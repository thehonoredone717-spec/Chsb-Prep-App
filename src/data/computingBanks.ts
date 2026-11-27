import { BilingualText, DifficultyLevel, QuestionItem } from '../types/quiz';

const COMPUTING_TOPICS = [
  '1. Networks and topologies',
  '2. Servers, internet and security',
  '3. Protocols and packets',
  '4. Data, storage and sound',
  '5. Transmission errors and checks',
  '6. Software and utilities',
  '7. Security and authentication',
  '8. The CPU and registers',
  '9. Programming languages and logic',
  '10. Design, AI and industry',
  '11. Network scalability (9DC.03)',
] as const;

interface BiConcept {
  topicIdx: number;
  diff: DifficultyLevel;
  testQ: BilingualText;
  testOpts: { uz: [string, string, string, string]; en: [string, string, string, string] };
  testExp: BilingualText;
  examQ: BilingualText;
  examOpts: { uz: [string, string, string, string]; en: [string, string, string, string] };
  examExp: BilingualText;
}

const BI_CONCEPTS: BiConcept[] = [
  // Topic 0: Networks and topologies
  {
    topicIdx: 0, diff: 'easy',
    testQ: { en: 'Which network topology shares one single central backbone cable with terminators at both ends?', uz: 'Qaysi tarmoq topologiyasida ikkala uchida terminatorlari bo‘lgan bitta asosiy magistral kabel ishlatiladi?' },
    testOpts: {
      uz: ['Shina (Bus) topologiyasi', 'Yulduz (Star) topologiyasi', 'Halqa (Ring) topologiyasi', 'Mesh topologiyasi'],
      en: ['Bus topology', 'Star topology', 'Ring topology', 'Mesh topology'],
    },
    testExp: { en: 'Bus topology uses one shared backbone cable terminated at both ends to absorb signals.', uz: 'Shina topologiyasi signallarni yutuvchi terminatorli bitta umumiy magistral kabeldan foydalanadi.' },
    examQ: { en: 'Why are terminators attached at both endpoints of a Bus network backbone?', uz: 'Nima uchun Shina (Bus) tarmog‘ining ikkala uchiga terminatorlar o‘rnatiladi?' },
    examOpts: {
      uz: ['Signallar kabel uchidan qaytib to‘qnashish (kolliziya) keltirib chiqarmasligi uchun', 'Har bir kompyuterga elektr tokini kuchaytirish uchun', 'Simsiz Wi-Fi signallarini kengaytirish uchun', 'Barcha IP manzillarni shifrlash uchun'],
      en: ['To absorb signals at cable ends and prevent reflection collisions', 'To boost AC electrical voltage to monitors', 'To extend wireless Wi-Fi coverage', 'To encrypt every MAC address automatically'],
    },
    examExp: { en: 'Terminators stop electrical pulses bouncing back along the shared backbone.', uz: 'Terminatorlar kabel uchida signalning aks etib qaytishini oldini oladi.' },
  },
  {
    topicIdx: 0, diff: 'medium',
    testQ: { en: 'Which hardware device reads a destination IP address to forward data packets between two different networks (such as a home LAN and the Internet)?', uz: 'Qaysi qurilma qabul qiluvchi IP manzilini o‘qib, ma’lumot paketlarini ikki xil tarmoq (masalan, LAN va Internet) o‘rtasida yo‘naltiradi?' },
    testOpts: {
      uz: ['Router (Marshrutizator)', 'Oddiy tarmoq kabeli', 'Printer drayveri', 'Terminator'],
      en: ['Router', 'Ethernet wall socket', 'Thermal printer', 'Bus terminator'],
    },
    testExp: { en: 'A router connects separate networks and directs IP packets along optimal paths.', uz: 'Router turli tarmoqlarni bog‘laydi va IP paketlarni eng qulay yo‘ldan yuboradi.' },
    examQ: { en: 'How does a Star topology react if one workstation’s Ethernet drop cable snaps?', uz: 'Yulduz topologiyasida bitta kompyuterning tarmoq kabeli uzilib qolsa, tarmoqqa qanday ta’sir qiladi?' },
    examOpts: {
      uz: ['Faqat o‘sha bitta qurilma uziladi, qolgan barcha kompyuterlar ishlashda davom etadi', 'Butun tarmoq darhol ishdan to‘xtaydi', 'Tarmoq avtomatik ravishda Shina topologiyasiga o‘tadi', 'Kommutator barcha fayllarni o‘chirib yuboradi'],
      en: ['Only that single workstation loses connection; all other devices continue running normally', 'The entire school or office network halts immediately', 'Signals reverse direction into a Bus backbone', 'The central switch deletes all MAC tables permanently'],
    },
    examExp: { en: 'Dedicated cable links isolate faults to a single device unless the central switch itself fails.', uz: 'Har bir qurilma alohida kabel bilan ulangani uchun faqat bitta tugun uziladi.' },
  },

  // Topic 1: Servers, internet and security
  {
    topicIdx: 1, diff: 'easy',
    testQ: { en: 'Which dedicated server translates readable domain names (like google.com) into numerical IP addresses?', uz: 'Qaysi maxsus server odamlar tushunadigan domen nomlarini (masalan, google.com) raqamli IP manzillarga aylantirib beradi?' },
    testOpts: {
      uz: ['DNS serveri (Domain Name System)', 'Chop etish serveri (Print Server)', 'Fayl arxivi (FTP)', 'Ovoz kartasi'],
      en: ['DNS server (Domain Name System)', 'Print spooler server', 'USB hub controller', 'Sound DAC chip'],
    },
    testExp: { en: 'DNS maps memorable domain URLs to IP addresses needed for routing.', uz: 'DNS domen nomini kompyuterlar tushunadigan IP manzilga moslashtiradi.' },
    examQ: { en: 'What is the fundamental security advantage of using HTTPS instead of plain HTTP when submitting forms?', uz: 'Veb-saytlarga ma’lumot yuborishda oddiy HTTP o‘rniga HTTPS ishlatishning asosiy xavfsizlik afzalligi nimada?' },
    examOpts: {
      uz: ['Ma’lumotlar jo‘natilishidan oldin shifrlanadi va tinglovchilar o‘qiy olmaydi', 'Veb-sahifalardan barcha rasmlar avtomatik o‘chiriladi', 'Kompyuterda antivirusga ehtiyoj qolmaydi', 'Internet tezligi doim 100 barobar oshadi'],
      en: ['Data is encrypted in transit so eavesdroppers cannot read passwords or forms', 'All images on webpages are automatically removed', 'Computers no longer need anti-malware protection', 'Transmission automatically bypasses all routers'],
    },
    examExp: { en: 'HTTPS uses TLS/SSL encryption to keep traffic confidential and tamper-resistant.', uz: 'HTTPS trafikni shifrlab, uchinchi shaxslar ma’lumotni o‘qib olishining oldini oladi.' },
  },

  // Topic 2: Protocols and packets
  {
    topicIdx: 2, diff: 'medium',
    testQ: { en: 'Who invented packet switching in the early 1960s so resilient networks could still deliver messages via alternate routes if nodes failed?', uz: '1960-yillar boshida tarmoq tugunlari ishdan chiqqanda ham ma’lumotlarni muqobil yo‘llardan yetkazish uchun paketli kommutatsiyani kim ixtiro qilgan?' },
    testOpts: {
      uz: ['Pol Baran (Paul Baran)', 'Tim Berners-Li', 'Alan Tyuring', 'Charlz Bebbidj'],
      en: ['Paul Baran', 'Tim Berners-Lee', 'Alan Turing', 'Charles Babbage'],
    },
    testExp: { en: 'Paul Baran proposed distributed packet switching for fault-tolerant communications.', uz: 'Pol Baran tarmoq chidamliligini oshirish uchun ma’lumotlarni mayda paketlarga bo‘lib yuborishni taklif qilgan.' },
    examQ: { en: 'Why does each data packet carry a sequence number such as “Packet 4 of 12” in its header?', uz: 'Har bir ma’lumot paketi sarlavhasida nima uchun “12 tadan 4-paket” kabi tartib raqami saqlanadi?' },
    examOpts: {
      uz: ['Turli yo‘llardan har xil vaqtda yetib kelgan paketlarni to‘g‘ri tartibda jamlash va yo‘qolganini aniqlash uchun', 'Kabeldagi kuchlanishni 220 voltda ushlab turish uchun', 'Foydalanuvchi parolini oddiy matnda saqlash uchun', 'Printer qog‘ozini tejash uchun'],
      en: ['So the receiver can reassemble out-of-order packets correctly and spot missing packets', 'To regulate AC power flowing inside copper wires', 'To broadcast user passwords in plain text', 'To compress graphics into bitmap audio'],
    },
    examExp: { en: 'Packets take independent routes and may arrive out of order; sequence numbers allow accurate reassembly.', uz: 'Paketlar turli yo‘llar bilan kelgani uchun qabul qiluvchi ularni tartib raqami bo‘yicha tiklaydi.' },
  },

  // Topic 3: Data, storage and sound
  {
    topicIdx: 3, diff: 'easy',
    testQ: { en: 'What sequence of steps does an Analogue-to-Digital Converter (ADC) follow when recording sound from a microphone?', uz: 'Mikrofondan tovush yozib olishda Analog-Raqamli O‘zgartirgich (ADC) qaysi bosqichlarni ketma-ket bajaradi?' },
    testOpts: {
      uz: ['Diskretlash (Sampling) → Kvantlash (Quantization) → Kodlash (Encoding)', 'Kompilyatsiya → Parol qo‘yish → Chop etish', 'Shifrlash → Routerlash → Paritet tekshiruvi', 'Dekodlash → Kuchaytirish → Spektr'],
      en: ['Sampling → Quantization → Binary Encoding', 'Compiling → Hashing → Printing', 'Encryption → Packet Routing → Parity Check', 'Decoding → Amplification → Playback'],
    },
    testExp: { en: 'ADC measures amplitudes at regular intervals (sampling), rounds levels (quantisation), and encodes binary.', uz: 'ADC tovush to‘lqinini muntazam o‘lchaydi (sampling), yaxlitlaydi (quantization) va ikkilik kodga o‘giradi.' },
    examQ: { en: 'How many bits make up one Nibble and how many bytes equal 4 Kilobytes (using metric decimal KB = 1000 bytes)?', uz: 'Bitta Nibble nechta bitdan iborat va 4 Kilobayt (o‘nlik KB = 1000 bayt) nechta baytga teng?' },
    examOpts: {
      uz: ['1 Nibble = 4 bit; 4 KB = 4 000 bayt', '1 Nibble = 8 bit; 4 KB = 400 bayt', '1 Nibble = 2 bit; 4 KB = 4 000 000 bayt', '1 Nibble = 16 bit; 4 KB = 32 bayt'],
      en: ['1 Nibble = 4 bits; 4 KB = 4,000 bytes', '1 Nibble = 8 bits; 4 KB = 400 bytes', '1 Nibble = 2 bits; 4 KB = 4,000,000 bytes', '1 Nibble = 16 bits; 4 KB = 32 bytes'],
    },
    examExp: { en: 'Half a byte (4 bits) is a nibble, and 1 KB = 1,000 bytes.', uz: '4 bit = 1 nibble, 1 KB esa 1000 baytga teng.' },
  },

  // Topic 4: Transmission errors and checks
  {
    topicIdx: 4, diff: 'medium',
    testQ: { en: 'What physical safeguard around copper Ethernet cables minimizes electromagnetic interference that can flip bits?', uz: 'Mis tarmoq kabellaridagi bitlarning ag‘darilishiga olib keluvchi elektromagnit shovqinni kamaytirish uchun qanday himoya qo‘llaniladi?' },
    testOpts: {
      uz: ['Kabel atrofiga metall ekran (shielding) o‘rash va juft simlarni burab o‘rash', 'Kabelni magnit maydon generatoriga yaqin qo‘yish', 'Barcha kompyuterlarni parolsiz ulash', 'Faqat bitta simli izolatsiyasiz kabel ishlatish'],
      en: ['Metallic foil shielding around the copper wires (and twisted pairs)', 'Placing cables tight beside high-voltage transformers', 'Removing all router firewalls', 'Using uninsulated bare single wires'],
    },
    testExp: { en: 'Shielded Twisted Pair (STP) cabling blocks external electrical noise.', uz: 'Ekranlangan (shielded) o‘rama kabellar tashqi elektr shovqinlarini to‘sadi.' },
    examQ: { en: 'A limitation of single-bit parity checking is that it fails to detect which type of transmission error?', uz: 'Bitta paritet bitli tekshiruv usuli qaysi turdagi uzatish xatosini aniqlay olmaydi?' },
    examOpts: {
      uz: ['Bir bayt ichida juft sondagi (masalan, 2 ta) bitning bir vaqtda ag‘darilishi (transpozitsiyasi)', 'Bitta bitning 0 dan 1 ga o‘zgarishi', 'Paritet protokoli o‘rnatilgan 7-bitli kodni tekshirish', 'Toq sondagi (1 yoki 3 ta) bit xatosini'],
      en: ['An even number of flipped bits (e.g. 2 bits flipped or transposed) in the same byte', 'A single bit flipping from 0 to 1', 'Checking an agreed odd parity 7-bit block', 'An odd count (1 or 3) of corrupted bits'],
    },
    examExp: { en: 'Two bit errors cancel out in total parity count, leaving parity unchanged even though data is corrupted.', uz: 'Ikkita bit birga o‘zgarsa, 1 lar sonining juft-toqligi o‘zgarmay qoladi va xato sezilmaydi.' },
  },

  // Topic 5: Software and utilities
  {
    topicIdx: 5, diff: 'easy',
    testQ: { en: 'Which utility software reorganises scattered pieces of files on a mechanical Hard Disk Drive (HDD) into contiguous blocks for faster reading?', uz: 'Qaysi utilita dasturi qattiq diskdagi (HDD) tarqoq fayl bo‘laklarini tezroq o‘qish uchun ketma-ket bloklarga jamlaydi?' },
    testOpts: {
      uz: ['Disk defragmentatori (Defragmentation)', 'Antivirus skaneri', 'Veb-brauzer kengaytmasi', 'Ovoz kuchaytirgich drayveri'],
      en: ['Disk defragmenter', 'Firewall packet filter', 'Spreadsheet macro', 'Screen brightness utility'],
    },
    testExp: { en: 'Defragmentation groups fragmented file sectors contiguously on spinning HDD platters.', uz: 'Defragmentatsiya HDD diskidagi sochilgan sektorlarni bitta uzluksiz ketma-ketlikka keltiradi.' },
    examQ: { en: 'What is the core role of Operating System device drivers?', uz: 'Operatsion tizimdagi qurilma drayverlarining (Device Drivers) asosiy vazifasi nima?' },
    examOpts: {
      uz: ['OS buyruqlarini printer, kamera yoki videokarta kabi tashqi qurilmalar tushunadigan tilga tarjima qilish', 'Internetdagi barcha reklamalarni bloklash', 'Fayllarni ZIP arxivga siqish', 'Kompyuter protsessorini sovutish'],
      en: ['Translate OS instructions into hardware-specific commands for peripherals like printers and GPUs', 'Block every incoming website banner automatically', 'Compress folders into encrypted archives', 'Physically spin cooling fans faster'],
    },
    examExp: { en: 'Drivers act as translators between the operating system and specific hardware components.', uz: 'Drayver operatsion tizim va aniq apparat qurilmasi o‘rtasida tarjimon vazifasini bajaradi.' },
  },

  // Topic 6: Security and authentication
  {
    topicIdx: 6, diff: 'medium',
    testQ: { en: 'Why is Two-Factor Authentication (2FA) significantly safer than relying solely on a memorable password?', uz: 'Nima uchun Ikki Bosqichli Autentifikatsiya (2FA) faqat bitta parolga tayanishdan ko‘ra ancha xavfsiz?' },
    testOpts: {
      uz: ['Parol o‘g‘irlansa ham, tajovuzkor telefon kodi yoki biometrik tasdiqsiz tizimga kira olmaydi', '2FA internetga ulanmasdan parollarni o‘chirib tashlaydi', 'U foydalanuvchiga bir xil parolni hamma saytda ishlatishga ruxsat beradi', 'Firewall o‘rnini to‘liq bosadi'],
      en: ['Even if a password leaks, attackers still lack the second factor (e.g. one-time code or fingerprint)', 'It deletes passwords completely from local disks', 'It makes identical passwords safe everywhere', 'It replaces physical Ethernet cables'],
    },
    testExp: { en: '2FA combines two distinct categories (e.g. something you know + something you have/are).', uz: '2FA ikki xil tasdiqlash omilini (masalan, parol + bir martalik SMS/ilova kodi) talab qiladi.' },
    examQ: { en: 'What distinguishes a Computer Worm from a classic Computer Virus?', uz: 'Kompyuter chuvalchangi (Worm) oddiy kompyuter virusidan (Virus) nimasi bilan farq qiladi?' },
    examOpts: {
      uz: ['Chuvalchang foydalanuvchi harakatisiz tarmoq orqali mustaqil nusxalanib tarqaladi; virus esa faylga yopishishi kerak', 'Chuvalchang faqat monitor ekranini o‘chiradi', 'Virus hech qachon fayllarga zarar yetkazmaydi', 'Chuvalchang faqat qog‘oz printerlarda uchraydi'],
      en: ['A worm self-replicates across networks automatically without needing a host file, whereas a virus attaches to host files', 'A worm only dims screen brightness briefly', 'Viruses require hardware router switches to move manually', 'Worms cannot affect Windows or Linux servers'],
    },
    examExp: { en: 'Worms spread autonomously over network connections without human clicks.', uz: 'Chuvalchang zararli dasturi xost faylga bog‘lanmasdan tarmoq bo‘ylab o‘zini ko‘paytiradi.' },
  },

  // Topic 7: The CPU and registers
  {
    topicIdx: 7, diff: 'easy',
    testQ: { en: 'Which CPU unit executes arithmetic additions, subtractions, and logical comparisons (<, >, =)?', uz: 'Protsessorning (CPU) qaysi qismi arifmetik qo‘shish-ayirish va mantiqiy taqqoslash (<, >, =) amallarini bajaradi?' },
    testOpts: {
      uz: ['ALU — Arifmetik-mantiqiy qurilma', 'Boshqaruv qurilmasi (Control Unit)', 'Doimiy xotira (ROM)', 'Tashqi qattiq disk (SSD)'],
      en: ['ALU (Arithmetic Logic Unit)', 'Control Unit (CU)', 'Read Only Memory (ROM)', 'Solid State Drive (SSD)'],
    },
    testExp: { en: 'The ALU handles arithmetic calculations and logical operations.', uz: 'ALU barcha matematik hisoblar va mantiqiy solishtirishlarni amalga oshiradi.' },
    examQ: { en: 'Describe the sequential operation of the Fetch–Decode–Execute cycle inside a Von Neumann CPU.', uz: 'Fon Neyman arxitekturali protsessor ichidagi Fetch–Decode–Execute (Olish–Dekodlash–Bajarish) siklini izohlang.' },
    examOpts: {
      uz: ['Xotiradan navbatdagi buyruq olinadi (PC manzilidan), CU uni dekodlaydi va ALU/registrlar bajaradi', 'Avval ma’lumot printerga chiqadi, keyin RAM tozalanadi', 'Dastur avtomatik ingliz tilidan o‘zbekchaga tarjima qilinadi', 'Kesh xotira kompyuter o‘chirilganda BIOSni yozadi'],
      en: ['Instruction is fetched from RAM address in PC, decoded by the CU, and executed (often using ALU & Accumulator)', 'Data prints first before loading RAM addresses', 'Source code rewrites itself into machine hardware', 'Cache flashes BIOS firmware every clock pulse'],
    },
    examExp: { en: 'Every CPU clock cycle steps through Fetch (from RAM) → Decode (CU) → Execute (ALU/CU).', uz: 'Har bir taktda buyruq RAMdan olinadi, dekodlanadi va ijro etiladi.' },
  },

  // Topic 8: Programming languages and logic
  {
    topicIdx: 8, diff: 'medium',
    testQ: { en: 'How does an Interpreter differ from a Compiler when running Python or JavaScript code?', uz: 'Dastur kodini ishga tushirishda Interpretator Kompilyatordan qanday farq qiladi?' },
    testOpts: {
      uz: ['Interpretator kodni qatorma-qator tarjima qilib darhol bajaradi va birinchi xatoda to‘xtaydi; kompilyator esa butun faylni bir yo‘la tarjima qiladi', 'Kompilyator dasturni faqat internetsiz ishlatadi', 'Interpretator mashina kodini abadiy exe faylga saqlaydi', 'Ular orasida hech qanday farq yo‘q'],
      en: ['An interpreter translates and runs line-by-line (halting at first error), while a compiler translates the entire source program into an executable first', 'Compilers refuse to run on laptops without Ethernet', 'Interpreters permanently create standalone .exe binaries beforehand', 'Both behave identically inside the CPU'],
    },
    testExp: { en: 'Compilers produce standalone machine-code binaries all at once; interpreters execute line by line.', uz: 'Kompilyator butun dasturni oldindan mashina kodiga o‘giradi, interpretator esa satrma-satr bajaradi.' },
    examQ: { en: 'Which logic gate outputs TRUE (1) ONLY when both inputs are DIFFERENT (one is 1 and the other is 0)?', uz: 'Qaysi mantiqiy element faqat ikkala kirish signali HAR XIL bo‘lgandagina (biri 1, ikkinchisi 0) 1 qiymat chiqaradi?' },
    examOpts: {
      uz: ['XOR (Istisno YOKI) elementi', 'AND (VA) elementi', 'NAND elementi', 'NOT (INKOR) elementi'],
      en: ['XOR gate', 'AND gate', 'NAND gate', 'NOT gate'],
    },
    examExp: { en: 'XOR outputs 1 if and only if A ≠ B.', uz: 'XOR (A ≠ B) kirishlar har xil bo‘lgandagina TRUE qaytaradi.' },
  },

  // Topic 9: Design, AI and industry
  {
    topicIdx: 9, diff: 'easy',
    testQ: { en: 'In robotics and factory quality control, what does CAD/CAM stand for?', uz: 'Zamonaviy zavod va muhandislikda CAD/CAM qisqartmasi nimani anglatadi?' },
    testOpts: {
      uz: ['Computer-Aided Design va Computer-Aided Manufacturing (kompyuterli loyihalash va ishlab chiqarish)', 'Central Arithmetic Data va Cache Memory', 'Cyber Attack Defence va Cloud Access Model', 'Coded Audio Digitisation'],
      en: ['Computer-Aided Design and Computer-Aided Manufacturing', 'Central Arithmetic Data and Cache Memory', 'Cyber Attack Defence and Cloud Access Module', 'Compact Audio Decoder'],
    },
    testExp: { en: 'CAD models 3D components digitally; CAM drives CNC machines and robots to build them.', uz: 'CAD kompyuterda chizma/model yaratadi, CAM esa dastgohlarni boshqarib detal ishlab chiqaradi.' },
    examQ: { en: 'What is Machine Learning (ML) in modern AI applications like predictive keyboards and medical image scanning?', uz: 'Bashoratli klaviatura yoki tibbiy tasvirlarni tahlil qilish kabi zamonaviy AI tizimlarida Machine Learning (ML) qanday ishlaydi?' },
    examOpts: {
      uz: ['Algoritmlar katta hajmdagi namuna ma’lumotlardagi qonuniyatlardan o‘rganib, har bir qadamni qo‘lda kodlamasdan bashorat qiladi', 'Dasturchi har bir mumkin bo‘lgan rasmni if-else bilan qo‘lda yozib chiqadi', 'Kompyuter faqat tasodifiy sonlar generatoridan foydalanadi', 'Tizim inson miyasidagi neyronlarga kabel ulaydi'],
      en: ['Models learn patterns from large training datasets to classify or predict without explicit rule-by-rule hardcoding', 'Programmers manually type an if-else statement for every pixel', 'The computer relies purely on random coin flips', 'Hardware ignores past data completely'],
    },
    examExp: { en: 'ML builds statistical models automatically from training examples rather than static rules.', uz: 'ML tizimlari misollardan qonuniyat o‘rganib, yangi holatlarni mustaqil baholaydi.' },
  },

  // Topic 10: Network scalability (9DC.03)
  {
    topicIdx: 10, diff: 'medium',
    testQ: { en: 'Why does upgrading a fast-growing school network from IPv4 to IPv6 directly solve IP scalability issues?', uz: 'Tez o‘sayotgan maktab yoki korxona tarmog‘ini IPv4 dan IPv6 ga o‘tkazish nima uchun masshtablanuvchanlik muammosini hal qiladi?' },
    testOpts: {
      uz: ['128-bitli IPv6 deyarli cheksiz miqdordagi noyob qurilma manzillarini taqdim etadi', 'IPv6 eski mis kabellarni optik tolaga aylantiradi', 'IPv6 elektr energiyasi sarfini nolga tushiradi', 'IPv6 barcha parollarni bekor qiladi'],
      en: ['128-bit IPv6 provides a virtually unlimited pool of unique IP addresses for new devices', 'IPv6 physically turns copper wires into optical glass', 'IPv6 cuts server power draw to zero', 'IPv6 removes the need for switches'],
    },
    testExp: { en: 'IPv4 (32-bit, ~4.3B addresses) exhausts quickly; IPv6 (128-bit) supports massive IoT and client growth.', uz: 'IPv4 manzillar soni cheklangan, 128-bitli IPv6 esa milliardlab yangi qurilmalarni qo‘llab-quvvatlaydi.' },
    examQ: { en: 'How do modular switches with spare SFP/Ethernet ports support cost-effective network scalability?', uz: 'Zaxira portlarga va modulli kengaytirish slotlariga ega kommutatorlar tarmoq masshtablanuvchanligini qanday ta’minlaydi?' },
    examOpts: {
      uz: ['Yangi kompyuter va qavatlar qo‘shilganda barcha eski uskunalarni tashlab yubormasdan kengaytirish imkonini beradi', 'Har bir foydalanuvchini bitta Wi-Fi paroliga majburlaydi', 'Tarmoq tezligini 1 Mbps gacha sekinlashtiradi', 'Faqat Shina topologiyasi bilan ishlaydi'],
      en: ['New workstations and wings can plug into existing hardware or expansion modules without replacing the entire core network', 'It forces every user onto one shared 1 Mbps cable', 'It locks the office into a Bus backbone', 'It removes network security monitoring'],
    },
    examExp: { en: 'Modular hardware with spare ports lets networks scale cleanly in stages.', uz: 'Modulli uskunalar butun tarmoqni noldan qurmasdan bosqichma-bosqich kengaytirish imkonini beradi.' },
  },
];

