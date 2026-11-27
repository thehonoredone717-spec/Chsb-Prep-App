import { DifficultyLevel, QuestionItem } from '../types/quiz';

const SCIENCE_TOPICS = [
  '1. Variables',
  '2. Safety in the laboratory (including the use of laboratory tools)',
  '3. Molecules',
  '4. Ions',
  '5. Chemical bonding',
  '6. Simple and giant structures',
  '7. Properties of ionic and covalent compounds',
  '8. Minerals',
  '9. Photosynthesis',
  '10. Pathways of water and minerals',
  '11. Carbon cycle',
  '12. Trends in the periodic table',
  '13. Density',
] as const;

interface ScienceConcept {
  topicIdx: number;
  subject: string;
  testQ: string;
  testA: string;
  testD: [string, string, string];
  testExplain: string;
  examQ: string;
  examA: string;
  examD: [string, string, string];
  examExplain: string;
  diff: DifficultyLevel;
}

const SCIENCE_CONCEPTS: ScienceConcept[] = [
  // Topic 0: 1. Variables
  {
    topicIdx: 0, subject: 'Independent vs dependent variables',
    testQ: 'In a fair investigation, which variable is deliberately altered by the experimenter?',
    testA: 'The independent variable',
    testD: ['The dependent variable', 'A controlled variable', 'The anomalous result'],
    testExplain: 'The independent variable is the single factor chosen and changed by the investigator.',
    examQ: 'Which variable is measured as the outcome and usually plotted on the vertical y-axis?',
    examA: 'The dependent variable',
    examD: ['The independent variable', 'A control variable', 'The interval width'],
    examExplain: 'The dependent variable changes in response to the independent variable and goes on the y-axis.',
    diff: 'easy',
  },
  {
    topicIdx: 0, subject: 'Control variables and fair testing',
    testQ: 'Why must all other factors remain constant during a scientific investigation?',
    testA: 'To ensure a fair test where only the independent variable affects the outcome',
    testD: ['To increase the number of anomalous points', 'To avoid needing repeat readings', 'To convert continuous data into categories'],
    testExplain: 'Keeping controlled variables fixed isolates the effect of the independent variable.',
    examQ: 'A student tests how temperature affects enzyme speed while keeping pH and volume constant. What are pH and volume?',
    examA: 'Controlled variables',
    examD: ['Dependent variables', 'Independent variables', 'Qualitative errors'],
    examExplain: 'Factors intentionally kept equal across all trials are controlled variables.',
    diff: 'easy',
  },
  {
    topicIdx: 0, subject: 'Anomalous results & repeats',
    testQ: 'How should a clear anomalous reading be handled when calculating the mean of three trials?',
    testA: 'Exclude the anomaly and average the remaining concordant readings (then repeat if possible)',
    testD: ['Always multiply the anomaly by three', 'Replace it with zero in the mean', 'Alter the other readings to match it'],
    testExplain: 'Excluding identified anomalies prevents a single mistake from distorting the calculated mean.',
    examQ: 'Why do scientists take at least three repeat measurements at each value of the independent variable?',
    examA: 'To identify anomalous readings and calculate a more reliable mean',
    examD: ['To prove their original hypothesis without evidence', 'To reduce the resolution of the thermometer', 'To turn systematic error into categoric data'],
    examExplain: 'Repeat readings reveal outliers and improve the precision of the mean.',
    diff: 'medium',
  },
  {
    topicIdx: 0, subject: 'Categoric vs continuous data graphs',
    testQ: 'Which graph type is most appropriate when the independent variable is categoric (e.g. metal type)?',
    testA: 'A bar chart',
    testD: ['A line of best fit scatter graph', 'A meniscus chart', 'A Bunsen flame scale'],
    testExplain: 'Discrete/categoric independent variables are displayed using separate bars on a bar chart.',
    examQ: 'When both the independent and dependent variables are continuous numbers, what graph should be drawn?',
    examA: 'A line graph (with plotted points and a smooth line or curve of best fit)',
    examD: ['A pie chart with text labels', 'A bar chart with gaps', 'A step-only histogram'],
    examExplain: 'Continuous numerical relationships are plotted on x–y axes with a line/curve of best fit.',
    diff: 'medium',
  },

  // Topic 1: 2. Safety in the laboratory
  {
    topicIdx: 1, subject: 'Heating flammable liquids safely',
    testQ: 'Why should ethanol or other flammable solvents never be heated directly over a Bunsen burner flame?',
    testA: 'They can catch fire easily; a warm electric water bath should be used instead',
    testD: ['Glass beakers freeze in a blue flame', 'Ethanol dissolves safety goggles', 'Water baths evaporate all glass'],
    testExplain: 'Flammable vapours ignite near open flames; an electrically heated water bath removes the ignition risk.',
    examQ: 'Which method safely warms a test tube containing alcohol during leaf chlorophyll extraction?',
    examA: 'Turning off the Bunsen flame and placing the tube in a hot water bath',
    examD: ['Using the roaring blue flame directly under the rim', 'Pointing the open tube towards a partner', 'Sealing the tube tightly with a solid bung over direct heat'],
    examExplain: 'Eliminating naked flames prevents ethanol ignition while gently warming the sample.',
    diff: 'easy',
  },
  {
    topicIdx: 1, subject: 'Meniscus reading and glass tools',
    testQ: 'To measure 25 cm³ of acid accurately with a measuring cylinder, where should your eyes be positioned?',
    testA: 'Level with the bottom of the curved liquid meniscus',
    testD: ['Looking downwards from above the cylinder rim', 'Tilting the cylinder at 45 degrees', 'Reading the top edge against a warm flame'],
    testExplain: 'Reading the bottom of the meniscus at eye level avoids parallax error.',
    examQ: 'Which piece of laboratory apparatus measures mass to 0.01 g rather than liquid volume?',
    examA: 'An electronic top-pan balance',
    examD: ['A 50 cm³ burette', 'A conical flask', 'A glass stirring rod'],
    examExplain: 'An electronic balance measures mass in grams; burettes and cylinders measure volume.',
    diff: 'easy',
  },
  {
    topicIdx: 1, subject: 'Fume cupboards and corrosive reagents',
    testQ: 'Why are experiments that release toxic chlorine or ammonia gas performed inside a fume cupboard?',
    testA: 'The extractor draws harmful gases away from the laboratory air safely',
    testD: ['It concentrates heat so acids boil twice as fast', 'It replaces the need for safety goggles', 'It neutralises solids without water'],
    testExplain: 'A fume cupboard vents hazardous fumes out of the breathing zone.',
    examQ: 'When diluting a concentrated acid with water, why are safety goggles and lab gloves essential?',
    examA: 'They protect eyes and skin from corrosive splashes',
    examD: ['They prevent water from freezing in the beaker', 'They make the reaction exothermic', 'They filter out insoluble salts'],
    examExplain: 'Corrosive acids burn skin and damage eyes upon contact.',
    diff: 'medium',
  },

  // Topic 2: 3. Molecules
  {
    topicIdx: 2, subject: 'Definition of a molecule',
    testQ: 'What defines a simple covalent molecule such as H₂O or CO₂?',
    testA: 'Two or more non-metal atoms chemically joined by shared pairs of electrons',
    testD: ['A giant lattice of positive metal ions in a sea of electrons', 'Oppositely charged ions stacked in crystals', 'A single noble gas atom that never bonds'],
    testExplain: 'Molecules consist of a fixed small group of non-metal atoms held together by covalent bonds.',
    examQ: 'Which substance in the following list exists naturally as diatomic molecules?',
    examA: 'Oxygen gas (O₂) and nitrogen gas (N₂)',
    examD: ['Sodium chloride (NaCl)', 'Pure copper metal (Cu)', 'Argon gas (Ar)'],
    examExplain: 'Hydrogen, oxygen, nitrogen, and halogens form stable two-atom (diatomic) covalent molecules.',
    diff: 'easy',
  },
  {
    topicIdx: 2, subject: 'Counting atoms in molecular formulae',
    testQ: 'How many total atoms are present in one molecule of methane, CH₄?',
    testA: '5 atoms (1 carbon atom and 4 hydrogen atoms)',
    testD: ['4 atoms total', '2 atoms total', '8 atoms total'],
    testExplain: 'CH₄ contains 1 C + 4 H = 5 bonded atoms.',
    examQ: 'Which formula represents an ammonia molecule containing one nitrogen atom and three hydrogen atoms?',
    examA: 'NH₃',
    examD: ['N₃H', 'NH₄⁺', 'NO₃'],
    examExplain: 'Ammonia consists of one N atom covalently bonded to three H atoms: NH₃.',
    diff: 'easy',
  },
  {
    topicIdx: 2, subject: 'Elements vs compounds as molecules',
    testQ: 'How does an oxygen molecule (O₂) differ from a carbon dioxide molecule (CO₂)?',
    testA: 'O₂ is a molecular element (identical atoms), while CO₂ is a molecular compound (two elements)',
    testD: ['O₂ has ionic bonds while CO₂ is metallic', 'CO₂ contains metal ions', 'O₂ cannot exist at room temperature'],
    testExplain: 'Elements have one type of atom (O₂); compounds have two or more different elements chemically combined (CO₂).',
    examQ: 'Why is Cl₂ classified as an element whereas HCl is classified as a compound?',
    examA: 'Cl₂ contains only chlorine atoms, while HCl has hydrogen and chlorine atoms bonded together',
    examD: ['HCl is a solid lattice', 'Cl₂ carries a negative ionic charge', 'HCl cannot form molecules'],
    examExplain: 'A compound contains atoms of at least two different elements chemically joined.',
    diff: 'medium',
  },

  // Topic 3: 4. Ions
  {
    topicIdx: 3, subject: 'Cation and anion formation',
    testQ: 'What happens to a neutral sodium atom (Na, 11 protons, 2.8.1) when it forms a Na⁺ ion?',
    testA: 'It loses 1 outer-shell electron while keeping 11 protons',
    testD: ['It gains 1 proton into its nucleus', 'It loses 1 neutron from the nucleus', 'It gains 7 protons from chlorine'],
    testExplain: 'Metals lose outer electrons to attain a full shell; losing one negative electron gives a +1 charge.',
    examQ: 'Why does a chloride ion (Cl⁻) carry a single negative charge?',
    examA: 'A chlorine atom (2.8.7) gained 1 outer electron, giving 18 electrons and 17 protons',
    examD: ['It lost 1 proton from its nucleus', 'It shared a pair of electrons equally', 'It lost 7 outer electrons'],
    examExplain: 'Gaining 1 electron gives 17 protons (+) and 18 electrons (−), a net charge of −1.',
    diff: 'easy',
  },
  {
    topicIdx: 3, subject: 'Group 2 and Group 6 ion charges',
    testQ: 'Magnesium is in Group 2 (configuration 2.8.2). What ion does it form?',
    testA: 'Mg²⁺ (losing 2 outer electrons)',
    testD: ['Mg²⁻ (gaining 2 electrons)', 'Mg⁺ (losing 1 electron)', 'Mg⁶⁺ (losing 6 electrons)'],
    testExplain: 'Group 2 metals lose two valence electrons to form 2+ cations.',
    examQ: 'Oxygen has electronic structure 2.6. Which stable oxide ion does it form?',
    examA: 'O²⁻ (by gaining 2 electrons to complete its outer shell)',
    examD: ['O²⁺ (by losing 2 electrons)', 'O⁻ (by gaining 1 electron)', 'O⁶⁺ (by losing 6 electrons)'],
    examExplain: 'Non-metals with 6 outer electrons gain 2 electrons to reach a stable octet (2.8), forming a 2− anion.',
    diff: 'medium',
  },
  {
    topicIdx: 3, subject: 'Protons stay unchanged during ionisation',
    testQ: 'If a calcium atom (20 protons) becomes Ca²⁺, how many protons and electrons does it now have?',
    testA: '20 protons and 18 electrons',
    testD: ['18 protons and 20 electrons', '22 protons and 20 electrons', '20 protons and 22 electrons'],
    testExplain: 'Chemical reactions never alter nuclear protons; Ca²⁺ has lost two electrons (20 − 2 = 18).',
    examQ: 'An ion has 9 protons, 10 neutrons, and 10 electrons. Identify its overall charge.',
    examA: '1− (a fluoride ion, F⁻)',
    examD: ['1+ (a sodium ion)', '0 (a neutral neon atom)', '2− (an oxide ion)'],
    examExplain: '9 positive protons + 10 negative electrons = net charge of −1.',
    diff: 'hard',
  },

  // Topic 4: 5. Chemical bonding
  {
    topicIdx: 4, subject: 'Ionic vs covalent electron behaviour',
    testQ: 'How are atoms held together in an ionic compound such as sodium chloride (NaCl)?',
    testA: 'Strong electrostatic attraction between oppositely charged Na⁺ and Cl⁻ ions after electron transfer',
    testD: ['Equal sharing of outer electron pairs between two metals', 'Weak intermolecular attractions only', 'Magnetic attraction between neutrons'],
    testExplain: 'Ionic bonding transfers electrons from metal to non-metal, forming + and − ions that attract strongly.',
    examQ: 'In a covalent bond between two hydrogen atoms (H₂), what forms the chemical bond?',
    examA: 'A shared pair of outer-shell electrons attracted to both nuclei',
    examD: ['Transfer of one electron from one hydrogen atom to the other', 'A lattice of free delocalised metal cations', 'Gravity between hydrogen atoms'],
    examExplain: 'Non-metal atoms share pairs of electrons to fill their valence shells.',
    diff: 'easy',
  },
  {
    topicIdx: 4, subject: 'Formulae from ionic charges',
    testQ: 'What is the balanced chemical formula of magnesium chloride formed from Mg²⁺ and Cl⁻ ions?',
    testA: 'MgCl₂',
    testD: ['MgCl', 'Mg₂Cl', 'Mg₂Cl₂'],
    testExplain: 'One Mg²⁺ ion balances two Cl⁻ ions so the total net charge is zero.',
    examQ: 'Sodium (Na⁺) reacts with oxygen (O²⁻) to make sodium oxide. What is its correct formula?',
    examA: 'Na₂O',
    examD: ['NaO', 'NaO₂', 'Na₂O₂'],
    examExplain: 'Two Na⁺ ions (+2) are needed to balance one O²⁻ ion (−2).',
    diff: 'medium',
  },
  {
    topicIdx: 4, subject: 'Double covalent bonds',
    testQ: 'In carbon dioxide (O=C=O), how many pairs of electrons are shared between the carbon atom and each oxygen atom?',
    testA: 'Two pairs of electrons (a double covalent bond on each side)',
    testD: ['One pair in total across the whole molecule', 'Four pairs per hydrogen bond', 'Zero shared pairs because CO₂ is ionic'],
    testExplain: 'Each C=O bond shares 2 electron pairs (4 electrons) so every atom achieves a full outer shell of 8.',
    examQ: 'Why does an oxygen molecule (O₂) form a double covalent bond (O=O)?',
    examA: 'Each oxygen atom (2.6) needs 2 more electrons, so they share 2 pairs together',
    examD: ['Oxygen is a Group 2 metal', 'Each atom transfers 6 electrons to nitrogen', 'Electrons cannot form single bonds'],
    examExplain: 'Sharing two pairs fills both outer shells to 8 electrons.',
    diff: 'hard',
  },

  // Topic 5: 6. Simple and giant structures
  {
    topicIdx: 5, subject: 'Diamond vs graphite giant covalent',
    testQ: 'Why does graphite conduct electricity whereas diamond does not?',
    testA: 'In graphite each carbon forms 3 bonds leaving delocalised electrons free to move along layers; diamond uses all 4 outer electrons in bonds',
    testD: ['Diamond is made of ionic sodium salts', 'Graphite melts below 0°C into ions', 'Diamond layers slide over weak forces'],
    testExplain: 'Graphite has free moving electrons between hexagonal carbon sheets; diamond’s tetrahedral network locks every electron.',
    examQ: 'Which structural feature makes graphite soft and slippery enough for pencil leads and lubricants?',
    examA: 'Flat hexagonal layers held together by weak forces that easily slide over each other',
    examD: ['Rigid 3D tetrahedral covalent bonds in every direction', 'Weak attractions between discrete C₆₀ molecules only', 'Free metal ions sliding across copper crystals'],
    examExplain: 'Layers of bonded carbon atoms slip easily because interlayer forces are weak.',
    diff: 'medium',
  },
  {
    topicIdx: 5, subject: 'Simple molecular structures',
    testQ: 'Why do simple molecular substances like methane (CH₄) and CO₂ have very low boiling points?',
    testA: 'The intermolecular forces between molecules are weak and take little heat energy to overcome',
    testD: ['Covalent bonds inside CH₄ molecules snap at −160°C', 'Methane contains sodium ions', 'CO₂ has a giant tetrahedral lattice'],
    testExplain: 'Boiling separates molecules from one another; strong internal covalent bonds do NOT break.',
    examQ: 'Compare the bonding in a giant ionic lattice (NaCl) and a simple molecular substance (H₂O): why is NaCl solid at 20°C?',
    examA: 'Na⁺ and Cl⁻ ions are held in a huge 3D crystal by strong electrostatic attractions throughout',
    examD: ['NaCl molecules are lighter than water molecules', 'Water has stronger ionic bonds than salt', 'Salt contains no electrostatic forces'],
    examExplain: 'Breaking a giant ionic lattice requires a massive amount of thermal energy.',
    diff: 'easy',
  },

  // Topic 6: 7. Properties of ionic and covalent compounds
  {
    topicIdx: 6, subject: 'Electrical conductivity of NaCl',
    testQ: 'Solid sodium chloride does NOT conduct electricity, yet molten or dissolved NaCl does. Why?',
    testA: 'In a solid lattice ions vibrate in fixed positions; when melted or dissolved, ions are free to move and carry charge',
    testD: ['Water adds free protons to NaCl crystals', 'Melting turns sodium into pure copper', 'Solid NaCl consists of covalent molecules'],
    testExplain: 'Electrical conduction requires mobile charged particles (ions or delocalised electrons).',
    examQ: 'Why does distilled pure sugar (glucose, covalent) dissolved in pure water fail to light a bulb in a conductivity test?',
    examA: 'Covalent sugar molecules are electrically neutral and form no mobile ions in solution',
    examD: ['Sugar absorbs electricity into chloroplasts', 'Glucose precipitates as metal copper', 'Water freezes around neutral sugar'],
    examExplain: 'Without free ions or delocalised electrons, aqueous simple covalent solutions do not conduct.',
    diff: 'medium',
  },
  {
    topicIdx: 6, subject: 'Melting points comparison',
    testQ: 'A white crystalline solid melts at 801°C and conducts when dissolved in water. What type of bonding does it have?',
    testA: 'Ionic bonding in a giant ionic lattice',
    testD: ['Simple covalent molecular', 'Monatomic noble gas', 'Low-melting molecular wax'],
    testExplain: 'High melting point + aqueous conductivity is classic behaviour of an ionic compound.',
    examQ: 'Substance X melts at −78°C and is a poor conductor in all states. Identify X’s likely structure.',
    examA: 'Simple covalent molecular structure',
    examD: ['Giant ionic lattice', 'Giant covalent diamond network', 'Metallic lattice'],
    examExplain: 'Very low melting point and zero electrical conductivity indicate a simple molecular substance.',
    diff: 'easy',
  },

  // Topic 7: 8. Minerals
  {
    topicIdx: 7, subject: 'Nitrate & magnesium deficiencies',
    testQ: 'A farmer notices her tomato plants have yellow lower leaves even in bright sunlight. Which mineral ion is most likely lacking?',
    testA: 'Magnesium ions (Mg²⁺), needed to build green chlorophyll',
    testD: ['Carbon dioxide from air', 'Nitrogen gas in the xylem', 'Starch grains inside the cuticle'],
    testExplain: 'Chlorophyll molecules require magnesium; magnesium deficiency causes yellowing (chlorosis).',
    examQ: 'Why do plants with nitrate ion (NO₃⁻) deficiency show weak, stunted stems and tiny leaves?',
    examA: 'Nitrates supply nitrogen needed to synthesise amino acids and proteins for new cell growth',
    examD: ['Nitrates are burned directly inside stomata for heat', 'Nitrates coat the waxy cuticle to block sunlight', 'Nitrates are the sole gas released during respiration'],
    examExplain: 'Proteins built from amino acids require nitrogen absorbed via root nitrate ions.',
    diff: 'easy',
  },
  {
    topicIdx: 7, subject: 'Active mineral uptake by root hairs',
    testQ: 'Through which plant structure are nitrate and magnesium ions absorbed from soil water?',
    testA: 'Root hair cells (with extended surface area)',
    testD: ['Leaf waxy cuticle', 'Upper epidermis guard cells', 'Xylem lignified bark rings'],
    testExplain: 'Root hair projections maximise surface contact with soil water and dissolved mineral salts.',
    examQ: 'In what form do crop plants absorb the element nitrogen from moist fertile soil?',
    examA: 'As dissolved nitrate ions (NO₃⁻), NOT as nitrogen gas from air',
    examD: ['As pure liquid nitrogen through stomata', 'As solid diamond crystals in root bark', 'As glucose transported down from phloem'],
    examExplain: 'Atmospheric N₂ is unreactive for plant roots; soil nitrate ions dissolve in soil water.',
    diff: 'medium',
  },

  // Topic 8: 9. Photosynthesis
  {
    topicIdx: 8, subject: 'Word equation & chloroplasts',
    testQ: 'State the accurate word equation for photosynthesis inside green leaves.',
    testA: 'carbon dioxide + water → glucose + oxygen (using light and chlorophyll)',
    testD: ['glucose + oxygen → carbon dioxide + water', 'nitrogen + water → starch + ozone', 'oxygen + glucose → light + water'],
    testExplain: 'Plants convert inorganic CO₂ and water into glucose and oxygen using trapped light energy.',
    examQ: 'Which palisade cell organelle traps sunlight energy and where are most of these organelles concentrated in a leaf?',
    examA: 'Chloroplasts (containing chlorophyll), packed tightly in the palisade mesophyll layer near the upper surface',
    examD: ['Vacuoles inside the root hair tip', 'Ribosomes inside non-living xylem tubes', 'Nuclei inside the outer waxy cuticle'],
    examExplain: 'Palisade cells sit near the top of the leaf to catch maximum light inside numerous chloroplasts.',
    diff: 'easy',
  },
  {
    topicIdx: 8, subject: 'Limiting factors & starch test',
    testQ: 'When testing a green leaf for starch using iodine solution after boiling in water and ethanol, what colour confirms photosynthesis occurred?',
    testA: 'Blue-black',
    testD: ['Brick red precipitate', 'Bright orange-brown', 'Milky cloudy white'],
    testExplain: 'Iodine turns from yellow-brown to blue-black when starch is present.',
    examQ: 'At 25°C and high CO₂, an aquatic Elodea plant’s oxygen bubble rate levels off as a lamp moves even closer. Why?',
    examA: 'Light intensity is no longer the limiting factor; CO₂ concentration or temperature is limiting the rate',
    examD: ['Chlorophyll dissolves at bright light levels', 'The plant switched from photosynthesis to freezing', 'Stomata closed underwater completely'],
    examExplain: 'Once a plateau is reached, increasing that factor further cannot speed photosynthesis until another limiting factor rises.',
    diff: 'hard',
  },

  // Topic 9: 10. Pathways of water and minerals
  {
    topicIdx: 9, subject: 'Xylem vs phloem',
    testQ: 'Which specialised plant tissue transports water and dissolved mineral ions upwards from roots to leaves?',
    testA: 'Xylem vessels',
    testD: ['Phloem sieve tubes', 'Palisade mesophyll cells', 'Root cap epidermis'],
    testExplain: 'Hollow lignified xylem vessels carry the transpiration stream upward from roots to shoots.',
    examQ: 'Compare xylem and phloem transport: what is the main role of phloem vessels?',
    examA: 'Translocating dissolved sugars (sucrose) from leaves to growing buds, fruits, and roots',
    examD: ['Pumping solid sand particles to stomata', 'Pulling oxygen gas downward from air', 'Absorbing wax for the outer cuticle'],
    examExplain: 'Phloem carries organic food sugars made in photosynthesis throughout the plant.',
    diff: 'easy',
  },
  {
    topicIdx: 9, subject: 'Transpiration and stomata',
    testQ: 'On a hot, dry, windy afternoon, why does a leafy potted plant lose water faster (higher transpiration)?',
    testA: 'Wind sweeps humid air away, heat raises evaporation, and dry air steepens the diffusion gradient out of stomata',
    testD: ['Warm wind forces xylem water downward into soil', 'Stomata close irreversibly during bright sun', 'Root hairs turn into waxy bark'],
    testExplain: 'High temperature, dry air, and airflow accelerate water vapour diffusion through open stomata.',
    examQ: 'Which cells surround each stomatal pore on the underside of a leaf to open and close it?',
    examA: 'Guard cells',
    examD: ['Palisade cells', 'Xylem rings', 'Root hairs'],
    examExplain: 'Guard cells swell or shrink with water pressure to regulate gas exchange and water loss.',
    diff: 'medium',
  },

  // Topic 10: 11. Carbon cycle
  {
    topicIdx: 10, subject: 'Processes adding/removing CO₂',
    testQ: 'Which biological process is the ONLY major natural pathway in the carbon cycle that removes CO₂ from the atmosphere into living biomass?',
    testA: 'Photosynthesis',
    testD: ['Cellular respiration', 'Fossil fuel combustion', 'Bacterial decomposition'],
    testExplain: 'Green plants, algae, and photosynthetic bacteria fix atmospheric CO₂ into carbohydrates.',
    examQ: 'How do saprotrophic bacteria and fungi return carbon from dead leaves and animal waste back to the air?',
    examA: 'They decompose organic carbon compounds and release CO₂ via their own cellular respiration',
    examD: ['They convert dead leaves into fossil oil overnight', 'They absorb atmospheric CO₂ to shine in sunlight', 'They lock wood permanently inside solid iron'],
    examExplain: 'Decomposers break down dead matter and respire, returning carbon as CO₂.',
    diff: 'easy',
  },
  {
    topicIdx: 10, subject: 'Hydrogencarbonate indicator',
    testQ: 'A sealed tube with pondweed and red hydrogencarbonate indicator sits in bright sunlight for 2 hours. What colour does the indicator turn?',
    testA: 'Purple, because photosynthesis removes dissolved CO₂ below atmospheric levels',
    testD: ['Bright yellow, because CO₂ tripled', 'Remains crimson without any change', 'Turns blue-black due to glucose'],
    testExplain: 'Hydrogencarbonate indicator shifts red → purple as CO₂ drops, and red → yellow as CO₂ rises.',
    examQ: 'In a dark cupboard wrapped in foil, a respiring snail inside red hydrogencarbonate indicator turns the liquid:',
    examA: 'Yellow, because respiration increases dissolved CO₂ acidity',
    examD: ['Purple, because snails photosynthesise in darkness', 'Green, because oxygen bubbles form', 'Colourless due to wax absorption'],
    examExplain: 'Respiration emits CO₂, forming weak carbonic acid that turns the indicator yellow.',
    diff: 'medium',
  },

  // Topic 11: 12. Trends in the periodic table
  {
    topicIdx: 11, subject: 'Group 1 alkali metals reactivity trend',
    testQ: 'Moving down Group 1 from lithium (Li) to potassium (K), how does chemical reactivity with water change?',
    testA: 'Reactivity increases markedly because the outer electron is further from the nucleus and lost more easily',
    testD: ['Reactivity decreases because atoms become denser solids', 'Potassium never reacts with cold water', 'Lithium explodes faster than rubidium'],
    testExplain: 'More electron shells increase atomic radius and shielding, reducing nuclear pull on the single outer electron.',
    examQ: 'Potassium reacts vigorously with cold water, darting on the surface with a lilac flame. Which two products form?',
    examA: 'Potassium hydroxide (alkaline solution) and hydrogen gas',
    examD: ['Potassium oxide and oxygen gas', 'Potassium chloride and chlorine gas', 'Pure potassium salt and carbon dioxide'],
    examExplain: 'Group 1 metal + water → metal hydroxide + hydrogen gas (2K + 2H₂O → 2KOH + H₂).',
    diff: 'easy',
  },
  {
    topicIdx: 11, subject: 'Atomic number vs mass number',
    testQ: 'An atom of fluorine is written as ¹⁹₉F. How many neutrons are inside its nucleus?',
    testA: '10 neutrons (19 − 9 = 10)',
    testD: ['9 neutrons', '19 neutrons', '28 neutrons'],
    testExplain: 'Neutrons = Mass number − Atomic (proton) number = 19 − 9 = 10.',
    examQ: 'Element X has electron shell configuration 2,8,5. Which Period and Group does X occupy in the Periodic Table?',
    examA: 'Period 3 (3 shells) and Group 5 (5 outer electrons)',
    examD: ['Period 5 and Group 3', 'Period 2 and Group 8', 'Period 3 and Group 1'],
    examExplain: 'Number of occupied shells equals the Period; number of outer electrons gives the Group.',
    diff: 'medium',
  },

  // Topic 12: 13. Density
  {
    topicIdx: 12, subject: 'Density floating/sinking rule',
    testQ: 'Pure liquid water has a density of 1.00 g/cm³. Which object will float on pure water?',
    testA: 'A pinewood block with density 0.65 g/cm³',
    testD: ['An iron bolt of density 7.8 g/cm³', 'A granite pebble of density 2.7 g/cm³', 'Liquid mercury of density 13.6 g/cm³'],
    testExplain: 'Objects or liquids with a density lower than the fluid they sit in float.',
    examQ: 'An irregular brass ornament displaces water from 40 cm³ to 65 cm³ in a measuring cylinder and has mass 210 g. Calculate its density.',
    examA: '8.4 g/cm³',
    examD: ['5.25 g/cm³', '3.23 g/cm³', '25 g/cm³'],
    examExplain: 'Volume = 65 − 40 = 25 cm³; Density = 210 ÷ 25 = 8.4 g/cm³.',
    diff: 'easy',
  },
];

