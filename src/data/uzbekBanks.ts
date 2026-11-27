import { DifficultyLevel, QuestionItem } from '../types/quiz';

const UZBEK_TOPICS = [
  '1. Olmosh turkumi va turlari',
  "2. Fe'l va uning shakllari",
  '3. Ravish va uning turlari',
  "4. Yordamchi so'zlar va imlo",
  "5. Sintaksis va so'z birikmasi",
  '6. Mumtoz va xalq og‘zaki adabiyoti',
  "7. O'zbek nasri (S. Ayniy, O'. Hoshimov, T. Murod, A. Qodiriy)",
  '8. Adabiyot nazariyasi va badiiy tahlil',
] as const;

interface UzRuleEntry {
  topicIdx: number;
  diff: DifficultyLevel;
  title: string;
  exampleTest: string;
  exampleExam: string;
  answer: string;
  d1: string;
  d2: string;
  d3: string;
  explain: string;
}

const UZ_RULE_BANK: UzRuleEntry[] = [
  // Topic 0: Olmosh
  {
    topicIdx: 0, diff: 'easy', title: 'Kishilik olmoshlari',
    exampleTest: '«Ular ertaga kutubxonaga boradilar» gapidagi olmosh turi',
    exampleExam: '«Men va sen bu topshiriqni hamjihatlikda bajaramiz» gapidagi olmoshlar',
    answer: 'Kishilik olmoshi (shaxsni bildiradi)',
    d1: 'Belgilash olmoshi', d2: 'Gumon olmoshi', d3: 'O‘zlik olmoshi',
    explain: 'Men, sen, u, biz, siz, ular — kishilik olmoshlari bo‘lib, uchta shaxsni ifodalaydi.',
  },
  {
    topicIdx: 0, diff: 'easy', title: 'O‘zlik olmoshi',
    exampleTest: '«O‘zingga ravo ko‘rganingni o‘zgaga ham ravo ko‘r» maqolidagi «o‘z» olmoshi',
    exampleExam: '«O‘zim mustaqil ravishda misolni yechdim» gapidagi «o‘zim» so‘zi',
    answer: 'O‘zlik olmoshi (ega bilan bog‘lanib shaxsni ta’kidlaydi)',
    d1: 'Ko‘rsatish olmoshi', d2: 'So‘roq olmoshi', d3: 'Bo‘lishsizlik olmoshi',
    explain: '«O‘z» so‘zi o‘zbek tilidagi yagona o‘zlik olmoshi bo‘lib, egalik va kelishik qo‘shimchalarini oladi.',
  },
  {
    topicIdx: 0, diff: 'medium', title: 'Ko‘rsatish olmoshlari',
    exampleTest: '«Ana shu bino yangi sport majmuasidir» birikmasidagi ta’kidlovchi olmosh',
    exampleExam: '«Bu kitobda qadimiy afsonalar jamlangan» gapidagi «bu» so‘zi',
    answer: 'Ko‘rsatish olmoshi (shaxs, narsa yoki belgini ishora qiladi)',
    d1: 'Kishilik olmoshi', d2: 'Gumon olmoshi', d3: 'Belgilash olmoshi',
    explain: 'Bu, shu, o‘sha, u, ana, mana, bunday, shunday so‘zlari ko‘rsatish olmoshlaridir.',
  },
  {
    topicIdx: 0, diff: 'medium', title: 'Belgilash olmoshlari',
    exampleTest: '«Hamma o‘quvchilar bayram tadbiriga jamlandi» gapidagi «hamma» so‘zi',
    exampleExam: '«Har bir inson tabiatni asrashi lozim» jumlasidagi «har bir»',
    answer: 'Belgilash olmoshi (jamlash va ajratib belgilash ma’nosini beradi)',
    d1: 'Bo‘lishsizlik olmoshi', d2: 'So‘roq olmoshi', d3: 'Ravish',
    explain: 'Hamma, barcha, bari, har kim, har narsa, har bir — belgilash olmoshlaridir.',
  },
  {
    topicIdx: 0, diff: 'hard', title: 'Gumon olmoshlari va yozilishi',
    exampleTest: '«Kimdir eshikni asta taqillatdi» gapidagi «kimdir» so‘zi',
    exampleExam: '«Allaqachon» ravishidan farqli o‘laroq «allakim», «nimadir» so‘zlari',
    answer: 'Gumon olmoshi (-dir qo‘shimchasi yoki alla- old qo‘shimchasi bilan yasaladi, qo‘shib yoziladi)',
    d1: 'Bo‘lishsizlik olmoshi (ajratib yoziladi)', d2: 'Yuklama bilan birikkan ot', d3: 'Qaratqich kelishigidagi sifat',
    explain: 'Gumon olmoshlari noaniqlikni bildiradi va -dir, alla- unsurlari bilan qo‘shib yoziladi.',
  },

  // Topic 1: Fe'l va uning shakllari
  {
    topicIdx: 1, diff: 'easy', title: 'Qo‘shma fe’l',
    exampleTest: '«Ukam bog‘dagi gullarga suv quyib yordam berdi» gapidagi kesim',
    exampleExam: '«O‘quvchilar muzey tomoshasidan mamnun bo‘ldilar» gapidagi fe’l',
    answer: 'Qo‘shma fe’l (ot/sifat + ko‘makchi fe’l yoki ikki fe’ldan tuzilib bir ma’no bildiradi)',
    d1: 'Sodda tub fe’l', d2: 'Takroriy ravish', d3: 'Yordamchi bog‘lovchi',
    explain: '«Yordam berdi», «mamnun bo‘ldi» — ikki so‘zdan tashkil topib bitta harakat/holatni bildiruvchi qo‘shma fe’llar.',
  },
  {
    topicIdx: 1, diff: 'medium', title: 'Fe’lning shart mayli (-sa)',
    exampleTest: '«Agar ko‘p kitob o‘qisang, nutqing ravonlashadi» gapidagi «o‘qisang» fe’li',
    exampleExam: '«Bahor kelsa, dalalar ko‘m-ko‘k maysaga burkanadi» jumlasidagi «kelsa» shakli',
    answer: 'Shart mayli (-sa qo‘shimchasi orqali harakatning bajarilish shartini bildiradi)',
    d1: 'Buyruq-istak mayli', d2: 'Xabar maylining o‘tgan zamoni', d3: 'Majhul nisbat shakli',
    explain: 'Fe’l asosiga -sa qo‘shimchasi qo‘shilishi bilan shart mayli yasaladi.',
  },
  {
    topicIdx: 1, diff: 'medium', title: 'Buyruq-istak mayli',
    exampleTest: '«Vatanimizning shuhratini yuksaklarga ko‘taraylik!» gapidagi kesim',
    exampleExam: '«Darsga doimo o‘z vaqtida tayyorgarlik ko‘ringlar» jumlasidagi fe’l mayli',
    answer: 'Buyruq-istak mayli (undash, da’vat, iltimos yoki istak bildiradi)',
    d1: 'Shart mayli', d2: 'Aniq xabar mayli', d3: 'Ravishdosh shakli',
    explain: '-ay/-aylik (I shaxs), -(i)ng/-(i)ngiz (II shaxs), -sin (III shaxs) buyruq-istak maylini yasaydi.',
  },
  {
    topicIdx: 1, diff: 'hard', title: 'Juft va takroriy fe’llar imlosi',
    exampleTest: '«Bolalar hovlida kula-kula yugurishardi» birikmasidagi «kula-kula»',
    exampleExam: '«Mehmonlar bilan uchrashib bordi-keldi qilishdi» gapidagi «bordi-keldi»',
    answer: 'Takroriy / juft fe’l bo‘lib, har ikki qismi orasiga chiziqcha (defis) qo‘yiladi',
    d1: 'Qo‘shib yoziladigan qo‘shma fe’l', d2: 'Ajratib yoziladigan ko‘makchi', d3: 'Sifatdosh oboroti',
    explain: 'Juft va takroriy fe’llar (bordi-keldi, o‘qib-o‘rganib, yozib-chizib) hamisha chiziqcha bilan yoziladi.',
  },

  // Topic 2: Ravish
  {
    topicIdx: 2, diff: 'easy', title: 'Holat (tarz) ravishi',
    exampleTest: '«Sportchi marraga tez va chaqqon yetib keldi» gapidagi «tez», «chaqqon» so‘zlari',
    exampleExam: '«O‘quvchi she’rni ifodali va ravon o‘qidi» gapidagi harakat belgisini bildirgan so‘z',
    answer: 'Holat ravishi («qanday?», «qay tarzda?» so‘roqlariga javob bo‘lib fe’lga bog‘lanadi)',
    d1: 'Payt ravishi', d2: 'O‘rin ravishi', d3: 'Sifat (otga bog‘langan)',
    explain: 'Harakatning qay tarzda bajarilishini bildirib fe’lga bog‘lanuvchi so‘zlar holat ravishidir.',
  },
  {
    topicIdx: 2, diff: 'easy', title: 'Payt ravishi',
    exampleTest: '«Kecha boshlangan musobaqa bugun yakunlandi» gapidagi «kecha» va «bugun»',
    exampleExam: '«Hamisha ezgu maqsad sari olg‘a intiling» jumlasidagi «hamisha» so‘zi',
    answer: 'Payt ravishi (ish-harakatning bajarilish vaqtini ko‘rsatadi)',
    d1: 'Miqdor-daraja ravishi', d2: 'Maqsad ravishi', d3: 'O‘rin ravishi',
    explain: 'Kecha, bugun, ertaga, hamisha, endi, dastlab so‘zlari payt ravishlaridir.',
  },
  {
    topicIdx: 2, diff: 'medium', title: 'Maqsad va sabab ravishlari',
    exampleTest: '«U bu savolni sinov tariqasida atayin berdi» gapidagi «atayin» so‘zi',
    exampleExam: '«Noilojlikdan bu taklifga rozi bo‘ldi» gapidagi «noilojlikdan» ravishi',
    answer: 'Maqsad («atayin» — nima maqsadda?) va sabab («noilojlikdan» — nima sababdan?) ravishlari',
    d1: 'O‘rin ravishlari', d2: 'Belgilash olmoshlari', d3: 'Sifat darajalari',
    explain: 'Atayin, ataylab, qasddan — maqsad ravishi; noiloj, ilojsizlikdan — sabab ravishi.',
  },
  {
    topicIdx: 2, diff: 'hard', title: 'Miqdor-daraja ravishi',
    exampleTest: '«Bu yil bog‘da ancha ko‘p meva yetishtirildi» gapidagi «ancha» va «ko‘p»',
    exampleExam: '«Kechga borib havo sal salqinlashdi» gapidagi «sal» so‘zi',
    answer: 'Miqdor-daraja ravishi (harakat yoki belgining oz-ko‘pligini va darajasini bildiradi)',
    d1: 'Payt ravishi', d2: 'Gumon olmoshi', d3: 'Chiqish kelishigi',
    explain: 'Ko‘p, oz, ancha, sal, xiyol, g‘oyat so‘zlari miqdor-daraja ravishlaridir.',
  },

  // Topic 3: Yordamchi so'zlar va imlo
  {
    topicIdx: 3, diff: 'easy', title: 'Ko‘makchilar',
    exampleTest: '«Ilm olish uchun qunt bilan mehnat qilish zarur» gapidagi «uchun» va «bilan»',
    exampleExam: '«Do‘stlar tog‘ tomon yo‘l oldilar» jumlasidagi «tomon» yordamchi so‘zi',
    answer: 'Sof va vazifadosh ko‘makchilar (ot va olmoshlarni fe’lga tobelab bog‘laydi)',
    d1: 'Teng bog‘lovchilar', d2: 'So‘roq yuklamalari', d3: 'Modal so‘zlar',
    explain: 'Uchun, bilan, kabi, singari, orqali, tomon, sababli — ko‘makchilar guruhiga kiradi.',
  },
  {
    topicIdx: 3, diff: 'medium', title: 'Yuklamalar imlosi',
    exampleTest: '«Siz ham bu tanlovda qatnashasizmi?» gapidagi «-mi» so‘roq unsuri',
    exampleExam: '«Buni do‘stlarimga ham aytdim-ku!» gapidagi «-ku» ta’kid unsuri',
    answer: 'Yuklama (-mi so‘zga qo‘shib yoziladi; -ku, -da, -chi yuklamalari esa chiziqcha bilan)',
    d1: 'Zidlov bog‘lovchisi (hamisha vergul bilan)', d2: 'Egalik qo‘shimchasi', d3: 'Kelishik shakli',
    explain: 'Imlo qoidasiga ko‘ra -mi qo‘shib, -chi/-ku/-u/-yu/-da yuklamalari esa chiziqcha bilan ajratib yoziladi.',
  },
  {
    topicIdx: 3, diff: 'hard', title: 'Tovush o‘zgarishlari (tushishi va ortishi)',
    exampleTest: '«O‘g‘il + i → o‘g‘li», «shahar + i → shahri» so‘zlaridagi fonetik hodisa',
    exampleExam: '«Parvo + y + i → parvoyi», «u + n + ga → unga» so‘zlaridagi imlo hodisasi',
    answer: 'Birinchisida tovush tushishi (unli tushishi), ikkinchisida tovush ortishi hodisasi',
    d1: 'Ikkalasida ham singarmonizm', d2: 'Faqat urg‘uning ko‘chishi', d3: 'Tovush almashishi (b→p)',
    explain: 'Ikkinchi bo‘g‘inda tor unli tushishi (o‘g‘li, shahri) va birikishda tovush ortishi (unga, parvoyi) imlo me’yoridir.',
  },

  // Topic 4: Sintaksis va so'z birikmasi
  {
    topicIdx: 4, diff: 'easy', title: 'Moslashuv aloqasi',
    exampleTest: '«Maktabning shinam kutubxonasi» so‘z birikmasidagi tobe va hokim qism aloqasi',
    exampleExam: '«O‘zbekistonning go‘zal tabiati» birikmasidagi sintaktik bog‘lanish',
    answer: 'Moslashuv aloqasi (qaratqich kelishigi -ning va egalik qo‘shimchasi -i/-si shaxs-sonda moslashadi)',
    d1: 'Bitishuv aloqasi', d2: 'Boshqaruv aloqasi', d3: 'Teng bog‘lanish',
    explain: 'Qaratqich-qaralmish munosabati (-ning ... -i/-si) moslashuv aloqasini hosil qiladi.',
  },
  {
    topicIdx: 4, diff: 'medium', title: 'Boshqaruv aloqasi',
    exampleTest: '«Qiziqarli kitobni o‘qimoq» va «do‘stiga yordam bermoq» birikmalaridagi aloqa',
    exampleExam: '«Qalam bilan rasm chizmoq» birikmasidagi hokim va tobe so‘z munosabati',
    answer: 'Boshqaruv aloqasi (hokim so‘z tobe so‘zni tushum, jo‘nalish, o‘rin, chiqish kelishigi yoki ko‘makchi orqali boshqaradi)',
    d1: 'Moslashuv aloqasi', d2: 'Bitishuv aloqasi', d3: 'Kirish so‘z aloqasi',
    explain: 'Tobe so‘z kelishik (qaratqichdan tashqari) yoki ko‘makchi bilan kelsa boshqaruv aloqasi yuzaga keladi.',
  },
  {
    topicIdx: 4, diff: 'medium', title: 'Bitishuv aloqasi',
    exampleTest: '«Baland bino», «tez yugurmoq», «oltin kuz» birikmalaridagi so‘z bog‘lanishi',
    exampleExam: '«Toza havo» va «asta gapirmoq» so‘z birikmalaridagi sintaktik bog‘lanish',
    answer: 'Bitishuv aloqasi (hech qanday grammatik qo‘shimchasiz faqat ma’no va ohang orqali bog‘lanadi)',
    d1: 'Moslashuv aloqasi', d2: 'Boshqaruv aloqasi', d3: 'Bog‘lovchili qo‘shma gap',
    explain: 'Sifat+ot va ravish+fe’l birikmalari qo‘shimchasiz bitishuv yo‘li bilan bog‘lanadi.',
  },

  // Topic 5: Mumtoz va xalq og'zaki adabiyoti
  {
    topicIdx: 5, diff: 'easy', title: 'Mahmud Koshg‘ariy merosi',
    exampleTest: 'XI asrda turkiy xalqlarning tili, maqol va qo‘shiqlarini jamlagan shoh asar',
    exampleExam: 'Mahmud Koshg‘ariy yaratgan ensiklopedik lug‘at va xalq og‘zaki ijodi xazinasi',
    answer: '«Devonu lug‘atit turk» (Turkiy so‘zlar devoni)',
    d1: '«Xamsa» beshligi', d2: '«Boburnoma»', d3: '«Ot kishnagan oqshom»',
    explain: '«Devonu lug‘atit turk» XI asr turkiy tilshunosligi va folklorining bebaho yodgorligidir.',
  },
  {
    topicIdx: 5, diff: 'medium', title: 'Alisher Navoiy «Xamsa»si',
    exampleTest: 'Turkiy tilda yaratilgan ilk «Xamsa» dostonlari muallifi va undagi dostonlar soni',
    exampleExam: 'Alisher Navoiyning 1483–1485-yillarda yozilgan besh dostonlik muazzam asari',
    answer: 'Alisher Navoiy; besh dostondan («Hayrat ul-abror», «Farhod va Shirin», «Layli va Majnun», «Sab’ai sayyor», «Saddi Iskandariy») iborat',
    d1: 'Yusuf Xos Hojib; uch qissadan iborat', d2: 'Ahmad Yugnakiy; yetti g‘azaldan iborat', d3: 'Pahlavon Mahmud; o‘n ruboiydan iborat',
    explain: 'Navoiy o‘zbek (turkiy) adabiyotida birinchi bo‘lib to‘liq besh dostonlik «Xamsa» yaratgan.',
  },
  {
    topicIdx: 5, diff: 'easy', title: 'Xalq og‘zaki ijodi — «Alpomish»',
    exampleTest: 'Qo‘ng‘irot elining mard pahlavoni Hakimbekning qahramonliklari kuylangan o‘zbek xalq dostoni',
    exampleExam: 'O‘zbek xalq baxshilari ijro etadigan «Barchinoy» va «Hakimbek» obrazlari mavjud qahramonlik dostoni',
    answer: '«Alpomish» dostoni',
    d1: '«Rustamxon» ertagi', d2: '«Zarbulmasal»', d3: '«O‘tkan kunlar»',
    explain: '«Alpomish» o‘zbek xalq og‘zaki ijodining eng yirik qahramonlik eposidir.',
  },

  // Topic 6: O'zbek nasri
  {
    topicIdx: 6, diff: 'easy', title: 'O‘tkir Hoshimov — «Dunyoning ishlari»',
    exampleTest: 'O‘zbek nasrida ona siymosining cheksiz mehri va fidoyiligini hikoyalar orqali ulug‘lagan asar',
    exampleExam: 'O‘tkir Hoshimov qalamiga mansub «Gilam paypoq», «Oq, oydin kechalar» hikoyalarini o‘z ichiga olgan qissa',
    answer: '«Dunyoning ishlari» qissasi',
    d1: '«Mehrobdan chayon»', d2: '«Esdaliklar»', d3: '«Yulduzli tunlar»',
    explain: '«Dunyoning ishlari» asarining bosh qahramoni — mehribon, munis Ona siymosidir.',
  },
  {
    topicIdx: 6, diff: 'medium', title: 'Tog‘ay Murod — «Ot kishnagan oqshom»',
    exampleTest: '«Ot kishnagan oqshom» qissasidagi Ziyodulla chavandoz va uning sadoqatli tulpori nomi',
    exampleExam: 'Tog‘ay Murodning qishloq qadriyatlarini va ot bilan inson do‘stligini kuylagan qissasi qahramoni',
    answer: 'Ziyodulla chavandoz va Tarlon ot',
    d1: 'Otabek va Kumushbibi', d2: 'Anvar va Ra’no', d3: 'Qorabotir va Boychibor',
    explain: 'Qissada Ziyodulla chavandozning Tarlon oti orqali mardlik va halollik g‘oyalari tarannum etiladi.',
  },
  {
    topicIdx: 6, diff: 'hard', title: 'Abdulla Qodiriy va o‘zbek romanchiligi',
    exampleTest: 'O‘zbek adabiyotida birinchi milliy roman — «O‘tkan kunlar» asarining muallifi',
    exampleExam: 'Otabek, Yusufbek hoji va Kumush obrazlarini yaratgan buyuk adib',
    answer: 'Abdulla Qodiriy (Julqunboy)',
    d1: 'Sadriddin Ayniy', d2: 'Said Ahmad', d3: 'Oybek',
    explain: 'Abdulla Qodiriy XX asr boshida «O‘tkan kunlar» va «Mehrobdan chayon» romanlari bilan milliy romanchilik maktabini yaratdi.',
  },

  // Topic 7: Adabiyot nazariyasi va badiiy tahlil
  {
    topicIdx: 7, diff: 'easy', title: 'Syujet elementlari',
    exampleTest: 'Badiiy asar syujetining besh asosiy bosqichi ketma-ketligi',
    exampleExam: 'Asarda voqealar tugunlanishi, rivoji va eng keskin nuqtaga yetishidan iborat tarkib',
    answer: 'Ekspozitsiya → tugun → voqealar rivoji → kulminatsiya → yechim',
    d1: 'Sarlavha → mundarija → izoh → lug‘at', d2: 'Qofiya → radif → vazn → bayt', d3: 'Epitet → metafora → tazod → mubolag‘a',
    explain: 'Syujet ekspozitsiyadan boshlanib tugun, voqealar rivoji, kulminatsiya (cho‘qqi) va yechim bilan tugaydi.',
  },
  {
    topicIdx: 7, diff: 'medium', title: 'Metafora (ko‘chim) va O‘xshatish',
    exampleTest: '«Kumush qish keldi» birikmasidagi yashirin o‘xshatish («-dek» qo‘shimchasisiz ko‘chim)',
    exampleExam: '«Ko‘zlarida yulduz chaqnadi» jumlasida so‘z ma’nosining o‘xshashlik asosida ko‘chishi',
    answer: 'Metafora (isti’ora)',
    d1: 'Anaphora', d2: 'Tazod (qarama-qarshi qo‘yish)', d3: 'Mubolag‘a',
    explain: 'Narsa va hodisalarning o‘xshash belgisiga ko‘ra nomi ko‘chirilishi metafora (isti’ora) sanaladi.',
  },
  {
    topicIdx: 7, diff: 'hard', title: 'Mubolag‘a (giperbola) va Tazod',
    exampleTest: '«Bir ohu tortdimki, tog‘lar larzaga keldi» misrasidagi badiiy tasvir vositasi',
    exampleExam: '«Daryo bo‘lib oqdi ko‘z yoshim» satrida holatni bo‘rttirib ko‘rsatish san’ati',
    answer: 'Mubolag‘a (bo‘rttirish san’ati)',
    d1: 'Tashxis (jonlantirish)', d2: 'Radd ul-aruz', d3: 'Sarlavha tanlash',
    explain: 'Qahramon qudrati yoki tuyg‘ularini oshirib, bo‘rttirib tasvirlash mubolag‘a san’atidir.',
  },
];