// Quantitative & Binary/Storage/Sound/Logic generators (100% unique bilingual Test & Exam problems!)
function buildComputingParametric(
  topicIdx: number,
  k: number,
  bank: 'test' | 'exam',
  id: string
): QuestionItem {
  const topic = COMPUTING_TOPICS[topicIdx];
  const diffs: DifficultyLevel[] = ['easy', 'medium', 'hard'];
  const diff = diffs[k % 3];
  const seq = bank === 'test' ? k + 1 : k + 120;

  switch (topicIdx) {
    // 0: Networks & topologies
    case 0: {
      const devices = (seq % 15) + 6;
      const rooms = ['IT Suite', 'Physics Wing', 'Library Hub', 'Media Lab', 'Admin Floor', 'Art Block', 'Robotics Studio', 'Exam Centre'][seq % 8];
      if (bank === 'test') {
        const starCables = devices;
        return {
          id, topic, difficulty: diff,
          q: {
            en: `${rooms} connects ${devices} workstations in a Star topology using one central 24-port switch. How many individual drop cables run to the switch, and what happens if 1 cable fails?`,
            uz: `${rooms} xonasidagi ${devices} ta kompyuter bitta 24-portli kommutatorga Yulduz topologiyasida ulangan. Kommutatorga nechta alohida kabel boradi va 1 ta kabel uzilsa nima bo‘ladi?`,
          },
          opts: {
            uz: [
              `${starCables} ta kabel; faqat o‘sha 1 ta kompyuter aloqani yo‘qotadi`,
              `1 ta umumiy magistral kabel; butun xona to‘xtaydi`,
              `${starCables * 2} ta halqa kabeli; barcha signallar aks etadi`,
              `${devices - 1} ta kabel; kommutator yonib ketadi`,
            ],
            en: [
              `${starCables} drop cables; only that 1 device loses connectivity`,
              `1 shared backbone cable; the whole room disconnects`,
              `${starCables * 2} ring cables; signal loops stop`,
              `${devices - 1} cables; the central switch shuts down`,
            ],
          },
          answer: 0,
          explain: {
            en: `In a Star topology, every node (${devices}) uses its own cable to the central switch; a single break isolates only that device.`,
            uz: `Yulduz topologiyasida har bir kompyuter (${devices} ta) kommutatorga alohida kabel bilan ulanadi.`,
          },
        };
      }
      const meshNodes = (seq % 6) + 4;
      const meshLinks = (meshNodes * (meshNodes - 1)) / 2;
      return {
        id, topic, difficulty: diff,
        q: {
          en: `In ${rooms}, ${meshNodes} critical servers are linked in a full Mesh topology so every server has a direct link to every other server. How many cable links are required?`,
          uz: `${rooms} bo‘limidagi ${meshNodes} ta asosiy server to‘liq Mesh (to‘r) topologiyasida o‘zaro to‘g‘ridan-to‘g‘ri ulangan. Jami nechta aloqa liniyasi kerak bo‘ladi?`,
        },
        opts: {
          uz: [`${meshLinks} ta liniya`, `${meshNodes} ta liniya`, `${meshNodes * meshNodes} ta liniya`, `${meshNodes - 1} ta liniya`],
          en: [`${meshLinks} links`, `${meshNodes} links`, `${meshNodes * meshNodes} links`, `${meshNodes - 1} links`],
        },
        answer: 0,
        explain: {
          en: `Full mesh edges = n(n − 1) / 2 = ${meshNodes} × ${meshNodes - 1} / 2 = ${meshLinks}.`,
          uz: `To‘liq mesh liniyalari soni n(n − 1) / 2 = ${meshNodes} × ${meshNodes - 1} / 2 = ${meshLinks} ta.`,
        },
      };
    }

    // 1: Servers, internet and security
    case 1: {
      const sites = ['chsb7.uz', 'schoolhub.org', 'cambridge-prep.net', 'tashkent-stem.edu', 'edu-portal.uz', 'science-lab.io', 'history-vault.org', 'math-olymp.uz'];
      const site = sites[seq % sites.length];
      const port = seq % 2 === 0 ? 443 : 80;
      const proto = port === 443 ? 'HTTPS' : 'HTTP';
      if (bank === 'test') {
        return {
          id, topic, difficulty: diff,
          q: {
            en: `A student opens https://${site}/quiz (port ${port}). Which server resolves "${site}" into an IP address before the browser fetches HTML via ${proto}?`,
            uz: `O‘quvchi https://${site}/quiz (${port}-port) manzilini ochdi. Brauzer ${proto} orqali sahifani olishidan oldin "${site}" nomini IP manzilga qaysi server aylantiradi?`,
          },
          opts: {
            uz: ['DNS serveri; so‘ngra veb-server shifrlangan HTML hujjatni yuboradi', 'Print serveri; so‘ngra fayllar USB orqali keladi', 'Mail serveri; faqat elektron xatlar uzatiladi', 'Router DNSsiz to‘g‘ridan-to‘g‘ri matnni o‘zgartiradi'],
            en: ['DNS server resolves the IP first, then the web server delivers encrypted HTML', 'Print server handles the IP lookup first', 'Mail server hosts the HTML gallery directly', 'Local mouse driver resolves domain strings'],
          },
          answer: 0,
          explain: { en: `DNS translates ${site} to its IP, then port 443 serves encrypted HTTPS HTML.`, uz: `DNS ${site} domenini IP ga o‘giradi, so‘ng veb-server 443-portdan HTTPS orqali sahifa beradi.` },
        };
      }
      const octet = (seq % 180) + 20;
      return {
        id, topic, difficulty: diff,
        q: {
          en: `Browser request headers to ${site} show ":method: GET", ":scheme: https", ":path: /results", and destination IP 192.168.${octet}.10. What does ":method: GET" mean?`,
          uz: `${site} saytiga yuborilgan HTTP/HTTPS sarlavhasida ":method: GET", ":scheme: https", ":path: /results" ko‘rsatilgan. ":method: GET" nimani bildiradi?`,
        },
        opts: {
          uz: [
            'Brauzer serverdan /results sahifasini xavfsiz (shifrlangan) holda o‘qib berishni so‘ramoqda',
            'Server barcha ma’lumotlar bazasini o‘chirib tashlamoqda',
            'Foydalanuvchi paroli oddiy matnda barchaga tarqatilmoqda',
            'Printer qog‘ozini tekshirish buyrug‘i berilmoqda',
          ],
          en: [
            'The browser is requesting to retrieve the /results resource from the server over encrypted HTTPS',
            'The server is formatting its hard drive immediately',
            'User passwords are being broadcast unencrypted over HTTP',
            'A hardware print queue job has timed out',
          ],
        },
        answer: 0,
        explain: { en: 'GET asks the web server to retrieve the specified path; scheme https ensures TLS encryption.', uz: 'GET serverdan ko‘rsatilgan resursni yuklab olishni so‘raydi, https esa shifrlashni ta’minlaydi.' },
      };
    }

    // 2: Protocols and packets
    case 2: {
      const fileKB = ((seq % 12) + 3) * 12; // KB
      const pktKB = (seq % 3) + 2; // 2, 3, or 4 KB
      const totalPkts = Math.ceil(fileKB / pktKB);
      const missIdx = (seq % Math.max(2, totalPkts - 1)) + 1;
      if (bank === 'test') {
        return {
          id, topic, difficulty: diff,
          q: {
            en: `A ${fileKB} KB document is split into ${pktKB} KB packets under TCP/IP. How many packets are created, and how does TCP handle packet #${missIdx} going missing?`,
            uz: `${fileKB} KB hajmli hujjat TCP/IP orqali ${pktKB} KB lik paketlarga bo‘lindi. Jami nechta paket hosil bo‘ladi va #${missIdx} paket yo‘qolsa TCP nima qiladi?`,
          },
          opts: {
            uz: [
              `${totalPkts} ta paket; qabul qiluvchi tasdiq (ACK) bermaydi va #${missIdx} paket qayta yuboriladi`,
              `${fileKB * pktKB} ta paket; butun hujjat hech qachon tiklanmaydi`,
              `${totalPkts + 5} ta paket; printer avtomatik chop etadi`,
              `1 ta ulkan paket; paket raqami kerak bo‘lmaydi`,
            ],
            en: [
              `${totalPkts} packets; TCP detects the missing ACK and requests retransmission of packet #${missIdx}`,
              `${fileKB * pktKB} packets; TCP ignores lost pieces completely`,
              `${totalPkts + 5} packets; DNS replaces the lost payload`,
              `1 giant packet; sequence headers are dropped`,
            ],
          },
          answer: 0,
          explain: { en: `${fileKB} ÷ ${pktKB} = ${totalPkts} packets. TCP uses sequence numbers and ACKs to resend missing packets.`, uz: `${fileKB} ÷ ${pktKB} = ${totalPkts} ta paket; TCP tartib raqami orqali yo‘qolgan paketni qayta so‘raydi.` },
        };
      }
      return {
        id, topic, difficulty: diff,
        q: {
          en: `In a ${totalPkts}-packet transfer sent from 10.0.1.${(seq % 50) + 10} to 172.16.4.${(seq % 40) + 2}, packets #${missIdx} and #${missIdx + 1} travel via different routers. Why does the file reassemble cleanly?`,
          uz: `10.0.1.${(seq % 50) + 10} manzilidan 172.16.4.${(seq % 40) + 2} ga yuborilgan ${totalPkts} ta paketning #${missIdx} va #${missIdx + 1} qismlari turlicha marshrutlardan o‘tdi. Nima uchun fayl buzilmay yig‘iladi?`,
        },
        opts: {
          uz: [
            'Har bir paket sarlavhasida tartib raqami (masalan, 3/12) hamda jo‘natuvchi/oluvchi IP borligi uchun',
            'Chunki routerlar barcha fayllarni bitta simdan tartib bilan chiqaradi',
            'Chunki har bir paket ichida antivirus dasturi bo‘ladi',
            'Chunki TCP paketlar o‘lchamini 1 bitga tenglashtiradi',
          ],
          en: [
            'Because each packet header carries packet sequence numbering alongside Sender and Receiver IP addresses',
            'Because routers lock every intermediate path for one single user',
            'Because anti-malware utilities rewrite router paths',
            'Because UDP encrypts the physical fiber',
          ],
        },
        answer: 0,
        explain: { en: 'Packet headers hold Sender IP, Receiver IP, and Packet Number for ordered reconstruction.', uz: 'Paket sarlavhasidagi IP manzillar va tartib raqami qabul qiluvchida to‘g‘ri tartibda tiklashni ta’minlaydi.' },
      };
    }

    // 3: Data, storage and sound (pure calculation items!)
    case 3: {
      const subMode = seq % 3;
      if (subMode === 0) {
        const chars = ((seq % 15) + 4) * 50; // 200..900 ASCII characters
        const bytes = chars;
        const kb = (bytes / 1000).toFixed(2).replace(/0$/, '');
        if (bank === 'test') {
          return {
            id, topic, difficulty: diff,
            q: {
              en: `An uncompressed ASCII text file holds exactly ${chars} characters (1 byte per character). What is its size in bits and decimal kilobytes (1 KB = 1000 bytes)?`,
              uz: `Siqilmagan ASCII matn faylida ${chars} ta belgi bor (1 belgi = 1 bayt). Uning hajmi bit va o‘nlik kilobaytda (1 KB = 1000 bayt) qancha?`,
            },
            opts: {
              uz: [`${bytes * 8} bit va ${kb} KB`, `${bytes * 4} bit va ${kb} KB`, `${bytes * 8} bit va ${(bytes / 100).toFixed(1)} KB`, `${bytes} bit va ${kb} MB`],
              en: [`${bytes * 8} bits and ${kb} KB`, `${bytes * 4} bits and ${kb} KB`, `${bytes * 8} bits and ${(bytes / 100).toFixed(1)} KB`, `${bytes} bits and ${kb} MB`],
            },
            answer: 0,
            explain: { en: `${chars} bytes × 8 = ${bytes * 8} bits; ${chars} ÷ 1000 = ${kb} KB.`, uz: `${chars} × 8 = ${bytes * 8} bit; ${chars} ÷ 1000 = ${kb} KB.` },
          };
        }
        const mb = ((seq % 8) + 2) * 1.5;
        const kBytes = Math.round(mb * 1000);
        return {
          id, topic, difficulty: diff,
          q: {
            en: `Convert a storage size of ${mb} MB (using decimal SI units, 1 MB = 1000 KB) into kilobytes and bytes.`,
            uz: `O‘nlik SI tizimida (1 MB = 1000 KB) ${mb} MB hajmli fayl nechta kilobayt va nechta baytga teng?`,
          },
          opts: {
            uz: [`${kBytes.toLocaleString('en-US')} KB (${(kBytes * 1000).toLocaleString('en-US')} bayt)`, `${kBytes * 10} KB`, `${mb * 8} KB`, `${Math.round(mb * 100)} KB`],
            en: [`${kBytes.toLocaleString('en-US')} KB (${(kBytes * 1000).toLocaleString('en-US')} bytes)`, `${kBytes * 10} KB`, `${mb * 8} KB`, `${Math.round(mb * 100)} KB`],
          },
          answer: 0,
          explain: { en: `1 MB = 1,000 KB = 1,000,000 bytes, so ${mb} MB = ${kBytes.toLocaleString('en-US')} KB.`, uz: `${mb} × 1000 = ${kBytes.toLocaleString('en-US')} KB.` },
        };
      } else if (subMode === 1) {
        // Sound file size: rate * depth * duration * channels
        const rate = [8000, 10000, 16000, 20000, 40000][seq % 5];
        const depth = [8, 16][seq % 2];
        const dur = ((seq % 5) + 2) * 5; // 10..30s
        const chans = bank === 'test' ? 1 : 2;
        const bits = rate * depth * dur * chans;
        const bytes = bits / 8;
        const kb = bytes / 1000;
        return {
          id, topic, difficulty: diff,
          q: {
            en: `Calculate the uncompressed ${chans === 1 ? 'mono (1-channel)' : 'stereo (2-channel)'} audio file size in decimal KB (1 KB = 1000 B) for ${dur}s recorded at ${rate.toLocaleString('en-US')} Hz, ${depth}-bit depth.`,
            uz: `${rate.toLocaleString('en-US')} Hz chastota va ${depth}-bit chuqurlikda ${dur} soniya yozilgan ${chans === 1 ? 'mono (1 kanal)' : 'stereo (2 kanal)'} ovoz faylining o‘nlik KB (1 KB = 1000 B) hajmini toping.`,
          },
          opts: {
            uz: [`${kb.toLocaleString('en-US')} KB`, `${(kb * 8).toLocaleString('en-US')} KB`, `${(kb / 2).toLocaleString('en-US')} KB`, `${(kb + 250).toLocaleString('en-US')} KB`],
            en: [`${kb.toLocaleString('en-US')} KB`, `${(kb * 8).toLocaleString('en-US')} KB`, `${(kb / 2).toLocaleString('en-US')} KB`, `${(kb + 250).toLocaleString('en-US')} KB`],
          },
          answer: 0,
          explain: { en: `Bits = ${rate} × ${depth} × ${dur} × ${chans} = ${bits.toLocaleString('en-US')} bits = ${bytes.toLocaleString('en-US')} bytes = ${kb} KB.`, uz: `Hajm = (${rate} × ${depth} × ${dur} × ${chans}) ÷ 8 ÷ 1000 = ${kb} KB.` },
        };
      }
      // Binary <-> Decimal conversion
      const decVal = ((seq * 13) % 190) + 25;
      const binStr = decVal.toString(2).padStart(8, '0');
      if (bank === 'test') {
        return {
          id, topic, difficulty: diff,
          q: {
            en: `Convert the 8-bit unsigned binary byte ${binStr} into denary (base-10).`,
            uz: `8-bitli ${binStr} ikkilik sonini o‘nlik (denary) sanoq tizimiga o‘tkazing.`,
          },
          opts: {
            uz: [`${decVal}`, `${decVal + 4}`, `${Math.max(1, decVal - 2)}`, `${decVal + 16}`],
            en: [`${decVal}`, `${decVal + 4}`, `${Math.max(1, decVal - 2)}`, `${decVal + 16}`],
          },
          answer: 0,
          explain: { en: `Adding the active place values (128, 64, 32, 16, 8, 4, 2, 1) of ${binStr} equals ${decVal}.`, uz: `${binStr} dagi 1 turgan xona qiymatlari yig‘indisi ${decVal} ga teng.` },
        };
      }
      return {
        id, topic, difficulty: diff,
        q: {
          en: `Represent the denary integer ${decVal} as an 8-bit binary byte.`,
          uz: `O‘nlik ${decVal} butun sonini 8-bitli ikkilik (binary) kod ko‘rinishida yozing.`,
        },
        opts: {
          uz: [binStr, (decVal + 1).toString(2).padStart(8, '0'), (decVal ^ 4).toString(2).padStart(8, '0'), (decVal ^ 16).toString(2).padStart(8, '0')],
          en: [binStr, (decVal + 1).toString(2).padStart(8, '0'), (decVal ^ 4).toString(2).padStart(8, '0'), (decVal ^ 16).toString(2).padStart(8, '0')],
        },
        answer: 0,
        explain: { en: `Converting ${decVal} to powers of two produces ${binStr}.`, uz: `${decVal} soni ikkilikda ${binStr} ko‘rinishida ifodalanadi.` },
      };
    }

    // 4: Transmission errors & parity checks
    case 4: {
      const payload7 = (((seq * 23) % 90) + 18).toString(2).padStart(7, '0');
      const onesCount = payload7.split('').filter((c) => c === '1').length;
      const evenParityBit = onesCount % 2 === 0 ? '0' : '1';
      const oddParityBit = onesCount % 2 === 1 ? '0' : '1';
      if (bank === 'test') {
        return {
          id, topic, difficulty: diff,
          q: {
            en: `Even parity protocol is agreed. A 7-bit data sequence is ${payload7}. What parity bit must be added so total 1s stay EVEN?`,
            uz: `Juft paritet (Even parity) protokoli kelishilgan. 7-bitli ma’lumot ${payload7} ga teng. Jami 1 lar soni JUFT bo‘lishi uchun qanday paritet bit qo‘shiladi?`,
          },
          opts: {
            uz: [
              `Paritet bit = ${evenParityBit} (chunki dastlabki ${onesCount} ta 1 bor)`,
              `Paritet bit = ${evenParityBit === '1' ? '0' : '1'}`,
              `Ikkita qo‘shimcha 1 qo‘shiladi`,
              `Paritet bit umuman kerak emas`,
            ],
            en: [
              `Parity bit = ${evenParityBit} (data contains ${onesCount} ones)`,
              `Parity bit = ${evenParityBit === '1' ? '0' : '1'}`,
              `Add two extra 1 bits`,
              `Omit the parity bit completely`,
            ],
          },
          answer: 0,
          explain: {
            en: `${payload7} has ${onesCount} ones (${onesCount % 2 === 0 ? 'already even' : 'odd'}), so adding ${evenParityBit} gives an even total.`,
            uz: `${payload7} da ${onesCount} ta 1 bor, demak juft qilish uchun ${evenParityBit} qo‘shiladi.`,
          },
        };
      }
      return {
        id, topic, difficulty: diff,
        q: {
          en: `Odd parity protocol is used for 7-bit sequence ${payload7}. Determine the correct parity bit so total 1s become ODD.`,
          uz: `Toq paritet (Odd parity) protokolida 7-bitli ${payload7} ketma-ketligida jami 1 lar soni TOQ chiqishi uchun paritet bit necha bo‘lishi kerak?`,
        },
        opts: {
          uz: [
            `Paritet bit = ${oddParityBit} (${onesCount} ta 1 mavjud)`,
            `Paritet bit = ${oddParityBit === '1' ? '0' : '1'}`,
            `Paritet bit = 2`,
            `Hech qanday bit qo‘shilmaydi`,
          ],
          en: [
            `Parity bit = ${oddParityBit} (${onesCount} ones present)`,
            `Parity bit = ${oddParityBit === '1' ? '0' : '1'}`,
            `Parity bit = 2`,
            `No parity bit added`,
          ],
        },
        answer: 0,
        explain: { en: `Since ${payload7} has ${onesCount} ones, adding ${oddParityBit} produces an odd total count.`, uz: `${payload7} da ${onesCount} ta 1 bor; toq bo‘lishi uchun ${oddParityBit} qo‘shiladi.` },
      };
    }

    // 5: Software and utilities
    case 5: {
      const utilities: Array<[string, string, string]> = [
        ['Lossless file compression (ZIP)', 'Shrinks files using repeated pattern dictionaries without losing a single original bit', 'Deletes half the audio samples permanently'],
        ['Incremental automatic backup', 'Copies only files newly created or altered since the previous scheduled backup', 'Defragments optical SSD flash blocks daily'],
        ['Real-time anti-malware monitor', 'Scans downloads and memory processes against threat signatures and heuristics', 'Converts analog microphone audio to MP3'],
        ['System restore / snapshot manager', 'Saves clean OS settings and system states so administrators can roll back faulty updates', 'Translates Python loops into assembly language'],
        ['Disk cleanup utility', 'Safely frees SSD/HDD space by removing temporary browser caches and old installer files', 'Encrypts Wi-Fi packets at the DNS resolver'],
        ['Software update / patch utility', 'Applies security fixes and bug patches to close newly discovered vulnerabilities', 'Increases monitor physical pixel resolution'],
      ];
      const [uName, uRole, wrong] = utilities[seq % utilities.length];
      const env = ['school server', 'student laptop', 'library PC', 'design workstation', 'lab terminal', 'exam tablet'][Math.floor(seq / utilities.length) % 6];
      if (bank === 'test') {
        return {
          id, topic, difficulty: diff,
          q: {
            en: `On a ${env}, when an IT technician runs "${uName}", what exact task does this utility carry out?`,
            uz: `Texnik mutaxassis ${env} kompyuterida "${uName}" utilitasini ishga tushirganda aynan qanday vazifa bajariladi?`,
          },
          opts: {
            uz: [uRole, wrong, 'Kompyuter protsessorini yangi chipga almashtiradi', 'Barcha Ethernet kabellarini uzadi'],
            en: [uRole, wrong, 'Physically swaps the CPU silicon chip', 'Disconnects all Ethernet switches'],
          },
          answer: 0,
          explain: { en: `${uName}: ${uRole}.`, uz: `${uName}: ${uRole}.` },
        };
      }
      return {
        id, topic, difficulty: diff,
        q: {
          en: `Exam scenario (${env}): An administrator needs software that "${uRole.toLowerCase()}". Which utility should be chosen?`,
          uz: `Imtihon holati (${env}): Administratorga "${uRole}" vazifasini bajaruvchi utilita kerak. Qaysi biri tanlanadi?`,
        },
        opts: {
          uz: [uName, 'O‘yin grafik drayveri', 'ASCII matn muharriri', 'Bus terminatori'],
          en: [uName, 'Gaming GPU shader pack', 'Plain ASCII text pad', 'Bus cable terminator'],
        },
        answer: 0,
        explain: { en: `This requirement matches ${uName}.`, uz: `Bu talabga aynan ${uName} javob beradi.` },
      };
    }

    // 6: Security & authentication
    case 6: {
      const threats: Array<[string, string, string, string]> = [
        ['Phishing email', 'Fake urgent messages posing as a trusted bank or teacher to steal login credentials', 'Installing 2FA authenticator apps', 'Cooling down CPU heatsinks'],
        ['Brute-force attack', 'Automated script guessing thousands of password combinations per second until matching', 'Using a 16-character random passphrase', 'Enabling disk defragmentation'],
        ['Spyware / Keylogger', 'Covert malware recording every keystroke and sensitive screen activity silently', 'Compressing documents into ZIP', 'Setting router MAC allow-lists'],
        ['Ransomware', 'Malicious software encrypting user files and demanding payment for the decryption key', 'Backing up offline to external drives', 'Checking parity bits on frames'],
        ['Social engineering (Shoulder surfing / pretexting)', 'Manipulating human trust or peeking over shoulders to extract confidential codes', 'Encrypting data using HTTPS', 'Updating operating system patches'],
        ['Denial of Service (DoS)', 'Flooding a server with overwhelming traffic so genuine users cannot access it', 'Translating URLs via DNS', 'Cleaning browser temp cookies'],
      ];
      const [tName, tDesc, defence, wrong] = threats[seq % threats.length];
      const target = ['school portal', 'student email', 'e-library account', 'exam server', 'cloud drive', 'payroll system'][Math.floor(seq / threats.length) % 6];
      if (bank === 'test') {
        return {
          id, topic, difficulty: diff,
          q: {
            en: `Cybersecurity analysis for a ${target}: Which threat matches the description "${tDesc}"?`,
            uz: `${target} tizimi xavfsizligi: "${tDesc}" tavsifiga qaysi kiber-tahdid mos keladi?`,
          },
          opts: {
            uz: [tName, defence, wrong, 'Star topologiyasi'],
            en: [tName, defence, wrong, 'Star network topology'],
          },
          answer: 0,
          explain: { en: `${tName}: ${tDesc}.`, uz: `${tName} aynan shunday usulda xavf tug‘diradi.` },
        };
      }
      return {
        id, topic, difficulty: diff,
        q: {
          en: `Exam security audit (${target}): Identify the accurate mechanism and mitigation related to "${tName}".`,
          uz: `Imtihon xavfsizlik tekshiruvi (${target}): "${tName}" tahdidining mohiyatini aniq belgilang.`,
        },
        opts: {
          uz: [tDesc, wrong, 'Faqat fayl nomini kattalashtirish bilan butunlay yo‘qoladi', 'Monitor yorqinligini pasaytirsa bas'],
          en: [tDesc, wrong, 'Solved completely by renaming files uppercase', 'Blocked simply by dimming monitor brightness'],
        },
        answer: 0,
        explain: { en: `${tName} operates via: ${tDesc}.`, uz: `${tName} mohiyati: ${tDesc}.` },
      };
    }

    // 7: The CPU & registers
    case 7: {
      const regs: Array<[string, string, string]> = [
        ['Program Counter (PC)', 'Holds the RAM memory address of the next instruction to be fetched', 'Stores permanent read-only BIOS sound clips'],
        ['Memory Address Register (MAR)', 'Holds the specific memory location address currently being read from or written to', 'Executes floating-point division inside RAM'],
        ['Memory Data Register (MDR)', 'Temporarily holds the instruction or data word just fetched from or going to RAM', 'Generates Wi-Fi radio frequency pulses'],
        ['Current Instruction Register (CIR)', 'Stores the instruction currently being decoded and executed by the Control Unit', 'Counts empty sectors on optical DVDs'],
        ['Accumulator (ACC)', 'Stores intermediate arithmetic and logic results directly produced by the ALU', 'Translates domain names into IP addresses'],
      ];
      const [regName, role, wrong] = regs[seq % regs.length];
      const ghz = ((seq % 4) + 2 + ((seq % 3) * 0.2)).toFixed(1);
      if (bank === 'test') {
        const sub = seq % 2;
        if (sub === 0) {
          return {
            id, topic, difficulty: diff,
            q: {
              en: `Inside a ${ghz} GHz CPU executing millions of cycles/sec, what is the specific function of the ${regName}?`,
              uz: `Sekundiga milliardlab taktda ishlovchi ${ghz} GHz li protsessor ichida ${regName} registrining aniq vazifasi nima?`,
            },
            opts: {
              uz: [role, wrong, 'Tashqi USB sichqoncha harakatini o‘lchaydi', 'Tarmoq paketlariga IP manzil yozadi'],
              en: [role, wrong, 'Tracks external optical mouse movement directly', 'Assigns IP addresses to Ethernet switches'],
            },
            answer: 0,
            explain: { en: `${regName}: ${role}.`, uz: `${regName}: ${role}.` },
          };
        }
        const mhz = ((seq % 5) + 2) * 1000;
        return {
          id, topic, difficulty: diff,
          q: {
            en: `A processor has a clock speed of ${(mhz / 1000).toFixed(1)} GHz (${mhz} MHz). How many clock cycles can it complete per second?`,
            uz: `Protsessorning takt chastotasi ${(mhz / 1000).toFixed(1)} GHz (${mhz} MHz) ga teng. U bir soniyada nechta takt (sikllar) bajara oladi?`,
          },
          opts: {
            uz: [
              `${(mhz / 1000).toFixed(1)} milliard takt/sekund`,
              `${mhz} ta takt/sekund`,
              `${mhz / 10} ta takt/daqiqa`,
              `Faqat 8 ta takt/sekund`,
            ],
            en: [
              `${(mhz / 1000).toFixed(1)} billion cycles per second`,
              `${mhz} cycles per second`,
              `${mhz / 10} cycles per minute`,
              `8 cycles per second`,
            ],
          },
          answer: 0,
          explain: { en: `1 GHz = 1 billion (10⁹) Fetch-Decode-Execute clock ticks per second.`, uz: `1 GHz = sekundiga 1 milliard (10⁹) takt.` },
        };
      }
      return {
        id, topic, difficulty: diff,
        q: {
          en: `Architecture Exam (${ghz} GHz core): Identify which register or component matches "${role}".`,
          uz: `Arxitektura imtihoni (${ghz} GHz yadro): "${role}" ta’rifiga mos registrni toping.`,
        },
        opts: {
          uz: [regName, 'Qattiq disk (HDD)', 'Optik tola ulagichi', 'Sovutish radiatori'],
          en: [regName, 'Magnetic Hard Drive', 'Fiber Optic Jack', 'Aluminium Heatsink'],
        },
        answer: 0,
        explain: { en: `${regName} handles this function during Fetch-Decode-Execute.`, uz: `Bu vazifani aynan ${regName} bajaradi.` },
      };
    }

    // 8: Programming languages & boolean logic expressions
    case 8: {
      const a = seq % 2 === 0;
      const b = Math.floor(seq / 2) % 2 === 0;
      const c = Math.floor(seq / 4) % 2 === 0;
      const str = (v: boolean) => (v ? 'True' : 'False');
      if (bank === 'test') {
        const exprRes = (a && b) || !c;
        return {
          id, topic, difficulty: diff,
          q: {
            en: `Evaluate the Boolean logic expression X = (A AND B) OR (NOT C) when A=${str(a)}, B=${str(b)}, C=${str(c)} (scenario variant ${seq}).`.replace(` (scenario variant ${seq})`, `, given sensors read A:${str(a)}, B:${str(b)}, C:${str(c)}.`),
            uz: `Sensor qiymatlari A=${str(a)}, B=${str(b)}, C=${str(c)} bo‘lganda X = (A AND B) OR (NOT C) mantiqiy ifoda natijasi nima chiqadi?`,
          },
          opts: {
            uz: [
              `X = ${str(exprRes)} (NOT C = ${str(!c)}, A AND B = ${str(a && b)})`,
              `X = ${str(!exprRes)}`,
              `X = None (sintaksis xatosi)`,
              `X = ${str(a && c)}`,
            ],
            en: [
              `X = ${str(exprRes)} (since A AND B = ${str(a && b)} and NOT C = ${str(!c)})`,
              `X = ${str(!exprRes)}`,
              `Syntax Error`,
              `Both True and False simultaneously`,
            ],
          },
          answer: 0,
          explain: { en: `A AND B is ${str(a && b)}; NOT C is ${str(!c)}; OR gives ${str(exprRes)}.`, uz: `A AND B = ${str(a && b)}, NOT C = ${str(!c)}, yakuniy OR natijasi ${str(exprRes)}.` },
        };
      }
      const resExam = (a || b) && !c;
      return {
        id, topic, difficulty: diff,
        q: {
          en: `Logic gate trace: Output Y = (A OR B) AND (NOT C) given inputs A=${str(a)}, B=${str(b)}, C=${str(c)}. Find Y.`,
          uz: `Mantiqiy sxema tahlili: A=${str(a)}, B=${str(b)}, C=${str(c)} bo‘lganda Y = (A OR B) AND (NOT C) chiqish qiymatini toping.`,
        },
        opts: {
          uz: [
            `Y = ${str(resExam)} (A OR B = ${str(a || b)}, NOT C = ${str(!c)})`,
            `Y = ${str(!resExam)}`,
            `Y = 42`,
            `Natijani aniqlab bo‘lmaydi`,
          ],
          en: [
            `Y = ${str(resExam)} (because A OR B = ${str(a || b)}, NOT C = ${str(!c)})`,
            `Y = ${str(!resExam)}`,
            `Y = 2`,
            `Undefined gate state`,
          ],
        },
        answer: 0,
        explain: { en: `(A OR B) = ${str(a || b)}; (NOT C) = ${str(!c)}; AND yields ${str(resExam)}.`, uz: `(A OR B) = ${str(a || b)} va (NOT C) = ${str(!c)}, demak AND natijasi ${str(resExam)}.` },
      };
    }

    // 9: Design, AI and industry
    case 9: {
      const apps: Array<[string, string, string]> = [
        ['Autonomous lane-keeping car camera', 'Trains vision models on millions of road images to detect pedestrians, lanes, and signs', 'Replaces tires with wooden wheels automatically'],
        ['Smart email spam filter', 'Analyses word patterns and sender reputation to isolate phishing/junk mail', 'Deletes every incoming message from teachers'],
        ['RFID warehouse inventory gate', 'Reads passive or active radio tags on pallets simultaneously without line-of-sight barcode scanning', 'Manually types prices into spreadsheets one by one'],
        ['Predictive factory maintenance sensor', 'Uses ML over vibration and heat streams to spot wear before machinery breaks down', 'Waits until motors catch fire before halting production'],
        ['AI medical imaging assistant', 'Highlights subtle anomalies in X-ray or MRI scans for doctors to review faster', 'Performs surgery without any human medical oversight'],
        ['Predictive phone keyboard', 'Learns a user’s common phrasing sequences to suggest the next likely word', 'Locks all alphabetical keys every evening'],
      ];
      const [app, desc, wrong] = apps[seq % apps.length];
      const sector = ['automotive', 'logistics', 'healthcare', 'e-commerce', 'publishing', 'aviation'][Math.floor(seq / apps.length) % 6];
      if (bank === 'test') {
        return {
          id, topic, difficulty: diff,
          q: {
            en: `In the ${sector} sector, how does "${app}" utilise modern automation or Machine Learning?`,
            uz: `${sector} sohasida "${app}" zamonaviy avtomatlashtirish yoki Machine Learning dan qanday foydalanadi?`,
          },
          opts: {
            uz: [desc, wrong, 'Internet va elektr energiyasiz qo‘lda ishlaydi', 'Faqat disketlarda ma’lumot saqlaydi'],
            en: [desc, wrong, 'Operates mechanically with zero electricity or data', 'Stores all models solely on floppy disks'],
          },
          answer: 0,
          explain: { en: `${app}: ${desc}.`, uz: `${app}: ${desc}.` },
        };
      }
      return {
        id, topic, difficulty: diff,
        q: {
          en: `Industry 4.0 Exam (${sector}): Match the system that "${desc.toLowerCase()}".`,
          uz: `Industry 4.0 imtihoni (${sector}): "${desc}" ta’rifiga mos texnologiyani toping.`,
        },
        opts: {
          uz: [app, 'Oddiy mexanik yozuv mashinkasi', 'Paritet tekshiruvsiz shina kabeli', 'Qog‘oz kartoteka shkaflari'],
          en: [app, 'Manual mechanical typewriter', 'Unshielded Bus terminator', 'Paper index filing cabinet'],
        },
        answer: 0,
        explain: { en: `Correct match: ${app}.`, uz: `To‘g‘ri texnologiya: ${app}.` },
      };
    }

    // 10: Network scalability (9DC.03)
    default: {
      const usersStart = ((seq % 6) + 2) * 50;
      const usersEnd = usersStart * 4;
      const factors: Array<[string, string, string]> = [
        ['Bandwidth capacity', `Upgrading copper uplinks to fiber optics prevents video-call lag when users grow from ${usersStart} to ${usersEnd}`, 'Cutting available bandwidth in half improves 4K streaming'],
        ['Redundancy & failover paths', `Adding backup routers and dual ISP links keeps ${usersEnd} users online if one main path fails`, 'Removing all spare cables lowers latency during outages'],
        ['Subnetting & IP planning', `Dividing address space cleanly lets ${usersEnd} devices connect without IP conflicts or address exhaustion`, 'Giving every laptop the exact same static IPv4 address'],
        ['Scalable security controls', `Deploying central next-gen firewalls handles the wider attack surface across ${usersEnd} endpoints`, 'Disabling authentication saves switch memory during expansion'],
        ['Hierarchical topology', `Connecting floor switches to core distribution switches lets new departments join cleanly`, 'Chaining 500 laptops onto one single Bus cable'],
      ];
      const [fac, reason, wrong] = factors[seq % factors.length];
      if (bank === 'test') {
        return {
          id, topic, difficulty: diff,
          q: {
            en: `Scalability planning (9DC.03): An institution expands from ${usersStart} to ${usersEnd} devices. Why does "${fac}" matter?`,
            uz: `Masshtablanuvchanlik (9DC.03): Muassasadagi qurilmalar ${usersStart} tadan ${usersEnd} taga ko‘paymoqda. Bunda "${fac}" omili nega muhim?`,
          },
          opts: {
            uz: [reason, wrong, 'Qurilmalar soni ortganda barcha IP manzillar o‘chiriladi', 'Tarmoq faqat bitta kompyuter bilan ishlashga qaytadi'],
            en: [reason, wrong, 'Expanding networks must remove all routers', 'Growing from 50 to 500 devices requires zero extra bandwidth'],
          },
          answer: 0,
          explain: { en: `${fac} ensures performance and reliability as device counts scale up.`, uz: `${fac} foydalanuvchilar ortganda ham tarmoq barqarorligini saqlaydi.` },
        };
      }
      return {
        id, topic, difficulty: diff,
        q: {
          en: `9DC.03 Exam Design: For an enterprise growing from ${usersStart} to ${usersEnd} hosts where "${reason.toLowerCase()}", which scalability factor is illustrated?`,
          uz: `9DC.03 Imtihon loyihasi (${usersStart} → ${usersEnd} qurilma): "${reason}" holati qaysi masshtablanuvchanlik omilini ko‘rsatadi?`,
        },
        opts: {
          uz: [fac, 'Ovoz kvantlash xatosi', 'Monitor rang chuqurligi', 'CPU registr hajmi'],
          en: [fac, 'Audio quantization noise', 'Monitor pixel colour depth', 'CPU accumulator width'],
        },
        answer: 0,
        explain: { en: `This design decision directly addresses ${fac}.`, uz: `Bu yechim tarmoq masshtablanuvchanligining ${fac} omiliga tegishli.` },
      };
    }
  }
}