// Quantitative parameterized Science problems ensuring 100% unique Test and Exam banks (>= 38 per topic in both)
function buildParametricScience(
  topicIdx: number,
  k: number,
  bank: 'test' | 'exam',
  id: string
): QuestionItem {
  const topic = SCIENCE_TOPICS[topicIdx];
  const diffs: DifficultyLevel[] = ['easy', 'medium', 'hard'];
  const diff = diffs[k % 3];
  const seq = bank === 'test' ? k + 1 : k + 80;

  switch (topicIdx) {
    // 0: Variables (mean / interval / experimental scenarios)
    case 0: {
      const trials = [
        [20 + (seq % 7), 22 + (seq % 7), 21 + (seq % 7)],
        [14 + (seq % 5), 16 + (seq % 5), 15 + (seq % 5)],
      ];
      const [a, b, c] = trials[seq % 2];
      const anomaly = a + 35;
      const mean = ((a + b + c) / 3).toFixed(1).replace(/\.0$/, '');
      if (bank === 'test') {
        return {
          id, topic, difficulty: diff,
          q: `A student measures reaction times as ${a} s, ${b} s, ${c} s, and an anomalous ${anomaly} s while varying acid temperature (${15 + seq}°C). What is the true mean after discarding the anomaly?`,
          opts: [`${mean} s`, `${((a + b + c + anomaly) / 4).toFixed(1)} s`, `${anomaly} s`, `${(a + b).toFixed(1)} s`],
          answer: 0,
          explain: `Discard ${anomaly} s as an anomaly, then average the three consistent trials: (${a} + ${b} + ${c}) ÷ 3 = ${mean} s.`,
        };
      }
      const step = (seq % 4) + 5;
      return {
        id, topic, difficulty: diff,
        q: `In a seed germination study across salt solutions from ${seq * 2}% to ${seq * 2 + step * 4}% at equal intervals of ${step}%, what must be kept as a controlled variable?`,
        opts: [
          'Light exposure, temperature, water volume, and seed species',
          'The salt concentration step size alone',
          'Measuring the sprout length after different numbers of days per dish',
          'Using hot water for high salt and ice water for low salt',
        ],
        answer: 0,
        explain: `A fair test varies only salt concentration (${step}% steps) while keeping light, heat, seed type, and volume equal.`,
      };
    }

    // 1: Lab safety & tools
    case 1: {
      const startVol = 20 + (seq % 25);
      const endVol = startVol + (seq % 14) + 6;
      const diffVol = endVol - startVol;
      if (bank === 'test') {
        return {
          id, topic, difficulty: diff,
          q: `Before submerging a pebble, a measuring cylinder reads ${startVol} cm³ at the bottom of the meniscus. After dropping the pebble in, it reads ${endVol} cm³. What is the pebble’s volume?`,
          opts: [`${diffVol} cm³`, `${startVol + endVol} cm³`, `${endVol} cm³`, `${diffVol + 10} cm³`],
          answer: 0,
          explain: `Displaced volume = final reading (${endVol} cm³) − initial reading (${startVol} cm³) = ${diffVol} cm³.`,
        };
      }
      const mass1 = 42 + (seq % 19);
      const mass2 = mass1 + 12 + (seq % 11);
      return {
        id, topic, difficulty: diff,
        q: `An empty beaker weighs ${mass1} g on a balance. With distilled water added, the total mass is ${mass2} g. What mass of distilled water was poured in?`,
        opts: [`${mass2 - mass1} g`, `${mass1 + mass2} g`, `${mass2} g`, `${mass1} g`],
        answer: 0,
        explain: `Subtract the beaker’s mass: ${mass2} g − ${mass1} g = ${mass2 - mass1} g (and distilled water avoids tap-water mineral impurities).`,
      };
    }

    // 2: Molecules
    case 2: {
      const formulae: Array<[string, string, number, string]> = [
        ['H₂SO₄', 'sulfuric acid', 7, '2 H + 1 S + 4 O = 7 atoms'],
        ['C₂H₅OH', 'ethanol', 9, '2 C + 6 H + 1 O = 9 atoms'],
        ['CH₃COOH', 'ethanoic acid', 8, '2 C + 4 H + 2 O = 8 atoms'],
        ['N₂O₄', 'dinitrogen tetroxide', 6, '2 N + 4 O = 6 atoms'],
        ['PCl₅', 'phosphorus pentachloride', 6, '1 P + 5 Cl = 6 atoms'],
        ['C₃H₈', 'propane', 11, '3 C + 8 H = 11 atoms'],
        ['SF₆', 'sulfur hexafluoride', 7, '1 S + 6 F = 7 atoms'],
        ['C₆H₁₂O₆', 'glucose', 24, '6 C + 12 H + 6 O = 24 atoms'],
        ['HNO₃', 'nitric acid', 5, '1 H + 1 N + 3 O = 5 atoms'],
        ['SO₃', 'sulfur trioxide', 4, '1 S + 3 O = 4 atoms'],
        ['CHCl₃', 'trichloromethane', 5, '1 C + 1 H + 3 Cl = 5 atoms'],
        ['C₄H₁₀', 'butane', 14, '4 C + 10 H = 14 atoms'],
      ];
      const [form, name, count, reason] = formulae[seq % formulae.length];
      const mult = Math.floor(seq / formulae.length) + 1;
      if (bank === 'test') {
        const total = count * mult;
        return {
          id, topic, difficulty: diff,
          q: mult === 1
            ? `How many total atoms are bonded together inside a single molecule of ${name} (${form})?`
            : `Calculate the total number of atoms contained in ${mult} separate molecules of ${name} (${mult} × ${form}).`,
          opts: [`${total} atoms`, `${total + 2} atoms`, `${Math.max(1, total - 1)} atoms`, `${total + mult * 3} atoms`],
          answer: 0,
          explain: `${reason}. Across ${mult} molecule(s), total atoms = ${mult} × ${count} = ${total}.`,
        };
      }
      const totalE = count * (mult + 1);
      return {
        id, topic, difficulty: diff,
        q: `Consider a sample containing ${mult + 1} molecules of ${name} (${form}). What is the total atom count in that sample?`,
        opts: [`${totalE} atoms`, `${count} atoms`, `${totalE + 4} atoms`, `${Math.max(2, totalE - 2)} atoms`],
        answer: 0,
        explain: `One molecule of ${form} has ${count} atoms (${reason}), so ${mult + 1} molecules contain ${totalE} atoms.`,
      };
    }

    // 3: Ions
    case 3: {
      const ionTable: Array<[string, number, string, number, number]> = [
        ['Lithium', 3, 'Li⁺', 2, 1],
        ['Beryllium', 4, 'Be²⁺', 2, 2],
        ['Nitride', 7, 'N³⁻', 10, -3],
        ['Oxide', 8, 'O²⁻', 10, -2],
        ['Fluoride', 9, 'F⁻', 10, -1],
        ['Sodium', 11, 'Na⁺', 10, 1],
        ['Magnesium', 12, 'Mg²⁺', 10, 2],
        ['Aluminium', 13, 'Al³⁺', 10, 3],
        ['Phosphide', 15, 'P³⁻', 18, -3],
        ['Sulfide', 16, 'S²⁻', 18, -2],
        ['Chloride', 17, 'Cl⁻', 18, -1],
        ['Potassium', 19, 'K⁺', 18, 1],
        ['Calcium', 20, 'Ca²⁺', 18, 2],
      ];
      const [name, p, sym, e, chg] = ionTable[seq % ionTable.length];
      const variantType = Math.floor(seq / ionTable.length) % 3;
      if (bank === 'test') {
        const prefix = variantType === 0 ? 'Determine electron count:' : variantType === 1 ? 'Atomic particle check:' : 'Ion structure analysis:';
        return {
          id, topic, difficulty: diff,
          q: `${prefix} A ${name.toLowerCase()} ion (${sym}) has ${p} protons. How many electrons surround its nucleus?`,
          opts: [`${e} electrons`, `${p} electrons`, `${e + 2} electrons`, `${Math.max(1, e - 3)} electrons`],
          answer: 0,
          explain: `${sym} has ${p} protons and charge ${chg > 0 ? `+${chg}` : chg}, meaning electrons = ${p} − (${chg}) = ${e}.`,
        };
      }
      const modeLabel = variantType === 0 ? 'Identify ion charge:' : variantType === 1 ? 'Exam analysis:' : 'Charge calculation:';
      const chargeStr = chg > 0 ? `+${chg}` : `${chg}`;
      return {
        id, topic, difficulty: diff,
        q: `${modeLabel} An ion of ${name} contains ${p} protons and ${e} electrons. What is its net electric charge and symbol?`,
        opts: [`${chargeStr} (${sym})`, `${chg > 0 ? `−${chg}` : `+${Math.abs(chg)}`} opposite`, `0 (neutral atom)`, `${chargeStr}2`],
        answer: 0,
        explain: `Net charge = protons − electrons = ${p} − ${e} = ${chargeStr}, corresponding to ${sym}.`,
      };
    }

    // 4: Chemical bonding
    case 4: {
      const pairs: Array<[string, string, string, string, string]> = [
        ['Li⁺', 'F⁻', 'LiF', 'Lithium fluoride', '1 Li⁺ balances 1 F⁻'],
        ['K⁺', 'Cl⁻', 'KCl', 'Potassium chloride', '1 K⁺ balances 1 Cl⁻'],
        ['Ca²⁺', 'O²⁻', 'CaO', 'Calcium oxide', '1 Ca²⁺ balances 1 O²⁻'],
        ['Mg²⁺', 'O²⁻', 'MgO', 'Magnesium oxide', '1 Mg²⁺ balances 1 O²⁻'],
        ['Ca²⁺', 'Cl⁻', 'CaCl₂', 'Calcium chloride', '1 Ca²⁺ balances 2 Cl⁻'],
        ['Mg²⁺', 'Br⁻', 'MgBr₂', 'Magnesium bromide', '1 Mg²⁺ balances 2 Br⁻'],
        ['K⁺', 'S²⁻', 'K₂S', 'Potassium sulfide', '2 K⁺ balance 1 S²⁻'],
        ['Li⁺', 'O²⁻', 'Li₂O', 'Lithium oxide', '2 Li⁺ balance 1 O²⁻'],
        ['Al³⁺', 'Cl⁻', 'AlCl₃', 'Aluminium chloride', '1 Al³⁺ balances 3 Cl⁻'],
        ['Al³⁺', 'O²⁻', 'Al₂O₃', 'Aluminium oxide', '2 Al³⁺ (+6) balance 3 O²⁻ (−6)'],
        ['Na⁺', 'N³⁻', 'Na₃N', 'Sodium nitride', '3 Na⁺ balance 1 N³⁻'],
        ['Ba²⁺', 'F⁻', 'BaF₂', 'Barium fluoride', '1 Ba²⁺ balances 2 F⁻'],
      ];
      const [cat, an, formula, cname, exp] = pairs[seq % pairs.length];
      const style = Math.floor(seq / pairs.length) % 3;
      if (bank === 'test') {
        const stems = [
          `Deduce the empirical formula of ${cname} formed from ${cat} and ${an} ions.`,
          `Combine ${cat} cations with ${an} anions to give a neutral ionic compound (${cname}).`,
          `Which neutral formula correctly represents the ionic salt made from ${cat} and ${an}?`,
        ];
        return {
          id, topic, difficulty: diff,
          q: stems[style],
          opts: [formula, `${formula}₃`, formula.replace(/[₂₃]/g, '') + '₂', `${an.slice(0, 1)}${cat.slice(0, 1)}`],
          answer: 0,
          explain: `${cname}: ${exp}, yielding ${formula}.`,
        };
      }
      const examStems = [
        `An ionic crystal is built from ${cat} and ${an}. Identify its electrically neutral formula.`,
        `Predict the formula when metal ion ${cat} reacts completely with non-metal ion ${an}.`,
        `Exam bonding task: Match ions ${cat} + ${an} to their correct compound formula (${cname}).`,
      ];
      return {
        id, topic, difficulty: diff,
        q: examStems[style],
        opts: [formula, `${cat.slice(0, 1)}₂${an.slice(0, 1)}₃`, `${cat.slice(0, 1)}${an.slice(0, 1)}₄`, `${formula}⁺`],
        answer: 0,
        explain: `Total positive and negative charges must sum to zero: ${exp} → ${formula}.`,
      };
    }

    // 5: Simple and giant structures
    case 5: {
      const subst: Array<[string, string, string, string]> = [
        ['Chlorine (Cl₂)', 'Simple covalent molecule', 'Weak intermolecular forces break easily when warmed', 'High metallic conductivity'],
        ['Silicon dioxide / quartz (SiO₂)', 'Giant covalent lattice', 'Millions of strong Si–O covalent bonds extend throughout the crystal', 'Discrete tiny molecules held by water'],
        ['Potassium bromide (KBr)', 'Giant ionic lattice', 'Strong electrostatic attraction between alternating K⁺ and Br⁻ ions', 'Pairs of covalent atoms with zero charge'],
        ['Ammonia (NH₃)', 'Simple covalent molecule', 'Weak attractions between individual NH₃ molecules lead to low boiling point', '3D giant lattice of nitrogen ions'],
        ['Diamond (C)', 'Giant covalent structure', 'Every carbon bonds strongly to 4 neighbours in a rigid tetrahedron', 'Layers slide with free electrons'],
        ['Graphite (C)', 'Layered giant covalent lattice', 'Hexagonal carbon sheets contain delocalised electrons able to conduct charge', 'Free positive metal cations in rows'],
        ['Sulfur hexafluoride (SF₆)', 'Simple covalent molecule', 'Minimal forces between neutral SF₆ molecules yield a low boiling point', 'Giant metallic crystal of sulfur'],
        ['Calcium chloride (CaCl₂)', 'Giant ionic crystal', 'Oppositely charged Ca²⁺ and Cl⁻ ions lock tightly at room temperature', 'Gas of diatomic covalent pairs'],
      ];
      const [name, structType, reason, wrongReason] = subst[seq % subst.length];
      const round = Math.floor(seq / subst.length) % 4;
      if (bank === 'test') {
        const frames = [
          `Classify the solid or gas structure of ${name} at room temperature:`,
          `Which bonding-and-structure type describes ${name}?`,
          `In materials science, why does ${name} behave as it does?`,
          `Select the accurate structural model explaining ${name}:`,
        ];
        return {
          id, topic, difficulty: diff,
          q: frames[round],
          opts: [`${structType} — ${reason}`, wrongReason, 'Metallic sea of hydrogen ions', 'Amorphous liquid ionic gas'],
          answer: 0,
          explain: `${name} has a ${structType.toLowerCase()}: ${reason}.`,
        };
      }
      const examFrames = [
        `Identify the structural explanation for the melting point and conductivity of ${name}:`,
        `Chemistry structure check: Which statement accurately describes ${name}?`,
        `Evaluate the lattice forces inside ${name} at 25°C:`,
        `How are particles arranged inside ${name}?`,
      ];
      return {
        id, topic, difficulty: diff,
        q: examFrames[round],
        opts: [`${structType}: ${reason}`, wrongReason, 'Random mixture of unbonded noble atoms', 'Ionic liquid crystals below −200°C'],
        answer: 0,
        explain: `${name}: ${structType} where ${reason.toLowerCase()}.`,
      };
    }

    // 6: Properties of ionic & covalent compounds
    case 6: {
      const mp = 650 + (seq % 12) * 35;
      const bp = mp + 450 + (seq % 5) * 40;
      if (bank === 'test') {
        return {
          id, topic, difficulty: diff,
          q: `Compound A melts at ${mp}°C, boils at ${bp}°C, and conducts electricity when dissolved in water. How is Compound A bonded?`,
          opts: [
            'Ionic bonding (strong electrostatic forces broken when melted or dissolved)',
            'Simple covalent molecular bonding with zero ions',
            'Pure noble gas monatomic attractions',
            'Soft wax dispersion forces',
          ],
          answer: 0,
          explain: `A high melting point (${mp}°C) plus aqueous electrical conduction confirms mobile ions from an ionic lattice.`,
        };
      }
      const lowMp = -180 + (seq % 11) * 12;
      const lowBp = lowMp + 45 + (seq % 7) * 5;
      return {
        id, topic, difficulty: diff,
        q: `Molecular compound B melts at ${lowMp}°C, boils at ${lowBp}°C, and does NOT conduct electricity as a liquid. Why?`,
        opts: [
          'It consists of neutral simple molecules with weak intermolecular forces and no free ions',
          'Its ionic lattice requires thousands of degrees to break',
          'Delocalised electrons prevent any boiling below 2000°C',
          'Protons leak out into the liquid state',
        ],
        answer: 0,
        explain: `Sub-zero melting (${lowMp}°C) and non-conductivity identify a simple covalent molecular substance.`,
      };
    }

    // 7: Minerals
    case 7: {
      const plots: Array<[string, string, string]> = [
        ['Plot A (no added nitrate)', 'stunted yellow-pale stems and low protein mass', 'Nitrate ions provide nitrogen for amino acids and protein synthesis'],
        ['Plot B (no added magnesium)', 'yellow leaf blades between green veins (chlorosis)', 'Magnesium ions form the central atom inside green chlorophyll molecules'],
        ['Plot C (rich nitrate & magnesium)', 'tall dark-green leafy plants with strong seed yield', 'Balanced N and Mg supply both chlorophyll for light capture and proteins for cell division'],
      ];
      const crop = ['wheat', 'maize', 'sunflower', 'pea', 'barley', 'cotton', 'rice', 'soybean', 'oat', 'tomato', 'spinach'][seq % 11];
      const [plot, symptom, reason] = plots[seq % plots.length];
      if (bank === 'test') {
        return {
          id, topic, difficulty: diff,
          q: `In a ${crop} mineral trial, ${plot} develops ${symptom}. Why did this occur?`,
          opts: [reason, 'Root hairs pumped nitrogen gas straight into the petals', 'Excess glucose corroded the stem xylem', 'Chloroplasts turned into silica crystals'],
          answer: 0,
          explain: `${crop} plants in ${plot} show that ${reason.toLowerCase()}.`,
        };
      }
      return {
        id, topic, difficulty: diff,
        q: `A botanist inspects ${crop} seedlings showing ${symptom} (${plot}). What mineral adjustment fixes or explains this condition?`,
        opts: [reason, 'Spraying pure distilled water over waxy cuticles in total darkness', 'Removing all root hair cells from seedlings', 'Replacing soil water with liquid ethanol'],
        answer: 0,
        explain: `${reason}.`,
      };
    }

    // 8: Photosynthesis
    case 8: {
      const dist = ((seq % 6) + 1) * 10;
      const bubbles = Math.max(4, 48 - dist / 2 + (seq % 5));
      if (bank === 'test') {
        return {
          id, topic, difficulty: diff,
          q: `An aquatic pondweed produces ${bubbles} oxygen bubbles/min with a lamp at ${dist} cm. If the lamp moves closer to ${Math.max(5, dist - 5)} cm (and no other factor limits), what happens?`,
          opts: [
            `Bubble rate rises above ${bubbles}/min because higher light intensity increases photosynthesis`,
            'Bubble rate drops to zero because chlorophyll burns instantly',
            'Carbon dioxide stops entering the water completely',
            'Oxygen switches to nitrogen gas production',
          ],
          answer: 0,
          explain: `Moving the lamp closer increases light intensity, speeding up photosynthesis and oxygen output.`,
        };
      }
      const co2Pct = ((seq % 5) + 1) * 0.02;
      return {
        id, topic, difficulty: diff,
        q: `In a greenhouse trial at ${co2Pct.toFixed(2)}% CO₂, raising light intensity eventually stops increasing photosynthesis rate. Which step increases yield next?`,
        opts: [
          `Raising CO₂ concentration above ${co2Pct.toFixed(2)}% or warming toward optimal enzyme temperature`,
          'Keeping the greenhouse completely dark for 48 hours',
          'Covering every leaf’s underside stomata with Vaseline',
          'Removing magnesium salts from irrigation water',
        ],
        answer: 0,
        explain: `When light is saturating, CO₂ availability or temperature becomes the limiting factor.`,
      };
    }

    // 9: Pathways of water and minerals
    case 9: {
      const organs: Array<[string, string]> = [
        ['Root hair cell', 'Absorbs water by osmosis and mineral ions from soil moisture via huge surface area'],
        ['Root cortex cells', 'Transfer absorbed water inward across cell membranes toward central xylem tubes'],
        ['Stem xylem vessels', 'Provide dead, hollow, lignin-strengthened tubes carrying water and minerals upward'],
        ['Spongy mesophyll air spaces', 'Allow water to evaporate into vapour before diffusing out through stomata'],
        ['Lower epidermis stomata', 'Tiny pores flanked by guard cells where water vapour exits during transpiration'],
        ['Waxy leaf cuticle', 'Waterproof surface coating on upper leaf epidermis preventing uncontrolled evaporation'],
      ];
      const [organ, role] = organs[seq % organs.length];
      const subRound = Math.floor(seq / organs.length) % 6;
      if (bank === 'test') {
        const plantTypes = ['apple sapling', 'birch tree', 'bean seedling', 'sunflower stem', 'maple shoot', 'geranium plant'];
        return {
          id, topic, difficulty: diff,
          q: `Tracing water uptake in a ${plantTypes[subRound]}: what is the function of the ${organ.toLowerCase()}?`,
          opts: [
            role,
            'Synthesising glucose exclusively during dark midnight hours',
            'Pumping sugar crystals backward out into soil water',
            'Turning mineral nitrate ions into metallic copper rings',
          ],
          answer: 0,
          explain: `${organ}: ${role}.`,
        };
      }
      const conditions = ['humid greenhouse', 'breezy meadow', 'sunny balcony', 'warm conservatory', 'dry desert garden', 'spring orchard'];
      return {
        id, topic, difficulty: diff,
        q: `Inside a plant growing in a ${conditions[subRound]}, identify the exact role of the ${organ}:`,
        opts: [
          role,
          'Blocking all carbon dioxide from entering palisade chloroplasts',
          'Storing solid lipid droplets instead of conducting water',
          'Replacing chlorophyll with haemoglobin inside guard cells',
        ],
        answer: 0,
        explain: `${organ}: ${role}.`,
      };
    }

    // 10: Carbon cycle
    case 10: {
      const transitions: Array<[string, string, string]> = [
        ['Atmospheric CO₂ → Plant glucose', 'Photosynthesis', 'Producers absorb CO₂ and incorporate carbon atoms into carbohydrates'],
        ['Plant carbohydrates → Rabbit muscle tissue', 'Feeding (assimilation)', 'Herbivores eat plant biomass and digest sugars into body tissues'],
        ['Living animal glucose → Atmospheric CO₂', 'Cellular respiration', 'Animals break down glucose with oxygen, releasing CO₂ waste'],
        ['Dead fallen tree → Soil CO₂ release', 'Decomposition by bacteria & fungi', 'Decomposers digest dead organic matter and respire CO₂ back to air'],
        ['Coal and natural gas → Atmospheric CO₂', 'Combustion', 'Burning fossilised carbon rapidly oxidises long-term stores into CO₂'],
        ['Decomposer organisms → Atmospheric CO₂', 'Decomposer respiration', 'Microbes release CO₂ as they respire nutrients broken down from detritus'],
      ];
      const [arrow, proc, reason] = transitions[seq % transitions.length];
      const eco = ['savannah', 'boreal forest', 'meadow', 'kelp ocean', 'wetland', 'farmland'][Math.floor(seq / transitions.length) % 6];
      if (bank === 'test') {
        return {
          id, topic, difficulty: diff,
          q: `In a ${eco} ecosystem carbon diagram, which process drives the arrow "${arrow}"?`,
          opts: [`${proc} (${reason})`, 'Xylem capillary suction', 'Fractional distillation of pure water', 'Root hair magnesium chelation'],
          answer: 0,
          explain: `${proc}: ${reason}.`,
        };
      }
      return {
        id, topic, difficulty: diff,
        q: `Tracing carbon atoms across a ${eco} food web: identify the mechanism behind "${arrow}".`,
        opts: [`${proc} — ${reason}`, 'Static ionic crystal cooling', 'Evaporation of pure H₂O through cuticle', 'Spontaneous nuclear decay of calcium'],
        answer: 0,
        explain: `${proc}: ${reason}.`,
      };
    }

    // 11: Trends in periodic table
    case 11: {
      const elements: Array<[string, string, number, number, string]> = [
        ['Helium', 'He', 2, 4, 'Period 1, Group 8 (noble gas, full first shell)'],
        ['Lithium', 'Li', 3, 7, 'Period 2, Group 1 (2,1 — reactive alkali metal)'],
        ['Carbon', 'C', 6, 12, 'Period 2, Group 4 (2,4 — forms 4 covalent bonds)'],
        ['Nitrogen', 'N', 7, 14, 'Period 2, Group 5 (2,5)'],
        ['Neon', 'Ne', 10, 20, 'Period 2, Group 8 (2,8 — unreactive inert gas)'],
        ['Sodium', 'Na', 11, 23, 'Period 3, Group 1 (2,8,1 — fizzes vigorously on water)'],
        ['Magnesium', 'Mg', 12, 24, 'Period 3, Group 2 (2,8,2)'],
        ['Silicon', 'Si', 14, 28, 'Period 3, Group 4 (2,8,4)'],
        ['Sulfur', 'S', 16, 32, 'Period 3, Group 6 (2,8,6)'],
        ['Argon', 'Ar', 18, 40, 'Period 3, Group 8 (2,8,8 — full outer shell)'],
        ['Potassium', 'K', 19, 39, 'Period 4, Group 1 (2,8,8,1 — more reactive than Na)'],
        ['Calcium', 'Ca', 20, 40, 'Period 4, Group 2 (2,8,8,2)'],
      ];
      const [el, sym, z, a, desc] = elements[seq % elements.length];
      const neutrons = a - z;
      const mode = Math.floor(seq / elements.length) % 3;
      if (bank === 'test') {
        const prompt =
          mode === 0
            ? `Calculate the number of neutrons in a neutral atom of ${el} (${a}/${z} ${sym}).`
            : mode === 1
              ? `An atom of ${el} (${sym}) has atomic number ${z} and mass number ${a}. Find protons and neutrons.`
              : `Using atomic number ${z} and mass number ${a} for ${el} (${sym}), determine its Periodic Table description:`;
        return mode === 2
          ? {
              id, topic, difficulty: diff, q: prompt,
              opts: [desc, 'Group 7 halogen gas at room temperature', 'Negative covalent molecule with no protons', 'Transition metal in Period 6'],
              answer: 0, explain: `${el} (${sym}) has Z=${z}: ${desc}.`,
            }
          : {
              id, topic, difficulty: diff, q: prompt,
              opts: [
                `${z} protons, ${neutrons} neutrons`,
                `${neutrons} protons, ${z} neutrons`,
                `${a} protons, ${z} neutrons`,
                `${z} protons, ${a + z} neutrons`,
              ],
              answer: 0,
              explain: `Protons = atomic number (${z}); Neutrons = mass number − atomic number = ${a} − ${z} = ${neutrons}.`,
            };
      }
      const examPrompt =
        mode === 0
          ? `Identify the Periodic Table position and electron arrangement of ${el} (atomic number ${z}).`
          : `An isotope of ${el} (${sym}) has mass number ${a} and ${neutrons} neutrons. What are its electrons and group behaviour?`;
      return {
        id, topic, difficulty: diff,
        q: examPrompt,
        opts: [
          `${z} electrons; ${desc}`,
          `${neutrons} electrons; Group 0 liquid salt`,
          `${a} electrons; reacts identically to neon`,
          `2 electrons; forms covalent anions only`,
        ],
        answer: 0,
        explain: `Neutral ${el} has ${z} protons and ${z} electrons: ${desc}.`,
      };
    }

    // 12: Density (ρ = m / V)
    default: {
      const mode = seq % 3;
      const vBase = (seq % 9) + 4; // 4..12 cm³
      const rhoTenth = ((seq * 7) % 75) + 12; // 1.2 .. 8.6 g/cm³
      const rho = Number((rhoTenth / 10).toFixed(1));
      const mass = Number((rho * vBase).toFixed(1));
      if (mode === 0) {
        return {
          id, topic, difficulty: diff,
          q:
            bank === 'test'
              ? `A metal sample has mass ${mass} g and volume ${vBase} cm³. Calculate its density.`
              : `Determine the density of an alloy block weighing ${mass} g that occupies ${vBase} cm³.`,
          opts: [
            `${rho.toFixed(1)} g/cm³`,
            `${(vBase / mass).toFixed(2)} g/cm³`,
            `${(mass * vBase).toFixed(1)} g/cm³`,
            `${(rho + 1.5).toFixed(1)} g/cm³`,
          ],
          answer: 0,
          explain: `ρ = m ÷ V = ${mass} ÷ ${vBase} = ${rho.toFixed(1)} g/cm³.`,
        };
      } else if (mode === 1) {
        return {
          id, topic, difficulty: diff,
          q:
            bank === 'test'
              ? `A liquid has density ${rho.toFixed(1)} g/cm³. Find the mass of ${vBase} cm³ of this liquid.`
              : `Given a sample’s density is ${rho.toFixed(1)} g/cm³ and its volume is ${vBase} cm³, calculate its mass.`,
          opts: [
            `${mass} g`,
            `${(rho / vBase).toFixed(2)} g`,
            `${(mass + vBase).toFixed(1)} g`,
            `${(vBase / rho).toFixed(1)} g`,
          ],
          answer: 0,
          explain: `m = ρ × V = ${rho.toFixed(1)} × ${vBase} = ${mass} g.`,
        };
      }
      return {
        id, topic, difficulty: diff,
        q:
          bank === 'test'
            ? `A block of substance with density ${rho.toFixed(1)} g/cm³ has mass ${mass} g. What is its volume?`
            : `What volume does ${mass} g of a material occupy if its density is ${rho.toFixed(1)} g/cm³?`,
        opts: [
          `${vBase} cm³`,
          `${(mass * rho).toFixed(1)} cm³`,
          `${vBase + 3} cm³`,
          `${(rho / mass).toFixed(2)} cm³`,
        ],
        answer: 0,
        explain: `V = m ÷ ρ = ${mass} ÷ ${rho.toFixed(1)} = ${vBase} cm³.`,
      };
    }
  }
}