// Extensive grammatical sentence drills across Topics 0..7 with completely disjoint sentence sets for Test & Exam!
interface SentencePatternDrill {
  topicIdx: number;
  diff: DifficultyLevel;
  questionStem: (sent: string) => string;
  answer: string;
  wrongs: [string, string, string];
  explain: string;
  testSentences: string[];
  examSentences: string[];
}

const UZ_SENTENCE_DRILLS: SentencePatternDrill[] = [
  // Topic 0: Olmosh
  {
    topicIdx: 0, diff: 'easy',
    questionStem: (s) => `Gapni o‘qing: «${s}» — bu gapdagi olmoshning ma’no turi qaysi?`,
    answer: 'So‘roq olmoshi',
    wrongs: ['O‘zlik olmoshi', 'Bo‘lishsizlik olmoshi', 'Ko‘rsatish olmoshi'],
    explain: 'Kim, nima, qanday, qancha, qaysi, qayerda so‘zlari shaxs, narsa va belgini so‘rab keluvchi so‘roq olmoshlaridir.',
    testSentences: [
      'Bugun kutubxonadan qaysi tarixiy kitobni olding?',
      'Kimning daftari stol ustida qolib ketibdi?',
      'Sinfimizdan necha nafar o‘quvchi olimpiadaga qatnashmoqda?',
      'Qayerda qadimiy Tuproqqal’a yodgorligi joylashgan?',
      'Siz bugun qanday yangi mavzuni o‘rgandingiz?',
      'Nima uchun zardushtiylar olovni muqaddas bilishgan?',
      'Kimga eng chiroyli tabrik xatini yozmoqchisiz?',
      'Qachon bahorgi ta’til kunlari boshlanadi?',
      'Qaysi daryo bo‘yida Kat shahri qad rostlagan?',
      'Bu musobaqada kim g‘oliblikni qo‘lga kiritdi?',
    ],
    examSentences: [
      'Ertaga tuman bosqichida qaysi jamoa birinchi chiqadi?',
      'Laboratoriyada nimalar bilan tajriba o‘tkaziladi?',
      'Kechagi ma’ruzada kimlar qatnashganini bilasizmi?',
      'Samarqandda qancha tarixiy obida saqlanib qolgan?',
      'Qayerdan eng yangi lug‘atlarni topish mumkin?',
      'Nima sababdan qishki kunlar qisqa bo‘ladi?',
      'Ushbu masalani qanday usulda yechish qulayroq?',
      'Boshlovchi sahnaga kimni taklif etmoqda?',
      'Bu qadimiy tanga qaysi davrga tegishli?',
      'Qaysingiz she’rni yoddan aytib berasiz?',
    ],
  },
  {
    topicIdx: 0, diff: 'medium',
    questionStem: (s) => `«${s}» gapidagi inkor ma’nosini ifodalovchi olmosh turini toping:`,
    answer: 'Bo‘lishsizlik olmoshi',
    wrongs: ['Belgilash olmoshi', 'Kishilik olmoshi', 'Gumon olmoshi'],
    explain: '«Hech» so‘zi ishtirokidagi hech kim, hech narsa, hech qanday, hech qachon — bo‘lishsizlik olmoshlaridir.',
    testSentences: [
      'Bunday muhim qarorni hech kim o‘ylamasdan qabul qilmaydi.',
      'U hech qachon do‘stlarining ishonchini suiiste’mol qilmagan.',
      'Qorong‘i xonada hech narsa aniq ko‘rinmas edi.',
      'Mehnat qilmasdan hech qanday muvaffaqiyatga erishib bo‘lmaydi.',
      'Bugun hech qayerga chiqmasdan testlarni takrorlayman.',
      'Sardor bu sirni hech kimga aytmaslikka va’da berdi.',
      'Hech bir mehnat e’tibordan chetda qolmaydi.',
      'Qishloq yo‘lida tong saharda hech kim ko‘rinmasdi.',
      'Ilmsiz inson hech narsada haqiqiy kamolot topa olmaydi.',
      'Bu kitobga teng keladigan asarni hali hech qayerda ko‘rmaganman.',
    ],
    examSentences: [
      'Halol inson birovning haqiga hech qachon ko‘z olaytirmaydi.',
      'Shovqinda hech kim ma’ruzachining gapini eshita olmadi.',
      'Uning ko‘nglida hech qanday gina qolmadi.',
      'Kutubxonaning bu bo‘limida hech narsa o‘zgarishsiz qolmagan.',
      'Kuchli irodani hech bir to‘siq sindira olmaydi.',
      'Men bu voqea haqida hech kimga og‘iz ochmadim.',
      'Qizg‘in bahsdan keyin ham hech qayerga tarqalmadik.',
      'Tashqarida shamoldan bo‘lak hech narsa sezilmasdi.',
      'O‘sha kuni hech kim kechikib kelmadi.',
      'U hech bir savolga ikkilanmay javob berdi.',
    ],
  },
  // Topic 1: Fe'l
  {
    topicIdx: 1, diff: 'easy',
    questionStem: (s) => `«${s}» gapida ajratilgan harakat ifodasi fe’lning qaysi zamonida turibdi?`,
    answer: 'Kelasi zamon (ish-harakat nutqdan keyin ro‘y beradi)',
    wrongs: ['Yaqin o‘tgan zamon', 'Hozirgi-o‘tgan zamon', 'Shart mayli'],
    explain: '-(a)r, -ajak, -moqchi, -adi qo‘shimchalari kelajakdagi harakatni bildiradi.',
    testSentences: [
      'Kelasi haftada biz Buxoroga ilmiy sayohatga boramiz.',
      'Ertaga ertalab sinfimiz jamoasi ko‘chat ekmoqchi.',
      'Tez orada bu bog‘da ham shirin mevalar pishar.',
      'O‘quvchilar bayramda yangi spektaklni namoyish etadilar.',
      'Men yozgi ta’tilda dasturlash tilini chuqur o‘rganaman.',
      'Kechqurun barcha guruh a’zolari hisobot tayyorlaydilar.',
      'Ustozimiz yaqinda yangi qo‘llanmani chop ettirmoqchi.',
      'Quyosh chiqqach, havo yana ham ilib ketadi.',
      'Bu loyiha kelgusi oyda o‘z natijasini berajak.',
      'Jamoamiz final bahsida bor mahoratini ishga soladi.',
    ],
    examSentences: [
      'Yakshanba kuni sport majmuasida musobaqa o‘tkaziladi.',
      'Men bu asarni ertaga kutubxonaga qaytarib bermoqchiman.',
      'Bahor yomg‘irlaridan so‘ng yaylovlar tez yashnaydi.',
      'Siz tez orada barcha urinishlaringiz mevasini ko‘rasiz.',
      'Ikki kundan keyin olimpiada natijalari e’lon qilinadi.',
      'Do‘stlarimiz yozda tog‘ yonbag‘rida dam olishmoqchi.',
      'Qat’iyat bilan ishlasangiz, albatta marraga yetajakdirsiz.',
      'Kuz kelishi bilan qushlar issiq o‘lkalarga uchib ketadi.',
      'Sinf sardori ertangi yig‘ilishda rejalarni tushuntiradi.',
      'Bu an’ana avloddan avlodga asrab yetkaziladi.',
    ],
  },
  {
    topicIdx: 1, diff: 'hard',
    questionStem: (s) => `«${s}» gapidagi fe’l nisbatini (ozlik, orttirma, majhul yoki birgalik) aniqlang:`,
    answer: 'Orttirma nisbat (-tir/-dir/-t/-gaz qo‘shimchasi bilan harakat boshqalar vositasida bajariladi)',
    wrongs: ['O‘zlik nisbati (-n/-l)', 'Birgalik nisbati (-sh/-ish)', 'Aniq nisbat'],
    explain: 'Orttirma nisbat harakat subyektining boshqa bajaruvchini harakatga undashini bildiradi.',
    testSentences: [
      'Muallim o‘quvchilarga murakkab tenglamani yechtirdi.',
      'Bog‘bon yangi ko‘chatlarni ariq bo‘yiga ektirdi.',
      'Ona kichik qizalog‘iga chiroyli ertak aytdirdi.',
      'Rahbar barcha hujjatlarni bir kun ichida tayyorlatdi.',
      'Ustoz talabalarga xatolarni mustaqil tuzattirdi.',
      'Me’mor eski naqshlarni mohir naqqoshga chizdirdi.',
      'Sardor kompyuterdagi dasturni qaytadan o‘rnattirdi.',
      'Murabbiy yosh sportchilarga yuz metrga yugurtirdi.',
      'Kutubxonachi yangi kelgan kitoblarni javonlarga terdirdi.',
      'Shifokor bemorlarga shifobaxsh damlamani ichirdi.',
    ],
    examSentences: [
      'Ota o‘g‘liga hovlidagi daraxtlarni oqlatdi.',
      'Direktor maktab foyesiga yangi stend yasattirdi.',
      'Usta shogirdlariga kumush idishga naqsh soldirdi.',
      'Sinf rahbari barcha o‘quvchilarni ko‘rikdan o‘tkazdi.',
      'Tajribali rassom shogirdiga manzara bo‘yatdi.',
      'Boshliq muhandisga yangi chizmani tekshirtirdi.',
      'Opa ukasiga she’rni uch marta takrorlatdi.',
      'Ziyodulla chavandoz tulporini poygaga tayyorlatdi.',
      'Dasturchi jamoaga tizim xavfsizligini sinatdi.',
      'Fermer bog‘dagi mevalarni tezda tergizdi.',
    ],
  },

  // Topic 2: Ravish
  {
    topicIdx: 2, diff: 'medium',
    questionStem: (s) => `«${s}» gapidagi o‘rin ravishini («qayerda?», «qayerga?», «qayerdan?») toping:`,
    answer: 'O‘rin ravishi (harakatning o‘rni yoki yo‘nalishini ko‘rsatuvchi mustaqil ravish)',
    wrongs: ['Payt ravishi', 'Ko‘rsatish olmoshi', 'Ko‘makchili ot'],
    explain: 'Oldinda, orqada, ichkari, tashqari, olg‘a, uzoqda, yuqoriga — o‘rin ravishlaridir.',
    testSentences: [
      'Karvon tog‘ oshib olg‘a qarab dadil intilardi.',
      'Uzoqdan chiroqlar miltillab ko‘rina boshladi.',
      'Mehmonlar hovlidan ichkariga taklif qilindilar.',
      'Oldinda yashil vodiy va tiniq soy jilolanar edi.',
      'Burgut qanotlarini yoyib yuqoriga ko‘tarildi.',
      'Qor yog‘gach, bolalar tashqariga quvonch bilan chiqdilar.',
      'Orqadan otlarning dupuri va qo‘ng‘iroq sadosi eshitildi.',
      'Kema qirg‘oqdan beriga asta suzib kelmoqda.',
      'Qal’a devorining pastida keng bog‘ yastanib yotardi.',
      'Yo‘lovchilar narida joylashgan karvonsaroyga burildilar.',
    ],
    examSentences: [
      'Askariy qismlar qo‘mondon buyrug‘i bilan olg‘a yurdi.',
      'Bog‘ning narisida baland chinorlar shovullardi.',
      'Issiq choy ichish uchun hamma ichkariga kirdi.',
      'Qishloq uzoqda emas, ikki chaqirim narida edi.',
      'Alpinistlar cho‘qqidan pastga ehtiyotkorlik bilan tushdi.',
      'Tashqaridan mayin shabada va qushlar sayrashi kirardi.',
      'Yo‘l boshlovchi oldinda, otliqlar esa orqada borardi.',
      'Qushlar parvozi yuqoridan juda go‘zal ko‘rinadi.',
      'Ular bu yerdan beri tomon piyoda yurib kelishdi.',
      'Darvoza yonidan orqaga qaytgan karvon ko‘rindi.',
    ],
  },

  // Topic 3: Yordamchi so'zlar va imlo
  {
    topicIdx: 3, diff: 'medium',
    questionStem: (s) => `«${s}» gapida vergul va ma’no jihatidan zidlov bog‘lovchisi vazifasini qaysi so‘z bajargan?`,
    answer: 'Ammo / lekin / biroq (qarama-qarshi fikrlarni bog‘lovchi zidlov bog‘lovchisi)',
    wrongs: ['Uchun / bilan ko‘makchilari', 'Faqat / hatto ayiruv yuklamalari', 'Chunki / shuning uchun sabab bog‘lovchilari'],
    explain: 'Ammo, lekin, biroq zidlov bog‘lovchilari doimo oldidan vergul bilan ajratiladi.',
    testSentences: [
      'Havo biroz salqin edi, ammo sayohat juda maroqli o‘tdi.',
      'Bu masala murakkab ko‘rinadi, lekin yechimi juda oddiy.',
      'Tashqarida yomg‘ir yog‘ardi, biroq biz mashg‘ulotni to‘xtatmadik.',
      'U ko‘p gapirmadi, ammo har bir so‘zi chuqur ma’noga ega edi.',
      'Kitob kichik hajmli, biroq mazmuni nihoyatda boy.',
      'Vaqt oz qolgan edi, lekin jamoa topshiriqni muddatida bajardi.',
      'Yo‘l uzoq edi, ammo do‘stlar suhbati charchoqni unuttirdi.',
      'Olim bu tajribani yuz marta sinadi, biroq umidsizlikka tushmadi.',
      'Qish sovuq keldi, lekin ko‘chatlarga zarar yetmadi.',
      'Savol qiyin tuyuldi, ammo diqqat bilan o‘ylagach javob topildi.',
    ],
    examSentences: [
      'Tong ottiyu quyosh chiqdi, biroq vodiy tumanli edi.',
      'Chavandoz charchagan edi, ammo poygani oxirigacha davom ettirdi.',
      'Xona keng emas, lekin nihoyatda shinam va yorug‘.',
      'U shoshilar edi, biroq qoidalarni sira buzmadi.',
      'Dars qiyin bo‘ldi, ammo barchamiz mavzuni tushundik.',
      'Shamolda daraxtlar egildi, lekin sinmadi.',
      'Shoir kamtar yashadi, biroq nomi asrlarga muhrlandi.',
      'Yoz issiq keldi, ammo tog‘ etaklarida salqin havo saqlandi.',
      'Sinfdoshlar ko‘p bahslashdi, lekin oxirida to‘g‘ri qarorga keldi.',
      'Bu qadimiy qo‘lyozma sarg‘aygan, biroq yozuvlari aniq o‘qiladi.',
    ],
  },

  // Topic 4: Sintaksis
  {
    topicIdx: 4, diff: 'medium',
    questionStem: (s) => `«${s}» gapidagi ajratilgan sintaktik bo‘lak yoki bog‘lanish turi qaysi?`,
    answer: 'Boshqaruvli fe’lli so‘z birikmasi (tobe ot tushum yoki jo‘nalish kelishigida)',
    wrongs: ['Moslashuvli otli so‘z birikmasi', 'Teng bog‘langan uyushiq bo‘lak', 'Kirish so‘z birikmasi'],
    explain: 'Fe’lga tushum (-ni), jo‘nalish (-ga), o‘rin (-da) yoki chiqish (-dan) kelishigi bilan bog‘lanish boshqaruvdir.',
    testSentences: [
      'O‘quvchilar kutubxonadan yangi ensiklopediyani olishdi.',
      'Sardor ukasiga qiziqarli tarix kitobini o‘qib berdi.',
      'Yomg‘ir tomchilari issiq tuproqqa singib ketdi.',
      'Musaffo tongda dehqonlar dalaga yo‘l olishdi.',
      'Ziyrak talaba murakkab tenglamani tezda yechdi.',
      'Sayyohlar qadimiy Registon maydoniga qadam qo‘ydilar.',
      'Bog‘bon mevali daraxtlarni bahorda ehtiyotlab butadi.',
      'Do‘stlar tog‘ cho‘qqisidan vodiy manzarasini kuzatishdi.',
      'Ustoz o‘z shogirdidan halollik va tirishqoqlikni talab qildi.',
      'Kechki shabada hovlidagi gul barglarini silkitdi.',
    ],
    examSentences: [
      'Talabalar qadimiy qal’adan noyob sopol ko‘zani topishdi.',
      'Mohir kulol loydan bejirim ko‘za yasadi.',
      'Yosh shoir o‘z she’rini tinglovchilarga taqdim etdi.',
      'Sayohat ishtirokchilari mehmonxonaga kech tushganda yetib kelishdi.',
      'Ona farzandining muvaffaqiyatidan cheksiz quvondi.',
      'Dasturchi kompyuter xotirasiga yangi dasturni yukladi.',
      'Qaldirg‘ochlar baland ayvonga in qurishdi.',
      'Tarixchi olim arxivdagi hujjatlarni sinchiklab o‘rgandi.',
      'Musobaqa g‘olibiga oltin medal topshirildi.',
      'Shamol quruq xazonlarni bog‘ chetiga uchirib ketdi.',
    ],
  },

  // Topic 5: Mumtoz va xalq og'zaki adabiyoti
  {
    topicIdx: 5, diff: 'medium',
    questionStem: (s) => `Adabiy-tarixiy tahlil (${s}): Alisher Navoiy, Lutfiy yoki xalq dostonlari haqidagi qaysi fikr to‘g‘ri?`,
    answer: 'Mumtoz adabiyotda g‘azal va ruboiy janrlari, folklorda esa doston, maqol va topishmoqlar yetakchi o‘rin tutadi',
    wrongs: [
      'Mumtoz adabiyot faqat nasriy romanlardan iborat bo‘lgan',
      'Xalq og‘zaki ijodi faqat bosma kitob shaklida yaratilgan',
      'Navoiy barcha asarlarini faqat lotin tilida yozgan',
    ],
    explain: 'Mumtoz adabiyotimiz aruz vaznidagi g‘azal, ruboiy, tuyuq, dostonlar bilan, folklor esa og‘zaki an’ana bilan rivojlangan.',
    testSentences: [
      'G‘azal janrining qofiyalanish tartibi (aa, ba, va...) va baytlardan tuzilishi',
      'Ruboiyning to‘rt misradan iborat falsafiy mazmuni',
      '«Ravshan» dostonidagi qahramonlik va sadoqat g‘oyalari',
      'Xalq maqollarining qisqa, lo‘nda va ibratli xulosalari',
      'Alisher Navoiyning «Mahbub ul-qulub» asaridagi odob-axloq pandlari',
      'Zahiriddin Muhammad Boburning lirik ruboiy va g‘azallari',
      '«Kuntug‘mish» va «Alpomish» dostonlarida vatanparvarlik ruhining ulug‘lanishi',
      'Lutfiy va Atoiy g‘azallarining xalqona tili',
      'Gulxaniyning «Zarbulmasal» asaridagi majoziy hikoyalar',
      'Turkiy tilning boyligini ko‘rsatuvchi «Muhokamat ul-lug‘atayn» asari',
    ],
    examSentences: [
      '«Hayrat ul-abror» dostonidagi ilm, adolat va halollik haqidagi boblar',
      'Xalq topishmoqlarining mantiqiy zukkolikni tarbiyalashdagi o‘rni',
      'Ogahiy va Munis Xorazmiy tarixiy hamda she’riy merosi',
      '«Go‘ro‘g‘li» turkum dostonlarining baxshilar tomonidan kuylanishi',
      'Aruz vazni va barmoq vazni o‘rtasidagi ritmik asoslar',
      'Nodirabegim va Uvaysiy she’riyatida ma’rifat hamda insoniylik',
      '«Farhod va Shirin» dostonida mehnatsevarlik va bunyodkorlik timsoli',
      'Xalq ertaklaridagi «yaxshilikning yovuzlik ustidan g‘alabasi» tamoyili',
      'Muqimiy va Furqat ijodida ma’rifatparvarlik g‘oyalari',
      '«Qutadg‘u bilig» asarida davlat boshqaruvi va adolat timsollari',
    ],
  },

  // Topic 6: O'zbek nasri
  {
    topicIdx: 6, diff: 'medium',
    questionStem: (s) => `Asar va muallif uyg‘unligi: «${s}» mazmuniga mos to‘g‘ri xulosani belgilang:`,
    answer: 'Milliy qadriyat, halollik, ona mehri va insoniy burch adiblarimiz nasrining bosh g‘oyasidir',
    wrongs: [
      'O‘zbek nasriy qissalari faqat o‘zga sayyoralar haqida yozilgan',
      'Bu asarlarda qahramonlar nutqi umuman mavjud emas',
      'XX asr o‘zbek adabiyotida hikoya va roman janri bo‘lmagan',
    ],
    explain: 'S. Ayniy, A. Qodiriy, Oybek, Said Ahmad, O‘. Hoshimov va T. Murod asarlari xalq hayoti va ma’naviyatini yuksak mahorat bilan yoritadi.',
    testSentences: [
      'O‘tkir Hoshimovning «Dunyoning ishlari»dagi ona duosi va sabri',
      'Tog‘ay Murodning «Ot kishnagan oqshom»ida chavandozlar sha’ni va g‘ururi',
      'Sadriddin Ayniyning «Esdaliklar» asarida XIX–XX asr Buxoro manzaralari',
      'Abdulla Qodiriyning «O‘tkan kunlar» romanida Otabekning vatanparvarligi',
      'Said Ahmadning «Ufq» trilogiyasida urush va mehnat mashaqqatlari',
      'Tohir Malikning «Alvido, bolalik» qissasida yoshlar tarbiyasi va mas’uliyati',
      'Oybekning «Bolalik» xotira qissasida ilmga chanqoq o‘spirin hayoti',
      'G‘afur G‘ulomning «Shum bola» qissasidagi xalqona hazil-mutoyiba',
      'Abdulla Qahhor hikoyalarida ixchamlik va hayotiy haqiqat',
      'O‘tkir Hoshimovning «Tushda kechgan umrlar» asarida vijdon sinovi',
    ],
    examSentences: [
      '«Dunyoning ishlari» asaridagi «Iltijo» va «Oqqan daryo» fasllari ruhi',
      'Tog‘ay Murodning «Otamdan qolgan dalalar» romanida dehqon matonati',
      '«Mehrobdan chayon» romanida Anvar va Ra’no fidoyiligi',
      'Oybekning «Navoiy» romanida buyuk mutafakkirning davlat arbobi sifatidagi qiyofasi',
      'Said Ahmadning hajviy hikoyalarida ijtimoiy illatlar tanqidi',
      'G‘afur G‘ulomning «Mening o‘g‘rigina bolam» hikoyasidagi mehribon kampir obrazi',
      'Cho‘lponning «Kecha va kunduz» romanida jadidchilik va uyg‘onish g‘oyasi',
      'Mirmuhsinning «Me’mor» tarixiy romanida bunyodkorlik ruhi',
      'Pirimqul Qodirovning «Yulduzli tunlar» romanida Bobur siymosi',
      'Odil Yoqubovning «Ulug‘bek xazinasi» romanida ilm-fan va ma’naviyat himoyasi',
    ],
  },

  // Topic 7: Adabiyot nazariyasi
  {
    topicIdx: 7, diff: 'medium',
    questionStem: (s) => `Badiiy tahlil: «${s}» ifodasi bilan bog‘liq adabiy atamani aniqlang:`,
    answer: 'Badiiy tasvir vositasi yoki kompozitsion unsur matnning emotsional ta’sirchanligini oshiradi',
    wrongs: [
      'Bu faqat grammatik imlo xatosi hisoblanadi',
      'Matnda hech qanday obrazli ma’no yuklamaydi',
      'Faqat ilmiy matematika formulalarida uchraydi',
    ],
    explain: 'Epitet, o‘xshatish, metafora, jonlantirish, mubolag‘a va portret badiiy asarning obrazliligini ta’minlaydi.',
    testSentences: [
      '«Oltin kuz», «kumush qish», «zangor osmon» kabi badiiy sifatlovchi — epitetlar',
      'Qahramonning tashqi qiyofasi, kiyimi va yuz ifodasini chizuvchi portret tasviri',
      'Asarda tabiat manzarasini qahramon ruhiyatiga moslab beruvchi peyzaj',
      '«Qor kabi oppoq», «tog‘dek viqorli» shaklidagi o‘xshatish qurilmalari',
      'Asar voqealaridan chetga chiqib muallifning o‘quvchiga bevosita murojaati — lirik chekinish',
      '«Daraxtlar shivirlab suhbatlashdi» kabi jonlantirish (tashxis) san’ati',
      '«Yaxshilik va yomonlik», «yorug‘lik va zulmat» qarama-qarshiligi — tazod',
      'Asar boblari, dialoglar va voqealarning joylashtirilish tartibi — kompozitsiya',
      'Muallif asar orqali kitobxonga yetkazmoqchi bo‘lgan bosh fikr — asar g‘oyasi',
      'She’rdagi misralar oxiridagi ohangdosh so‘zlar — qofiya va radif',
    ],
    examSentences: [
      '«Kumush tola», «po‘lat iroda» kabi ko‘chma ma’noli sifatlash — epitet namunalari',
      'Qahramon xarakterini ochib beruvchi ichki monolog va ruhiy tahlil',
      'Hikoya boshidagi voqea muhiti va qahramonlarni tanishtiruvchi ekspozitsiya',
      'Ziddiyatning yechilishi va xulosa chiqariladigan syujet yakuni',
      '«Quyosh kulimsirab mo‘raladi» misolidagi tashxis (jonlantirish)',
      'Masal va hikmatlarda yashirin majoziy ma’no beruvchi allegoriya',
      'Dramatik asarlarda sahna harakati uchun yoziladigan muallif izohi — remarka',
      'She’riy nutqda bir xil tovushlarning ohangdor takrorlanishi — alliteratsiya',
      'Asarda ko‘tarilgan asosiy hayotiy muammolar doirasi — asar mavzusi',
      'Hikoya ichida boshqa qahramonlar tilidan keltirilgan qoliplovchi hikoya',
    ],
  },
];

