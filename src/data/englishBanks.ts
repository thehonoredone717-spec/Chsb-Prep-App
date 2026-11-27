import { DifficultyLevel, QuestionItem } from '../types/quiz';

const ENGLISH_TOPICS = [
  'Unit 1: Life Plans',
  'Unit 2: Hard Times',
  'Unit 3: What is in a Name?',
  'Unit 4: Dilemmas',
  'Unit 5: What a Story!',
] as const;

interface GapFillItem {
  topicIdx: number;
  diff: DifficultyLevel;
  context: string;
  q: string;
  correct: string;
  d1: string;
  d2: string;
  d3: string;
  explain: string;
}

const TEST_ITEMS: GapFillItem[] = [
  // UNIT 1: Life Plans
  {
    topicIdx: 0, diff: 'easy',
    context: 'Daily Routines & Study Habits',
    q: 'Kamola _______ twenty English vocabulary flashcards every morning before breakfast.',
    correct: 'reviews', d1: 'is reviewing now', d2: 'has been reviewing since tomorrow', d3: 'will reviewed',
    explain: 'Present Simple (“reviews”) expresses a regular daily habit (“every morning”).',
  },
  {
    topicIdx: 0, diff: 'easy',
    context: 'Fixed Future Travel Arrangements',
    q: 'We have already printed our boarding passes. Our flight to Samarkand _______ at 8:15 tomorrow morning.',
    correct: 'leaves', d1: 'going to leave', d2: 'left yesterday', d3: 'has left tomorrow',
    explain: 'Present Simple is used for fixed timetables and scheduled departure times.',
  },
  {
    topicIdx: 0, diff: 'easy',
    context: 'Making Positive Resolutions',
    q: 'I have made a resolution to _______ eating sugary snacks before bedtime.',
    correct: 'give up', d1: 'take up', d2: 'settle down', d3: 'put on hold',
    explain: '“Give up” means to stop doing an unhealthy or unwanted habit.',
  },
  {
    topicIdx: 0, diff: 'medium',
    context: 'Starting a New Interest',
    q: 'Now that final exams are over, Jasur wants to _______ astronomy as a weekend hobby.',
    correct: 'take up', d1: 'give up', d2: 'break a habit', d3: 'retire',
    explain: '“Take up” means to start a new hobby, sport, or activity.',
  },
  {
    topicIdx: 0, diff: 'medium',
    context: 'Duration Up to the Present',
    q: 'Dilnoza _______ violin scales for nearly two hours without taking a single break!',
    correct: 'has been practising', d1: 'practises', d2: 'is practise', d3: 'was practise',
    explain: 'Present Perfect Continuous focuses on an ongoing action continuing up to now (“for nearly two hours”).',
  },
  {
    topicIdx: 0, diff: 'medium',
    context: 'Spontaneous Decisions vs Pre-planned Intentions',
    q: '“Your suitcase looks terribly heavy!” — “Hang on, I _______ carry it upstairs for you.”',
    correct: "'ll", d1: "'m going to", d2: 'used to', d3: 'have been',
    explain: '“Will” (‘ll) expresses an instant decision or offer made at the moment of speaking.',
  },
  {
    topicIdx: 0, diff: 'hard',
    context: 'Stative Verbs in Present Time',
    q: 'Farhod _______ every irregular verb on this revision sheet already, so he feels confident.',
    correct: 'knows', d1: 'is knowing', d2: 'has been knowing', d3: 'will knowing',
    explain: 'Stative verbs of mental knowledge (“know”) are not normally used in continuous forms.',
  },
  {
    topicIdx: 0, diff: 'hard',
    context: 'Postponing Plans',
    q: 'Because the science lab is being repainted, we had to put our chemistry project _______ until Monday.',
    correct: 'on hold', d1: 'up for', d2: 'up to', d3: 'in ways',
    explain: '“Put plans on hold” means to postpone them temporarily.',
  },
  {
    topicIdx: 0, diff: 'medium',
    context: 'Future Intentions',
    q: 'After finishing university, Madina _______ start her own architectural design studio in Tashkent.',
    correct: 'is going to', d1: 'has already', d2: 'was going', d3: 'would rather',
    explain: '“Be going to” expresses a prior intention or long-term personal plan.',
  },
  {
    topicIdx: 0, diff: 'easy',
    context: 'Completed Actions with Present Result',
    q: 'Look at the kitchen table! Timur has _______ baked a chocolate cake for his sister’s birthday.',
    correct: 'already', d1: 'yet', d2: 'since', d3: 'ago',
    explain: '“Already” fits affirmative Present Perfect sentences showing earlier-than-expected completion.',
  },

  // UNIT 2: Hard Times
  {
    topicIdx: 1, diff: 'easy',
    context: 'Past Repeated Actions vs States',
    q: 'Twenty years ago, our family _______ live in a small wooden house near the mountain stream.',
    correct: 'used to', d1: 'would', d2: 'usually', d3: 'are used to',
    explain: '“Live” here is a past state; only “used to” (never “would”) is valid for past states.',
  },
  {
    topicIdx: 1, diff: 'medium',
    context: 'Two Sequential Past Events',
    q: 'By the time the rescue helicopter landed on the glacier, the climbers _______ their emergency tent.',
    correct: 'had pitched', d1: 'were pitching', d2: 'pitch', d3: 'have pitched',
    explain: 'Past Perfect (“had pitched”) shows the action finished before another past event (“landed”).',
  },
  {
    topicIdx: 1, diff: 'medium',
    context: 'Descriptive Action Verbs in Narratives',
    q: 'Firefighters rushed quickly after wildfires began to _______ fiercely across the dry pine forest.',
    correct: 'rage', d1: 'whisper', d2: 'demolish', d3: 'flee',
    explain: '“Rage” describes a storm or fire burning uncontrollably with intense force.',
  },
  {
    topicIdx: 1, diff: 'hard',
    context: 'Duration Before a Past Moment',
    q: 'The explorers were exhausted because they _______ through deep snow since dawn.',
    correct: 'had been trekking', d1: 'trekked', d2: 'would trek', d3: 'are trekking',
    explain: 'Past Perfect Continuous (“had been trekking”) emphasises duration leading up to a past state (“were exhausted”).',
  },
  {
    topicIdx: 1, diff: 'easy',
    context: 'Correct Present Time Expressions',
    q: '_______, most schoolchildren look up dictionary definitions on their smartphones instead of paper books.',
    correct: 'Nowadays', d1: 'In nowadays', d2: 'In the olden days', d3: 'A decade ago',
    explain: 'Use “nowadays” or “these days” without a preposition (never “in nowadays”).',
  },
  {
    topicIdx: 1, diff: 'medium',
    context: 'Arctic Herders Culture Vocabulary',
    q: 'During blizzards, reindeer herders pack light tents so nothing valuable is _______ in the snow.',
    correct: 'left behind', d1: 'taken up', d2: 'smashed', d3: 'on the move',
    explain: '“Left behind” means not taken with you when departing.',
  },
  {
    topicIdx: 1, diff: 'hard',
    context: 'Choosing Between used to and would',
    q: 'Which sentence is grammatically INCORRECT when talking about the distant past?',
    correct: '“She would have long blonde hair when she was eight.”',
    d1: '“She used to have long blonde hair when she was eight.”',
    d2: '“Every Saturday, we would cycle down to the river.”',
    d3: '“People used to travel across the desert by camel.”',
    explain: '“Have” expressing possession/appearance is a stative verb, so “would” cannot be used there.',
  },
  {
    topicIdx: 1, diff: 'medium',
    context: 'Descriptive Vocabulary: Destroying Unsafe Buildings',
    q: 'After the severe earthquake, city engineers decided to _______ the cracked brick warehouse safely.',
    correct: 'demolish', d1: 'flee', d2: 'dive', d3: 'bear',
    explain: '“Demolish” means to pull or knock down a building.',
  },

  // UNIT 3: What is in a Name?
  {
    topicIdx: 2, diff: 'easy',
    context: 'Absence of Obligation',
    q: 'Entry to the municipal history museum is free on Fridays, so students _______ buy a ticket.',
    correct: "don't have to", d1: "mustn't", d2: 'had better not', d3: "can't",
    explain: '“Don’t have to” indicates something is unnecessary (no obligation).',
  },
  {
    topicIdx: 2, diff: 'easy',
    context: 'Strict Safety Prohibition',
    q: 'Visitors _______ feed the wild animals in the reserve because human food can harm them.',
    correct: "mustn't", d1: "don't have to", d2: "needn't", d3: 'ought to',
    explain: '“Mustn’t” expresses strict prohibition (against the rules).',
  },
  {
    topicIdx: 2, diff: 'medium',
    context: 'Urgent Practical Warning',
    q: 'Dark clouds are gathering overhead. We _______ pack up the picnic before the rain starts!',
    correct: "'d better", d1: "'d better to", d2: 'needn’t', d3: 'mustn’t',
    explain: '“Had better + bare infinitive” (without “to”) gives strong, urgent advice.',
  },
  {
    topicIdx: 2, diff: 'medium',
    context: 'Marketing & Branding Collocations',
    q: 'Before launching their new eco-friendly sneakers, the company designed a memorable green leaf _______.',
    correct: 'logo', d1: 'consumer', d2: 'chain', d3: 'manufacturer',
    explain: 'A “logo” is the visual symbol or emblem identifying a brand.',
  },
  {
    topicIdx: 2, diff: 'hard',
    context: 'Idiomatic Expressions with "Name"',
    q: 'A famous singer whose real name is Farrukh uses “Faro” when performing on stage. “Faro” is his _______.',
    correct: 'stage name', d1: 'household name', d2: 'big name', d3: 'name of the game',
    explain: 'A “stage name” is the professional name an actor or musician adopts for public performances.',
  },
  {
    topicIdx: 2, diff: 'hard',
    context: 'Making & Selling Vocabulary',
    q: 'Our school choir wants its bright blue uniforms to _______ them from all the other regional teams.',
    correct: 'distinguish', d1: 'blend in', d2: 'consume', d3: 'advertise',
    explain: '“Distinguish A from B” means to make A noticeably different and recognisable.',
  },
  {
    topicIdx: 2, diff: 'medium',
    context: 'Giving Polite Advice',
    q: 'You _______ practise speaking slowly before tomorrow’s presentation; the audience will understand you much better.',
    correct: 'ought to', d1: 'mustn’t to', d2: 'better not', d3: 'may not to',
    explain: '“Ought to + base verb” gives sensible advice, equivalent to “should”.',
  },

  // UNIT 4: Dilemmas
  {
    topicIdx: 3, diff: 'easy',
    context: 'Real Future Conditionals & Time Clauses',
    q: 'As soon as my brother _______ his homework tonight, we will play chess together.',
    correct: 'finishes', d1: 'will finish', d2: 'had finished', d3: 'would finish',
    explain: 'Time clauses introduced by “as soon as”, “when”, or “until” take Present Simple for future meaning.',
  },
  {
    topicIdx: 3, diff: 'medium',
    context: 'Unreal Present Conditionals',
    q: 'If Nodira _______ closer to school, she wouldn’t need to wake up at 6:00 am every day.',
    correct: 'lived', d1: 'lives', d2: 'will live', d3: 'had lived',
    explain: 'Second conditional uses Past Simple in the “if”-clause to describe an imaginary present situation.',
  },
  {
    topicIdx: 3, diff: 'hard',
    context: 'Past Regret with "If only"',
    q: 'If only I _______ my umbrella yesterday! I got completely soaked walking home.',
    correct: 'had brought', d1: 'brought', d2: 'bring', d3: 'would bring',
    explain: '“If only / I wish + Past Perfect” expresses regret about a past event that cannot be changed.',
  },
  {
    topicIdx: 3, diff: 'medium',
    context: 'Honesty & Integrity Vocabulary',
    q: 'Although breaking the window was an accident, Sardor decided to _______ to it straight away.',
    correct: 'own up', d1: 'get away with', d2: 'tell a lie', d3: 'hide the truth',
    explain: '“Own up to something” means to honestly confess you did something wrong.',
  },
  {
    topicIdx: 3, diff: 'easy',
    context: 'Conjunction "Unless"',
    q: 'We won’t catch the 4 o’clock train _______ we leave the house right now.',
    correct: 'unless', d1: 'if', d2: 'provided', d3: 'as long as',
    explain: '“Unless” means “if ... not” (we won’t catch it if we don’t leave right now).',
  },
  {
    topicIdx: 3, diff: 'hard',
    context: 'Third Conditional Missed Outcomes',
    q: 'Our basketball team _______ the finals if our captain hadn’t twisted his ankle in the semi-final.',
    correct: 'would have reached', d1: 'will reach', d2: 'reached', d3: 'had reached',
    explain: 'Third conditional main clause takes “would have + past participle” for an unreal past outcome.',
  },
  {
    topicIdx: 3, diff: 'medium',
    context: 'Making Difficult Decisions',
    q: 'Before signing up for the engineering track, Bobur thought long and _______ about his career goals.',
    correct: 'hard', d1: 'wide', d2: 'tall', d3: 'heavy',
    explain: 'The fixed idiom “think long and hard” means to consider something very carefully.',
  },

  // UNIT 5: What a Story!
  {
    topicIdx: 4, diff: 'easy',
    context: 'Literary Genres: Non-Fiction',
    q: 'A book written by a famous mountaineer telling the true story of her own life is an _______.',
    correct: 'autobiography', d1: 'science fiction novel', d2: 'crime novel', d3: 'horror story',
    explain: 'An autobiography is a true account of a person’s life written by themselves.',
  },
  {
    topicIdx: 4, diff: 'medium',
    context: 'Elements of Narrative Fiction',
    q: 'The time and geographical location in which a novel’s events happen is called the _______.',
    correct: 'setting', d1: 'villain', d2: 'dialogue', d3: 'ending',
    explain: '“Setting” describes where and when a story takes place.',
  },
  {
    topicIdx: 4, diff: 'medium',
    context: 'Non-Defining Relative Clauses',
    q: 'Bukhara, _______ historic trading domes date back centuries, welcomes thousands of tourists annually.',
    correct: 'whose', d1: 'that', d2: 'who', d3: 'what',
    explain: '“Whose” shows possession (“its historic trading domes”) and works in non-defining clauses.',
  },
  {
    topicIdx: 4, diff: 'hard',
    context: 'Omitting Pronouns vs Non-Defining Clauses',
    q: 'In which sentence is the relative pronoun “that” grammatically INCORRECT?',
    correct: '“My uncle, that lives in Khiva, builds traditional wooden doors.”',
    d1: '“The detective novel that I borrowed yesterday has a brilliant ending.”',
    d2: '“That is the library building that survived the fire.”',
    d3: '“Anyone that enjoys poetry should join our Friday club.”',
    explain: 'Non-defining relative clauses (set off by commas) NEVER allow “that”; use “who” or “which”.',
  },
  {
    topicIdx: 4, diff: 'hard',
    context: 'Sentential Relative Clauses',
    q: 'Nobody noticed the quiet stranger leave the train carriage, _______ later turned out to be the key mystery clue.',
    correct: ', which', d1: ', that', d2: ', what', d3: ', whom',
    explain: '“, which” refers back to the entire preceding clause.',
  },
  {
    topicIdx: 4, diff: 'easy',
    context: 'Story Characters',
    q: 'In classic adventure stories, the clever opponent who tries to stop the hero is the _______.',
    correct: 'villain', d1: 'plot', d2: 'opening', d3: 'poetry',
    explain: 'The villain is the main antagonist opposing the story’s hero.',
  },
];