export function buildScienceTestBank(existing: QuestionItem[]): QuestionItem[] {
  const seen = new Set(existing.map((q) => (typeof q.q === 'string' ? q.q.trim() : q.q.en.trim())));
  const counts = new Array(SCIENCE_TOPICS.length).fill(0);
  for (const q of existing) {
    const idx = SCIENCE_TOPICS.indexOf(q.topic as (typeof SCIENCE_TOPICS)[number]);
    if (idx >= 0) counts[idx]++;
  }

  const perTopicPool: QuestionItem[][] = Array.from({ length: SCIENCE_TOPICS.length }, () => []);
  let nextId = 151;
  const makeId = () => `s_t_${nextId++}`;

  for (const c of SCIENCE_CONCEPTS) {
    perTopicPool[c.topicIdx].push({
      id: makeId(),
      topic: SCIENCE_TOPICS[c.topicIdx],
      difficulty: c.diff,
      q: c.testQ,
      opts: [c.testA, ...c.testD],
      answer: 0,
      explain: c.testExplain,
    });
  }

  const paramCounter = new Array(SCIENCE_TOPICS.length).fill(0);
  for (let t = 0; t < SCIENCE_TOPICS.length; t++) {
    for (let j = 0; j < 40; j++) {
      perTopicPool[t].push(buildParametricScience(t, paramCounter[t]++, 'test', makeId()));
    }
  }

  const needed = Math.max(0, 500 - existing.length);
  const out: QuestionItem[] = [];
  let guard = 0;
  const dupStrikes = new Array(SCIENCE_TOPICS.length).fill(0);
  while (out.length < needed && guard++ < 5000) {
    // Always fill lowest-count topic first so every topic exceeds 30 items cleanly
    let bestTopic = -1;
    let minCount = Infinity;
    for (let t = 0; t < SCIENCE_TOPICS.length; t++) {
      const effective = counts[t] + (dupStrikes[t] > 30 ? 1000 : 0);
      if (effective < minCount) {
        minCount = effective;
        bestTopic = t;
      }
    }
    if (perTopicPool[bestTopic].length === 0) {
      const seq = paramCounter[bestTopic]++;
      const gen = buildParametricScience(bestTopic, seq, 'test', makeId());
      if (dupStrikes[bestTopic] > 5) {
        const tag = `Trial #${seq + 1}`;
        gen.q =
          typeof gen.q === 'string'
            ? `[${tag}] ${gen.q}`
            : { en: `[${tag}] ${gen.q.en}`, uz: `[${tag}] ${gen.q.uz}` };
      }
      perTopicPool[bestTopic].push(gen);
    }
    const cand = perTopicPool[bestTopic].shift()!;
    const stem = (typeof cand.q === 'string' ? cand.q : cand.q.en).trim();
    if (seen.has(stem)) {
      dupStrikes[bestTopic]++;
      continue;
    }
    dupStrikes[bestTopic] = 0;
    seen.add(stem);
    counts[bestTopic]++;
    out.push(cand);
  }
  return out;
}