export function buildComputingTestBank(existing: QuestionItem[]): QuestionItem[] {
  const seenEn = new Set(existing.map((q) => (typeof q.q === 'string' ? q.q.trim() : q.q.en.trim())));
  const counts = new Array(COMPUTING_TOPICS.length).fill(0);
  for (const q of existing) {
    const idx = COMPUTING_TOPICS.indexOf(q.topic as (typeof COMPUTING_TOPICS)[number]);
    if (idx >= 0) counts[idx]++;
  }

  const perTopicPool: QuestionItem[][] = Array.from({ length: COMPUTING_TOPICS.length }, () => []);
  let nextId = 200;
  const makeId = () => `c_t_${nextId++}`;

  for (const c of BI_CONCEPTS) {
    perTopicPool[c.topicIdx].push({
      id: makeId(),
      topic: COMPUTING_TOPICS[c.topicIdx],
      difficulty: c.diff,
      q: c.testQ,
      opts: c.testOpts,
      answer: 0,
      explain: c.testExp,
    });
  }

  const paramCounter = new Array(COMPUTING_TOPICS.length).fill(0);
  for (let t = 0; t < COMPUTING_TOPICS.length; t++) {
    for (let j = 0; j < 40; j++) {
      perTopicPool[t].push(buildComputingParametric(t, paramCounter[t]++, 'test', makeId()));
    }
  }

  const needed = Math.max(0, 500 - existing.length);
  const out: QuestionItem[] = [];
  let guard = 0;
  const dupStrikes = new Array(COMPUTING_TOPICS.length).fill(0);
  while (out.length < needed && guard++ < 5000) {
    let bestTopic = 0;
    let minCount = Infinity;
    for (let t = 0; t < COMPUTING_TOPICS.length; t++) {
      const effective = counts[t] + (dupStrikes[t] > 30 ? 1000 : 0);
      if (effective < minCount) {
        minCount = effective;
        bestTopic = t;
      }
    }
    if (perTopicPool[bestTopic].length === 0) {
      const seq = paramCounter[bestTopic]++;
      const gen = buildComputingParametric(bestTopic, seq, 'test', makeId());
      if (dupStrikes[bestTopic] > 5) {
        const tag = `Case #${seq + 1}`;
        gen.q =
          typeof gen.q === 'string'
            ? `[${tag}] ${gen.q}`
            : { en: `[${tag}] ${gen.q.en}`, uz: `[${tag}] ${gen.q.uz}` };
      }
      perTopicPool[bestTopic].push(gen);
    }
    const cand = perTopicPool[bestTopic].shift()!;
    const stem = (typeof cand.q === 'string' ? cand.q : cand.q.en).trim();
    if (seenEn.has(stem)) {
      dupStrikes[bestTopic]++;
      continue;
    }
    dupStrikes[bestTopic] = 0;
    seenEn.add(stem);
    counts[bestTopic]++;
    out.push(cand);
  }
  return out;
}