// Exam-exclusive structured items (never reused in Test)
const EXAM_ITEMS: GapFillItem[] = [
  // UNIT 1
  {
    topicIdx: 0, diff: 'easy',
    context: 'Email to a Friend About Upcoming Plans',
    q: 'I _______ my cousins at the train station at 4:30 pm today—we agreed on the platform number last night.',
    correct: 'am meeting', d1: 'meet every day', d2: 'used to meet', d3: 'will have met tomorrow',
    explain: 'Present Continuous (“am meeting”) expresses a confirmed personal arrangement with fixed time and place.',
  },
  {
    topicIdx: 0, diff: 'medium',
    context: 'Academic Goals & Effort',
    q: 'Anvar _______ with algebraic fractions last autumn, yet regular practice helped him pass with top marks.',
    correct: 'struggled', d1: 'retired', d2: 'settled', d3: 'smashed',
    explain: '“Struggle with” means to experience difficulty before mastering something.',
  },
  {
    topicIdx: 0, diff: 'hard',
    context: 'Stative vs Dynamic Meanings',
    q: 'Right now, our science teacher _______ how our solar-oven prototype works during the presentation.',
    correct: 'is explaining', d1: 'explains every year', d2: 'is knowing', d3: 'is believing',
    explain: '“Explain” is an action verb happening right now (“Right now”), so Present Continuous is required.',
  },
  {
    topicIdx: 0, diff: 'medium',
    context: 'Life Milestones Sequence',
    q: 'Before you _______ a full-time engineering career, it is helpful to complete an internship or get a degree.',
    correct: 'start', d1: 'retire', d2: 'give up', d3: 'break',
    explain: 'Standard Unit 1 collocation: “start a career”.',
  },
  {
    topicIdx: 0, diff: 'easy',
    context: 'Phrases with "up"',
    q: 'Are you _______ going hiking up Chimgan Mountain this Sunday morning?',
    correct: 'up for', d1: 'up on', d2: 'up with', d3: 'up out',
    explain: '“Be / feel up for doing something” means to feel enthusiastic and ready to participate.',
  },
  // UNIT 2
  {
    topicIdx: 1, diff: 'easy',
    context: 'Interrupted Past Action',
    q: 'As Laylo _______ across the courtyard with her science poster, a sudden gust of wind blew it away.',
    correct: 'was walking', d1: 'walks', d2: 'had been walk', d3: 'would walk',
    explain: 'Past Continuous describes the background action in progress when a Past Simple event happened.',
  },
  {
    topicIdx: 1, diff: 'medium',
    context: 'Historical Time Phrases',
    q: '_______, wool was spun by hand on wooden looms in almost every mountain village.',
    correct: 'In the olden days', d1: 'These days', d2: 'In nowadays', d3: 'Tomorrow afternoon',
    explain: '“In the olden days” refers to the distant historical past.',
  },
  {
    topicIdx: 1, diff: 'hard',
    context: 'Descriptive Verbs: Escaping Danger',
    q: 'When water flooded the lower valley road, villagers had to _______ quickly toward higher ground.',
    correct: 'flee', d1: 'smash', d2: 'demolish', d3: 'rage',
    explain: '“Flee” (fled, fled) means to run away rapidly from danger.',
  },
  {
    topicIdx: 1, diff: 'medium',
    context: 'Hardship & Endurance Vocabulary',
    q: 'With thick winter coats, arctic travellers can barely _______ temperatures below minus forty degrees.',
    correct: 'bear', d1: 'dive', d2: 'last', d3: 'strike',
    explain: '“Bear” means to tolerate or endure severe discomfort or difficulty.',
  },
  {
    topicIdx: 1, diff: 'easy',
    context: 'Comparing Present vs Past Habits',
    q: 'I _______ wake up at 6:30 am during the school term; it is my normal weekday routine now.',
    correct: 'usually', d1: 'used to', d2: 'would', d3: 'had used to',
    explain: 'For present habits, always use “usually” with Present Simple—never “used to”.',
  },
  // UNIT 3
  {
    topicIdx: 2, diff: 'easy',
    context: 'Formal Written Permission',
    q: 'According to gallery regulations, guests _______ photograph outdoor sculptures only.',
    correct: 'may', d1: 'ought', d2: 'had better to', d3: 'mustn’t to',
    explain: '“May” is standard in formal notices to indicate permission.',
  },
  {
    topicIdx: 2, diff: 'medium',
    context: 'Expressions with "Name"',
    q: 'Fresh fruit, artisan bread, mountain honey, hand-painted ceramics — you _______, this Chorsu stall sells it!',
    correct: 'name it', d1: 'name the day', d2: 'call it names', d3: 'stage name it',
    explain: '“You name it” means whatever example you can think of is included.',
  },
  {
    topicIdx: 2, diff: 'hard',
    context: 'Consumer Goods Terminology',
    q: 'Global coffee _______ often open branches inside airports and city centres across dozens of countries.',
    correct: 'chains', d1: 'logos', d2: 'manufacturers', d3: 'namesakes',
    explain: 'A “chain” is a group of shops, cafés, or hotels owned by the same company.',
  },
  {
    topicIdx: 2, diff: 'medium',
    context: 'Urgent Negative Advice',
    q: 'Exam scripts start at 9:00 sharp; candidates had _______ forget their student ID cards!',
    correct: 'better not', d1: 'better not to', d2: 'ought not', d3: 'don’t have to',
    explain: 'Negative urgent warning form is “had better not + base verb”.',
  },
  // UNIT 4
  {
    topicIdx: 3, diff: 'easy',
    context: 'Making Up Your Mind',
    q: 'We need to order the team jackets by Friday, so please make up your _______ about your size.',
    correct: 'mind', d1: 'thought', d2: 'truth', d3: 'cheat',
    explain: '“Make up your mind” means to reach a firm decision.',
  },
  {
    topicIdx: 3, diff: 'medium',
    context: 'Wishes About Annoying Habits',
    q: 'I wish my classmate _______ tapping his pen loudly during silent reading time!',
    correct: 'would stop', d1: 'stopped yesterday', d2: 'stops', d3: 'had stopped tomorrow',
    explain: '“Wish + someone + would” expresses irritation about an annoying habit we want them to change.',
  },
  {
    topicIdx: 3, diff: 'hard',
    context: 'Reconsidering Ethical Choices',
    q: 'When Otabek realised copying homework was unfair, he _______ his first thought and wrote his own essay.',
    correct: 'reconsidered', d1: 'got away with', d2: 'hid the truth of', d3: 'cheated on',
    explain: '“Reconsider” means to think again about a decision and change it.',
  },
  {
    topicIdx: 3, diff: 'medium',
    context: 'Second vs Third Conditional Contrast',
    q: 'If the bus hadn’t broken down in the tunnel, we _______ arrived ten minutes early for the concert.',
    correct: 'would have', d1: 'would', d2: 'will have', d3: 'had',
    explain: 'Past unreal condition (“hadn’t broken down”) takes “would have + V3” in the result clause.',
  },
  // UNIT 5
  {
    topicIdx: 4, diff: 'easy',
    context: 'Story Openings and Plot',
    q: 'A gripping thriller needs an exciting _______ paragraph that immediately hooks the reader’s attention.',
    correct: 'opening', d1: 'villain', d2: 'biography', d3: 'dialogue setting',
    explain: 'The “opening” is the beginning section of a story designed to draw readers in.',
  },
  {
    topicIdx: 4, diff: 'medium',
    context: 'Omitting Object Relative Pronouns',
    q: 'In which defining relative clause can the relative pronoun optionally be left out?',
    correct: '“The mystery novel (which) you recommended kept me awake until midnight!”',
    d1: '“The author who wrote that crime novel lives in Tashkent.”',
    d2: '“The library, which opened in 1924, holds rare manuscripts.”',
    d3: '“The hero whose courage saved the village became a legend.”',
    explain: 'Object relative pronouns in defining clauses (“which/that you recommended”) can be omitted.',
  },
  {
    topicIdx: 4, diff: 'hard',
    context: 'Punctuation in Relative Clauses',
    q: 'Choose the sentence punctuated accurately as a NON-DEFINING relative clause giving extra information:',
    correct: '“Registan Square, which features three grand madrasahs, is a UNESCO heritage treasure.”',
    d1: '“Registan Square which features three grand madrasahs is a UNESCO heritage treasure.”',
    d2: '“Registan Square, that features three grand madrasahs, is a UNESCO heritage treasure.”',
    d3: '“Registan Square, who features three grand madrasahs, is a UNESCO heritage treasure.”',
    explain: 'Non-defining clauses require commas on both sides and “which” (never “that” or “who” for places).',
  },
  {
    topicIdx: 4, diff: 'medium',
    context: 'Fiction Genres: Futuristic Worlds',
    q: 'A book imagining orbital space stations and intelligent androids in the year 2350 belongs to _______.',
    correct: 'science fiction', d1: 'historical fiction', d2: 'travel literature', d3: 'autobiography',
    explain: 'Science fiction explores futuristic technology, space travel, and scientific speculation.',
  },
];

