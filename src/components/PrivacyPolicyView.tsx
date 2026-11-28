import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, Globe, Mail, Shield, ShieldAlert, Sparkles } from 'lucide-react';
import { UILanguage } from '../types/quiz';

interface PrivacyPolicyViewProps {
  lang: UILanguage;
  onBack: () => void;
}

export function PrivacyPolicyView({ lang: initialLang, onBack }: PrivacyPolicyViewProps) {
  const [selectedLang, setSelectedLang] = useState<'en' | 'uz'>(initialLang === 'uz' ? 'uz' : 'en');

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Top bar with back navigation and language switch */}
        <div className="bg-slate-900 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-200 hover:text-white transition"
          >
            <ArrowLeft className="h-4 w-4" />
            {selectedLang === 'uz' ? 'Ilovaga qaytish' : 'Back to Platform'}
          </button>

          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-emerald-400" />
            <div className="flex rounded-lg bg-slate-800 p-0.5 border border-slate-700">
              <button
                type="button"
                onClick={() => setSelectedLang('en')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                  selectedLang === 'en'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setSelectedLang('uz')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                  selectedLang === 'uz'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                O‘zbekcha
              </button>
            </div>
          </div>
        </div>

        {/* Header Header */}
        <div className="p-6 sm:p-10 border-b border-slate-100 bg-gradient-to-br from-emerald-50/50 via-white to-slate-50">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-4">
            <Shield className="h-3.5 w-3.5" />
            {selectedLang === 'uz' ? 'Rasmiy Maxfiylik Hujjati' : 'Official Store Privacy Policy'}
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
            {selectedLang === 'uz' ? 'Maxfiylik Siyosati' : 'Privacy Policy'}
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {selectedLang === 'uz'
              ? 'Prep App For 7 Graders (ChSB Prep) — 7-sinf o‘quvchilari uchun ta’lim dasturi'
              : 'Prep App For 7 Graders (CHSB Prep) — Educational exam preparation platform'}
          </p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600 bg-white p-4 rounded-xl border border-slate-200/80">
            <div>
              <span className="font-semibold text-slate-800 block">{selectedLang === 'uz' ? 'Ishlab chiquvchi:' : 'Publisher:'}</span>
              Ibrohimbek Xujanazarov
            </div>
            <div>
              <span className="font-semibold text-slate-800 block">Package ID:</span>
              IbrohimbekXujanazarov.ChSBforPS
            </div>
            <div>
              <span className="font-semibold text-slate-800 block">{selectedLang === 'uz' ? 'Sana:' : 'Effective Date:'}</span>
              November 28, 2026
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-10 space-y-8 text-slate-700 leading-relaxed text-[15px]">
          {selectedLang === 'en' ? (
            <>
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold inline-flex items-center justify-center">1</span>
                  Overview &amp; Purpose
                </h2>
                <p>
                  This Privacy Policy applies to the <strong>Prep App For 7 Graders (CHSB Prep)</strong> application, developed and published by <strong>Ibrohimbek Xujanazarov</strong>. The application is an educational study platform providing practice examinations for 7th-grade students across 6 subjects: Mathematics, History, Science, Computing, English, and Uzbek Language &amp; Literature.
                </p>
                <p className="mt-2">
                  We are deeply committed to protecting the privacy and safety of all our users, particularly young learners, children, and students.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold inline-flex items-center justify-center">2</span>
                  Data We Collect
                </h2>
                <p>We practice strict data minimization. The application collects only what is required to track educational progress:</p>
                <ul className="mt-3 space-y-2 list-disc list-inside text-slate-600">
                  <li><strong>Student Nickname:</strong> A display nickname chosen by the student or user. We do not require or collect legal names, physical addresses, or phone numbers.</li>
                  <li><strong>Exam Scores &amp; Achievements:</strong> Quiz answers, percentage scores, test completion times, milestone badges, and unlocked rank titles/frames.</li>
                  <li><strong>Device Preferences:</strong> Locally stored settings (audio on/off, high-contrast mode, selected UI language) preserved on device via LocalStorage.</li>
                </ul>
              </section>

              <section className="bg-amber-50/70 border border-amber-200 rounded-xl p-5">
                <h2 className="text-lg font-bold text-amber-950 mb-2 flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-amber-700" />
                  3. Camera Proctoring (Strictly Local)
                </h2>
                <p className="text-sm text-amber-900 leading-relaxed">
                  The application features an optional practice proctoring simulator to help students prepare for monitored exam environments. When enabled by the user, the camera feed is processed <strong>strictly and entirely on the user's local device</strong>.
                </p>
                <p className="mt-2 text-sm text-amber-950 font-semibold">
                  NO video feeds, photos, recordings, or facial data are ever saved, stored, or transmitted to any server or external party.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold inline-flex items-center justify-center">4</span>
                  Third-Party Services
                </h2>
                <p>The application relies solely on enterprise-grade infrastructure to synchronize educational scores:</p>
                <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 font-semibold text-slate-900">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Google Firebase (Cloud Firestore &amp; Authentication)
                  </div>
                  <p className="mt-1 text-xs text-slate-600">
                    Used to store anonymous user progress, score leaderboards, and earned ranks under Google Cloud's secure privacy standards.
                  </p>
                </div>
                <p className="mt-3 text-sm text-slate-500">
                  We do NOT integrate advertising networks, trackers, analytics brokers, or commercial behavioral profiling scripts.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold inline-flex items-center justify-center">5</span>
                  Children's Privacy (COPPA &amp; GDPR-K)
                </h2>
                <p>
                  As an educational tool intended for 7th-grade students (ages 12–14), we comply fully with children's privacy principles:
                </p>
                <ul className="mt-2 space-y-1.5 list-disc list-inside text-slate-600 text-sm">
                  <li>No personal identifying data is sold, leased, or rented.</li>
                  <li>No in-app purchases, targeted advertisements, or monetary transactions exist.</li>
                  <li>Parents and legal guardians may request review or deletion of any student records at any time.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold inline-flex items-center justify-center">6</span>
                  Data Deletion &amp; Contact
                </h2>
                <div className="p-5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
                  <p className="font-semibold text-slate-900 mb-1">Developer &amp; Publisher Contact:</p>
                  <p className="text-sm text-slate-700"><strong>Name:</strong> Ibrohimbek Xujanazarov</p>
                  <p className="text-sm text-slate-700">
                    <strong>Support &amp; Data Deletion Email:</strong>{' '}
                    <a href="mailto:ibrohimbekxujanazarov@gmail.com" className="text-emerald-700 font-semibold underline">
                      ibrohimbekxujanazarov@gmail.com
                    </a>
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    Requests for student data deletion will be processed within 48 hours.
                  </p>
                </div>
              </section>
            </>
          ) : (
            <>
              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold inline-flex items-center justify-center">1</span>
                  Umumiy Ma’lumot va Maqsad
                </h2>
                <p>
                  Ushbu Maxfiylik Siyosati <strong>Ibrohimbek Xujanazarov</strong> tomonidan ishlab chiqilgan va nashr etilgan <strong>Prep App For 7 Graders (CHSB Prep)</strong> ilovasiga tegishlidir. Ilova 7-sinf o‘quvchilarining 6 ta fan (Matematika, Tarix, Science, Informatika, Ingliz tili va Ona tili) bo‘yicha ChSB imtihonlariga tayyorlanishi uchun xizmat qiladi.
                </p>
                <p className="mt-2">
                  Biz foydalanuvchilarimiz, xususan yosh o‘quvchilar va bolalarning shaxsiy daxlsizligi hamda xavfsizligini ta’minlashni oliy o‘ringa qo‘yamiz.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold inline-flex items-center justify-center">2</span>
                  Qanday Ma’lumotlar To‘planadi?
                </h2>
                <p>Biz faqat ta’limiy natijalarni ko‘rsatish uchun eng zarur bo‘lgan minimal ma’lumotlarni yig‘amiz:</p>
                <ul className="mt-3 space-y-2 list-disc list-inside text-slate-600">
                  <li><strong>O‘quvchi taxallusi (nikneym):</strong> O‘quvchi tomonidan tanlangan ixtiyoriy ism. Pasport ma’lumotlari, telefon raqami yoki manzil talab qilinmaydi.</li>
                  <li><strong>Test natijalari va yutuqlar:</strong> Yechilgan testlar, to‘plangan ballar, sarflangan vaqt, yutuq nishonlari va ochilgan unvonlar.</li>
                  <li><strong>Qurilma sozlamalari:</strong> Ovozni yoqish/o‘chirish, yuqori kontrastli rejim va tanlangan til faqat o‘quvchining o‘z qurilmasida saqlanadi.</li>
                </ul>
              </section>

              <section className="bg-amber-50/70 border border-amber-200 rounded-xl p-5">
                <h2 className="text-lg font-bold text-amber-950 mb-2 flex items-center gap-2">
                  <ShieldAlert className="h-5 w-5 text-amber-700" />
                  3. Kamera va Proktorlik (Faqat Qurilmaning O‘zida)
                </h2>
                <p className="text-sm text-amber-900 leading-relaxed">
                  Ilovada haqiqiy imtihon muhitini simulyatsiya qilish uchun ixtiyoriy kamera proktorlik funksiyasi mavjud. Foydalanuvchi ruxsat bergan taqdirda ham, video tasvir <strong>faqatgina o‘quvchining o‘z qurilmasida</strong> tahlil qilinadi.
                </p>
                <p className="mt-2 text-sm text-amber-950 font-semibold">
                  HECH QANDAY video, surat yoki biometrik ma’lumotlar yozib olinmaydi, saqlanmaydi va tashqi serverlarga yuborilmaydi!
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold inline-flex items-center justify-center">4</span>
                  Tashqi Xizmatlar
                </h2>
                <p>Natijalarni sinf reytingida ko‘rsatish uchun faqat bitta ishonchli xizmatdan foydalaniladi:</p>
                <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 font-semibold text-slate-900">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Google Firebase (Firestore &amp; Auth)
                  </div>
                  <p className="mt-1 text-xs text-slate-600">
                    O‘quvchilarning umumiy reytingi va ballarini xavfsiz saqlash uchun Google standartlari asosida ishlaydi.
                  </p>
                </div>
                <p className="mt-3 text-sm text-slate-500">
                  Dasturda hech qanday reklama tarmoqlari, foydalanuvchini kuzatish tizimlari yoki tijoriy trekerlar yo‘q.
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold inline-flex items-center justify-center">5</span>
                  Bog‘lanish va Ma’lumotlarni O‘chirish
                </h2>
                <div className="p-5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200">
                  <p className="font-semibold text-slate-900 mb-1">Ishlab chiquvchi va murojaat:</p>
                  <p className="text-sm text-slate-700"><strong>Muallif:</strong> Ibrohimbek Xujanazarov</p>
                  <p className="text-sm text-slate-700">
                    <strong>Elektron pochta:</strong>{' '}
                    <a href="mailto:ibrohimbekxujanazarov@gmail.com" className="text-emerald-700 font-semibold underline">
                      ibrohimbekxujanazarov@gmail.com
                    </a>
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    Foydalanuvchi ma’lumotlarini o‘chirish bo‘yicha arizalar 48 soat ichida bajariladi.
                  </p>
                </div>
              </section>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
          <div>&copy; 2026 Ibrohimbek Xujanazarov. All rights reserved.</div>
          <button
            onClick={onBack}
            className="text-emerald-700 font-semibold hover:underline"
          >
            {selectedLang === 'uz' ? 'Ilovaga qaytish' : 'Return to App'}
          </button>
        </div>
      </div>
    </div>
  );
}