// Explicit authentic Uzbek grammar & literature pairs separating Test and Exam banks cleanly
interface DirectUzPair {
  topicIdx: number;
  diff: DifficultyLevel;
  testQ: string; testA: string; testD: [string, string, string]; testExp: string;
  examQ: string; examA: string; examD: [string, string, string]; examExp: string;
}

const DIRECT_UZ_PAIRS: DirectUzPair[] = [
  {
    topicIdx: 0, diff: 'hard',
    testQ: '«O‘z» o‘zlik olmoshi III shaxs birlikda tushum kelishigini olganda qaysi to‘g‘ri shaklda yoziladi?',
    testA: 'o‘zini (o‘z + i + n + i)',
    testD: ['o‘ziga', 'o‘zidan', 'o‘zlarining'],
    testExp: 'III shaxs egalik qo‘shimchasi -i dan keyin tushum kelishigi -ni qo‘shilganda orttirma «n» qo‘yilmaydi: o‘z+i+ni.',
    examQ: '«Men» va «sen» kishilik olmoshlariga qaratqich (-ning) va tushum (-ni) kelishiklari qo‘shilganda qanday imlo o‘zgarishi yuz beradi?',
    examA: 'Bir «n» tushib qoladi: mening, sening, meni, seni',
    examD: ['Ikki «n» saqlanadi: menning, senning', 'Tovush almashib «m» ga o‘tadi', 'Umuman kelishik qo‘shilmaydi'],
    examExp: 'Men+ning → mening, sen+ni → seni shaklida bitta n tushib yoziladi.',
  },
  {
    topicIdx: 1, diff: 'medium',
    testQ: '«O‘qib chiqdi», «yozib oldi», «aytib berdi» kabi shakllar fe’lning qaysi tuzilish turiga kiradi?',
    testA: 'Ko‘makchi fe’lli so‘z qo‘shilmasi (sifatida qo‘shma/ko‘makchi shakli)',
    testD: ['Sodda tub fe’l', 'Juft fe’l', 'Takroriy fe’l'],
    testExp: 'Yetakchi fe’l (-b/-ib ravishdosh) + ko‘makchi fe’l (chiqdi, oldi, berdi) harakat tarzini to‘ldiradi.',
    examQ: '«Ket + di» va «ayt + di» so‘zlarining imlo qoidasi bo‘yicha to‘g‘ri yozilishini ko‘rsating:',
    examA: 'ketdi, aytdi (jarangsiz «t» dan keyin ham -di shaklida yoziladi)',
    examD: ['ketti, aytti', 'kedi, aydi', 'ket-di, ayt-di'],
    examExp: 'O‘tgan zamon -di qo‘shimchasi talaffuzda «ti» eshitilsa-da, imloda doimo -di yoziladi.',
  },
  {
    topicIdx: 2, diff: 'easy',
    testQ: 'Qaysi qatorda faqat payt ravishlari berilgan?',
    testA: 'kecha, bugun, ertaga, hamisha, endi',
    testD: ['tez, sekin, ohista, jim', 'olg‘a, ichkari, yuqori, nari', 'ko‘p, ancha, sal, xiyla'],
    testExp: 'Kecha, bugun, ertaga, hamisha va endi harakatning vaqtini bildiruvchi payt ravishlaridir.',
    examQ: '«Asta», «jim», «piyoda», «qo‘qqisdan» so‘zlari ravishning qaysi ma’no turiga kiradi?',
    examA: 'Holat (tarz) ravishi',
    examD: ['O‘rin ravishi', 'Payt ravishi', 'Maqsad ravishi'],
    examExp: 'Bu so‘zlar harakatning qay holatda va qay tarzda yuz berishini ifodalaydi.',
  },
  {
    topicIdx: 3, diff: 'medium',
    testQ: 'Qaysi qatorda bog‘lovchilar guruhi to‘g‘ri ko‘rsatilgan?',
    testA: 'va, hamda, ammo, lekin, biroq, chunki, agar',
    testD: ['uchun, bilan, kabi, singari, orqali', 'hamma, barcha, har kim, hech narsa', 'tez, kecha, ichkari, ko‘p'],
    testExp: 'Va, hamda (biriktiruv), ammo, lekin, biroq (zidlov), chunki (sabab), agar (shart) — bog‘lovchilardir.',
    examQ: '«Umid bilan kutmoq» va «Qalam va daftar» birikmalaridagi «bilan» hamda «va» so‘zlari qanday farqlanadi?',
    examA: '«bilan» bu yerda ko‘makchi (usulni bildirgan), «va» esa teng bog‘lovchidir',
    examD: ['Ikkalasi ham yuklama', 'Ikkalasi ham ravish', '«bilan» bog‘lovchi, «va» ko‘makchi'],
    examExp: 'Uyushiq bo‘laklarni bog‘layotgan «va» bog‘lovchi, tobelab bog‘layotgan «bilan» ko‘makchidir.',
  },
  {
    topicIdx: 4, diff: 'hard',
    testQ: '«Qishki ta’til», «tosh ko‘prik», «tez yurmoq» birikmalarida tobe so‘z hokim so‘zga qanday bog‘langan?',
    testA: 'Bitishuv aloqasi bilan (qo‘shimchasiz, ma’no va tartib asosida)',
    testD: ['Moslashuv aloqasi bilan', 'Boshqaruv aloqasi bilan', 'Bog‘lovchili teng aloqa bilan'],
    testExp: 'Sifat/ot + ot va ravish + fe’l ko‘rinishidagi qo‘shimchasiz birikmalar bitishuv usulidadir.',
    examQ: '«Vatanning ravnaqi» so‘z birikmasidagi «-ning» va «-i» qo‘shimchalari sintaktik aloqaning qaysi turini ta’minlaydi?',
    examA: 'Moslashuv aloqasini',
    examD: ['Bitishuv aloqasini', 'Boshqaruv aloqasini', 'Ajratilgan bo‘lakni'],
    examExp: 'Qaratqich (-ning) va egalik (-i) moslashuvi klassik moslashuv aloqasidir.',
  },
  {
    topicIdx: 5, diff: 'easy',
    testQ: 'Alisher Navoiyning «Hayrat ul-abror» dostoni «Xamsa»ning nechanchi dostoni hisoblanadi?',
    testA: 'Birinchi (kirish falsafiy-axloqiy) dostoni',
    testD: ['Beshinchi yakuniy dostoni', 'Uchinchi ishqiy dostoni', 'Oltinchi qo‘shimcha dostoni'],
    testExp: '1483-yilda yozilgan «Hayrat ul-abror» «Xamsa» beshligining birinchi dostonidir.',
    examQ: 'Xalq og‘zaki ijodida «Maqol» va «Topishmoq» janrlarining umumiy belgisi nimada?',
    examA: 'Har ikkalasi ham xalq donishmandligini ixcham shaklda avlodlarga yetkazadi',
    examD: ['Ikkalasi ham faqat she’riy doston hajmida bo‘ladi', 'Ikkalasini ham faqat XIX asr mualliflari yozgan', 'Ularda qofiya va ohang umuman bo‘lmaydi'],
    examExp: 'Maqol ham, topishmoq ham xalqning hayotiy tajribasi va topqirligini ixcham ifodalaydi.',
  },
  {
    topicIdx: 6, diff: 'medium',
    testQ: '«Ot kishnagan oqshom» asarining muallifi Tog‘ay Murod qaysi viloyatda tug‘ilgan va qaysi voha ruhi uning asarlarida aks etgan?',
    testA: 'Surxondaryo viloyati (Denov); Surxon vohasi chavandozlari va qishloq hayoti',
    testD: ['Xorazm viloyati; dengiz kemachiligi', 'Farg‘ona viloyati; zavod ishchilari hayoti', 'Buxoro viloyati; qadimgi madrasalar'],
    testExp: 'Tog‘ay Murod asarlarida Surxon vohasining boy xalq tili, chavandozlar va dehqonlar ruhi yorqin tasvirlanadi.',
    examQ: 'O‘tkir Hoshimovning «Dunyoning ishlari» asari qanday kompozitsion shaklga ega?',
    examA: 'Mustaqil kichik hikoyalar-novellalardan tashkil topgan yaxlit qissa',
    examD: ['Besh pardali sahna dramasi', 'Aruz vaznida yozilgan doston', 'Faqat bitta kichik to‘rtlik she’r'],
    examExp: 'Asar «Oq, oydin kechalar», «Gilam paypoq», «Iltijo» kabi o‘nlab qisqa hayotiy hikoyalar tizimidan iborat.',
  },
  {
    topicIdx: 7, diff: 'hard',
    testQ: 'Badiiy asarda personajning boshqa qahramonlar yoki o‘quvchi uchun ichki kechinmalarini o‘z-o‘ziga so‘zlashi nima deyiladi?',
    testA: 'Ichki monolog',
    testD: ['Dialog', 'Peyzaj', 'Ekspozitsiya'],
    explain: '',
    testExp: 'Ikki kishi suhbati dialog, bir qahramonning o‘y-xayollari bilan yolg‘iz nutqi esa ichki monologdir.',
    examQ: 'Asardagi voqealar rivojida ziddiyat eng keskin va hal qiluvchi nuqtaga yetgan lahza nima deb nomlanadi?',
    examA: 'Kulminatsiya',
    examD: ['Ekspozitsiya', 'Prolog', 'Tugun'],
    examExp: 'Kulminatsiya (cho‘qqi) asar konflikti eng yuqori darajaga ko‘tariladigan bosqichdir.',
  } as DirectUzPair & { explain?: string },
];