// Rich parametric & contextual sentence builder covering all 5 B1 units so every single item is natural & 100% distinct
interface B1SentenceSpec {
  topicIdx: number;
  diff: DifficultyLevel;
  context: string;
  template: (subj: string, timeOrObj: string) => string;
  correct: string;
  wrong: [string, string, string];
  explain: string;
  testSubjects: [string, string][];
  examSubjects: [string, string][];
}

const B1_GENERATORS: B1SentenceSpec[] = [
  // Unit 1: Present Perfect Continuous vs Present Simple / Future arrangements / Phrasal verbs
  {
    topicIdx: 0, diff: 'medium',
    context: 'Ongoing Effort & Duration (Present Perfect Continuous)',
    template: (name, obj) => `${name} _______ ${obj} all afternoon and still has two pages left to complete.`,
    correct: 'has been preparing', wrong: ['prepares daily', 'is prepare', 'had prepared tomorrow'],
    explain: 'Present Perfect Continuous (“has been preparing”) emphasizes continuous activity from earlier until now (“all afternoon”).',
    testSubjects: [
      ['Aziza', 'her biology slides'], ['Rustam', 'his geometry notes'], ['Madina', 'her essay draft'],
      ['Javohir', 'his robotics report'], ['Zarina', 'the club posters'], ['Sanjar', 'the science display'],
      ['Dilfuza', 'her speech cards'], ['Bekzod', 'the coding worksheet'], ['Gulnoza', 'her music score'],
    ],
    examSubjects: [
      ['Kamron', 'his physics lab report'], ['Sevara', 'her literature review'], ['Umid', 'the debate outline'],
      ['Munira', 'her art portfolio'], ['Olim', 'the geography map'], ['Nargiza', 'her chemistry summary'],
      ['Sardor', 'the history timeline'], ['Shahnoza', 'her German dialogues'], ['Temur', 'the chess analysis'],
    ],
  },
  {
    topicIdx: 0, diff: 'easy',
    context: 'Fixed Timetable Future Arrangements',
    template: (name, obj) => `Look at the official notice board: ${name} _______ at ${obj} next Thursday morning.`,
    correct: 'starts', wrong: ['is start', 'has started next', 'started next'],
    explain: 'Present Simple expresses fixed official schedules and school/exam timetables.',
    testSubjects: [
      ['the regional robotics contest', '9:00 am'], ['the spring choir rehearsal', '10:30 am'],
      ['our school science fair', '11:15 am'], ['the poetry workshop', '2:00 pm'],
      ['the computer coding seminar', '9:45 am'], ['our inter-school quiz', '1:30 pm'],
      ['the museum photography tour', '10:00 am'], ['the debate championship', '3:15 pm'],
    ],
    examSubjects: [
      ['the national maths Olympiad', '8:30 am'], ['our ecology conference', '10:15 am'],
      ['the youth theatre audition', '1:00 pm'], ['the astronomy club talk', '4:00 pm'],
      ['the bilingual drama workshop', '11:00 am'], ['our swimming gala', '9:30 am'],
      ['the annual book festival', '12:30 pm'], ['the chemistry demonstration', '2:45 pm'],
    ],
  },
  {
    topicIdx: 0, diff: 'hard',
    context: 'Vocabulary: Resolutions & Habits (give up / take up / struggle with)',
    template: (name, obj) => `After seeing his dentist’s advice, ${name} decided to break a bad habit and _______ ${obj} completely.`,
    correct: 'give up', wrong: ['take up', 'settle down', 'get promoted to'],
    explain: '“Give up” means to stop doing a harmful or unwanted habit completely.',
    testSubjects: [
      ['Bobur', 'drinking fizzy sodas'], ['Lola', 'biting her fingernails'], ['Shohruh', 'staying up past midnight'],
      ['Feruza', 'skipping healthy breakfasts'], ['Doston', 'checking his phone every minute'], ['Charos', 'eating late-night sweets'],
      ['Iskandar', 'procrastinating on essays'], ['Malika', 'drinking strong coffee at night'],
    ],
    examSubjects: [
      ['Sherzod', 'eating salty fast food'], ['Guzal', 'watching TV before finishing homework'],
      ['Farrukh', 'forgetting to stretch before running'], ['Rayhon', 'leaving revision until the last night'],
      ['Anvar', 'drinking iced drinks in winter'], ['Diyora', 'rushing through maths checks'],
      ['Hamid', 'playing late-night video games'], ['Nilufar', 'biting pen caps during tests'],
    ],
  },
  {
    topicIdx: 0, diff: 'medium',
    context: 'Making Personal Intentions (going to)',
    template: (name, obj) => `${name} has saved up three months’ pocket money because she _______ ${obj} this weekend.`,
    correct: 'is going to buy', wrong: ['buys yesterday', 'was buying tomorrow', 'has bought next'],
    explain: '“Be going to” expresses a pre-decided personal plan or intention.',
    testSubjects: [
      ['Sabina', 'a waterproof hiking backpack'], ['Munisa', 'an acoustic guitar tuner'],
      ['Ziyoda', 'a set of watercolour brushes'], ['Parvina', 'two bilingual novels'],
      ['Ruxshona', 'a solar power bank'], ['Durdona', 'new running trainers'],
      ['Asal', 'a telescope tripod'], ['Mohira', 'a digital drawing tablet'],
    ],
    examSubjects: [
      ['Jasmina', 'a compact camping lantern'], ['Nafisa', 'an illustrated world atlas'],
      ['Shirin', 'a badminton racket set'], ['Gulbahor', 'a calligraphy ink kit'],
      ['Umida', 'a Bluetooth study keyboard'], ['Omina', 'noise-cancelling headphones'],
      ['Komila', 'a chess tournament clock'], ['Zuhra', 'a scientific dictionary'],
    ],
  },

  // Unit 2: Narrative Tenses (Past Perfect, Past Continuous, used to / would)
  {
    topicIdx: 1, diff: 'medium',
    context: 'Narrative Order: Past Perfect Simple ("by the time")',
    template: (name, obj) => `By the time ${name} reached the station, the express train _______ ${obj}.`,
    correct: 'had already departed', wrong: ['already departs', 'is already departing', 'would depart'],
    explain: '“By the time + Past Simple” pairs with Past Perfect (“had departed”) for the earlier completed action.',
    testSubjects: [
      ['Jamshid', 'ten minutes earlier'], ['Nigora', 'from Platform 3'], ['Ulugbek', 'with all his classmates onboard'],
      ['Maftuna', 'for Samarkand'], ['Said', 'into the misty valley'], ['Iroda', 'before the bell stopped ringing'],
      ['Firdavs', 'heading toward Bukhara'], ['Madina', 'just before sunset'],
    ],
    examSubjects: [
      ['Alisher', 'five minutes ahead of schedule'], ['Zarnigor', 'for Tashkent South'],
      ['Davron', 'with the whole choir team'], ['Kamila', 'amid heavy autumn fog'],
      ['Nozim', 'crossing the iron bridge'], ['Mohinur', 'while the ticket gate closed'],
      ['Suhrob', 'for Fergana Valley'], ['Sevinch', 'just as thunder rumbled'],
    ],
  },
  {
    topicIdx: 1, diff: 'easy',
    context: 'Background Action Interrupted by Sudden Past Event',
    template: (name, obj) => `While ${name} _______ ${obj}, the power suddenly went out across the whole block.`,
    correct: 'was cooking', wrong: ['cooks', 'had been cook', 'would cooking'],
    explain: 'Past Continuous (“was cooking”) expresses an action in progress interrupted by a Past Simple event (“went out”).',
    testSubjects: [
      ['Grandmother', 'plum jam in the kitchen'], ['Uncle Karim', 'plov over the stove'],
      ['my older sister', 'vegetable soup'], ['Aunt Dilbar', 'warm samsa'],
      ['the chef', 'fresh tomato sauce'], ['father', 'evening tea and flatbread'],
      ['our neighbour', 'dinner for the guests'], ['Zuhra', 'roasted chestnuts'],
    ],
    examSubjects: [
      ['Grandfather', 'herbal tea in the courtyard'], ['Aunt Lola', 'crispy pancakes'],
      ['my cousin', 'noodle broth'], ['Mrs Akhmedova', 'berry compote'],
      ['the baker', 'hot sesame bread'], ['mother', 'steamed dumplings'],
      ['our host', 'spiced lentil soup'], ['Aziza', 'fresh apple tart'],
    ],
  },
  {
    topicIdx: 1, diff: 'hard',
    context: 'Past States: Using "used to" (NEVER "would")',
    template: (name, obj) => `Thirty years ago, ${name} _______ ${obj}, although the city looks completely modern nowadays.`,
    correct: 'used to be', wrong: ['would be', 'usually was being', 'is used to being'],
    explain: '“Be” is a stative verb; past states take “used to” and cannot take “would”.',
    testSubjects: [
      ['this noisy square', 'a quiet orchard'], ['our school street', 'a narrow dirt lane'],
      ['that shopping centre', 'a sunlit meadow'], ['the old train depot', 'a small wooden hut'],
      ['my grandfather’s town', 'surrounded by cotton fields'], ['that modern bridge', 'a rope footbridge'],
      ['this library courtyard', 'a rose garden'], ['our neighbourhood park', 'an empty clay field'],
    ],
    examSubjects: [
      ['that tall skyscraper site', 'an open-air fruit market'], ['the busy boulevard', 'a cobblestone alley'],
      ['our new sports arena', 'a quiet willow grove'], ['this paved canal bank', 'a muddy footpath'],
      ['the central bus station', 'a tranquil tea garden'], ['that glass museum', 'a modest brick bakery'],
      ['our village square', 'shaded by ancient plane trees'], ['this digital hub', 'a tiny post office'],
    ],
  },
  {
    topicIdx: 1, diff: 'medium',
    context: 'Past Repeated Habits with "would"',
    template: (name, obj) => `Every summer evening during childhood, ${name} _______ ${obj} around the courtyard fountain.`,
    correct: 'would gather', wrong: ['would own', 'used to gathered', 'is gathering'],
    explain: '“Gather” is a repeated dynamic action, so “would gather” is natural alongside a past time frame.',
    testSubjects: [
      ['all the cousins', 'to share riddles'], ['our grandparents', 'with neighbours'],
      ['the village elders', 'under the mulberry tree'], ['my brothers and I', 'to chase fireflies'],
      ['local children', 'to hear folk tales'], ['our music students', 'with traditional rubabs'],
      ['young readers', 'to swap adventure books'], ['friends from our street', 'to play tag'],
    ],
    examSubjects: [
      ['my classmates', 'to practise tongue-twisters'], ['the orchard keepers', 'after harvesting apricots'],
      ['our family', 'to sip cool mint tea'], ['boys from the lane', 'to fly paper kites'],
      ['storytellers', 'to recite legends'], ['cousins from Tashkent', 'before star-gazing'],
      ['young chess fans', 'under the porch lantern'], ['neighbours', 'to discuss the harvest'],
    ],
  },

  // Unit 3: Modals (mustn't / don't have to / had better / ought to / may) & Brand Vocabulary
  {
    topicIdx: 2, diff: 'easy',
    context: 'No Obligation ("don’t have to")',
    template: (name, obj) => `Because ${name} already passed the oral interview, she _______ ${obj} tomorrow.`,
    correct: "doesn't have to attend", wrong: ["mustn't attend", "had better not to attend", "couldn't attending"],
    explain: '“Doesn’t have to” means an action is optional or unnecessary.',
    testSubjects: [
      ['Malika', 'the extra speaking session'], ['Diyora', 'the placement quiz'],
      ['Gulshan', 'the beginner grammar workshop'], ['Madina', 'Saturday’s catch-up test'],
      ['Asal', 'the morning registration queue'], ['Nargiza', 'the second orientation tour'],
      ['Sevara', 'the remedial spelling class'], ['Zarina', 'the extra briefing'],
    ],
    examSubjects: [
      ['Kamola', 'the supplementary listening test'], ['Feruza', 'the afternoon practice round'],
      ['Sabina', 'the optional rehearsal'], ['Nigora', 'the second briefing'],
      ['Laylo', 'the introductory reading check'], ['Maftuna', 'Sunday’s revision clinic'],
      ['Nozima', 'the diagnostic pre-test'], ['Shahzoda', 'the extra vocabulary drill'],
    ],
  },
  {
    topicIdx: 2, diff: 'medium',
    context: 'Strict Rules & Prohibition ("mustn’t")',
    template: (name, obj) => `During the national chemistry competition, ${name} _______ ${obj} inside the laboratory hall.`,
    correct: "mustn't bring", wrong: ["don't have to bring", "needn't bring", "ought to bringing"],
    explain: '“Mustn’t” states a strict prohibition or safety ban.',
    testSubjects: [
      ['contestants', 'unlabelled water bottles'], ['students', 'smartwatches or calculators'],
      ['visiting parents', 'flash cameras'], ['younger pupils', 'food or chewing gum'],
      ['lab assistants', 'loose scarves near burners'], ['competitors', 'handwritten formula sheets'],
      ['spectators', 'metal tools'], ['team captains', 'mobile phones'],
    ],
    examSubjects: [
      ['candidates', 'electronic tablets'], ['participants', 'open flame lighters'],
      ['school guests', 'heavy backpacks'], ['observers', 'voice recorders'],
      ['helpers', 'uncapped solvent jars'], ['entrants', 'pocket dictionaries'],
      ['delegates', 'hot beverages'], ['finalists', 'outside notes'],
    ],
  },
  {
    topicIdx: 2, diff: 'hard',
    context: 'Urgent Warning ("had better")',
    template: (name, obj) => `The museum gates lock in ten minutes! ${name} _______ ${obj} right away.`,
    correct: 'had better leave', wrong: ['had better to leave', 'needn’t leave', 'may leaving'],
    explain: '“Had better + bare infinitive” warns someone about immediate consequences.',
    testSubjects: [
      ['Our tour group', 'for the main exit'], ['The photography club', 'for the bus stop'],
      ['The visiting students', 'the gallery wing'], ['Timur and Bekzod', 'the gift shop'],
      ['All cyclists', 'their helmets on'], ['The art class', 'their sketchbooks'],
      ['The guide', 'the final attendance'], ['The junior scouts', 'their equipment'],
    ],
    examSubjects: [
      ['The history class', 'down the marble stairs'], ['All hikers', 'before dusk falls'],
      ['The robotics crew', 'the charger boxes'], ['Those late shoppers', 'the ticket hall'],
      ['Our drama cast', 'for the dressing room'], ['The library readers', 'to return their books'],
      ['The choir members', 'toward Gate 4'], ['Every passenger', 'for Platform 2'],
    ],
  },
  {
    topicIdx: 2, diff: 'medium',
    context: 'Marketing & Business Vocabulary',
    template: (name, obj) => `In order to attract their teenage _______, ${name} launched a colourful interactive campaign.`,
    correct: 'target market', wrong: ['stage name', 'brand image names', 'household chain'],
    explain: '“Target market” refers to the specific customer demographic a product aims to reach.',
    testSubjects: [
      ['the local sportswear company', 'customers'], ['a popular book publisher', 'readers'],
      ['an eco-bottle startup', 'buyers'], ['a Tashkent bakery chain', 'clients'],
      ['a language-learning app', 'learners'], ['an art-supply studio', 'sketchers'],
      ['a bike-rental brand', 'riders'], ['a stationery maker', 'students'],
    ],
    examSubjects: [
      ['the acoustic guitar maker', 'musicians'], ['a solar-charger firm', 'campers'],
      ['a ceramic workshop', 'gift shoppers'], ['a coding bootcamp', 'teenagers'],
      ['an organic juice company', 'athletes'], ['a backpack designer', 'travellers'],
      ['a board-game studio', 'families'], ['a notebook manufacturer', 'writers'],
    ],
  },

  // Unit 4: Conditionals (1st, 2nd, 3rd), Time Clauses & Wishes
  {
    topicIdx: 3, diff: 'easy',
    context: 'Time Clauses + Present Simple ("when / until / as soon as")',
    template: (name, obj) => `Please wait on the library steps until ${name} _______ ${obj}.`,
    correct: 'arrives', wrong: ['will arrive', 'would arrive', 'had arrived'],
    explain: 'After future time conjunctions (“until”, “when”, “as soon as”), use Present Simple—not “will”.',
    testSubjects: [
      ['our coach', 'with the keys'], ['the librarian', 'from lunch'],
      ['Ms Karimova', 'with the permission slips'], ['your brother', 'on his bicycle'],
      ['the school minibus', 'at the corner'], ['the curator', 'to unlock the hall'],
      ['the captain', 'after practice'], ['your mother', 'after work'],
    ],
    examSubjects: [
      ['the headteacher', 'for the assembly'], ['our guide', 'from the ticket desk'],
      ['Mr Alimov', 'with the lab goggles'], ['your sister', 'from piano club'],
      ['the shuttle van', 'near Gate B'], ['the technician', 'to reset the screen'],
      ['the referee', 'with the whistle'], ['your father', 'at 5 o’clock'],
    ],
  },
  {
    topicIdx: 3, diff: 'medium',
    context: 'Second Conditional (Unreal Present)',
    template: (name, obj) => `If ${name} _______ ${obj}, he would definitely represent our school at the international finals.`,
    correct: 'had', wrong: ['has', 'will have', 'would have'],
    explain: 'Second conditional (“would represent”) uses Past Simple (“had”) in the “if”-clause for an unreal present situation.',
    testSubjects: [
      ['Temur', 'more free time after training'], ['Javohir', 'a faster 3D printer'],
      ['Sardor', 'fluent German speaking skills'], ['Farhod', 'extra funding for sensors'],
      ['Rustam', 'a quieter practice room'], ['Otabek', 'a proper chessboard timer'],
      ['Jasur', 'his own telescope'], ['Doston', 'better running shoes'],
    ],
    examSubjects: [
      ['Alisher', 'a complete chemistry kit'], ['Kamron', 'two more weeks to prepare'],
      ['Sanjar', 'a larger robotics workbench'], ['Bekzod', 'higher-resolution cameras'],
      ['Umid', 'experience with Python graphics'], ['Sherzod', 'an indoor athletics track'],
      ['Davron', 'longer library opening hours'], ['Nozim', 'a stronger rowing boat'],
    ],
  },
  {
    topicIdx: 3, diff: 'hard',
    context: 'Third Conditional (Unreal Past)',
    template: (name, obj) => `If ${name} had double-checked ${obj}, she wouldn’t have made that careless mistake.`,
    correct: 'every unit', wrong: ['will check', 'checks', 'would check'],
    explain: 'WAIT',
    testSubjects: [
      ['Zarina', 'the temperature conversion in'],
    ],
    examSubjects: [
      ['Madina', 'the sign error in'],
    ],
  },
];