export function buildComputingExamBank(testBank: QuestionItem[]): QuestionItem[] {
  const seenEn = new Set(testBank.map((q) => (typeof q.q === 'string' ? q.q.trim() : q.q.en.trim())));
  const counts = new Array(COMPUTING_TOPICS.length).fill(0);
  const perTopicPool: QuestionItem[][] = Array.from({ length: COMPUTING_TOPICS.length }, () => []);
  let nextId = 1;
  const makeId = () => `c_e_${nextId++}`;

  for (const c of BI_CONCEPTS) {
    perTopicPool[c.topicIdx].push({
      id: makeId(),
      topic: COMPUTING_TOPICS[c.topicIdx],
      difficulty: c.diff,
      q: c.examQ,
      opts: c.examOpts,
      answer: 0,
      explain: c.examExp,
    });
  }

  const paramCounter = new Array(COMPUTING_TOPICS.length).fill(0);
  for (let t = 0; t < COMPUTING_TOPICS.length; t++) {
    for (let j = 0; j < 48; j++) {
      perTopicPool[t].push(buildComputingParametric(t, paramCounter[t]++, 'exam', makeId()));
    }
  }

  const out: QuestionItem[] = [];
  let guard = 0;
  const dupStrikes = new Array(COMPUTING_TOPICS.length).fill(0);
  while (out.length < 500 && guard++ < 5000) {
    let bestTopic = 0;
    let minCount = Infinity;
    for (let t = 0; t < COMPUTING_TOPICS.length; t++) {
      const effective = counts[t] + (dupStrikes[t] > 30 ? 1000 : 0);
      if (effective < minCount) {
        minCount = effective;
        bestTopic = t;
      }
    }
    if (perTopicPool[bestTopic].length === 0) {
      const seq = paramCounter[bestTopic]++;
      const gen = buildComputingParametric(bestTopic, seq, 'exam', makeId());
      if (dupStrikes[bestTopic] > 5) {
        const tag = `Exam Case #${seq + 1}`;
        gen.q =
          typeof gen.q === 'string'
            ? `[${tag}] ${gen.q}`
            : { en: `[${tag}] ${gen.q.en}`, uz: `[${tag}] ${gen.q.uz}` };
      }
      perTopicPool[bestTopic].push(gen);
    }
    const cand = perTopicPool[bestTopic].shift()!;
    const stem = (typeof cand.q === 'string' ? cand.q : cand.q.en).trim();
    if (seenEn.has(stem)) {
      dupStrikes[bestTopic]++;
      continue;
    }
    dupStrikes[bestTopic] = 0;
    seenEn.add(stem);
    counts[bestTopic]++;
    out.push(cand);
  }
  return out;
}
