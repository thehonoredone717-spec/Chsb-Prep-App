import {
  AlertTriangle,
  Camera,
  CameraOff,
  Maximize2,
  Minimize2,
  ShieldAlert,
  Video,
} from 'lucide-react';
import { PointerEvent as ReactPointerEvent, useCallback, useEffect, useRef, useState } from 'react';
import { UILanguage } from '../types/quiz';

export type ProctorStatus = 'facing' | 'looking_away' | 'no_face' | 'multiple_faces' | 'camera_off';
export type ProctorCorner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

const CORNER_STORAGE_KEY = 'g7_chsb_proctor_corner_v1';

function loadSavedCorner(): ProctorCorner {
  try {
    const raw = window.localStorage.getItem(CORNER_STORAGE_KEY);
    if (raw === 'top-left' || raw === 'top-right' || raw === 'bottom-left' || raw === 'bottom-right') {
      return raw;
    }
  } catch {
    // Ignore storage errors
  }
  return 'bottom-right';
}

export interface CameraProctorProps {
  lang: UILanguage;
  isActive: boolean; // true during active quiz
  warningsLeft: number;
  maxWarnings: number;
  onViolation: (reasonUz: string, reasonEn: string) => void;
  stream: MediaStream | null;
  cameraStatus: 'idle' | 'requesting' | 'active' | 'denied' | 'error';
  cameraError: string | null;
  onRequestCamera: () => void;
  variant: 'preview-card' | 'floating';
}

const GRACE_LOOKAWAY_MS = 5000; // 5 seconds grace before deducting a warning
const SCAN_INTERVAL_MS = 250; // 4 FPS scan rate

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface FaceLandmark {
  type: string;
  locations?: { x: number; y: number }[];
  location?: { x: number; y: number };
}

interface DetectedFaceNative {
  boundingBox?: BoundingBox;
  landmarks?: FaceLandmark[];
}

interface FaceCandidate {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  skinCount: number;
  score: number;
  sumX?: number;
  sumY?: number;
}