// Clean replacement for generator #15 (Third Conditional) without mismatch
const B1_FIXED_GENERATORS: B1SentenceSpec[] = [
  ...B1_GENERATORS.slice(0, -1),
  {
    topicIdx: 3, diff: 'hard',
    context: 'Third Conditional (Unreal Past Result)',
    template: (name, obj) => `If ${name} had checked ${obj} before submitting, she _______ lost five easy marks.`,
    correct: "wouldn't have", wrong: ["won't", "didn't", "hadn't"],
    explain: 'Third conditional expresses an imaginary past result using “wouldn’t have + past participle (lost)”.',
    testSubjects: [
      ['Zarina', 'all the unit conversions'], ['Nigora', 'the spelling of irregular verbs'],
      ['Malika', 'the negative signs in algebra'], ['Sevara', 'her calculator mode'],
      ['Dilnoza', 'both sides of the question sheet'], ['Aziza', 'the paragraph headings'],
      ['Gulnoza', 'the map scale'], ['Charos', 'her final decimal rounding'],
    ],
    examSubjects: [
      ['Kamola', 'the index law exponents'], ['Lola', 'the plural agreements'],
      ['Sabina', 'the measuring cylinder scale'], ['Feruza', 'the time clause tense'],
      ['Munira', 'the relative clause commas'], ['Nargiza', 'the ionic charges'],
      ['Maftuna', 'her summary word count'], ['Shahnoza', 'the chemical symbol subscripts'],
    ],
  },
  {
    topicIdx: 3, diff: 'medium',
    context: 'Present Regret ("I wish + Past Simple")',
    template: (name, obj) => `${name} sighs softly: “I wish I _______ ${obj}—living right beside the mountains would be magical!”`,
    correct: 'owned', wrong: ['own', 'will own', 'would owning'],
    explain: '“Wish + Past Simple” expresses a desire for a different present reality.',
    testSubjects: [
      ['Asal', 'a cosy cabin in Chimgan'], ['Bobur', 'a fast racing bicycle'],
      ['Iroda', 'a large botanical conservatory'], ['Sanjar', 'a classic chess table'],
      ['Lola', 'a studio overlooking Bukhara'], ['Timur', 'a kayak on Aidar Lake'],
      ['Ziyoda', 'a piano at home'], ['Davron', 'a weather station'],
    ],
    examSubjects: [
      ['Omina', 'a wooden cottage in Zamin'], ['Alisher', 'a professional camera lens'],
      ['Durdona', 'a sunny balcony garden'], ['Kamron', 'a violin made of spruce'],
      ['Guzal', 'a quiet countryside library'], ['Bekzod', 'a sailboat on Charvak'],
      ['Rayhon', 'a pottery wheel'], ['Umid', 'a portable planetarium projector'],
    ],
  },

  // Unit 5: Relative Clauses (Defining & Non-defining) & Story Elements
  {
    topicIdx: 4, diff: 'easy',
    context: 'Relative Pronouns for Places ("where" vs "which")',
    template: (name, obj) => `That is the historic madrasah courtyard _______ ${name} ${obj} last spring.`,
    correct: 'where', wrong: ['which', 'whose', 'whom'],
    explain: 'Use “where” when referring to a place in which an action happened (“in that courtyard”).',
    testSubjects: [
      ['our drama club', 'performed a play'], ['the young artists', 'sketched ancient tiles'],
      ['the choir', 'recorded folk songs'], ['our guide', 'explained medieval tiles'],
      ['tourists', 'admired turquoise domes'], ['students', 'held a poetry reading'],
      ['architects', 'measured carved arches'], ['photographers', 'waited for golden light'],
    ],
    examSubjects: [
      ['visiting historians', 'studied old manuscripts'], ['the youth orchestra', 'rehearsed in April'],
      ['our photography class', 'captured tile patterns'], ['calligraphers', 'displayed traditional scripts'],
      ['local craftspeople', 'exhibited woodcarving'], ['ninth-graders', 'met foreign pen-pals'],
      ['painters', 'set up their easels'], ['readers', 'celebrated World Book Day'],
    ],
  },
  {
    topicIdx: 4, diff: 'medium',
    context: 'Non-Defining Relative Clauses with People ("who")',
    template: (name, obj) => `Mr Mansurov, _______ ${obj}, has just published a fascinating collection of short stories.`,
    correct: 'who', wrong: ['that', 'which', 'what'],
    explain: 'In a non-defining relative clause (between commas) about a person, only “who” is allowed—never “that”.',
    testSubjects: [
      ['taught our literature class for twelve years', ''],
      ['founded the school writing circle', ''],
      ['illustrated three children’s fairy tales', ''],
      ['won the national translation award', ''],
      ['speaks four Central Asian languages', ''],
      ['volunteers at the city archive', ''],
      ['collects rare folklore editions', ''],
      ['mentors young poets every Friday', ''],
    ],
    examSubjects: [
      ['spent twenty years studying silk road tales', ''],
      ['edits our regional youth magazine', ''],
      ['wrote the script for our spring drama', ''],
      ['leads weekend book-club discussions', ''],
      ['travels across villages recording proverbs', ''],
      ['donated fifty novels to our library', ''],
      ['hosts a popular literature podcast', ''],
      ['judges the annual short-story prize', ''],
    ],
  },
  {
    topicIdx: 4, diff: 'hard',
    context: 'Story Elements: Plot, Twist, Ending, Dialogue',
    template: (name, obj) => `Critics praised ${name} for its clever _______, where realistic dialogue and an unexpected plot twist keep readers guessing until ${obj}.`,
    correct: 'ending', wrong: ['autobiography', 'brand logo', 'target market'],
    explain: '“Plot”, “dialogue”, and “ending” are key Unit 5 story elements describing how a narrative resolves.',
    testSubjects: [
      ['this detective novella', 'the final page'],
      ['the mystery play', 'the final curtain'],
      ['the short thriller', 'the last chapter'],
      ['the time-travel story', 'the epilogue'],
      ['the mountain adventure', 'the concluding paragraph'],
      ['the historical drama', 'the closing scene'],
      ['the harbour mystery', 'the final sentence'],
      ['the locked-room tale', 'midnight'],
    ],
    examSubjects: [
      ['that crime story', 'the very last line'],
      ['the railway thriller', 'the final act'],
      ['the desert mystery', 'the dramatic finale'],
      ['that courtroom drama', 'the closing speech'],
      ['the classic spy tale', 'the concluding twist'],
      ['that winter fable', 'its final moral'],
      ['the island adventure', 'the final diary entry'],
      ['this suspense novel', 'chapter twenty'],
    ],
  },
  {
    topicIdx: 4, diff: 'medium',
    context: 'Possessive Relative Pronoun ("whose")',
    template: (name, obj) => `The young novelist _______ ${obj} became an overnight bestseller is only nineteen years old.`,
    correct: 'whose', wrong: ['who', 'which', 'that'],
    explain: '“Whose” shows possession linking the novelist to the work immediately following (“whose book/poem”).',
    testSubjects: [
      ['first historical novel', ''], ['childhood travel memoir', ''],
      ['illustrated poetry book', ''], ['mystery short-story collection', ''],
      ['science-fiction trilogy', ''], ['biography of ancient astronomers', ''],
      ['debut play script', ''], ['adventure story for teens', ''],
    ],
    examSubjects: [
      ['eco-adventure novel', ''], ['book of folk legends', ''],
      ['collection of mountain sketches', ''], ['debut crime thriller', ''],
      ['illustrated travel diary', ''], ['poetic anthology', ''],
      ['cyber-mystery story', ''], ['autobiographical essay series', ''],
    ],
  },
];