export function buildUzbekTestBank(existing: QuestionItem[]): QuestionItem[] {
  const seen = new Set(existing.map((q) => (typeof q.q === 'string' ? q.q.trim() : q.q.uz.trim())));
  const counts = new Array(UZBEK_TOPICS.length).fill(0);
  for (const q of existing) {
    const idx = UZBEK_TOPICS.indexOf(q.topic as (typeof UZBEK_TOPICS)[number]);
    if (idx >= 0) counts[idx]++;
  }

  const perTopicPool: QuestionItem[][] = Array.from({ length: UZBEK_TOPICS.length }, () => []);
  let nextId = 151;
  const makeId = () => `u_t_${nextId++}`;

  for (const r of UZ_RULE_BANK) {
    perTopicPool[r.topicIdx].push({
      id: makeId(),
      topic: UZBEK_TOPICS[r.topicIdx],
      difficulty: r.diff,
      q: `Qoidaviy tahlil (${r.title}): ${r.exampleTest} qaysi birlikka misol bo‘ladi?`,
      opts: [r.answer, r.d1, r.d2, r.d3],
      answer: 0,
      explain: r.explain,
    });
  }

  for (const dp of DIRECT_UZ_PAIRS) {
    perTopicPool[dp.topicIdx].push({
      id: makeId(),
      topic: UZBEK_TOPICS[dp.topicIdx],
      difficulty: dp.diff,
      q: dp.testQ,
      opts: [dp.testA, ...dp.testD],
      answer: 0,
      explain: dp.testExp,
    });
  }

  for (const dr of UZ_SENTENCE_DRILLS) {
    for (const s of dr.testSentences) {
      perTopicPool[dr.topicIdx].push({
        id: makeId(),
        topic: UZBEK_TOPICS[dr.topicIdx],
        difficulty: dr.diff,
        q: dr.questionStem(s),
        opts: [dr.answer, ...dr.wrongs],
        answer: 0,
        explain: dr.explain,
      });
    }
  }

  // Additional distinct morphological/syntactic/literary practice questions balancing all 8 topics >= 62 each
  const extraUzPracticeTemplates: Array<{
    topicIdx: number;
    items: Array<[string, string, [string, string, string], string, DifficultyLevel]>;
  }> = [
    {
      topicIdx: 0,
      items: [
        ['«Har kim o‘z burchini bilsin» gapidagi olmoshlar juftligi', 'Belgilash olmoshi (har kim) va o‘zlik olmoshi (o‘z)', ['Kishilik va so‘roq olmoshi', 'Bo‘lishsizlik va gumon olmoshi', 'Ko‘rsatish va kishilik olmoshi'], 'Har kim — belgilash, o‘z — o‘zlik olmoshi.', 'medium'],
        ['«Ana o‘sha uzoqdagi cho‘qqilar qor bilan qoplangan» gapidagi ko‘rsatish olmoshi', 'ana o‘sha', ['uzoqda', 'cho‘qqilar', 'qoplangan'], 'Ana, mana, u, bu, shu, o‘sha — ko‘rsatish olmoshlaridir.', 'easy'],
        ['«Allaqanday sirli ovoz bog‘ tomondan eshitildi» gapidagi «allaqanday» so‘zi', 'Gumon olmoshi', ['Belgilash olmoshi', 'O‘zlik olmoshi', 'Payt ravishi'], 'Alla- old qo‘shimchasi noaniq belgini bildiruvchi gumon olmoshi yasaydi.', 'medium'],
        ['«Bizning maktab jamoasi birinchi o‘rinni oldi» gapidagi «bizning» olmoshi', 'Qaratqich kelishigidagi kishilik olmoshi', ['So‘roq olmoshi', 'Gumon olmoshi', 'Ko‘rsatish olmoshi'], 'Biz — I shaxs ko‘plikdagi kishilik olmoshi.', 'easy'],
      ],
    },
    {
      topicIdx: 1,
      items: [
        ['«Gulzor bahor kelishi bilan yashnadi» gapidagi «yashnadi» fe’lining tuzilishi', 'Sodda yasama fe’l (yashna + di)', ['Qo‘shma fe’l', 'Juft fe’l', 'Takroriy fe’l'], 'Yashil/yashna asosidan yasalgan bir o‘zakli sodda fe’ldir.', 'medium'],
        ['«Qani endi, hamma kitobxon bo‘lsa!» gapidagi «bo‘lsa» fe’li mayli', 'Shart mayli (-sa)', ['Buyruq mayli', 'Xabar mayli', 'Sifatdosh'], 'Shart mayli -sa qo‘shimchasi bilan yasaladi.', 'easy'],
        ['«O‘qiyotgan talaba» birikmasidagi «o‘qiyotgan» shakli', 'Fe’lning hozirgi zamon sifatdosh shakli', ['Ravishdosh shakli', 'Buyruq mayli', 'Harakat nomi'], '-(a)yotgan qo‘shimchasi sifatdosh yasaydi.', 'hard'],
      ],
    },
    {
      topicIdx: 2,
      items: [
        ['«Qasddan qilingan xato kechirilmaydi» gapidagi «qasddan» so‘zi', 'Maqsad ravishi', ['O‘rin ravishi', 'Payt ravishi', 'Miqdor ravishi'], 'Qasddan, atayin — maqsad ravishlari.', 'medium'],
        ['«Uzoq-yaqindan mehmonlar tashrif buyurishdi» birikmasidagi «uzoq-yaqindan»', 'Juft o‘rin ravishi', ['Takroriy sifat', 'Qo‘shma bog‘lovchi', 'Kishilik olmoshi'], 'Qarama-qarshi ma’noli o‘rin ravishlari juftlashib kelgan.', 'hard'],
      ],
    },
    {
      topicIdx: 3,
      items: [
        ['«Hatto kichiklar ham hashar ishlarida faol bo‘lishdi» gapidagi «hatto» so‘zi', 'Kuchaytiruv-ta’kid yuklamasi', ['Zidlov bog‘lovchisi', 'O‘rin ravishi', 'Ko‘makchi'], 'Hatto, -ku, -da, axir kuchaytiruv yuklamalaridir.', 'medium'],
        ['«Maktub pochta orqali yetkazildi» gapidagi «orqali» yordamchisi', 'Vazifadosh ko‘makchi', ['So‘roq yuklamasi', 'Sabab bog‘lovchisi', 'Gumon olmoshi'], 'Orqali vositani bildiruvchi ko‘makchidir.', 'easy'],
      ],
    },
    {
      topicIdx: 4,
      items: [
        ['«O‘zbekiston Respublikasining bayrog‘i» birikmasidagi sintaktik aloqa', 'Moslashuv aloqasi', ['Bitishuv aloqasi', 'Boshqaruv aloqasi', 'Uyushish aloqasi'], '-ning ... -i qaratqich-qaralmish moslashuvini beradi.', 'easy'],
        ['«Yashil barglar», «shirin olma», «tez gapirmoq» birikmalari', 'Bitishuv aloqasi namunalari', ['Moslashuv aloqasi', 'Boshqaruv aloqasi', 'Undalma'], 'Qo‘shimchasiz bog‘lanish bitishuvdir.', 'easy'],
      ],
    },
    {
      topicIdx: 5,
      items: [
        ['Mahmud Koshg‘ariyning «Devonu lug‘atit turk» asari nechanchi asrda yaratilgan?', 'XI asr (1072–1074-yillarda)', ['V asr', 'XV asr', 'XIX asr'], 'Buyuk tilshunos XI asrda bu shoh asarni yozgan.', 'easy'],
        ['Alisher Navoiyning «Xamsa»sidagi beshinchi yakuniy doston nomi', '«Saddi Iskandariy»', ['«Hayrat ul-abror»', '«Farhod va Shirin»', '«Layli va Majnun»'], '«Saddi Iskandariy» «Xamsa»ning beshinchi va eng yirik dostonidir.', 'medium'],
      ],
    },
    {
      topicIdx: 6,
      items: [
        ['«Dunyoning ishlari» qissasida muallif qaysi insoniy tuyg‘uni birinchi o‘ringa qo‘yadi?', 'Ona mehri va farzandning ona oldidagi umrbod qarzdorligini', ['Boylik orttirish yo‘llarini', 'Xorijiy sayohat sarguzashtlarini', 'Harbiy yurish strategiyasini'], 'O‘tkir Hoshimov ona siymosini ulug‘lagan.', 'easy'],
        ['«Ot kishnagan oqshom» qissasida Ziyodulla chavandozning sodiq yo‘ldoshi kim/nima?', 'Tarlon ot (tulpori)', ['Bo‘z ayg‘ir', 'Qora arg‘umoq', 'Boychibor'], 'Tarlon ot Ziyodulla chavandoz taqdirining markazida turadi.', 'easy'],
      ],
    },
    {
      topicIdx: 7,
      items: [
        ['Asar voqealarining ziddiyati boshlanadigan ilk turtki nuqtasi nima deyiladi?', 'Tugun', ['Yechim', 'Ekspozitsiya', 'Lirik chekinish'], 'Syujet tuguni voqealar kurashini boshlab beradi.', 'medium'],
        ['«Ko‘zlari chaqmoqday chaqnadi» jumlasida «-day» qo‘shimchasi qaysi vositani yasagan?', 'O‘xshatish (tashbeh)', ['Mubolag‘a', 'Tazod', 'Tashxis'], '-dek/-day/-simon o‘xshatish ko‘rsatkichlaridir.', 'easy'],
      ],
    },
  ];

  for (const grp of extraUzPracticeTemplates) {
    for (const [q, a, ds, exp, diff] of grp.items) {
      perTopicPool[grp.topicIdx].push({
        id: makeId(),
        topic: UZBEK_TOPICS[grp.topicIdx],
        difficulty: diff,
        q,
        opts: [a, ...ds],
        answer: 0,
        explain: exp,
      });
    }
  }

  // Unique grammar example sets if any topic needs extra items to reach 500 cleanly
  const wordTriplesByTopic: Array<Array<[string, string, string, string]>> = [
    [
      ['men, biz, siz', 'kishilik olmoshlari', 'belgilash olmoshlari', 'ravishlar'],
      ['kimdir, allanima, biror', 'gumon olmoshlari', 'bo‘lishsizlik olmoshlari', 'ko‘rsatish olmoshlari'],
      ['hamma, barcha, har bir', 'belgilash olmoshlari', 'o‘zlik olmoshi', 'kishilik olmoshlari'],
      ['hech kim, hech qanday, hech narsa', 'bo‘lishsizlik olmoshlari', 'so‘roq olmoshlari', 'gumon olmoshlari'],
      ['bu, shu, ana o‘sha', 'ko‘rsatish olmoshlari', 'gumon olmoshlari', 'belgilash olmoshlari'],
      ['kim, nima, qaysi, qancha', 'so‘roq olmoshlari', 'kishilik olmoshlari', 'o‘zlik olmoshi'],
    ],
    [
      ['keldi, yozdi, o‘qidi', 'sodda fe’llar', 'qo‘shma fe’llar', 'juft fe’llar'],
      ['olib keldi, yordam berdi, bayon qildi', 'qo‘shma fe’llar', 'takroriy fe’llar', 'sodda tub fe’l'],
      ['bordi-keldi, kirdi-chiqdi, oldi-berdi', 'juft fe’llar', 'sodda fe’llar', 'ravishlar'],
      ['kula-kula, yugura-yugura, so‘ray-so‘ray', 'takroriy ravishdosh/fe’llar', 'qo‘shma fe’llar', 'olmoshlar'],
    ],
    [
      ['tez, asta, jim, mardona', 'holat ravishlari', 'payt ravishlari', 'o‘rin ravishlari'],
      ['kecha, bugun, avval, hamisha', 'payt ravishlari', 'miqdor ravishlari', 'sabab ravishlari'],
      ['olg‘a, ichkari, yuqorida, narida', 'o‘rin ravishlari', 'payt ravishlari', 'maqsad ravishlari'],
      ['ko‘p, ancha, sal, xiyla', 'miqdor-daraja ravishlari', 'o‘rin ravishlari', 'holat ravishlari'],
    ],
    [
      ['uchun, bilan, kabi, orqali', 'ko‘makchilar', 'bog‘lovchilar', 'yuklamalar'],
      ['va, hamda, ammo, biroq', 'bog‘lovchilar', 'ko‘makchilar', 'olmoshlar'],
      ['-mi, -chi, -ku, faqat, hatto', 'yuklamalar', 'ko‘makchilar', 'ravishlar'],
      ['o‘g‘li, shahri, bag‘ri, og‘zi', 'tovush tushishi hodisasi', 'tovush ortishi hodisasi', 'tovush almashishi'],
    ],
    [
      ['maktabning bog‘i, do‘stimning fikri', 'moslashuv aloqasi', 'bitishuv aloqasi', 'boshqaruv aloqasi'],
      ['kitobni o‘qimoq, uydan kelmoq', 'boshqaruv aloqasi', 'moslashuv aloqasi', 'bitishuv aloqasi'],
      ['baland bino, tez yugurmoq', 'bitishuv aloqasi', 'boshqaruv aloqasi', 'moslashuv aloqasi'],
    ],
    [
      ['«Devonu lug‘atit turk» (Mahmud Koshg‘ariy)', 'XI asr turkiy til va folklor obidasi', 'XX asr sarguzasht romani', 'G‘arbiy Yevropa xronikasi'],
      ['«Hayrat ul-abror», «Farhod va Shirin»', 'Alisher Navoiy «Xamsa»si dostonlari', 'Xalq ertaklari', 'Memuar qissalar'],
      ['«Alpomish», «Ravshan», «Go‘ro‘g‘li»', 'o‘zbek xalq qahramonlik dostonlari', 'yozma memuar asarlar', 'lirik ruboiylar'],
    ],
    [
      ['«Esdaliklar» (Sadriddin Ayniy)', 'XIX–XX asr Buxoro hayoti memuar asari', 'fantastik roman', 'she’riy to‘plam'],
      ['«Dunyoning ishlari» (O‘tkir Hoshimov)', 'ona siymosini ulug‘lagan qissa', 'xalq og‘zaki dostoni', 'tarixiy qonunlar majmuasi'],
      ['«Ot kishnagan oqshom» (Tog‘ay Murod)', 'Ziyodulla chavandoz va Tarlon ot qissasi', 'dramatik tragediya', 'lug‘at kitobi'],
      ['«O‘tkan kunlar» (Abdulla Qodiriy)', 'birinchi o‘zbek milliy romani', 'mumtoz g‘azallar devoni', 'bolalar topishmoqlari'],
    ],
    [
      ['ekspozitsiya, tugun, rivoj, kulminatsiya, yechim', 'badiiy asar syujeti bosqichlari', 'gap bo‘laklari turlari', 'kelishik shakllari'],
      ['tashbeh, epitet, metafora, mubolag‘a', 'badiiy tasvir vositalari', 'tutuq belgisi qoidalari', 'yordamchi so‘zlar'],
    ],
  ];

  const needed = Math.max(0, 500 - existing.length);
  const out: QuestionItem[] = [];
  let extraCounter = 0;

  while (out.length < needed) {
    let bestTopic = 0;
    let minCount = counts[0];
    for (let t = 1; t < UZBEK_TOPICS.length; t++) {
      if (counts[t] < minCount) {
        minCount = counts[t];
        bestTopic = t;
      }
    }
    if (perTopicPool[bestTopic].length === 0) {
      const list = wordTriplesByTopic[bestTopic];
      const [sample, ans, w1, w2] = list[extraCounter % list.length];
      const phraseMode = Math.floor(extraCounter / list.length) % 4;
      extraCounter++;
      const contexts = [
        'Ona tili va adabiyot mashqi',
        'Sinf ishi tahlili',
        'Mustaqil tayyorgarlik savoli',
        'Guruh muhokamasi topshirig‘i',
      ];
      perTopicPool[bestTopic].push({
        id: makeId(),
        topic: UZBEK_TOPICS[bestTopic],
        difficulty: phraseMode % 2 === 0 ? 'easy' : 'medium',
        q: `${contexts[phraseMode]} (${UZBEK_TOPICS[bestTopic].split('. ')[1]}): «${sample}» qatori nimani ifodalaydi?`,
        opts: [ans, w1, w2, 'Faqat punktuatsiya tinish belgisi'],
        answer: 0,
        explain: `«${sample}» — ${ans}.`,
      });
    }
    const cand = perTopicPool[bestTopic].shift()!;
    const stem = (typeof cand.q === 'string' ? cand.q : cand.q.uz).trim();
    if (seen.has(stem)) continue;
    seen.add(stem);
    counts[bestTopic]++;
    out.push(cand);
  }
  return out;
}