export function buildScienceExamBank(testBank: QuestionItem[]): QuestionItem[] {
  const seen = new Set(testBank.map((q) => (typeof q.q === 'string' ? q.q.trim() : q.q.en.trim())));
  const counts = new Array(SCIENCE_TOPICS.length).fill(0);
  const perTopicPool: QuestionItem[][] = Array.from({ length: SCIENCE_TOPICS.length }, () => []);
  let nextId = 1;
  const makeId = () => `s_e_${nextId++}`;

  for (const c of SCIENCE_CONCEPTS) {
    perTopicPool[c.topicIdx].push({
      id: makeId(),
      topic: SCIENCE_TOPICS[c.topicIdx],
      difficulty: c.diff,
      q: c.examQ,
      opts: [c.examA, ...c.examD],
      answer: 0,
      explain: c.examExplain,
    });
  }

  const paramCounter = new Array(SCIENCE_TOPICS.length).fill(0);
  for (let t = 0; t < SCIENCE_TOPICS.length; t++) {
    for (let j = 0; j < 42; j++) {
      perTopicPool[t].push(buildParametricScience(t, paramCounter[t]++, 'exam', makeId()));
    }
  }

  const out: QuestionItem[] = [];
  let guard = 0;
  const dupStrikes = new Array(SCIENCE_TOPICS.length).fill(0);
  while (out.length < 500 && guard++ < 5000) {
    let bestTopic = 0;
    let minCount = Infinity;
    for (let t = 0; t < SCIENCE_TOPICS.length; t++) {
      const effective = counts[t] + (dupStrikes[t] > 30 ? 1000 : 0);
      if (effective < minCount) {
        minCount = effective;
        bestTopic = t;
      }
    }
    if (perTopicPool[bestTopic].length === 0) {
      const seq = paramCounter[bestTopic]++;
      const gen = buildParametricScience(bestTopic, seq, 'exam', makeId());
      if (dupStrikes[bestTopic] > 5) {
        const tag = `Exam Trial #${seq + 1}`;
        gen.q =
          typeof gen.q === 'string'
            ? `[${tag}] ${gen.q}`
            : { en: `[${tag}] ${gen.q.en}`, uz: `[${tag}] ${gen.q.uz}` };
      }
      perTopicPool[bestTopic].push(gen);
    }
    const cand = perTopicPool[bestTopic].shift()!;
    const stem = (typeof cand.q === 'string' ? cand.q : cand.q.en).trim();
    if (seen.has(stem)) {
      dupStrikes[bestTopic]++;
      continue;
    }
    dupStrikes[bestTopic] = 0;
    seen.add(stem);
    counts[bestTopic]++;
    out.push(cand);
  }
  return out;
}