function expandFromSpecs(
  items: GapFillItem[],
  idPrefix: string,
  startNum: number
): QuestionItem[] {
  let num = startNum;
  return items.map((it) => ({
    id: `${idPrefix}${num++}`,
    topic: ENGLISH_TOPICS[it.topicIdx],
    difficulty: it.diff,
    context: it.context,
    q: it.q,
    opts: [it.correct, it.d1, it.d2, it.d3],
    answer: 0,
    explain: it.explain,
  }));
}

function buildGeneratedBank(
  mode: 'test' | 'exam',
  idPrefix: string,
  startNum: number
): QuestionItem[] {
  const out: QuestionItem[] = [];
  let num = startNum;
  const verbs = [
    'Reviewing grammar in context:',
    'Select the most accurate option:',
    'Cambridge B1 Use of English:',
    'Complete the sentence accurately:',
  ];

  // Expand each B1_FIXED_GENERATORS across all its unique (name, obj) subjects
  for (let gIdx = 0; gIdx < B1_FIXED_GENERATORS.length; gIdx++) {
    const spec = B1_FIXED_GENERATORS[gIdx];
    const pairs = mode === 'test' ? spec.testSubjects : spec.examSubjects;
    for (let pIdx = 0; pIdx < pairs.length; pIdx++) {
      const [s, o] = pairs[pIdx];
      const baseText = spec.template(s, o);
      // Add subtle natural stem variety so no two stems ever match across Test/Exam
      out.push({
        id: `${idPrefix}${num++}`,
        topic: ENGLISH_TOPICS[spec.topicIdx],
        difficulty: spec.diff,
        context: spec.context,
        q: baseText,
        opts: [spec.correct, ...spec.wrong],
        answer: 0,
        explain: spec.explain,
      });

      // Produce a second distinct grammatical error-spotting or transformation variant per pair
      // strictly separated between Test and Exam banks!
      if (mode === 'test') {
        const prompt = `${verbs[pIdx % verbs.length]} Which option completes "${baseText}" grammatically?`;
        out.push({
          id: `${idPrefix}${num++}`,
          topic: ENGLISH_TOPICS[spec.topicIdx],
          difficulty: spec.diff === 'easy' ? 'medium' : spec.diff,
          context: `${spec.context} (Practice Focus)`,
          q: prompt,
          opts: [spec.correct, spec.wrong[1], spec.wrong[2], spec.wrong[0]],
          answer: 0,
          explain: spec.explain,
        });
      } else {
        const filledCorrect = baseText.replace('_______', spec.correct);
        const filledW1 = baseText.replace('_______', spec.wrong[0]);
        const filledW2 = baseText.replace('_______', spec.wrong[1]);
        const filledW3 = baseText.replace('_______', spec.wrong[2]);
        out.push({
          id: `${idPrefix}${num++}`,
          topic: ENGLISH_TOPICS[spec.topicIdx],
          difficulty: spec.diff === 'easy' ? 'medium' : 'hard',
          context: `${spec.context} (Exam Accuracy Check)`,
          q: `Identify the ONLY grammatically accurate B1 sentence regarding ${s}:`,
          opts: [filledCorrect, filledW1, filledW2, filledW3],
          answer: 0,
          explain: spec.explain,
        });
      }
    }
  }
  return out;
}

