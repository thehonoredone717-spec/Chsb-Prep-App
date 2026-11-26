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

const GRACE_LOOKAWAY_MS = 2500; // 2.5 seconds grace before deducting a warning
const SCAN_INTERVAL_MS = 200; // 5 FPS scan rate

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
          maxDetectedFaces: 1,
        });
        nativeSupportedRef.current = true;
      } catch {
        nativeSupportedRef.current = false;
      }
    } else {
      nativeSupportedRef.current = false;
    }
  }, []);

  // Frame analyzer: classifies current video frame into 'facing', 'looking_away', or 'no_face'
  const analyzeFrame = useCallback(async (): Promise<ProctorStatus> => {
    const video = videoRef.current;
    if (!video || video.readyState < 2 || video.paused || video.ended) {
      return 'camera_off';
    }

    // 1. Try Native FaceDetector if available
    if (nativeSupportedRef.current && nativeFaceDetectorRef.current) {
      try {
        const detector = nativeFaceDetectorRef.current as {
          detect: (source: HTMLVideoElement) => Promise<DetectedFaceNative[]>;
        };
        const faces = await detector.detect(video);
        if (!faces || faces.length === 0) {
          return 'no_face';
        }

        const face = faces[0];
        const vidW = video.videoWidth || 640;
        const boxW = face.boundingBox?.width ?? 0;
        const isFarFace = boxW > 0 && boxW < vidW * 0.14;
        const landmarks = face.landmarks || [];
        const eyeLandmarks = landmarks.filter((l) => l.type === 'eye');
        const noseLandmark = landmarks.find((l) => l.type === 'nose');

        // Only trust missing-landmark profile heuristic when face is close enough for reliable landmarks
        if (!isFarFace && eyeLandmarks.length === 1 && !noseLandmark && boxW > 0) {
          return 'looking_away';
        }

        // If two eyes and nose are present and face is large enough, calculate head yaw offset
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

            // Allow natural monitor-scanning gaze angles across screen edges
            if (Math.abs(yawOffset) > 0.34) {
              return 'looking_away';
            }
          }
        }

        // Check if face bounding box is pushed completely to the frame edge or severely profile
        if (face.boundingBox) {
          const faceCenterX = face.boundingBox.x + face.boundingBox.width / 2;
          if (faceCenterX < vidW * 0.06 || faceCenterX > vidW * 0.94) {
            return 'looking_away';
          }
          const aspect = face.boundingBox.width / Math.max(1, face.boundingBox.height);
          if (aspect < 0.42) {
            return 'looking_away';
          }
        }

        return 'facing';
      } catch {
        // Fall back to Canvas pixel analysis if native call fails
      }
    }

    // 2. Multi-scale Canvas Computer Vision Fallback (320px wide, preserving aspect ratio for far faces)
    const vidW = video.videoWidth || 640;
    const vidH = video.videoHeight || 480;
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

    ctx.drawImage(video, 0, 0, analysisW, analysisH);
    const imgData = ctx.getImageData(0, 0, analysisW, analysisH);
    const data = imgData.data;

    // Classify skin pixels using lighting-tolerant YCbCr bounds (handles cool monitor light, warm rooms, and dim lighting)
    const skinMask = new Uint8Array(analysisW * analysisH);
    const lumaArr = new Uint8Array(analysisW * analysisH);

    const CELL = 6;
    const cols = Math.ceil(analysisW / CELL);
    const rows = Math.ceil(analysisH / CELL);
    const cellSkinCounts = new Uint16Array(cols * rows);

    const yStart = Math.floor(analysisH * 0.02);
    const yEnd = Math.floor(analysisH * 0.95);
    const xStart = Math.floor(analysisW * 0.03);
    const xEnd = Math.floor(analysisW * 0.97);

    for (let y = yStart; y < yEnd; y++) {
      const rowOffset = y * analysisW;
      const cellRowOffset = Math.floor(y / CELL) * cols;
      for (let x = xStart; x < xEnd; x++) {
        const pIdx = rowOffset + x;
        const dIdx = pIdx * 4;
        const r = data[dIdx];
        const g = data[dIdx + 1];
        const b = data[dIdx + 2];

        const luma = 0.299 * r + 0.587 * g + 0.114 * b;
        lumaArr[pIdx] = luma;

        const cb = 128 - 0.168736 * r - 0.331264 * g + 0.5 * b;
        const cr = 128 + 0.5 * r - 0.418688 * g - 0.081312 * b;

        const isSkin =
          luma >= 20 &&
          cb >= 68 &&
          cb <= 136 &&
          cr >= 128 &&
          cr <= 182 &&
          r >= 24 &&
          r >= g - 6 &&
          r - Math.min(g, b) >= 7;

        if (isSkin) {
          skinMask[pIdx] = 1;
          cellSkinCounts[cellRowOffset + Math.floor(x / CELL)]++;
        }
      }
    }

    // Connected-component clustering over 6x6 cells (supports very far faces down to ~10x12 px)
    const visited = new Uint8Array(cols * rows);
    const queue = new Int32Array(cols * rows);

    // Collect all valid face candidates to detect if another person is present
    const validCandidates: FaceCandidate[] = [];

    for (let cy = 0; cy < rows; cy++) {
      for (let cx = 0; cx < cols; cx++) {
        const startCell = cy * cols + cx;
        if (visited[startCell] || cellSkinCounts[startCell] < 4) continue;

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
                const l = lumaArr[pIdx];
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
              if (!visited[nCell] && cellSkinCounts[nCell] >= 4) {
                visited[nCell] = 1;
                queue[tail++] = nCell;
              }
            }
          }
        }

        // Minimum 28 skin pixels allows detection even 3–4.5m away (~6x7 px face on 320x240)
        if (cSkin < 28) continue;

        const rawW = cMaxX - cMinX + 1;
        let rawH = cMaxY - cMinY + 1;

        // Reject giant uniform background walls/doors
        if (rawW > analysisW * 0.72 || (rawW > analysisW * 0.62 && rawH > analysisH * 0.85)) {
          continue;
        }

        // If neck/collar is attached below head, focus on upper head slice
        let headMaxY = cMaxY;
        if (rawH / Math.max(1, rawW) > 1.75 && rawH > 40) {
          headMaxY = Math.min(cMaxY, Math.round(cMinY + rawW * 1.45));
          rawH = headMaxY - cMinY + 1;
        }

        const aspect = rawH / Math.max(1, rawW);
        if (aspect < 0.55 || aspect > 2.6) continue;

        const fillRatio = cSkin / Math.max(1, rawW * (cMaxY - cMinY + 1));
        if (fillRatio < 0.22) continue;

        const lumaMean = cLumaSum / cSkin;
        const lumaStd = Math.sqrt(Math.max(0, cLumaSqSum / cSkin - lumaMean * lumaMean));
        // Reject large completely flat wall regions
        if (cSkin > 320 && lumaStd < 3.5) continue;

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
          if (dist < analysisW * 0.25) continuityBonus = 1.35;
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
      lastFaceCenterRef.current = null;
      return 'no_face';
    }

    // Filter out overlapping/nested sub-clusters to count distinct people accurately
    validCandidates.sort((a, b) => b.score - a.score);
    const distinctFaces: FaceCandidate[] = [];
    for (const cand of validCandidates) {
      const cx = (cand.minX + cand.maxX) / 2;
      const cy = (cand.minY + cand.maxY) / 2;
      const isDuplicate = distinctFaces.some(
        (f) => Math.hypot(cx - (f.minX + f.maxX) / 2, cy - (f.minY + f.maxY) / 2) < analysisW * 0.18
      );
      if (!isDuplicate && cand.skinCount >= 35) {
        distinctFaces.push(cand);
      }
    }

    if (distinctFaces.length > 1) {
      return 'multiple_faces';
    }

    const bestCandidate = distinctFaces[0] || validCandidates[0];

    const { minX, maxX, minY, maxY } = bestCandidate;
    const faceWidth = Math.max(1, maxX - minX + 1);
    const faceHeight = Math.max(1, maxY - minY + 1);
    const boxCenterX = (minX + maxX) / 2;
    const boxCenterY = (minY + maxY) / 2;

    lastFaceCenterRef.current = { x: boxCenterX, y: boxCenterY };

    // Only flag looking_away if head moved completely to the outer edges of the frame
    if (boxCenterX < analysisW * 0.06 || boxCenterX > analysisW * 0.94) {
      return 'looking_away';
    }

    // Recompute horizontal balance strictly inside the head bounding box
    let headSkin = 0;
    let headSumX = 0;
    let leftSkin = 0;
    let rightSkin = 0;
    let leftSkinLumaSum = 0;
    let rightSkinLumaSum = 0;

    for (let y = minY; y <= maxY; y++) {
      const rowOffset = y * analysisW;
      for (let x = minX; x <= maxX; x++) {
        const pIdx = rowOffset + x;
        if (skinMask[pIdx]) {
          headSkin++;
          headSumX += x;
          if (x < boxCenterX) {
            leftSkin++;
            leftSkinLumaSum += lumaArr[pIdx];
          } else {
            rightSkin++;
            rightSkinLumaSum += lumaArr[pIdx];
          }
        }
      }
    }

    if (headSkin < 24) {
      return 'no_face';
    }

    const avgX = headSumX / headSkin;
    const skinRatio =
      Math.max(leftSkin, rightSkin) / (Math.min(leftSkin, rightSkin) + 1);
    const centroidOffset = Math.abs(avgX - boxCenterX) / faceWidth;

    // Far faces (< 28px wide on 320px canvas) have natural pixel quantization variance, so scale tolerances
    const isFarFace = faceWidth < 28;
    const maxSkinRatio = isFarFace ? 2.9 : 2.35;
    const maxCentroidOffset = isFarFace ? 0.28 : 0.23;

    if (skinRatio > maxSkinRatio || centroidOffset > maxCentroidOffset) {
      return 'looking_away';
    }

    // For medium/close faces, also check relative eye darkness asymmetry (cancels out one-sided room lighting)
    if (faceWidth >= 36 && faceHeight >= 40) {
      const leftMeanLuma = leftSkin > 0 ? leftSkinLumaSum / leftSkin : 120;
      const rightMeanLuma = rightSkin > 0 ? rightSkinLumaSum / rightSkin : 120;
      const leftDarkThreshold = Math.max(18, leftMeanLuma * 0.72);
      const rightDarkThreshold = Math.max(18, rightMeanLuma * 0.72);

      const eyeStartY = Math.floor(minY + faceHeight * 0.16);
      const eyeEndY = Math.floor(minY + faceHeight * 0.52);
      let leftDark = 0;
      let rightDark = 0;

      for (let y = eyeStartY; y <= eyeEndY; y++) {
        const rowOffset = y * analysisW;
        for (let x = minX; x <= maxX; x++) {
          const l = lumaArr[rowOffset + x];
          if (x < boxCenterX) {
            if (l < leftDarkThreshold) leftDark++;
          } else {
            if (l < rightDarkThreshold) rightDark++;
          }
        }
      }

      const darkRatio =
        Math.max(leftDark, rightDark) / (Math.min(leftDark, rightDark) + 1);
      if (
        darkRatio > 3.2 &&
        leftDark + rightDark > 24 &&
        (skinRatio > 1.65 || centroidOffset > 0.15)
      ) {
        return 'looking_away';
      }
    }

    return 'facing';
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
      if (buf.length > 4) buf.shift();

      let status = smoothedStatusRef.current;
      if (status === 'camera_off') {
        status = rawStatus;
      } else if (status === 'facing') {
        // Require 3 out of last 4 frames non-facing before leaving 'facing' (prevents single-frame flicker)
        const nonFacingCount = buf.filter((s) => s !== 'facing').length;
        if (buf.length >= 3 && nonFacingCount >= 3) {
          const noFaceCount = buf.filter((s) => s === 'no_face').length;
          const awayCount = buf.filter((s) => s === 'looking_away').length;
          status = noFaceCount > awayCount ? 'no_face' : 'looking_away';
        }
      } else {
        // Recover swiftly back to 'facing' as soon as 2 of last 3 frames (or last 2 frames) show facing
        const lastTwoFacing =
          buf.length >= 2 && buf[buf.length - 1] === 'facing' && buf[buf.length - 2] === 'facing';
        const recentFacingCount = buf.slice(-3).filter((s) => s === 'facing').length;
        if (lastTwoFacing || recentFacingCount >= 2) {
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
          setSecondsRemaining(2);
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
            ? `⚠️ Boshqa odam bor! (${secondsRemaining ?? 2}s)`
            : `⚠️ Another person! (${secondsRemaining ?? 2}s)`,
      };
    }
    return {
      bg: 'bg-rose-100 text-rose-900 border-rose-400 animate-pulse',
      dot: 'bg-rose-500',
      text:
        lang === 'uz'
          ? `✕ Yuz ko‘rinmadi! (${secondsRemaining ?? 2}s)`
          : `✕ No face detected! (${secondsRemaining ?? 2}s)`,
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
              ? 'Diqqat: Test davomida boshqa tarafga 2.5 soniyadan ortiq burilib qaralsa yoki yuz yopilsa, ogohlantirish olib tashlanadi (3 ta ogohlantirish tugasa test 0 ball bilan yakunlanadi).'
              : 'Notice: Turning head away from the screen for over 2.5 seconds or obscuring your face will deduct 1 warning (3 warnings = instant zero).'}
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
