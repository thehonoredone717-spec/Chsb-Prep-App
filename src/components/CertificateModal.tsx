import { Award, Printer, X } from 'lucide-react';
import { pickText, UI_COPY } from '../data/subjects';
import { SubjectConfig, UILanguage } from '../types/quiz';

interface CertificateModalProps {
  lang: UILanguage;
  studentName: string;
  subject: SubjectConfig;
  score: number;
  total: number;
  grade: number;
  dateStr: string;
  onClose: () => void;
}

export function CertificateModal({
  lang,
  studentName,
  subject,
  score,
  total,
  grade,
  dateStr,
  onClose,
}: CertificateModalProps) {
  const subjectName = pickText(subject.title, lang);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 p-4 overflow-y-auto backdrop-blur-sm"
    >
      <div className="relative w-full max-w-3xl rounded-3xl border-4 border-amber-400 bg-white p-8 shadow-2xl sm:p-12 print:border-none print:shadow-none print:p-0">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label={lang === 'uz' ? 'Yopish' : 'Close'}
          className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700 print:hidden"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>

        {/* Certificate Content */}
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 shadow-inner ring-4 ring-amber-200">
            <Award className="h-9 w-9" aria-hidden="true" />
          </div>

          <p className="mt-4 font-display text-xs font-bold uppercase tracking-widest text-amber-600 sm:text-sm">
            {lang === 'uz' ? 'O‘QUVCHILAR UCHUN TAQDIRNOMA' : 'CERTIFICATE OF EXCELLENCE'}
          </p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            {lang === 'uz' ? 'Muvaffaqiyat Sertifikati' : 'Certificate of Achievement'}
          </h1>

          <p className="mt-4 text-sm text-slate-600 sm:text-base">
            {lang === 'uz'
              ? 'Ushbu sertifikat quyidagi o‘quvchiga 7-sinf ChSB tayyorgarlik imtihonida ko‘rsatgan yuksak natijasi uchun taqdim etiladi:'
              : 'This certificate is proudly presented to the following student for outstanding performance in the Grade 7 ChSB Prep Examination:'}
          </p>

          <div className="my-8 py-4 border-y-2 border-dashed border-amber-200">
            <h2 className="font-display text-2xl font-extrabold text-teal-800 sm:text-3xl">
              {studentName}
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-8 text-left bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">
                {lang === 'uz' ? 'Fan' : 'Subject'}
              </p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{subjectName}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase">
                {lang === 'uz' ? 'Natija va Baho' : 'Score & Grade'}
              </p>
              <p className="text-sm font-bold text-teal-700 mt-0.5">
                {score} / {total} ({lang === 'uz' ? `Baho: ${grade}` : `Grade ${grade}`})
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 px-4 mt-12">
            <div>
              <p className="font-semibold text-slate-900">NavPS ChSB Prep Platform</p>
              <p>{dateStr}</p>
            </div>
            <div className="text-right">
              <div className="font-display font-bold text-teal-800 text-sm">Ibrohimbek Xujanazarov</div>
              <p>{lang === 'uz' ? 'Platforma Muallifi' : 'Platform Creator'}</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex items-center justify-center gap-3 print:hidden">
          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-teal-700 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-colors hover:bg-teal-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
          >
            <Printer className="h-4 w-4" aria-hidden="true" />
            <span>{lang === 'uz' ? 'Chop etish / PDF Saqlash' : 'Print / Save PDF'}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-700"
          >
            {lang === 'uz' ? 'Yopish' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