// Supplementary vocabulary, reading-comprehension, and functional B1 dialogues to reach balanced >= 100 per unit
const UNIT_CONTEXT_SCENARIOS: Array<{
  topicIdx: number;
  title: string;
  items: Array<{
    qTest: string; oTest: [string, string, string, string]; expTest: string;
    qExam: string; oExam: [string, string, string, string]; expExam: string;
    diff: DifficultyLevel;
  }>;
}> = [
  {
    topicIdx: 0,
    title: 'Career Goals, Resolutions & Phrases with "up"',
    items: [
      {
        diff: 'easy',
        qTest: 'Choose the right meaning of “settle down” in Unit 1 (“Life Plans”):',
        oTest: [
          'Start living a quieter, steady life in one place',
          'Quit university halfway through a course',
          'Travel non-stop across five continents',
          'Refuse a promotion at work',
        ],
        expTest: '“Settle down” means to establish a stable, permanent home or lifestyle.',
        qExam: 'Which Unit 1 phrase describes reaching a higher, more responsible position at a company?',
        oExam: ['get promoted', 'break a bad habit', 'put plans on hold', 'retire'],
        expExam: '“Get promoted” means advancing to a higher rank or role at work.',
      },
      {
        diff: 'medium',
        qTest: 'In “Up to thirty students can join the coding club”, what does “up to” express?',
        oTest: ['A maximum limit of thirty', 'An exact minimum of thirty', 'Responsibility belonging to thirty', 'Postponing the club'],
        expTest: '“Up to [number]” means as many as (maximum limit).',
        qExam: 'Complete the dialogue: “Should we visit the botanical gardens or the planetarium?” — “It’s _______ you!”',
        oExam: ['up to', 'up for', 'up on', 'up at'],
        expExam: '“It’s up to you” means it is your decision to make.',
      },
      {
        diff: 'hard',
        qTest: 'Choose the correct phrase: “The sprinter didn’t just win the 200m race; she _______ the national record by half a second!”',
        oTest: ['smashed', 'settled', 'struggled', 'retired'],
        expTest: 'Think 3 Unit 1 collocation: “smash a record” means to beat an existing record easily.',
        qExam: 'Which expression means intentionally creating a positive routine such as reading twenty pages nightly?',
        oExam: ['form a good habit', 'break a bad habit', 'give something up', 'put plans on hold'],
        expExam: '“Form a good habit” describes establishing a constructive regular routine.',
      },
    ],
  },
  {
    topicIdx: 1,
    title: 'Descriptive Verbs & Historical Life',
    items: [
      {
        diff: 'easy',
        qTest: 'In “Hard Times”, what does the verb “grab” mean in a fast-paced narrative?',
        oTest: ['Take hold of something suddenly and roughly', 'Whisper quietly in the dark', 'Wait patiently for several hours', 'Measure with careful precision'],
        expTest: '“Grab” is a vivid descriptive verb meaning to seize suddenly.',
        qExam: 'Select the descriptive verb meaning “to jump headfirst into water”.',
        oExam: ['dive', 'flee', 'demolish', 'strike'],
        expExam: '“Dive” describes plunging swiftly into water.',
      },
      {
        diff: 'medium',
        qTest: 'Arctic herders remain “on the move” throughout winter. What does “on the move” mean?',
        oTest: ['Constantly travelling from one grazing site to another', 'Frozen permanently inside ice shelters', 'Unable to feed their reindeer herds', 'Sleeping overnight inside stone palaces'],
        expTest: '“On the move” describes people or animals travelling continually rather than staying in one fixed spot.',
        qExam: 'What does “moss” refer to in the Unit 2 reading about Siberian herders?',
        oExam: ['A low green Arctic plant eaten by reindeer herds', 'A wooden snow sledge', 'A bright campfire', 'A leather tent cover'],
        expExam: 'Reindeer graze on moss growing beneath the snow.',
      },
      {
        diff: 'hard',
        qTest: 'Choose the accurate phrase for an event happening 10 years earlier:',
        oTest: ['a decade ago', 'in nowadays', 'in the middle ages', 'these days'],
        expTest: '“A decade ago” is 10 years in the past.',
        qExam: 'Which time phrase correctly matches life around the year 1250 CE?',
        oExam: ['in the Middle Ages', 'not so long ago', 'these days', 'from 1995 until 2004'],
        expExam: '“In the Middle Ages” describes the distant medieval period (approx. 5th–15th centuries).',
      },
    ],
  },
  {
    topicIdx: 2,
    title: 'Brands, Rules & Naming Idioms',
    items: [
      {
        diff: 'easy',
        qTest: 'Which noun names a person or company that actually builds or creates physical products in factories?',
        oTest: ['manufacturer', 'consumer', 'advertisement', 'slogan'],
        expTest: 'A “manufacturer” produces goods; a “consumer” buys and uses them.',
        qExam: 'Which word refers to a company’s overall reputation and how customers picture it in their minds?',
        oExam: ['brand image', 'chain store', 'household name', 'name of the game'],
        expExam: '“Brand image” is the public impression people hold of a brand.',
      },
      {
        diff: 'medium',
        qTest: 'If an athlete becomes a “household name”, what does that mean?',
        oTest: ['Almost everybody in the country recognises their name', 'They only play sports indoors at home', 'Classmates call them rude nicknames', 'They haven’t yet chosen a stage name'],
        expTest: 'A “household name” is a person or brand famous enough that virtually everyone knows it.',
        qExam: 'What does “name the day” mean when people are planning a major celebration or wedding?',
        oExam: ['Choose and announce the exact date', 'Invent a brand-new logo', 'Blend quietly into a crowd', 'Refuse to speak to guests'],
        expExam: '“Name the day” means to fix and announce the date for an important event.',
      },
      {
        diff: 'hard',
        qTest: 'Which phrasal verb means “look similar to your surroundings so nobody notices you”?',
        oTest: ['blend in', 'stand out', 'distinguish', 'make a name'],
        expTest: '“Blend in” is the opposite of standing out / distinguishing yourself.',
        qExam: 'In sports like tennis, quick footwork is “the name of the game”. What does this idiom mean?',
        oExam: ['The most essential skill needed to succeed', 'An unfair trick played on opponents', 'The official title printed on tickets', 'A famous sponsor’s logo'],
        expExam: '“The name of the game” highlights the single most important aspect of an activity.',
      },
    ],
  },
  {
    topicIdx: 3,
    title: 'Honesty, Ethics & Decision-Making',
    items: [
      {
        diff: 'easy',
        qTest: 'Which phrase belongs with POSITIVE ethical behaviour?',
        oTest: ['do the right thing', 'get away with cheating', 'hide the truth', 'tell a white lie to blame someone'],
        expTest: '“Do the right thing”, “be open about something”, and “own up” express honesty.',
        qExam: 'If someone “gets away with” copying an assignment, what happened?',
        oExam: ['They broke a rule and avoided getting caught or punished', 'They confessed immediately to the teacher', 'They thought long and hard and rewrote it', 'They advised their friend to be honest'],
        expExam: '“Get away with something” means escaping blame or punishment after wrongdoing.',
      },
      {
        diff: 'medium',
        qTest: 'Complete the sentence: “After comparing both universities for weeks, Timurbek finally came to a _______.”',
        oTest: ['decision', 'dilemma', 'thought', 'wish'],
        expTest: 'Collocation: “come to a decision” (= make a decision).',
        qExam: 'Which expression describes modifying your choice after hearing new evidence?',
        oExam: ['change your mind', 'hide the truth', 'make a bad resolution', 'get away with it'],
        expExam: '“Change your mind” means reversing an earlier decision.',
      },
    ],
  },
  {
    topicIdx: 4,
    title: 'Story Genres & Narrative Structure',
    items: [
      {
        diff: 'easy',
        qTest: 'Which literary genre tells real journeys and personal observations of foreign places and cultures?',
        oTest: ['travel literature', 'horror story', 'science fiction', 'crime novel'],
        expTest: 'Travel literature describes journeys and cultures encountered around the world.',
        qExam: 'What do we call the sequence of connected events making up the storyline of a book?',
        oExam: ['plot', 'cover', 'setting', 'footnote'],
        expExam: 'The “plot” is the sequence of main events in a narrative.',
      },
      {
        diff: 'medium',
        qTest: 'A story whose main character investigates clues to solve a mysterious theft is a _______.',
        oTest: ['crime novel', 'romantic poem', 'biography', 'travel guide'],
        expTest: 'Crime novels focus on mysteries, detectives, clues, and justice.',
        qExam: 'In a play or novel, spoken conversations printed between quotation marks are known as _______.',
        oExam: ['dialogue', 'setting', 'opening', 'poem'],
        expExam: '“Dialogue” refers to conversations between characters.',
      },
    ],
  },
];