export function CameraProctor({
  lang,
  isActive,
  warningsLeft,
  maxWarnings,
  onViolation,
  stream,
  cameraStatus,
  cameraError,
  onRequestCamera,
  variant,
}: CameraProctorProps) {
  const [proctorStatus, setProctorStatus] = useState<ProctorStatus>('camera_off');
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [corner, setCorner] = useState<ProctorCorner>(() => loadSavedCorner());
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const awayStartTimeRef = useRef<number | null>(null);
  const nativeFaceDetectorRef = useRef<unknown>(null);
  const nativeSupportedRef = useRef<boolean | null>(null);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const lastFaceCenterRef = useRef<{ x: number; y: number } | null>(null);
  const recentRawStatusesRef = useRef<ProctorStatus[]>([]);
  const smoothedStatusRef = useRef<ProctorStatus>('camera_off');

  const attachVideoElement = useCallback(
    (node: HTMLVideoElement | null) => {
      videoRef.current = node;
      if (node && stream) {
        if (node.srcObject !== stream) {
          node.srcObject = stream;
        }
        node.play().catch(() => {
          // Video autoplay policy handled
        });
      }
    },
    [stream]
  );

  // Re-bind video element whenever stream, variant, cameraStatus, or minimized state changes
  useEffect(() => {
    const node = videoRef.current;
    if (node && stream) {
      if (node.srcObject !== stream) {
        node.srcObject = stream;
      }
      node.play().catch(() => {
        // Video autoplay policy handled
      });
    }
  }, [stream, variant, isMinimized, cameraStatus]);

  const updateCorner = useCallback((next: ProctorCorner) => {
    setCorner(next);
    try {
      window.localStorage.setItem(CORNER_STORAGE_KEY, next);
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Initialize native FaceDetector if supported in Chromium
  useEffect(() => {
    if (typeof window !== 'undefined' && 'FaceDetector' in window) {
      try {
        const FaceDetectorCtor = (
          window as unknown as {
            FaceDetector: new (opts?: {
              fastMode?: boolean;
              maxDetectedFaces?: number;
            }) => unknown;
          }
        ).FaceDetector;
        nativeFaceDetectorRef.current = new FaceDetectorCtor({
          fastMode: true,
          maxDetectedFaces: 3,
        });
        nativeSupportedRef.current = true;
      } catch {
        nativeSupportedRef.current = false;
      }
    } else {
      nativeSupportedRef.current = false;
    }
  }, []);

  // Frame analyzer: classifies current video frame into 'facing', 'looking_away', 'no_face', or 'multiple_faces'
  const analyzeFrame = useCallback(async (): Promise<ProctorStatus> => {
    const video = videoRef.current;
    if (!video || video.readyState < 2 || video.paused || video.ended) {
      return 'camera_off';
    }

    const vidW = video.videoWidth || 640;
    const vidH = video.videoHeight || 480;

    // 1. Try Native FaceDetector if available (fall through to Canvas CV if it detects 0 faces on low-pixel cams)
    if (nativeSupportedRef.current && nativeFaceDetectorRef.current) {
      try {
        const detector = nativeFaceDetectorRef.current as {
          detect: (source: HTMLVideoElement) => Promise<DetectedFaceNative[]>;
        };
        const rawFaces = await detector.detect(video);
        const faces = (rawFaces || []).filter(
          (f) => !f.boundingBox || f.boundingBox.width >= vidW * 0.04
        );

        const largeFaces = faces.filter(
          (f) => !f.boundingBox || f.boundingBox.width >= vidW * 0.1
        );
        if (largeFaces.length > 1) {
          return 'multiple_faces';
        }

        if (faces.length >= 1) {
          const face = faces[0];
          const boxW = face.boundingBox?.width ?? 0;
          const isFarFace = boxW > 0 && boxW < vidW * 0.14;
          const landmarks = face.landmarks || [];
          const eyeLandmarks = landmarks.filter((l) => l.type === 'eye');
          const noseLandmark = landmarks.find((l) => l.type === 'nose');

          if (face.boundingBox) {
            lastFaceCenterRef.current = {
              x: ((face.boundingBox.x + face.boundingBox.width / 2) / Math.max(1, vidW)) * 320,
              y: ((face.boundingBox.y + face.boundingBox.height / 2) / Math.max(1, vidH)) * 240,
            };
          }

          // If two eyes and nose are present and face is large enough, trigger only on large head yaw turn (>~45 deg)
          if (!isFarFace && eyeLandmarks.length >= 2 && noseLandmark) {
            const e1 = eyeLandmarks[0].locations?.[0] || eyeLandmarks[0].location;
            const e2 = eyeLandmarks[1].locations?.[0] || eyeLandmarks[1].location;
            const nose = noseLandmark.locations?.[0] || noseLandmark.location;

            if (e1 && e2 && nose) {
              const leftEye = e1.x < e2.x ? e1 : e2;
              const rightEye = e1.x < e2.x ? e2 : e1;
              const eyeDist = Math.max(1, rightEye.x - leftEye.x);
              const midX = (leftEye.x + rightEye.x) / 2;
              const yawOffset = (nose.x - midX) / eyeDist;

              if (Math.abs(yawOffset) > 0.62) {
                return 'looking_away';
              }
            }
          }

          // Check only extreme edge exits or severe side profile
          if (face.boundingBox) {
            const faceCenterX = face.boundingBox.x + face.boundingBox.width / 2;
            if (faceCenterX < vidW * 0.02 || faceCenterX > vidW * 0.98) {
              return 'looking_away';
            }
            const aspect = face.boundingBox.width / Math.max(1, face.boundingBox.height);
            if (aspect < 0.3) {
              return 'looking_away';
            }
          }

          return 'facing';
        }
        // If native FaceDetector returned 0 faces, fall through to Canvas CV
      } catch {
        // Fall back to Canvas pixel analysis if native call fails
      }
    }

    // 2. Multi-scale Canvas Computer Vision (320px wide with smoothing for low-pixel streams)
    const analysisW = 320;
    const analysisH = Math.max(
      160,
      Math.min(240, Math.round((analysisW * vidH) / Math.max(1, vidW)))
    );

    let canvas = canvasRef.current;
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvasRef.current = canvas;
    }
    if (canvas.width !== analysisW || canvas.height !== analysisH) {
      canvas.width = analysisW;
      canvas.height = analysisH;
    }

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return 'facing';

    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(video, 0, 0, analysisW, analysisH);
    const imgData = ctx.getImageData(0, 0, analysisW, analysisH);
    const data = imgData.data;
    const totalPixels = analysisW * analysisH;

    // Precompute luma, Cb, Cr, and frame dynamic range for adaptive low-pixel normalization
    const lumaArr = new Float32Array(totalPixels);
    const cbArr = new Float32Array(totalPixels);
    const crArr = new Float32Array(totalPixels);
    const rMinusMinGB = new Int16Array(totalPixels);
    const rMinusG = new Int16Array(totalPixels);

    let frameLumaSum = 0;
    let frameLumaSqSum = 0;
    let chromaSum = 0;
    let minLuma = 255;
    let maxLuma = 0;

    for (let i = 0; i < totalPixels; i++) {
      const dIdx = i * 4;
      const r = data[dIdx];
      const g = data[dIdx + 1];
      const b = data[dIdx + 2];

      const luma = 0.299 * r + 0.587 * g + 0.114 * b;
      lumaArr[i] = luma;
      frameLumaSum += luma;
      frameLumaSqSum += luma * luma;
      if (luma < minLuma) minLuma = luma;
      if (luma > maxLuma) maxLuma = luma;

      const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
      const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;
      cbArr[i] = cb;
      crArr[i] = cr;

      const rg = r - g;
      const rMin = r - Math.min(g, b);
      rMinusG[i] = rg;
      rMinusMinGB[i] = rMin;
      chromaSum += Math.abs(r - g) + Math.abs(g - b);
    }

    const frameMeanLuma = frameLumaSum / totalPixels;
    const frameLumaStd = Math.sqrt(
      Math.max(0, frameLumaSqSum / totalPixels - frameMeanLuma * frameMeanLuma)
    );

    // Reject completely covered / black / uniform lens frames
    if (frameLumaStd < 3.5 || maxLuma < 8) {
      lastFaceCenterRef.current = null;
      return 'no_face';
    }

    // Build contrast-stretched luma for washed-out / dim webcams
    const lumaRange = Math.max(1, maxLuma - minLuma);
    const normLumaArr = new Uint8Array(totalPixels);
    const stretchScale = lumaRange < 160 ? 240 / lumaRange : 1;
    for (let i = 0; i < totalPixels; i++) {
      normLumaArr[i] =
        stretchScale > 1
          ? Math.min(255, Math.max(0, Math.round((lumaArr[i] - minLuma) * stretchScale)))
          : Math.round(lumaArr[i]);
    }

    const useNormalizedStrict = frameMeanLuma < 85 || lumaRange < 150;

    const runSkinPass = (relaxed: boolean): ProctorStatus | null => {
      const skinMask = new Uint8Array(totalPixels);
      const CELL = 6;
      const cols = Math.ceil(analysisW / CELL);
      const rows = Math.ceil(analysisH / CELL);
      const cellSkinCounts = new Uint16Array(cols * rows);

      const yStart = Math.floor(analysisH * 0.01);
      const yEnd = Math.floor(analysisH * 0.98);
      const xStart = Math.floor(analysisW * 0.01);
      const xEnd = Math.floor(analysisW * 0.99);

      const minL = relaxed ? 6 : 12;
      const cbMin = relaxed ? 48 : 60;
      const cbMax = relaxed ? 162 : 144;
      const crMin = relaxed ? 114 : 123;
      const crMax = relaxed ? 205 : 192;
      const minR = relaxed ? 8 : 14;
      const minRG = relaxed ? -22 : -12;
      const minRDiff = relaxed ? -6 : 1;
      const cellThreshold = relaxed ? 1 : 2;
      const minClusterSkin = relaxed ? 10 : 16;
      const minFillRatio = relaxed ? 0.08 : 0.12;

      for (let y = yStart; y < yEnd; y++) {
        const rowOffset = y * analysisW;
        const cellRowOffset = Math.floor(y / CELL) * cols;
        for (let x = xStart; x < xEnd; x++) {
          const pIdx = rowOffset + x;
          const r = data[pIdx * 4];
          const l = relaxed || useNormalizedStrict ? normLumaArr[pIdx] : lumaArr[pIdx];
          const cb = cbArr[pIdx];
          const cr = crArr[pIdx];

          const isSkin =
            l >= minL &&
            cb >= cbMin &&
            cb <= cbMax &&
            cr >= crMin &&
            cr <= crMax &&
            r >= minR &&
            rMinusG[pIdx] >= minRG &&
            rMinusMinGB[pIdx] >= minRDiff;

          if (isSkin) {
            skinMask[pIdx] = 1;
            cellSkinCounts[cellRowOffset + Math.floor(x / CELL)]++;
          }
        }
      }

      const visited = new Uint8Array(cols * rows);
      const queue = new Int32Array(cols * rows);
      const validCandidates: FaceCandidate[] = [];

      for (let cy = 0; cy < rows; cy++) {
        for (let cx = 0; cx < cols; cx++) {
          const startCell = cy * cols + cx;
          if (visited[startCell] || cellSkinCounts[startCell] < cellThreshold) continue;

          let head = 0;
          let tail = 0;
          queue[tail++] = startCell;
          visited[startCell] = 1;

          let cMinX = analysisW;
          let cMaxX = 0;
          let cMinY = analysisH;
          let cMaxY = 0;
          let cSkin = 0;
          let cSumX = 0;
          let cSumY = 0;
          let cLumaSum = 0;
          let cLumaSqSum = 0;

          while (head < tail) {
            const cur = queue[head++];
            const curY = Math.floor(cur / cols);
            const curX = cur % cols;

            const pxStartX = curX * CELL;
            const pxEndX = Math.min(analysisW, pxStartX + CELL);
            const pxStartY = curY * CELL;
            const pxEndY = Math.min(analysisH, pxStartY + CELL);

            for (let py = pxStartY; py < pxEndY; py++) {
              const pRow = py * analysisW;
              for (let px = pxStartX; px < pxEndX; px++) {
                const pIdx = pRow + px;
                if (skinMask[pIdx]) {
                  cSkin++;
                  cSumX += px;
                  cSumY += py;
                  const l = normLumaArr[pIdx];
                  cLumaSum += l;
                  cLumaSqSum += l * l;
                  if (px < cMinX) cMinX = px;
                  if (px > cMaxX) cMaxX = px;
                  if (py < cMinY) cMinY = py;
                  if (py > cMaxY) cMaxY = py;
                }
              }
            }

            // 8-connected neighbors
            for (let dy = -1; dy <= 1; dy++) {
              const ny = curY + dy;
              if (ny < 0 || ny >= rows) continue;
              for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const nx = curX + dx;
                if (nx < 0 || nx >= cols) continue;
                const nCell = ny * cols + nx;
                if (!visited[nCell] && cellSkinCounts[nCell] >= cellThreshold) {
                  visited[nCell] = 1;
                  queue[tail++] = nCell;
                }
              }
            }
          }

          if (cSkin < minClusterSkin) continue;

          const rawW = cMaxX - cMinX + 1;
          let rawH = cMaxY - cMinY + 1;

          const lumaMean = cLumaSum / cSkin;
          const lumaStd = Math.sqrt(Math.max(0, cLumaSqSum / cSkin - lumaMean * lumaMean));

          // Reject only huge completely flat background walls that cover nearly the whole frame
          if (rawW > analysisW * 0.92 && rawH > analysisH * 0.92 && lumaStd < 5.5) {
            continue;
          }
          if (cSkin > 400 && lumaStd < 2.2) continue;

          // If neck/collar is attached below head, focus on upper head slice
          let headMaxY = cMaxY;
          if (rawH / Math.max(1, rawW) > 1.85 && rawH > 36) {
            headMaxY = Math.min(cMaxY, Math.round(cMinY + rawW * 1.45));
            rawH = headMaxY - cMinY + 1;
          }

          const aspect = rawH / Math.max(1, rawW);
          if (aspect < 0.32 || aspect > 3.6) continue;

          const fillRatio = cSkin / Math.max(1, rawW * (cMaxY - cMinY + 1));
          if (fillRatio < minFillRatio) continue;

          const candCenterX = cSumX / cSkin;
          const candCenterY = cSumY / cSkin;
          const upperBias = 1.25 - 0.5 * (candCenterY / analysisH);
          const aspectIdealDiff = Math.abs(aspect - 1.28);
          const aspectScore = Math.max(0.4, 1.3 - aspectIdealDiff * 0.5);

          let continuityBonus = 1;
          if (lastFaceCenterRef.current) {
            const dist = Math.hypot(
              candCenterX - lastFaceCenterRef.current.x,
              candCenterY - lastFaceCenterRef.current.y
            );
            if (dist < analysisW * 0.28) continuityBonus = 1.35;
          }

          const score = Math.sqrt(cSkin) * upperBias * aspectScore * continuityBonus;
          validCandidates.push({
            minX: cMinX,
            maxX: cMaxX,
            minY: cMinY,
            maxY: headMaxY,
            skinCount: cSkin,
            sumX: cSumX,
            score,
          });
        }
      }

      if (validCandidates.length === 0) {
        return null;
      }

      validCandidates.sort((a, b) => b.score - a.score);
      if (!relaxed) {
        const distinctFaces: FaceCandidate[] = [];
        for (const cand of validCandidates) {
          const cx = (cand.minX + cand.maxX) / 2;
          const cy = (cand.minY + cand.maxY) / 2;
          const cW = Math.max(1, cand.maxX - cand.minX + 1);
          const cH = Math.max(1, cand.maxY - cand.minY + 1);
          const cAspect = cH / cW;
          const isDuplicate = distinctFaces.some(
            (f) => Math.hypot(cx - (f.minX + f.maxX) / 2, cy - (f.minY + f.maxY) / 2) < analysisW * 0.25
          );
          if (!isDuplicate && cand.skinCount >= 140 && cAspect >= 0.55 && cAspect <= 2.1) {
            distinctFaces.push(cand);
          }
        }
        if (distinctFaces.length > 1) {
          return 'multiple_faces';
        }
      }

      const bestCandidate = validCandidates[0];
      const { minX, maxX, minY, maxY } = bestCandidate;
      const faceWidth = Math.max(1, maxX - minX + 1);
      const boxCenterX = (minX + maxX) / 2;
      const boxCenterY = (minY + maxY) / 2;

      lastFaceCenterRef.current = { x: boxCenterX, y: boxCenterY };

      if (boxCenterX < analysisW * 0.02 || boxCenterX > analysisW * 0.98) {
        return 'looking_away';
      }

      let headSkin = 0;
      let headSumX = 0;
      let leftSkin = 0;
      let rightSkin = 0;

      for (let y = minY; y <= maxY; y++) {
        const rowOffset = y * analysisW;
        for (let x = minX; x <= maxX; x++) {
          const pIdx = rowOffset + x;
          if (skinMask[pIdx]) {
            headSkin++;
            headSumX += x;
            if (x < boxCenterX) {
              leftSkin++;
            } else {
              rightSkin++;
            }
          }
        }
      }

      if (headSkin < (relaxed ? 8 : 12)) {
        return null;
      }

      const avgX = headSumX / headSkin;
      const skinRatio =
        Math.max(leftSkin, rightSkin) / (Math.min(leftSkin, rightSkin) + 1);
      const centroidOffset = Math.abs(avgX - boxCenterX) / faceWidth;

      const maxSkinRatio = relaxed ? 5.5 : 3.8;
      const maxCentroidOffset = relaxed ? 0.44 : 0.36;

      if (skinRatio > maxSkinRatio || centroidOffset > maxCentroidOffset) {
        return 'looking_away';
      }

      return 'facing';
    };

    // Pass 2A: Standard YCbCr skin detector
    const strictResult = runSkinPass(false);
    if (strictResult !== null) {
      return strictResult;
    }

    // Pass 2B: Relaxed desaturated / dim / cool-light YCbCr detector
    const relaxedResult = runSkinPass(true);
    if (relaxedResult !== null) {
      return relaxedResult;
    }

    // Pass 3: Universal Head-Feature & Structure Contrast Fallback (runs across ALL resolutions & lighting)
    if (frameLumaStd >= 5) {
      const scanBoxes: Array<{ x0: number; y0: number; w: number; h: number }> = [];
      if (lastFaceCenterRef.current) {
        const lw = Math.round(analysisW * 0.28);
        const lh = Math.round(analysisH * 0.42);
        scanBoxes.push({
          x0: Math.max(4, Math.min(analysisW - lw - 4, Math.round(lastFaceCenterRef.current.x - lw / 2))),
          y0: Math.max(4, Math.min(analysisH - lh - 4, Math.round(lastFaceCenterRef.current.y - lh / 2))),
          w: lw,
          h: lh,
        });
      }
      for (const scale of [0.22, 0.32, 0.42]) {
        const bw = Math.round(analysisW * scale);
        const bh = Math.min(analysisH - 8, Math.round(bw * 1.25));
        for (const cxFrac of [0.5, 0.36, 0.64, 0.25, 0.75]) {
          for (const cyFrac of [0.4, 0.52, 0.28]) {
            scanBoxes.push({
              x0: Math.max(4, Math.min(analysisW - bw - 4, Math.round(analysisW * cxFrac - bw / 2))),
              y0: Math.max(4, Math.min(analysisH - bh - 4, Math.round(analysisH * cyFrac - bh / 2))),
              w: bw,
              h: bh,
            });
          }
        }
      }

      for (const box of scanBoxes) {
        const eyeY1 = box.y0 + Math.floor(box.h * 0.18);
        const eyeY2 = box.y0 + Math.floor(box.h * 0.48);
        const cheekY1 = box.y0 + Math.floor(box.h * 0.5);
        const cheekY2 = box.y0 + Math.floor(box.h * 0.8);
        const midX = box.x0 + box.w / 2;
        const midY = box.y0 + box.h / 2;

        let eyeSum = 0;
        let eyeCount = 0;
        let cheekSum = 0;
        let cheekCount = 0;
        let upperSum = 0;
        let upperCount = 0;
        let lowerSum = 0;
        let lowerCount = 0;
        let leftSum = 0;
        let leftCount = 0;
        let rightSum = 0;
        let rightCount = 0;
        let boxSum = 0;
        let boxSqSum = 0;
        let boxCount = 0;

        for (let y = box.y0; y < box.y0 + box.h; y++) {
          const rowOff = y * analysisW;
          for (let x = box.x0; x < box.x0 + box.w; x++) {
            const val = normLumaArr[rowOff + x];
            boxSum += val;
            boxSqSum += val * val;
            boxCount++;
            if (x < midX) {
              leftSum += val;
              leftCount++;
            } else {
              rightSum += val;
              rightCount++;
            }
            if (y < midY) {
              upperSum += val;
              upperCount++;
            } else {
              lowerSum += val;
              lowerCount++;
            }
            if (y >= eyeY1 && y <= eyeY2) {
              eyeSum += val;
              eyeCount++;
            } else if (y >= cheekY1 && y <= cheekY2) {
              cheekSum += val;
              cheekCount++;
            }
          }
        }

        if (boxCount === 0 || eyeCount === 0 || cheekCount === 0) continue;
        const boxMean = boxSum / boxCount;
        const boxStd = Math.sqrt(Math.max(0, boxSqSum / boxCount - boxMean * boxMean));
        const eyeMean = eyeSum / eyeCount;
        const cheekMean = cheekSum / cheekCount;
        const upperMean = upperSum / Math.max(1, upperCount);
        const lowerMean = lowerSum / Math.max(1, lowerCount);
        const leftMean = leftSum / Math.max(1, leftCount);
        const rightMean = rightSum / Math.max(1, rightCount);

        if (
          boxStd >= 8 &&
          boxMean >= 12 &&
          boxMean <= 245 &&
          (Math.abs(cheekMean - eyeMean) >= 3 || Math.abs(lowerMean - upperMean) >= 4) &&
          Math.abs(leftMean - rightMean) <= 55
        ) {
          lastFaceCenterRef.current = { x: box.x0 + box.w / 2, y: box.y0 + box.h / 2 };
          return 'facing';
        }
      }
    }

    // Pass 4: Center Foreground Head/Subject Presence Fallback (handles extreme backlighting / glasses / heavy shadow)
    const fgX1 = Math.floor(analysisW * 0.22);
    const fgX2 = Math.floor(analysisW * 0.78);
    const fgY1 = Math.floor(analysisH * 0.08);
    const fgY2 = Math.floor(analysisH * 0.82);
    let fgSum = 0;
    let fgSqSum = 0;
    let fgCount = 0;
    let fgEdges = 0;
    for (let y = fgY1; y < fgY2; y += 2) {
      const rowOff = y * analysisW;
      for (let x = fgX1; x < fgX2; x += 2) {
        const val = normLumaArr[rowOff + x];
        fgSum += val;
        fgSqSum += val * val;
        fgCount++;
        if (x + 2 < fgX2 && Math.abs(val - normLumaArr[rowOff + x + 2]) >= 12) {
          fgEdges++;
        }
      }
    }
    if (fgCount > 0) {
      const fgMean = fgSum / fgCount;
      const fgStd = Math.sqrt(Math.max(0, fgSqSum / fgCount - fgMean * fgMean));
      const edgeDensity = fgEdges / fgCount;
      if (fgStd >= 14 && edgeDensity >= 0.045) {
        lastFaceCenterRef.current = { x: analysisW * 0.5, y: analysisH * 0.45 };
        return 'facing';
      }
    }

    void chromaSum;
    lastFaceCenterRef.current = null;
    return 'no_face';
  }, []);

  // Proctoring loop: runs detection every SCAN_INTERVAL_MS with temporal smoothing
  useEffect(() => {
    if (!stream || cameraStatus !== 'active') {
      setProctorStatus('camera_off');
      setSecondsRemaining(null);
      awayStartTimeRef.current = null;
      recentRawStatusesRef.current = [];
      smoothedStatusRef.current = 'camera_off';
      lastFaceCenterRef.current = null;
      return;
    }

    let isMounted = true;

    const intervalId = window.setInterval(async () => {
      const rawStatus = await analyzeFrame();
      if (!isMounted) return;

      if (rawStatus === 'camera_off') {
        setProctorStatus('camera_off');
        smoothedStatusRef.current = 'camera_off';
        return;
      }

      const buf = recentRawStatusesRef.current;
      buf.push(rawStatus);
      if (buf.length > 8) buf.shift();

      let status = smoothedStatusRef.current;
      if (status === 'camera_off') {
        status = rawStatus;
      } else if (status === 'facing') {
        // Require 6 out of last 8 frames non-facing before leaving 'facing' (prevents flicker & false triggers)
        const nonFacingCount = buf.filter((s) => s !== 'facing').length;
        if (buf.length >= 6 && nonFacingCount >= 6) {
          const noFaceCount = buf.filter((s) => s === 'no_face').length;
          const awayCount = buf.filter((s) => s === 'looking_away').length;
          const multiCount = buf.filter((s) => s === 'multiple_faces').length;
          if (multiCount >= noFaceCount && multiCount >= awayCount) {
            status = 'multiple_faces';
          } else {
            status = noFaceCount > awayCount ? 'no_face' : 'looking_away';
          }
        }
      } else {
        // Recover immediately back to 'facing' as soon as a facing frame is seen
        if (rawStatus === 'facing') {
          status = 'facing';
        } else {
          status = rawStatus;
        }
      }

      smoothedStatusRef.current = status;
      setProctorStatus(status);

      // In active quiz mode, enforce looking-away / no-face / multiple-faces grace countdown & violation penalties
      if (isActive) {
        if (status === 'looking_away' || status === 'no_face' || status === 'multiple_faces') {
          if (awayStartTimeRef.current === null) {
            awayStartTimeRef.current = Date.now();
          }

          const elapsedMs = Date.now() - awayStartTimeRef.current;
          const msLeft = Math.max(0, GRACE_LOOKAWAY_MS - elapsedMs);
          const secs = Math.max(1, Math.ceil(msLeft / 1000));
          setSecondsRemaining(secs);

          if (elapsedMs >= GRACE_LOOKAWAY_MS) {
            // Grace period expired! Deduct 1 warning via penalty callback
            awayStartTimeRef.current = Date.now(); // reset timer for subsequent warnings if away continues
            if (status === 'looking_away') {
              onViolation(
                'Boshqa tarafga burilib qarash taqiqlanadi! Ekranga to‘g‘ri qarang. 1 ta ogohlantirish olib tashlandi.',
                'Looking away from the screen is prohibited! Please face the screen. 1 warning was deducted.'
              );
            } else if (status === 'multiple_faces') {
              onViolation(
                'Kamerada boshqa odam aniqlandi! Yolg‘iz o‘zingiz o‘tirishingiz shart. 1 ta ogohlantirish olib tashlandi.',
                'Another person was detected in front of the camera! You must take the test alone. 1 warning was deducted.'
              );
            } else {
              onViolation(
                'Yuzingiz kamerada ko‘rinmay qoldi! Ekranga to‘g‘ri qarab o‘tiring. 1 ta ogohlantirish olib tashlandi.',
                'Face was not detected by the camera! Please face the screen. 1 warning was deducted.'
              );
            }
          }
        } else {
          // Facing screen: clear warning timer
          awayStartTimeRef.current = null;
          setSecondsRemaining(null);
        }
      } else {
        // Not active (preview mode before quiz starts): show status indicator without penalties
        if (status === 'looking_away' || status === 'no_face' || status === 'multiple_faces') {
          setSecondsRemaining(5);
        } else {
          setSecondsRemaining(null);
        }
      }
    }, SCAN_INTERVAL_MS);

    return () => {
      isMounted = false;
      window.clearInterval(intervalId);
    };
  }, [stream, cameraStatus, isActive, analyzeFrame, onViolation]);

  // Status visual cues
  const getStatusBadge = () => {
    if (cameraStatus !== 'active') {
      return {
        bg: 'bg-slate-100 text-slate-700 border-slate-300',
        dot: 'bg-slate-400',
        text: lang === 'uz' ? 'Kamera yoqilmagan' : 'Camera off',
      };
    }
    if (proctorStatus === 'facing') {
      return {
        bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        dot: 'bg-emerald-500 animate-pulse',
        text: lang === 'uz' ? '✓ Ekranga qaralyapti' : '✓ Facing screen',
      };
    }
    if (proctorStatus === 'multiple_faces') {
      return {
        bg: 'bg-rose-100 text-rose-900 border-rose-400 animate-pulse',
        dot: 'bg-rose-500',
        text:
          lang === 'uz'
            ? `⚠️ Boshqa odam bor! (${secondsRemaining ?? 5}s)`
            : `⚠️ Another person! (${secondsRemaining ?? 5}s)`,
      };
    }
    if (proctorStatus === 'looking_away') {
      return {
        bg: 'bg-amber-100 text-amber-900 border-amber-400 animate-pulse',
        dot: 'bg-amber-500',
        text:
          lang === 'uz'
            ? `⚠️ Ekranga qarang! (${secondsRemaining ?? 5}s)`
            : `⚠️ Look at screen! (${secondsRemaining ?? 5}s)`,
      };
    }
    return {
      bg: 'bg-rose-100 text-rose-900 border-rose-400 animate-pulse',
      dot: 'bg-rose-500',
      text:
        lang === 'uz'
          ? `✕ Yuz ko‘rinmadi! (${secondsRemaining ?? 5}s)`
          : `✕ No face detected! (${secondsRemaining ?? 5}s)`,
    };
  };

  const badge = getStatusBadge();

  // VARIANT A: PREVIEW CARD (on pre-quiz Start screen)
  if (variant === 'preview-card') {
    return (
      <div className="mx-auto mt-6 w-full max-w-xl rounded-2xl border border-slate-200 bg-slate-50/70 p-5 text-left shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-600 text-white shadow-xs">
              <Camera className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                {lang === 'uz' ? 'Kamera orqali nazorat (Proctoring)' : 'Webcam Proctoring Required'}
              </h3>
              <p className="text-xs text-slate-500">
                {lang === 'uz'
                  ? 'Boshqa tarafga burilib qarash va yuzni berkitish taqiqlanadi'
                  : 'Turning head away and obscuring face will deduct warnings'}
              </p>
            </div>
          </div>

          <div
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${badge.bg}`}
          >
            <span className={`h-2 w-2 rounded-full ${badge.dot}`} />
            <span>{badge.text}</span>
          </div>
        </div>

        {/* Video feed or Request button */}
        <div className="mt-4 flex flex-col items-center justify-center">
          {cameraStatus === 'active' ? (
            <div className="relative w-full overflow-hidden rounded-xl border-2 border-slate-300 bg-black shadow-inner aspect-4/3 max-h-56">
              <video
                ref={attachVideoElement}
                autoPlay
                playsInline
                muted
                className="h-full w-full object-cover scale-x-[-1]"
              />
              <div className="absolute top-2 left-2 flex items-center gap-1.5 rounded-md bg-black/60 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur-xs">
                <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
                <span>Live Test</span>
              </div>
              <div className="absolute bottom-2 inset-x-2 flex items-center justify-between rounded-lg bg-black/75 px-3 py-1.5 text-xs text-white backdrop-blur-xs">
                <span>{badge.text}</span>
                <span className="font-mono-num text-[11px] text-slate-300">
                  {lang === 'uz' ? 'Sinov rejimi' : 'Ready check'}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white p-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                <CameraOff className="h-6 w-6" aria-hidden="true" />
              </div>
              <p className="mt-3 text-sm font-semibold text-slate-800">
                {lang === 'uz'
                  ? 'Imtihonni boshlash uchun kamera ruxsati zarur'
                  : 'Webcam access is required to begin the quiz'}
              </p>
              <p className="mt-1 max-w-sm text-xs text-slate-500">
                {lang === 'uz'
                  ? 'Brauzer kamera so‘rovini ochish uchun quyidagi tugmani bosing va "Ruxsat berish"ni tanlang.'
                  : 'Click below and allow camera permissions in your browser to proceed with the exam.'}
              </p>

              {cameraError && (
                <div className="mt-2.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700">
                  {cameraError}
                </div>
              )}

              <button
                type="button"
                onClick={onRequestCamera}
                className="mt-4 inline-flex min-h-[40px] items-center gap-2 rounded-lg bg-teal-700 px-5 text-sm font-bold text-white shadow-xs transition-colors hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
              >
                <Video className="h-4 w-4" aria-hidden="true" />
                <span>{lang === 'uz' ? 'Kamerani yoqish' : 'Enable Camera'}</span>
              </button>
            </div>
          )}
        </div>

        <div className="mt-3 flex items-start gap-2 text-xs text-slate-600">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
          <p>
            {lang === 'uz'
              ? 'Diqqat: Test davomida boshqa tarafga 5 soniyadan ortiq burilib qaralsa yoki yuz butunlay yopilsa, ogohlantirish olib tashlanadi (3 ta ogohlantirish tugasa test 0 ball bilan yakunlanadi).'
              : 'Notice: Turning head completely away from the screen for over 5 seconds or covering your camera will deduct 1 warning (3 warnings = instant zero).'}
          </p>
        </div>
      </div>
    );
  }

  // VARIANT B: FLOATING CORNER WIDGET (active during exam)
  const isAwayAlert =
    proctorStatus === 'looking_away' || proctorStatus === 'no_face';

  const cornerPosClass: Record<ProctorCorner, string> = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  const handleFloatingPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button')) return;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    setDragOffset({ x: 0, y: 0 });
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handleFloatingPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragStartRef.current) return;
    setDragOffset({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleFloatingPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragStartRef.current) return;
    dragStartRef.current = null;
    setDragOffset(null);
    const isLeft = e.clientX < window.innerWidth / 2;
    const isTop = e.clientY < window.innerHeight / 2;
    const snapped: ProctorCorner = isTop
      ? isLeft
        ? 'top-left'
        : 'top-right'
      : isLeft
        ? 'bottom-left'
        : 'bottom-right';
    updateCorner(snapped);
  };

  const cornerOptions: { id: ProctorCorner; labelUz: string; labelEn: string }[] = [
    { id: 'top-left', labelUz: 'Yuqori chap', labelEn: 'Top left' },
    { id: 'top-right', labelUz: "Yuqori o'ng", labelEn: 'Top right' },
    { id: 'bottom-left', labelUz: 'Pastki chap', labelEn: 'Bottom left' },
    { id: 'bottom-right', labelUz: "Pastki o'ng", labelEn: 'Bottom right' },
  ];

  return (
    <div
      role="region"
      aria-label="Webcam Proctor"
      style={
        dragOffset
          ? { transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0)` }
          : undefined
      }
      className={`fixed ${cornerPosClass[corner]} z-50 select-none ${
        dragOffset ? '' : 'transition-all duration-200'
      } ${isMinimized ? 'w-52' : 'w-56 sm:w-64'}`}
    >
      <div
        className={`overflow-hidden rounded-2xl border-2 shadow-2xl backdrop-blur-md transition-colors ${
          isAwayAlert
            ? 'border-rose-500 bg-rose-950/90 text-white ring-4 ring-rose-500/30'
            : 'border-slate-800 bg-slate-900/90 text-white'
        }`}
      >
        {/* Floating Widget Header (drag to any corner or click 2x2 corner grid) */}
        <div
          onPointerDown={handleFloatingPointerDown}
          onPointerMove={handleFloatingPointerMove}
          onPointerUp={handleFloatingPointerUp}
          className="flex cursor-grab items-center justify-between border-b border-white/10 px-3 py-1.5 text-xs active:cursor-grabbing"
        >
          <div className="flex items-center gap-1.5">
            <span
              className={`h-2 w-2 rounded-full ${
                isAwayAlert ? 'bg-rose-500 animate-ping' : 'bg-emerald-400'
              }`}
            />
            <span className="font-bold tracking-tight text-[11px]">PROCTOR</span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* 4-Corner Switcher (2x2 mini grid) */}
            <div
              role="group"
              aria-label={lang === 'uz' ? 'Kamera burchagi' : 'Camera corner'}
              className="grid grid-cols-2 gap-0.5 rounded border border-white/15 bg-black/30 p-0.5"
              title={lang === 'uz' ? 'Kamerani istalgan burchakka ko‘chirish' : 'Move camera to any corner'}
            >
              {cornerOptions.map((opt) => {
                const active = corner === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => updateCorner(opt.id)}
                    aria-label={lang === 'uz' ? opt.labelUz : opt.labelEn}
                    title={lang === 'uz' ? opt.labelUz : opt.labelEn}
                    className={`h-2.5 w-2.5 rounded-[2px] transition-colors ${
                      active ? 'bg-teal-400' : 'bg-slate-600 hover:bg-slate-400'
                    }`}
                  />
                );
              })}
            </div>

            <span
              className={`font-mono-num text-[11px] font-bold ${
                warningsLeft === 3
                  ? 'text-emerald-400'
                  : warningsLeft === 2
                    ? 'text-amber-400'
                    : 'text-rose-400'
              }`}
              title={lang === 'uz' ? 'Qolgan ogohlantirishlar' : 'Warnings remaining'}
            >
              {warningsLeft}/{maxWarnings}
            </span>
            <button
              type="button"
              onClick={() => setIsMinimized((prev) => !prev)}
              className="rounded-md p-1 text-slate-400 hover:bg-white/10 hover:text-white focus-visible:outline-none"
              title={isMinimized ? 'Kattalashtirish' : 'Kichiklashtirish'}
            >
              {isMinimized ? (
                <Maximize2 className="h-3 w-3" aria-hidden="true" />
              ) : (
                <Minimize2 className="h-3 w-3" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Video feed (kept mounted when minimized so proctor detection stays active) */}
        <div
          className={
            isMinimized
              ? 'pointer-events-none absolute h-1 w-1 overflow-hidden opacity-0'
              : 'relative aspect-4/3 w-full bg-black'
          }
          aria-hidden={isMinimized}
        >
          <video
            ref={attachVideoElement}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover scale-x-[-1]"
          />

          {/* Look-away warning banner overlay right on video */}
          {!isMinimized && isAwayAlert && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-rose-950/80 p-2 text-center text-white backdrop-blur-xs">
              <AlertTriangle className="h-6 w-6 animate-bounce text-amber-400" />
              <p className="mt-1 text-xs font-black tracking-wide text-white">
                {lang === 'uz' ? 'EKRANGA QARANG!' : 'FACE THE SCREEN!'}
              </p>
              <div className="font-mono-num mt-1 flex h-8 w-8 items-center justify-center rounded-full bg-rose-600 text-sm font-extrabold text-white shadow-md">
                {secondsRemaining ?? 2}s
              </div>
              <p className="mt-0.5 text-[10px] text-rose-200">
                {lang === 'uz' ? 'Ogohlantirish beriladi' : 'Warning deduction'}
              </p>
            </div>
          )}
        </div>

        {/* Status Pill Footer */}
        <div
          className={`px-3 py-1.5 text-[11px] font-semibold text-center transition-colors ${
            isAwayAlert
              ? 'bg-rose-600 text-white font-bold'
              : proctorStatus === 'facing'
                ? 'bg-emerald-950/80 text-emerald-300'
                : 'bg-slate-800 text-slate-300'
          }`}
        >
          {badge.text}
        </div>
      </div>
    </div>
  );
}
