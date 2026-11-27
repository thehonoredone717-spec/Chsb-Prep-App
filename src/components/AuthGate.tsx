import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
} from 'firebase/auth';
import { Eye, EyeOff, GraduationCap, Lock, LogIn, User, UserPlus } from 'lucide-react';
import { FormEvent, PointerEvent as ReactPointerEvent, useMemo, useRef, useState } from 'react';
import {
  DISPLAY_NAME_MAX_LEN,
  auth,
  googleProvider,
  isValidUsername,
  normalizeUsername,
  sanitizeDisplayName,
  toAuthEmail,
} from '../firebase';
import { UILanguage } from '../types/quiz';
import { playSound } from '../utils/sound';

interface AuthGateProps {
  lang: UILanguage;
  onChangeLang: (lang: UILanguage) => void;
  onPrepareSignup: (username: string, displayName: string) => void;
}

type AuthTab = 'login' | 'register';

interface FireflySpec {
  id: number;
  size: number;
  duration: number;
  delay: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  x3: number;
  y3: number;
  x4: number;
  y4: number;
  x5: number;
  y5: number;
}

function randomRange(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function generateFireflies(): FireflySpec[] {
  return Array.from({ length: 18 }, (_, id) => ({
    id,
    size: randomRange(3, 7),
    duration: randomRange(35, 65),
    delay: randomRange(0, 3),
    x1: randomRange(0, 100),
    y1: randomRange(0, 100),
    x2: randomRange(0, 100),
    y2: randomRange(0, 100),
    x3: randomRange(0, 100),
    y3: randomRange(0, 100),
    x4: randomRange(0, 100),
    y4: randomRange(0, 100),
    x5: randomRange(0, 100),
    y5: randomRange(0, 100),
  }));
}

function mapAuthError(code: string | undefined, lang: UILanguage): string {
  const uz = lang === 'uz';
  const host = typeof window !== 'undefined' ? window.location.hostname : '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return uz
        ? "Foydalanuvchi nomi (yoki email) yoxud parol noto'g'ri."
        : 'Invalid username (or email) or password.';
    case 'auth/invalid-email':
      return uz
        ? "Email yoki foydalanuvchi nomi formati noto'g'ri."
        : 'Invalid email or username format.';
    case 'auth/email-already-in-use':
      return uz
        ? 'Bu foydalanuvchi nomi allaqachon band. Boshqasini tanlang yoki tizimga kiring.'
        : 'This username is already taken. Choose another one or sign in.';
    case 'auth/weak-password':
      return uz
        ? "Parol kamida 6 ta belgidan iborat bo'lishi kerak."
        : 'Password must be at least 6 characters long.';
    case 'auth/operation-not-allowed':
      return uz
        ? "Username + parol orqali kirish uchun Firebase Console'da Email/Password usulini yoqish kerak. Hozircha Google orqali kirishingiz mumkin."
        : 'Email/Password sign-in is not yet enabled in Firebase Console. You can sign in with Google right now.';
    case 'auth/unauthorized-domain':
      return uz
        ? `Ushbu domen (${host}) Firebase Console -> Authorized domains ro'yxatiga qo'shilmagan.`
        : `This domain (${host}) is not listed in Firebase Console -> Authorized domains.`;
    case 'auth/popup-blocked':
      return uz
        ? 'Brauzer Google kirish oynasini (popup) blokladi. Iltimos, popup oynalarga ruxsat bering.'
        : 'Browser blocked the Google sign-in popup. Please allow popups and try again.';
    case 'auth/popup-closed-by-user':
    case 'auth/cancelled-popup-request':
      return uz
        ? 'Google kirish oynasi yopildi. Qayta urinib ko‘ring.'
        : 'Google sign-in popup was closed. Please try again.';
    case 'auth/network-request-failed':
      return uz
        ? "Tarmoq xatoligi yuz berdi. Internet aloqasini tekshirib qayta urinib ko'ring."
        : 'Network error occurred. Please check your connection and try again.';
    case 'auth/too-many-requests':
      return uz
        ? "Juda ko'p urinish bo'ldi. Biroz kutib qayta urinib ko'ring."
        : 'Too many attempts. Please wait a moment and try again.';
    default:
      return uz
        ? `Kirishda xatolik yuz berdi${code ? ` (${code})` : ''}. Qayta urinib ko'ring.`
        : `Authentication failed${code ? ` (${code})` : ''}. Please try again.`;
  }
}