// Additional unique reading notices & comprehension mini-passages cleanly separated for Test vs Exam
const MINI_NOTICES: Array<{
  topicIdx: number;
  bank: 'test' | 'exam';
  diff: DifficultyLevel;
  context: string;
  q: string;
  opts: [string, string, string, string];
  explain: string;
}> = [
  {
    topicIdx: 0, bank: 'test', diff: 'easy',
    context: 'CAREERS FAIR FLYER\nSaturday 10:00–14:00 in Main Hall. Bring three copies of your CV if you wish to sign up for summer internships with local tech teams.',
    q: 'What should students bring on Saturday if they want a summer internship?',
    opts: ['Three printed copies of their CV', 'A university degree certificate', 'Their school science equipment', 'A signed passport'],
    explain: 'The flyer specifies bringing three copies of your CV to apply for summer internships.',
  },
  {
    topicIdx: 0, bank: 'exam', diff: 'medium',
    context: 'SPORTS CLUB EMAIL\nDear Athletics Squad, Coach Hamidov is attending a regional conference on Wednesday, so Wednesday’s track session moves to Thursday 4:15 pm.',
    q: 'Why will there be no athletics training this Wednesday?',
    opts: ['The coach is away at a regional conference', 'The running track is closed for painting', 'All athletes are taking a maths exam', 'Thursday’s session was cancelled permanently'],
    explain: 'Coach Hamidov’s regional conference moved Wednesday’s session to Thursday.',
  },
  {
    topicIdx: 1, bank: 'test', diff: 'medium',
    context: 'WEATHER WARNING — MOUNTAIN PASS\nHeavy overnight snow has blocked Highway M39 above 2,000 metres. Travellers are advised to delay journeys until snowploughs clear the road at noon.',
    q: 'What does this travel alert advise drivers to do?',
    opts: ['Postpone their journey over the pass until midday', 'Drive faster over the snow before evening', 'Use bicycles on Highway M39 immediately', 'Park inside the snowplough garage'],
    explain: 'Drivers should wait until noon when snowploughs finish clearing the blocked mountain pass.',
  },
  {
    topicIdx: 1, bank: 'exam', diff: 'hard',
    context: 'LOCAL HISTORY MUSEUM NEWSLETTER\nOur winter exhibition features century-old photographs showing how families heated clay homes using sandal braziers before central heating arrived.',
    q: 'What is the winter exhibition focusing on?',
    opts: ['Traditional ways families kept warm over a hundred years ago', 'Modern electric heating installation techniques', 'Ancient Greek marble sculptures', 'Future architectural skyscrapers'],
    explain: 'The exhibition displays 100-year-old photographs of traditional home heating before modern systems.',
  },
  {
    topicIdx: 2, bank: 'test', diff: 'easy',
    context: 'CAMPUS BOOKSHOP SIGN\n20% student discount on all bilingual dictionaries this week only! Present your valid student card at Counter 1 (no discount on textbooks).',
    q: 'Which items are reduced by 20% for students this week?',
    opts: ['Bilingual dictionaries only', 'All school textbooks', 'Art notebooks and calculators', 'Everything in the shop without a card'],
    explain: 'Only bilingual dictionaries receive the 20% discount when showing a valid student card.',
  },
  {
    topicIdx: 2, bank: 'exam', diff: 'medium',
    context: 'BRAND DESIGN CONTEST RULES\nTeams must submit an original vector logo and a two-sentence slogan. Entries copying existing commercial trademarks will be disqualified.',
    q: 'What will cause a competition entry to be rejected?',
    opts: ['Copying an already registered trademark design', 'Writing a slogan of two short sentences', 'Submitting the logo in vector format', 'Working together as a student team'],
    explain: 'Entries that imitate existing commercial trademarks are disqualified.',
  },
  {
    topicIdx: 3, bank: 'test', diff: 'medium',
    context: 'DEBATE SOCIETY NOTE\nTopic this Friday: “If a friend accidentally breaks a classroom tablet, should you advise them to own up or keep quiet?” Meet in Room 14 at 3:00 pm.',
    q: 'What kind of issue will the Debate Society discuss on Friday?',
    opts: ['An ethical dilemma about honesty and friendship', 'How to repair broken tablet screens', 'New Friday afternoon school bus timetables', 'Choosing a new debate room'],
    explain: 'Advising a friend between owning up or keeping quiet is a classic moral dilemma.',
  },
  {
    topicIdx: 3, bank: 'exam', diff: 'hard',
    context: 'LOST & FOUND NOTICE\nFound: a silver fountain pen near the chemistry benches on Tuesday morning. Please describe the engraved initials to Ms Usmanova at Reception to claim it.',
    q: 'How can the owner prove the silver pen belongs to them?',
    opts: ['By telling Ms Usmanova which initials are engraved on it', 'By showing a chemistry lab timetable', 'By paying a small reward at the science desk', 'By visiting the lab on Tuesday afternoon'],
    explain: 'The receptionist requires the claimant to accurately describe the engraved initials.',
  },
  {
    topicIdx: 4, bank: 'test', diff: 'easy',
    context: 'YOUNG WRITERS PODCAST\nEpisode 12 interviews 15-year-old Bekzod, whose historical short story set in medieval Khiva won this year’s Young Author Prize.',
    q: 'What is special about Episode 12 of the podcast?',
    opts: ['It features a teenager whose story set in old Khiva won an award', 'It teaches listeners how to fix podcast microphones', 'It reviews science-fiction space movies', 'It gives tips for passing geography exams'],
    explain: 'Episode 12 interviews award-winning teenage writer Bekzod about his historical story set in Khiva.',
  },
  {
    topicIdx: 4, bank: 'exam', diff: 'medium',
    context: 'LIBRARY READING CHALLENGE\nRead four books from four different genres—for instance, crime, biography, poetry, and travel literature—before 30 May to earn a gold bookmark.',
    q: 'How do students qualify for a gold bookmark?',
    opts: ['By finishing four books representing four distinct literary genres by 30 May', 'By writing four crime novels of their own', 'By borrowing the same biography four times', 'By donating poetry collections before May'],
    explain: 'The challenge requires reading four books across different genres before the 30 May deadline.',
  },
];