export function buildUzbekExamBank(testBank: QuestionItem[]): QuestionItem[] {
  const seen = new Set(testBank.map((q) => (typeof q.q === 'string' ? q.q.trim() : q.q.uz.trim())));
  const counts = new Array(UZBEK_TOPICS.length).fill(0);
  const perTopicPool: QuestionItem[][] = Array.from({ length: UZBEK_TOPICS.length }, () => []);
  let nextId = 1;
  const makeId = () => `u_e_${nextId++}`;

  for (const r of UZ_RULE_BANK) {
    perTopicPool[r.topicIdx].push({
      id: makeId(),
      topic: UZBEK_TOPICS[r.topicIdx],
      difficulty: r.diff,
      q: `ChSB Imtihon tahlili (${r.title}): ${r.exampleExam} qaysi qoidaga mos keladi?`,
      opts: [r.answer, r.d2, r.d3, r.d1],
      answer: 0,
      explain: r.explain,
    });
  }

  for (const dp of DIRECT_UZ_PAIRS) {
    perTopicPool[dp.topicIdx].push({
      id: makeId(),
      topic: UZBEK_TOPICS[dp.topicIdx],
      difficulty: dp.diff,
      q: dp.examQ,
      opts: [dp.examA, ...dp.examD],
      answer: 0,
      explain: dp.examExp,
    });
  }

  for (const dr of UZ_SENTENCE_DRILLS) {
    for (const s of dr.examSentences) {
      perTopicPool[dr.topicIdx].push({
        id: makeId(),
        topic: UZBEK_TOPICS[dr.topicIdx],
        difficulty: dr.diff,
        q: dr.questionStem(s),
        opts: [dr.answer, ...dr.wrongs],
        answer: 0,
        explain: dr.explain,
      });
    }
  }

  const examContextDrills: Array<[number, string, string, [string, string, string], string, DifficultyLevel]> = [
    [0, '«Ular o‘z vazifalarini sidqidildan bajardilar» gapidagi olmoshlar ketma-ketligi:', 'Kishilik olmoshi (ular) va o‘zlik olmoshi (o‘z)', ['Ko‘rsatish va gumon olmoshi', 'So‘roq va belgilash olmoshi', 'Bo‘lishsizlik va kishilik olmoshi'], 'Ular — kishilik, o‘z — o‘zlik olmoshi.', 'medium'],
    [0, '«Qayerda halollik bo‘lsa, o‘sha yerda baraka bo‘ladi» gapidagi «qayerda» va «o‘sha» so‘zlari:', 'So‘roq olmoshi va ko‘rsatish olmoshi', ['Ravish va bog‘lovchi', 'Gumon olmoshi va yuklama', 'Belgilash va bo‘lishsizlik olmoshi'], 'Qayerda — so‘roq, o‘sha — ko‘rsatish olmoshi.', 'hard'],
    [1, '«Tog‘larga qor yog‘di-yu, havo birdan sovib ketdi» gapidagi fe’l shakllari:', 'Xabar mayli o‘tgan zamon fe’li (yog‘di) va ko‘makchi fe’lli qo‘shilma (sovib ketdi)', ['Buyruq mayli fe’li', 'Shart mayli fe’li', 'Harakat nomi'], 'Yog‘di — aniq o‘tgan zamon; sovib ketdi — ravishdosh + ko‘makchi fe’l.', 'hard'],
    [2, '«Saharda yo‘lga chiqqan karvon uzoqqa ketib ulgurdi» gapidagi payt va o‘rin ravishlari:', 'saharda (payt/hol) va uzoqqa (o‘rin ravishi)', ['yo‘lga va karvon', 'chiqqan va ulgurdi', 'hamma va hech'], 'Uzoqqa so‘zi harakat yo‘nalishini ko‘rsatuvchi o‘rin ravishidir.', 'medium'],
    [3, '«Ilm — aql chirog‘i, ammo amalsiz ilm foyda bermaydi» gapidagi «ammo» yordamchi so‘zi:', 'Zidlov bog‘lovchisi', ['Ko‘makchi', 'Modal so‘z', 'Undov so‘z'], 'Ammo gap bo‘laklari yoki sodda gaplarni zidlab bog‘laydi.', 'easy'],
    [4, '«Do‘stga sadoqat» va «Do‘stning sadoqati» birikmalari qaysi aloqa turlari bilan farqlanadi?', 'Birinchisi boshqaruv (-ga), ikkinchisi moslashuv (-ning ... -i)', ['Ikkalasi ham bitishuv', 'Birinchisi moslashuv, ikkinchisi bitishuv', 'Ikkalasi ham teng bog‘lanish'], 'Jo‘nalish kelishigi boshqaruvni, qaratqich-egalik esa moslashuvni beradi.', 'hard'],
    [5, 'Yusuf Xos Hojibning «Qutadg‘u bilig» asari nechanchi asrda yozilgan va nimaga bag‘ishlangan?', 'XI asrda (1069-yil) odob-axloq, ilm va adolatli davlat boshqaruviga', ['XV asrda Amir Temurga', 'XIX asrda Qo‘qon xonligiga', 'V asrda Eftaliylarga'], '«Qutadg‘u bilig» turkiy mumtoz didaktik adabiyotning ilk yirik obidasidir.', 'medium'],
    [6, 'Sadriddin Ayniyning «Esdaliklar» asaridan o‘quvchilar qanday asosiy tarixiy saboq oladilar?', 'Eski madrasa hayoti, oddiy mehnatkashlarning matonati va ma’rifatga intilish qadrini', ['Dengiz qaroqchilari sarguzashtlarini', 'Antik Yunon falsafasini', 'Zamonaviy kompyuter tarmoqlarini'], 'Ayniy o‘z boshidan kechirgan real hayotiy manzaralarni tasvirlagan.', 'medium'],
    [7, 'She’riy misrada ikki qarama-qarshi tushuncha (masalan, «kecha va kunduz», «yig‘i va kulgi») ning yonma-yon keltirilishi:', 'Tazod (qarshilantirish) san’ati', ['Mubolag‘a', 'Tashxis', 'Ixchamlik'], 'Qarama-qarshi ma’noli so‘zlardan obrazli kontrast yaratish tazoddir.', 'medium'],
  ];

  for (const [tIdx, q, a, ds, exp, diff] of examContextDrills) {
    perTopicPool[tIdx].push({
      id: makeId(),
      topic: UZBEK_TOPICS[tIdx],
      difficulty: diff,
      q,
      opts: [a, ...ds],
      answer: 0,
      explain: exp,
    });
  }

  const examTopicPoolWords: Array<Array<[string, string, string, string]>> = [
    [
      ['o‘z, o‘zim, o‘zingiz', 'o‘zlik olmoshi shakllari', 'kishilik olmoshlari', 'belgilash olmoshlari'],
      ['ana shu, mana bu, o‘shanday', 'ko‘rsatish olmoshlari', 'gumon olmoshlari', 'bo‘lishsizlik olmoshlari'],
      ['allaqancha, biror kim, nimadir', 'gumon olmoshlari', 'so‘roq olmoshlari', 'belgilash olmoshlari'],
      ['har narsa, barchamiz, hamma', 'belgilash olmoshlari', 'o‘zlik olmoshi', 'kishilik olmoshlari'],
      ['hech qachon, hech bir, hech qayerga', 'bo‘lishsizlik olmoshlari', 'ko‘rsatish olmoshlari', 'payt ravishlari'],
    ],
    [
      ['yozdi, o‘yladi, yugurdi', 'sodda fe’l namunalari', 'qo‘shma fe’llar', 'juft fe’llar'],
      ['qaror qildi, javob berdi, taklif etdi', 'qo‘shma fe’llar', 'sodda tub fe’llar', 'takroriy fe’llar'],
      ['o‘qisa, kelsa, bajarsa', 'shart mayli fe’llari', 'buyruq-istak mayli', 'majhul nisbat'],
      ['o‘qing, boraylik, kelsin', 'buyruq-istak mayli fe’llari', 'shart mayli', 'o‘tgan zamon'],
    ],
    [
      ['jim, piyoda, to‘satdan, ohista', 'holat ravishlari', 'o‘rin ravishlari', 'miqdor ravishlari'],
      ['dastlab, hali, doimo, kechasi', 'payt ravishlari', 'maqsad ravishlari', 'holat ravishlari'],
      ['yuqori, tuban, berida, chetda', 'o‘rin ravishlari', 'payt ravishlari', 'sabab ravishlari'],
      ['xiyol, g‘oyat, kam, ancha', 'miqdor-daraja ravishlari', 'o‘rin ravishlari', 'bog‘lovchilar'],
    ],
    [
      ['kabi, singari, sari, qadar', 'ko‘makchilar', 'teng bog‘lovchilar', 'ravishlar'],
      ['chunki, shuning uchun, agarda', 'ergashtiruvchi bog‘lovchilar', 'ko‘makchilar', 'yuklamalar'],
      ['axir, faqat, -a/-ya, -da', 'yuklamalar', 'bog‘lovchilar', 'so‘z birikmalari'],
      ['unga, parvoyi, avzoyi', 'tovush ortishi imlosi', 'tovush tushishi imlosi', 'tovush almashishi'],
    ],
    [
      ['do‘stning maslahati, uyning tomi', 'moslashuv aloqasi', 'bitishuv aloqasi', 'boshqaruv aloqasi'],
      ['she’rni yodlamoq, do‘stga ishonmoq', 'boshqaruv aloqasi', 'moslashuv aloqasi', 'bitishuv aloqasi'],
      ['tinimsiz mehnat, dadil gapirmoq', 'bitishuv aloqasi', 'boshqaruv aloqasi', 'moslashuv aloqasi'],
    ],
    [
      ['Alisher Navoiy «Sab’ai sayyor» va «Layli va Majnun»', '«Xamsa»ning lirik-falsafiy dostonlari', 'zamonaviy hikoyalar', 'folkor maqollari'],
      ['Og‘zaki dostonlar: «Alpomish», «Shirin bilan Shakar»', 'xalq og‘zaki ijodi durdonalari', 'mumtoz lug‘atlar', 'memuar romanlar'],
      ['«Devonu lug‘atit turk»dagi maqol va to‘rtliklar', 'XI asr xalq she’riyati namunalari', 'XX asr dramalari', 'Yevropa dostonlari'],
    ],
    [
      ['Abdulla Qodiriy «Mehrobdan chayon»', 'tarixiy-ma’rifiy roman', 'xalq dostoni', 'aruz risolasi'],
      ['Tog‘ay Murod «Ot kishnagan oqshom»', 'halollik va chavandozlik qissasi', 'fantastik hikoya', 'tilshunoslik lug‘ati'],
      ['O‘tkir Hoshimov «Dunyoning ishlari»', 'ona siymosi haqidagi novellalar qissasi', 'qahramonlik eposi', 'she’riy drama'],
    ],
    [
      ['kulminatsiya, yechim, ekspozitsiya', 'syujet tarkibiy qismlari', 'gap bo‘laklari', 'olmosh turlari'],
      ['metafora, tashxis, tazod, mubolag‘a', 'badiiy san’at va tasvir vositalari', 'tovush o‘zgarishlari', 'yordamchi so‘zlar'],
    ],
  ];

  const out: QuestionItem[] = [];
  let extraCounter = 0;

  while (out.length < 500) {
    let bestTopic = 0;
    let minCount = counts[0];
    for (let t = 1; t < UZBEK_TOPICS.length; t++) {
      if (counts[t] < minCount) {
        minCount = counts[t];
        bestTopic = t;
      }
    }
    if (perTopicPool[bestTopic].length === 0) {
      const list = examTopicPoolWords[bestTopic];
      const [sample, ans, w1, w2] = list[extraCounter % list.length];
      const round = Math.floor(extraCounter / list.length) + 1;
      extraCounter++;
      const labels = [
        'ChSB Imtihon savoli',
        'Bilimni sinash topshirig‘i',
        'Grammatik-adabiy tekshiruv',
        'Yakuniy imtihon tahlili',
        'Nazariy-amaliy topshiriq',
      ];
      perTopicPool[bestTopic].push({
        id: makeId(),
        topic: UZBEK_TOPICS[bestTopic],
        difficulty: round % 2 === 0 ? 'hard' : 'medium',
        q: `${labels[round % labels.length]} (${UZBEK_TOPICS[bestTopic].split('. ')[1]}): «${sample}» misoli qaysi nazariy birlikka tegishli?`,
        opts: [ans, w1, w2, 'Faqat punktuatsiya belgisi'],
        answer: 0,
        explain: `«${sample}» to‘g‘ridan-to‘g‘ri ${ans} sirasiga kiradi.`,
      });
    }
    const cand = perTopicPool[bestTopic].shift()!;
    const stem = (typeof cand.q === 'string' ? cand.q : cand.q.uz).trim();
    if (seen.has(stem)) continue;
    seen.add(stem);
    counts[bestTopic]++;
    out.push(cand);
  }
  return out;
}