export function AuthGate({ lang, onChangeLang, onPrepareSignup }: AuthGateProps) {
  const uz = lang === 'uz';

  // Lamp interactive state
  const [lampOn, setLampOn] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 });
  const dragStartRef = useRef({ x: 0, y: 0 });
  const fireflies = useMemo(() => generateFireflies(), []);

  // Auth form state
  const [tab, setTab] = useState<AuthTab>('login');
  const [username, setUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const toggleLamp = () => {
    setLampOn((prev) => !prev);
    playSound('click');
  };

  const handlePointerDown = (e: ReactPointerEvent<HTMLButtonElement>) => {
    setDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    setDragPos({ x: 0, y: 0 });
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (!dragging) return;
    const rawX = (e.clientX - dragStartRef.current.x) * 0.3;
    const rawY = Math.max(0, e.clientY - dragStartRef.current.y) * 0.6;
    const clampedX = Math.max(-35, Math.min(35, rawX));
    const clampedY = Math.min(180, rawY);
    setDragPos({ x: clampedX, y: clampedY });
  };

  const handlePointerUp = () => {
    if (!dragging) return;
    setDragging(false);
    const pulled = dragPos.y > 30;
    const tapped = Math.abs(dragPos.x) < 4 && dragPos.y < 4;
    setDragPos({ x: 0, y: 0 });
    if (pulled || tapped) {
      toggleLamp();
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const rawLogin = username.trim();
    if (!rawLogin) {
      setErrorMsg(uz ? 'Foydalanuvchi nomini kiriting.' : 'Please enter your username.');
      return;
    }

    if (tab === 'register') {
      const normalized = normalizeUsername(rawLogin);
      if (!isValidUsername(normalized)) {
        setErrorMsg(
          uz
            ? "Username 3–32 belgi bo'lishi va faqat kichik harf, raqam, '_' yoki '.' dan iborat bo'lishi kerak."
            : 'Username must be 3–32 characters using lowercase letters, numbers, underscores, or dots.'
        );
        return;
      }
      const cleanName = sanitizeDisplayName(displayName, normalized);
      if (cleanName.length < 2) {
        setErrorMsg(uz ? 'Ism va familiyangizni kiriting.' : 'Please enter your full name.');
        return;
      }
      if (password.length < 6) {
        setErrorMsg(
          uz
            ? "Parol kamida 6 ta belgidan iborat bo'lishi kerak."
            : 'Password must be at least 6 characters.'
        );
        return;
      }

      setBusy(true);
      try {
        onPrepareSignup(normalized, cleanName);
        const cred = await createUserWithEmailAndPassword(auth, toAuthEmail(normalized), password);
        await updateProfile(cred.user, { displayName: cleanName });
      } catch (err: unknown) {
        const code = (err as { code?: string })?.code;
        setErrorMsg(mapAuthError(code, lang));
      } finally {
        setBusy(false);
      }
      return;
    }

    if (!password) {
      setErrorMsg(uz ? 'Parolni kiriting.' : 'Please enter your password.');
      return;
    }

    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, toAuthEmail(rawLogin), password);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      setErrorMsg(mapAuthError(code, lang));
    } finally {
      setBusy(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setBusy(true);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      setErrorMsg(mapAuthError(code, lang));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className={`lamp-room ${lampOn ? 'on' : ''}`}>
      <div className="lamp-room-light" />

      {/* Top Overlay Navigation: Brand & Language Switcher */}
      <header className="absolute left-0 right-0 top-0 z-30 flex items-center justify-between px-5 py-4 sm:px-8">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-700 text-white shadow-sm ring-1 ring-teal-500/40">
            <GraduationCap className="h-5 w-5" aria-hidden="true" />
          </div>
          <span className="font-display text-base font-bold tracking-tight text-white sm:text-lg">
            {uz ? '7-Sinf ChSB' : 'Grade 7 ChSB'}
          </span>
        </div>

        <div
          role="group"
          aria-label={uz ? 'Tilni tanlash' : 'Select Language'}
          className="inline-flex rounded-lg border border-slate-700/80 bg-slate-900/70 p-0.5 backdrop-blur-md"
        >
          <button
            type="button"
            onClick={() => onChangeLang('uz')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              lang === 'uz' ? 'bg-teal-700 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            O&apos;zbekcha
          </button>
          <button
            type="button"
            onClick={() => onChangeLang('en')}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              lang === 'en' ? 'bg-teal-700 text-white' : 'text-slate-300 hover:text-white'
            }`}
          >
            English
          </button>
        </div>
      </header>

      {/* Glowing Fireflies when Lamp is ON */}
      {lampOn && (
        <div className="lamp-fireflies" aria-hidden="true">
          {fireflies.map((f) => (
            <span
              key={f.id}
              className="lamp-firefly"
              style={
                {
                  width: `${f.size}px`,
                  height: `${f.size}px`,
                  '--duration': `${f.duration}s`,
                  '--delay': `${f.delay}s`,
                  '--x1': `${f.x1}vw`,
                  '--y1': `${f.y1}vh`,
                  '--x2': `${f.x2}vw`,
                  '--y2': `${f.y2}vh`,
                  '--x3': `${f.x3}vw`,
                  '--y3': `${f.y3}vh`,
                  '--x4': `${f.x4}vw`,
                  '--y4': `${f.y4}vh`,
                  '--x5': `${f.x5}vw`,
                  '--y5': `${f.y5}vh`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      )}

      {/* Left Side: Interactive Desk Lamp */}
      <section className="lamp-side">
        <div className="lamp-prompt">
          <span>
            {uz ? 'Chiroqni yoqish uchun ipni torting' : 'Pull the string to turn on the light'}
          </span>
          <i className="lamp-prompt-arrow" />
        </div>

        <div className="lamp-container">
          <div className="lamp-glow" />
          <div
            role="button"
            tabIndex={0}
            aria-label={uz ? 'Chiroqni yoqish' : 'Toggle lamp light'}
            onClick={toggleLamp}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleLamp();
              }
            }}
            className="lamp-head cursor-pointer"
          />
          <div className="lamp-beam" />
          <div className="lamp-stem" />
          <div className="lamp-base" />
          <div className="lamp-desk-surface" />

          <svg className="lamp-string-svg" aria-hidden="true">
            <path d={`M 0 0 L ${dragPos.x} ${80 + dragPos.y}`} />
          </svg>

          <button
            type="button"
            aria-label={uz ? 'Chiroq ipini torting' : 'Pull lamp string'}
            aria-pressed={lampOn}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleLamp();
              }
            }}
            style={{
              transform: `translate(${dragPos.x}px, ${dragPos.y}px)`,
            }}
            className={`lamp-string-handle ${dragging ? 'dragging' : ''}`}
          />
        </div>

        {!lampOn && (
          <button
            type="button"
            onClick={toggleLamp}
            className="mt-6 rounded-full border border-teal-500/40 bg-teal-950/60 px-5 py-2 text-xs font-semibold text-teal-200 transition-colors hover:bg-teal-900/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400"
          >
            {uz ? 'Kirish oynasini ochish (Chiroqni yoqish)' : 'Open Sign In (Turn On Light)'}
          </button>
        )}
      </section>

      {/* Right Side: Website-Styled Login Card */}
      <section className="lamp-login-side">
        <div className="lamp-login-card">
          <div className="lamp-glass-line" />

          <div className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-teal-700 text-white shadow-sm ring-4 ring-teal-50">
              <GraduationCap className="h-6 w-6" aria-hidden="true" />
            </div>
            <h1 className="font-display text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              {tab === 'login'
                ? uz
                  ? '7-Sinf ChSB Platformasi'
                  : 'Grade 7 ChSB Portal'
                : uz
                  ? "Ro'yxatdan O'tish"
                  : 'Create Account'}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {uz
                ? 'Hisobingizga kirish uchun ma’lumotlaringizni kiriting'
                : 'Enter your details to access your account'}
            </p>
          </div>

          {/* Login / Register Toggle */}
          <div className="grid grid-cols-2 rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setErrorMsg(null);
              }}
              className={`flex min-h-[38px] items-center justify-center gap-1.5 rounded-md text-xs font-semibold transition-colors sm:text-sm ${
                tab === 'login'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LogIn className="h-4 w-4" aria-hidden="true" />
              <span>{uz ? 'Kirish' : 'Sign In'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('register');
                setErrorMsg(null);
              }}
              className={`flex min-h-[38px] items-center justify-center gap-1.5 rounded-md text-xs font-semibold transition-colors sm:text-sm ${
                tab === 'register'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              <span>{uz ? "Ro'yxatdan o'tish" : 'Register'}</span>
            </button>
          </div>

          {errorMsg && (
            <div
              role="alert"
              className="rounded-lg border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-medium leading-relaxed text-rose-800"
            >
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
            {tab === 'register' && (
              <label className="relative block">
                <User
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  type="text"
                  maxLength={DISPLAY_NAME_MAX_LEN}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={uz ? 'Ism va familiya (masalan: Ali Valiyev)' : 'Full Name'}
                  className="lamp-input"
                />
              </label>
            )}

            <label className="relative block">
              <User
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                type="text"
                autoComplete="username"
                maxLength={64}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={uz ? 'Foydalanuvchi nomi (Username)' : 'Username'}
                className="lamp-input"
              />
            </label>

            <label className="relative block">
              <Lock
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={uz ? 'Parol' : 'Password'}
                className="lamp-input !pr-11"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-700"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </label>

            <button type="submit" disabled={busy} className="lamp-sign-in mt-1 disabled:opacity-60">
              {tab === 'login'
                ? uz
                  ? 'Kirish'
                  : 'Sign In'
                : uz
                  ? 'Hisob yaratish'
                  : 'Create Account'}
            </button>
          </form>

          <div className="my-1 flex items-center gap-3">
            <span className="h-px flex-1 bg-slate-200" />
            <b className="whitespace-nowrap text-[11px] font-semibold tracking-wider text-slate-400">
              {uz ? 'YOKI DAVOM ETISH' : 'OR CONTINUE WITH'}
            </b>
            <span className="h-px flex-1 bg-slate-200" />
          </div>

          <button
            type="button"
            disabled={busy}
            onClick={handleGoogleSignIn}
            className="lamp-social-btn disabled:opacity-60"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
              />
            </svg>
            <span>{uz ? 'Google bilan kirish' : 'Continue with Google'}</span>
          </button>

          <p className="text-center text-[11px] leading-relaxed text-slate-500">
            {uz
              ? "O'qituvchilar barcha natijalarni ko'rish uchun Google orqali kirishi kerak."
              : 'Teachers sign in with their verified Google account to view results.'}
          </p>
        </div>
      </section>

      <footer className="pointer-events-none absolute bottom-3 left-0 right-0 z-20 text-center text-[11px] text-slate-400">
        Developer: <span className="font-medium text-slate-200">Ibrohimbek Xujanazarov</span>
      </footer>
    </main>
  );
}