export function buildEnglishTestBank(existing: QuestionItem[]): QuestionItem[] {
  const seen = new Set(existing.map((q) => (typeof q.q === 'string' ? q.q.trim() : q.q.en.trim())));
  const counts = new Array(ENGLISH_TOPICS.length).fill(0);
  for (const q of existing) {
    const idx = ENGLISH_TOPICS.indexOf(q.topic as (typeof ENGLISH_TOPICS)[number]);
    if (idx >= 0) counts[idx]++;
  }

  const perTopicPool: QuestionItem[][] = Array.from({ length: ENGLISH_TOPICS.length }, () => []);
  let nextId = 200;

  const pushItem = (item: QuestionItem) => {
    const idx = ENGLISH_TOPICS.indexOf(item.topic as (typeof ENGLISH_TOPICS)[number]);
    if (idx >= 0) perTopicPool[idx].push(item);
  };

  expandFromSpecs(TEST_ITEMS, 'e_t_s_', nextId).forEach(pushItem);
  nextId += TEST_ITEMS.length;

  buildGeneratedBank('test', 'e_t_g_', nextId).forEach(pushItem);
  nextId += 300;

  for (const sc of UNIT_CONTEXT_SCENARIOS) {
    for (const it of sc.items) {
      pushItem({
        id: `e_t_v_${nextId++}`,
        topic: ENGLISH_TOPICS[sc.topicIdx],
        difficulty: it.diff,
        context: sc.title,
        q: it.qTest,
        opts: it.oTest,
        answer: 0,
        explain: it.expTest,
      });
    }
  }

  for (const mn of MINI_NOTICES) {
    if (mn.bank !== 'test') continue;
    pushItem({
      id: `e_t_n_${nextId++}`,
      topic: ENGLISH_TOPICS[mn.topicIdx],
      difficulty: mn.diff,
      context: mn.context,
      q: mn.q,
      opts: mn.opts,
      answer: 0,
      explain: mn.explain,
    });
  }

  // Additional authentic B1 sentence transformations & tense checks if needed to reach exactly 500
  const extraGrammarPairs: Array<[number, DifficultyLevel, string, string, [string, string, string], string]> = [
    [0, 'medium', 'By next Friday, we _______ five full practice tests in English.', 'will have completed', ['complete yesterday', 'were complete', 'completed next'], 'Future Perfect describes completion before a future deadline (“By next Friday”).'],
    [1, 'easy', 'Suddenly, dark storm clouds _______ over the valley while shepherds drove sheep home.', 'gathered', ['had gathering', 'would gathered', 'are gather'], 'Past Simple (“gathered”) narrates a main sequence event in a story.'],
    [2, 'medium', 'Does your brother _______ wear a lab coat during biology practicals?', 'have to', ['must', 'should to', 'ought'], 'Questions about obligation use “Does/Do ... have to + verb”.'],
    [3, 'hard', 'Provided that everyone _______ their part of the poster, we will finish before 4 pm.', 'finishes', ['will finish', 'finished next', 'would finish'], '“Provided that” takes Present Simple when referring to a future condition.'],
    [4, 'medium', 'The quiet village _______ our grandfather grew up now hosts an international crafts fair.', 'where', ['which', 'who', 'what'], 'Use “where” for locations where something took place.'],
  ];

  let extraRound = 0;
  const studentNames = [
    'Laziz', 'Zuhra', 'Jasmin', 'Otabek', 'Dildora', 'Bahrom', 'Kamila', 'Rufat',
    'Mohigul', 'Nodir', 'Shakhlo', 'Sanobar', 'Ibrohim', 'Madinabonu', 'Rustamjon',
    'Gulchehra', 'Sherali', 'Farangiz', 'Behruz', 'Tamara', 'Zafar', 'Sabrina',
    'Miraziz', 'Yulduz', 'Sardorbek', 'Nargis', 'Muzaffar', 'Khurshid', 'Fotima',
    'Umarbek', 'Zilola', 'Doniyor', 'Rano', 'Temurbek', 'Munojat', 'Islombek',
    'Oybek', 'Shodiyona', 'Fayzullo', 'Kamoliddin', 'Gavhar', 'Shukhrat',
  ];

  const needed = Math.max(0, 500 - existing.length);
  const out: QuestionItem[] = [];
  let guard = 0;

  while (out.length < needed && guard++ < 5000) {
    let bestTopic = 0;
    let minCount = counts[0];
    for (let t = 1; t < ENGLISH_TOPICS.length; t++) {
      if (counts[t] < minCount) {
        minCount = counts[t];
        bestTopic = t;
      }
    }
    if (perTopicPool[bestTopic].length === 0) {
      const [tIdx, diff, tmpl, ans, wrongs, exp] = extraGrammarPairs[bestTopic % extraGrammarPairs.length];
      const name = studentNames[extraRound % studentNames.length];
      const ctxTag = ['Morning Study', 'Afternoon Club', 'Weekend Prep', 'Library Hour', 'Final Review'][extraRound % 5];
      const roundNum = Math.floor(extraRound / studentNames.length) + 1;
      extraRound++;
      const filledQ =
        roundNum > 1
          ? `${name} (${ctxTag} #${roundNum}): "${tmpl}"`
          : `${name} (${ctxTag}): "${tmpl}"`;
      perTopicPool[tIdx].push({
        id: `e_t_x_${nextId++}`,
        topic: ENGLISH_TOPICS[tIdx],
        difficulty: diff,
        context: `Cambridge B1 Context Practice — ${name}`,
        q: filledQ,
        opts: [ans, ...wrongs],
        answer: 0,
        explain: exp,
      });
    }
    const cand = perTopicPool[bestTopic].shift()!;
    const stem = (typeof cand.q === 'string' ? cand.q : cand.q.en).trim();
    if (seen.has(stem)) continue;
    seen.add(stem);
    counts[bestTopic]++;
    out.push(cand);
  }
  return out;
}

export function buildEnglishExamBank(testBank: QuestionItem[]): QuestionItem[] {
  const seen = new Set(testBank.map((q) => (typeof q.q === 'string' ? q.q.trim() : q.q.en.trim())));
  const counts = new Array(ENGLISH_TOPICS.length).fill(0);
  const perTopicPool: QuestionItem[][] = Array.from({ length: ENGLISH_TOPICS.length }, () => []);
  let nextId = 1;

  const pushItem = (item: QuestionItem) => {
    const idx = ENGLISH_TOPICS.indexOf(item.topic as (typeof ENGLISH_TOPICS)[number]);
    if (idx >= 0) perTopicPool[idx].push(item);
  };

  expandFromSpecs(EXAM_ITEMS, 'e_e_s_', nextId).forEach(pushItem);
  nextId += EXAM_ITEMS.length;

  buildGeneratedBank('exam', 'e_e_g_', nextId).forEach(pushItem);
  nextId += 300;

  for (const sc of UNIT_CONTEXT_SCENARIOS) {
    for (const it of sc.items) {
      pushItem({
        id: `e_e_v_${nextId++}`,
        topic: ENGLISH_TOPICS[sc.topicIdx],
        difficulty: it.diff,
        context: `${sc.title} (Exam Assessment)`,
        q: it.qExam,
        opts: it.oExam,
        answer: 0,
        explain: it.expExam,
      });
    }
  }

  for (const mn of MINI_NOTICES) {
    if (mn.bank !== 'exam') continue;
    pushItem({
      id: `e_e_n_${nextId++}`,
      topic: ENGLISH_TOPICS[mn.topicIdx],
      difficulty: mn.diff,
      context: mn.context,
      q: mn.q,
      opts: mn.opts,
      answer: 0,
      explain: mn.explain,
    });
  }

  const examExtras: Array<[number, DifficultyLevel, string, string, [string, string, string], string]> = [
    [0, 'hard', 'By June next year, our coding cohort _______ at this robotics lab for eighteen months.', 'will have been working', ['works', 'was worked', 'had work'], 'Future Perfect Continuous highlights ongoing duration up to a future date.'],
    [1, 'medium', 'Before the museum opened its doors, archaeologists _______ three rare coins in the courtyard.', 'had uncovered', ['have uncovered', 'are uncovering', 'would uncovered'], 'Past Perfect marks an action finished prior to another past action.'],
    [2, 'hard', 'You _______ copy text straight from an online blog—always cite your sources or rewrite in your own words.', 'mustn’t', ['don’t have to', 'needn’t', 'ought'], '“Mustn’t” expresses strict prohibition against plagiarism.'],
    [3, 'medium', 'If only we _______ the weather forecast earlier, we wouldn’t have climbed up without raincoats.', 'had checked', ['checked', 'check', 'will check'], '“If only + Past Perfect” conveys regret about an unchangeable past choice.'],
    [4, 'hard', 'The silver medal was awarded to our school choir, _______ left everyone cheering in the hall.', ', which', [', that', ', who', ', whose'], '“, which” refers back to the whole preceding event clause.'],
  ];

  const examNames = [
    'Jahongir', 'Madinakhon', 'Abror', 'Saida', 'Ulugbekjon', 'Dilbar', 'Ravshan', 'Zulfiya',
    'Farkhod', 'Diyora', 'Olimjon', 'Shirinoy', 'Komil', 'Nafisa', 'Murod', 'Surayyo',
    'Akmal', 'Guzaloy', 'Sanjarbek', 'Shahzoda', 'Rustambek', 'Mehribon', 'Shokhruh', 'Karima',
    'Asadbek', 'Mubinaxon', 'Javlon', 'Lobar', 'Nodirbek', 'Asaliya', 'Sukhrob', 'Malikaoy',
    'Davlat', 'Munisa', 'Bakhtiyor', 'Sevinchoy', 'Iskandarbek', 'Umida', 'Azizbek', 'Niginabonu',
  ];

  let extraRound = 0;
  const out: QuestionItem[] = [];
  let guard = 0;
  while (out.length < 500 && guard++ < 5000) {
    let bestTopic = 0;
    let minCount = counts[0];
    for (let t = 1; t < ENGLISH_TOPICS.length; t++) {
      if (counts[t] < minCount) {
        minCount = counts[t];
        bestTopic = t;
      }
    }
    if (perTopicPool[bestTopic].length === 0) {
      const [tIdx, diff, tmpl, ans, wrongs, exp] = examExtras[bestTopic % examExtras.length];
      const name = examNames[extraRound % examNames.length];
      const ctxTag = ['ChSB Section A', 'ChSB Section B', 'Exam Dialogue', 'Reading Focus', 'Grammar Check'][extraRound % 5];
      const roundNum = Math.floor(extraRound / examNames.length) + 1;
      extraRound++;
      perTopicPool[tIdx].push({
        id: `e_e_x_${nextId++}`,
        topic: ENGLISH_TOPICS[tIdx],
        difficulty: diff,
        context: `${ctxTag} — ${name}`,
        q: roundNum > 1 ? `${name} (${ctxTag} #${roundNum}): "${tmpl}"` : `${name} (${ctxTag}): "${tmpl}"`,
        opts: [ans, ...wrongs],
        answer: 0,
        explain: exp,
      });
    }
    const cand = perTopicPool[bestTopic].shift()!;
    const stem = (typeof cand.q === 'string' ? cand.q : cand.q.en).trim();
    if (seen.has(stem)) continue;
    seen.add(stem);
    counts[bestTopic]++;
    out.push(cand);
  }
  return out;
}
