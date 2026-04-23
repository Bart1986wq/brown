

export enum Phase {
  Discovery = 'Phase 1: Discovery',
  Architecture = 'Phase 2: Architecture',
  Craft = 'Phase 3: Craft',
  Publication = 'Phase 4: Publication',
}

export enum NarrativeAnchor {
  Relationship = 'Relationship-First (The Connection)',
  SocialTension = 'Social-First (The System)',
  TurningPoint = 'Turning-First (The Change)',
  Memory = 'Memory-First (The Past)',
  Desire = 'Desire-First (The Want)',
  Setting = 'Setting-First (The Atmosphere)',
  Timeline = 'Timeline-First (The Sequence)',
  Perspective = 'Perspective-First (The View)',
  Absence = 'Absence / The Void',
  Threshold = 'Threshold / The Breaking Point',
  Institution = 'Institution-First (The Apparatus)',
  Labour = 'Labour-First (The Task)',
  Scene = 'Scene-First (The Situation)',
  Body = 'Body-First (The Sensation)',
  Liminal = 'Liminal-First (The Threshold Pivot)',
}

export enum PerspectiveFamily {
  FirstPerson = 'First-Person',
  CloseThird = 'Close Third',
  Omniscient = 'Omniscient',
  MultiVocal = 'Multi-vocal',
  Objective = 'Objective / Documentary',
  Nonhuman = 'Nonhuman / Object',
  Experimental = 'Experimental / Fragmented',
}

export enum PerspectiveMode {
  // First-Person
  Confessional = 'Confessional',
  Unreliable = 'Unreliable',
  Retrospective = 'Retrospective',
  Obsessed = 'Obsessed',
  IntimateParticipant = 'Intimate Participant',
  CulturalCritic = 'Cultural Critic',
  // Close Third
  LimitedSingle = 'Limited Single',
  FreeIndirect = 'Free Indirect',
  ForensicReconstruction = 'Forensic Reconstruction',
  // Omniscient
  GodsEyeSocialPanorama = 'God’s-Eye Social Panorama',
  InstitutionalBureaucratic = 'Institutional / Bureaucratic',
  // Multi-vocal
  CollectiveChoral = 'Collective / Choral',
  Intersectional = 'Intersectional',
  RumourNetwork = 'Rumour Network',
  // Objective / Documentary
  Journalistic = 'Journalistic',
  CaseFileAssembly = 'Case-File Assembly',
  ArchiveAsNarrator = 'Archive-As-Narrator',
  // Nonhuman / Object
  TheObject = 'The Object',
  TheMicroscopic = 'The Microscopic',
  InfrastructureAsNarrator = 'Infrastructure-As-Narrator',
  PlatformAsNarrator = 'Platform-As-Narrator',
  // Experimental / Fragmented
  ShiftingPrismatic = 'Shifting (Prismatic)',
  Redacted = 'Redacted',
  LivestreamFeedBased = 'Livestream / Feed-Based',
  Dissociated = 'Dissociated',
}

export interface NarrativePerspective {
  family: PerspectiveFamily;
  modes: PerspectiveMode[];
}

export enum CreativeForm {
  // Narrative/Literary
  FamilySaga = 'Family Saga',
  CampusNovel = 'Campus Novel',
  WorkplaceNovel = 'Workplace Novel',
  MarriagePlot = 'Marriage Plot',
  BreakupNarrative = 'Breakup Narrative',
  FriendshipNovel = 'Friendship Novel',
  ApartmentNovel = 'Apartment Novel',
  RoadNovel = 'Road Novel',
  StateOfTheNationNovel = 'State-of-the-Nation Novel',
  MoralFable = 'Moral Fable',
  PsychologicalDrama = 'Psychological Drama',
  PoliticalFiction = 'Political Fiction',
  CourtroomHearingDrama = 'Courtroom / Hearing Drama',
  CampusSatire = 'Campus Satire',
  SexualComedy = 'Sexual Comedy',
  Tragedy = 'Tragedy',
  Tragicomedy = 'Tragicomedy',
  Bildungsroman = 'Bildungsroman',
  FragmentNovel = 'Fragment Novel',
  LinkedStoriesCompositeNovel = 'Linked Stories / Composite Novel',
  Monologue = 'Monologue',
  DialogueDuet = 'Dialogue / Duet',
  TriptychMosaicNarrative = 'Triptych / Mosaic Narrative',
  // Essay/Nonfiction-adjacent
  PersonalEssay = 'Personal Essay',
  LyricEssay = 'Lyric Essay',
  ReportedEssay = 'Reported Essay',
  CriticalEssay = 'Critical Essay',
  CulturalCriticism = 'Cultural Criticism',
  MemoirFragment = 'Memoir Fragment',
  WitnessStatement = 'Witness Statement',
  Manifesto = 'Manifesto',
  Confession = 'Confession',
  Testimony = 'Testimony',
  CaseStudy = 'Case Study',
  FieldNotes = 'Field Notes',
  NotebookCommonplaceBook = 'Notebook / Commonplace Book',
  LectureAddress = 'Lecture / Address',
  ReviewCounterReview = 'Review / Counter-Review',
  Profile = 'Profile',
  AutopsyOfAnEvent = 'Autopsy of an Event',
  TimelineChronicle = 'Timeline / Chronicle',
  // Document/Archive
  EmailsInboxNovel = 'Emails / Inbox Novel',
  TextsChatLog = 'Texts / Chat Log',
  ForumThread = 'Forum Thread',
  MeetingMinutes = 'Meeting Minutes',
  HRReport = 'HR Report',
  PoliceReport = 'Police Report',
  MedicalNotes = 'Medical Notes',
  CourtTranscript = 'Court Transcript',
  SearchQueryLog = 'Search Query Log',
  TermsConditionsLegaleseRemix = 'Terms & Conditions / Legalese Remix',
  ScrapbookArchiveBox = 'Scrapbook / Archive Box',
  AnnotatedDossier = 'Annotated Dossier',
  FAQSelfHelpManual = 'FAQ / Self-Help Manual',
  UserGuideHandbook = 'User Guide / Handbook',
  ComplaintLetter = 'Complaint Letter',
  MissingPersonFile = 'Missing Person File',
  // Contemporary/Digital
  InfluencerNarrative = 'Influencer Narrative',
  PodcastScript = 'Podcast Script',
  VideoEssayScript = 'Video Essay Script',
  SubstackEssay = 'Substack Essay',
  FeedNarrative = 'Feed Narrative',
  CancelationChronicle = 'Cancelation Chronicle',
  DatingAppNarrative = 'Dating App Narrative',
  PlatformDiary = 'Platform Diary',
  GroupChatNovel = 'Group Chat Novel',
  CommentSectionChorus = 'Comment-Section Chorus',
  // Renamed
  SociologicalSpeculation = 'Sociological Speculation',
  // Contemporary/Romance/Erotica
  RomanceDesirearc = 'Romance (Desire Arc)',
  EroticaNarrative = 'Erotica / Erotic Fiction',
  SlowBurnRomance = 'Slow Burn',
  ContemporaryRomcom = 'Romantic Comedy',
  QueerRomance = 'Queer Romance / Coming Out Narrative',
  DomesticNoir = 'Domestic Noir',
  AutofictionalRomance = 'Autofictional Romance',
  SocialCommentaryNovel = 'Social Commentary Novel',
}

export enum SettingType {
  City = 'City',
  Suburban = 'Suburban',
  Rural = 'Rural',
  PoliceStation = 'Police Station',
  CrimeScene = 'Crime Scene',
  Courtroom = 'Courtroom',
  Archive = 'Archive / Library',
  Industrial = 'Industrial',
  Domestic = 'Domestic',
  Office = 'Office',
  PublicSpace = 'Public Space',
  Underground = 'Underground',
  Road = 'Road / Highway',
  PostCollapseCommune = 'Post-Collapse Commune',
  HyperDigitalEnclave = 'Hyper-Digital Enclave',
  IsolatedResearchStation = 'Isolated Research Station',
  FadingAristocraticEstate = 'Fading Aristocratic Estate',
  TransientUrbanFringe = 'Transient Urban Fringe',
  LiminalPublicSpace = 'Liminal Public Space',
  AcademicSeminarRoom = 'Academic Seminar Room',
  SterileTransitHub = 'Sterile TransitHub',
  ModernHotelLobby = 'Modern Hotel Lobby',
  CommunityGarden = 'Community Garden',
  AbandonedIndustrialSite = 'Abandoned Industrial Site',
  RemoteCoastalVillage = 'Remote Coastal Village',
  HighTechLaboratory = 'High-Tech Laboratory',
  TraditionalMarketplace = 'Traditional Marketplace',
  CuskianSeminarRoom = 'Cuskian Seminar Room',
  StroutianSmallTown = 'Stroutian Small Town',
  WardianSouthernGothic = 'Wardian Southern Gothic',
  GigEconomyHub = 'Gig Economy Hub',
  AlgorithmicEnclave = 'Algorithmic Enclave',
  PrecariousHousing = 'Precarious Housing',
  GentrifiedFringe = 'Gentrified Fringe',
  CorporateCampus = 'Corporate Campus',
  DigitalCommons = 'Digital Commons',
  SurveillanceState = 'Surveillance State',
  ClimateRefugeeCamp = 'Climate Refugee Camp',
}

export enum AtmosphereMode {
  Rain = 'Rain',
  Fog = 'Fog',
  Night = 'Night',
  Tense = 'Tense',
  Oppressive = 'Oppressive',
  Cold = 'Cold',
  Chaotic = 'Chaotic',
  Clear = 'Clear',
  Wind = 'Wind',
  Storm = 'Storm',
  Drought = 'Drought',
  Industrial = 'Industrial',
  Claustrophobic = 'Claustrophobic',
  ExpansiveDesolate = 'Expansive / Desolate',
  TechnoMelancholic = 'Techno-Melancholic',
  FeverDream = 'Fever-Dream',
  QuietlyMenacing = 'Quietly Menacing',
  Ethereal = 'Ethereal',
  Nostalgic = 'Nostalgic',
  Surreal = 'Surreal',
  Vibrant = 'Vibrant',
  Melancholic = 'Melancholic',
  CuskianDetachment = 'Cuskian Detachment',
  StroutianIntimacy = 'Stroutian Intimacy',
  WardianVisceral = 'Wardian Visceral',
  AlgorithmicDissonance = 'Algorithmic Dissonance',
  BureaucraticCold = 'Bureaucratic Cold',
  Precarious = 'Precarious',
  HyperConnectedIsolated = 'Hyper-Connected / Isolated',
  SurveillanceParanoia = 'Surveillance Paranoia',
  EcoAnxious = 'Eco-Anxious',
}

export enum TimePeriodMode {
  Contemporary = 'Contemporary',
  ColdWar = 'Cold War',
  Historical = 'Historical',
  PostWar = 'Post-War',
  Modern = 'Modern',
  Classic = 'Classic',
}

export enum SocialSetting {
  // Built Environment
  Urban = 'Urban',
  Rural = 'Rural',
  Coastal = 'Coastal',
  Mountainous = 'Mountainous',
  Industrial = 'Industrial',
  Domestic = 'Domestic',
  Suburban = 'Suburban',
  Exurban = 'Exurban',
  SmallTown = 'Small Town',
  PortCity = 'Port City',
  UniversityTown = 'University Town',
  PostIndustrialTown = 'Post-Industrial Town',
  HighRiseEstate = 'High-Rise Estate',
  InformalSettlement = 'Informal Settlement',
  WarehouseDistrict = 'Warehouse District',
  HospitalCareSector = 'Hospital / Care Sector',
  SchoolCampus = 'School / Campus Ecology',
  PrisonCarceralEdge = 'Prison / Carceral Edge',
  FarmBelt = 'Farm Belt',
  IslandCommunity = 'Island Community',
  OffshoreMaritimeEconomy = 'Offshore / Maritime Economy',
  // Economic Condition
  PrecariousServiceEconomy = 'Precarious Service Economy',
  PrecariousHousing = 'Precarious Housing',
  GentrifiedFringe = 'Gentrified Fringe',
  DebtSociety = 'Debt Society',
  AusterityLandscape = 'Austerity Landscape',
  PlatformLabourZone = 'Platform Labour Zone',
  SpeculativePropertyMarket = 'Speculative Property Market',
  DecliningMainStreet = 'Declining Main Street',
  LuxuryRedevelopmentZone = 'Luxury Redevelopment Zone',
  CoLivingSharedRental = 'Co-Living / Shared Rental',
  HomelessnessInterface = 'Homelessness Interface',
  StartupEcosystem = 'Startup Ecosystem',
  CreativePrecarityCluster = 'Creative Precarity Cluster',
  InfluencerEconomy = 'Influencer Economy',
  CareEconomy = 'Care Economy',
  MigrantLabourSystem = 'Migrant Labour System',
  ShadowEconomy = 'Shadow Economy',
  // Institutional Context
  CorporateCampus = 'Corporate Campus',
  NGOHumanitarianSpace = 'NGO Humanitarian Space',
  CompanyTown = 'Company Town',
  // Political Regime
  SurveillanceState = 'Surveillance State',
  BorderRegime = 'Border Regime',
  OccupiedMilitarisedZone = 'Occupied / Militarised Zone',
  BiosecurityState = 'Biosecurity State',
  PrivatisedPublicRealm = 'Privatised Public Realm',
  EcologicalCollapseFrontier = 'Ecological Collapse Frontier',
  DisasterRecoveryZone = 'Disaster Recovery Zone',
  AutomatedCity = 'Automated City',
  ClimateRefugeeCamp = 'Climate Refugee Camp',
  // Digital
  PlatformPublicSphere = 'Platform Public Sphere',
  OnlineCommons = 'Online Commons',
  NetworkedPublic = 'Networked Public',
}

export enum TensionLevel {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
  Extreme = 'Extreme',
}

export enum ThematicFocus {
  Class = 'Class & Power',
  Intimacy = 'Intimacy & Connection',
  Technology = 'Technology & Modern Life',
  Gentrification = 'Gentrification & Place',
  Identity = 'Identity & Self',
  Memory = 'Memory & The Past',
  Desire = 'Desire & Longing',
  SocialChange = 'Social Change',
  FamilyDynamics = 'Family Dynamics',
  Art = 'Art & Culture',
  EcologicalGrief = 'Ecological Grief',
  DigitalHauntology = 'Digital Hauntology',
  BureaucraticAbsurdity = 'Bureaucratic Absurdity',
  IntergenerationalTrauma = 'Intergenerational Trauma',
  UrbanDecayRenewal = 'Urban Decay / Renewal',
  AlgorithmicBias = 'Algorithmic Bias',
  Precarity = 'Precarity',
  SurveillanceCapitalism = 'Surveillance Capitalism',
  ClimateJustice = 'Climate Justice',
  DigitalAlienation = 'Digital Alienation',
  InstitutionalFailure = 'Institutional Failure',
  PerformativeActivism = 'Performative Activism',
  DesireAndTheBody = 'Desire & The Body',
  RelationalPower = 'Relational Power',
  LoveAndItsFailures = 'Love & Its Failures',
  GriefAndLoss = 'Grief & Loss',
  SexualityAndIdentity = 'Sexuality & Identity',
  BodyAndSelfImage = 'Body & Self-Image',
  FriendshipAndLoyalty = 'Friendship & Loyalty',
  RecoveryAndResilience = 'Recovery & Resilience',
  PrivateDevotionUselessExpertise = 'Private Devotion / Useless Expertise',
  GapBetweenRecordAndReality = 'The Gap Between Record and Reality',
}

export enum VoicePreset {
  ClassicStrandline = 'Classic Strandline',
  MythogeographicDeepTime = 'Mythogeographic Deep-Time',
  MaritimeDreamscape = 'Maritime Dreamscape',
  BirdDriven = 'Bird-driven',
  PastoralSolitary = 'Pastoral & Solitary',
  StormWitness = 'Storm Witness',
  HauntingElegiac = 'Haunting & Elegiac',
  RewildingImmersion = 'Rewilding Immersion',
  UrbanRainPsychogeography = 'Urban Rain-Psychogeography',
  PilgrimsArc = 'Pilgrim’s Arc',
  GardenRefuge = 'Garden Refuge',
  BorderlandMythWeather = 'Borderland Myth-Weather',
  KayakCliffTheology = 'Kayak-Cliff Theology',
  IslandForager = 'Island Forager',
  GritAndDrift = 'Grit & Drift',
  EurasianPilgrim = 'Eurasian Pilgrim',
  DeepMappingStrata = 'Deep-Mapping & Strata',
  LonelyCity = 'The Lonely City (Urban/Art)',
  IcebergMemoir = 'The Iceberg (Grief/Memoir)',
  ComparativeArchive = 'The Comparative Archive (Then/Now)',
  AuthorialHauntology = 'Authorial Hauntology (The Ghost)',
  ForestMetabolism = 'Forest Metabolism (Systemic)',
  ObjectProvenance = 'The Object’s Journey (Artifact)',
  ReciprocalEcology = 'Reciprocal Ecology (Wisdom)',
  ModernistEssayist = 'Modernist Essayist (Braided)',
  SatiricalPolemic = 'Satirical Polemic (Sharp)',
  ModernCulturalCritic = 'Modern Cultural Critic (Digital)',
  DigressiveIntellectual = 'Digressive Intellectual (Restless)',
  EpicHistorian = 'Epic Historian (Sweeping)',
  GlobalPilgrim = 'Global Pilgrim (Stillness)',
  SocialRealist = 'Social Realist (Domestic)',
  PostHumanArchive = 'Post-Human Archive (Ruins)',
  AlpineMystic = 'Alpine Mystic (High Altitude)',
  FolkloricGothic = 'Folkloric Gothic (Rural Weird)',
  EntomologicalCollector = 'Entomological Collector (Minute)',
  VagabondPicaresque = 'Vagabond Picaresque (Rough Road)',
  RailMeanderer = 'Rail Meanderer (Industrial/Rural)',
  WhimsicalAbsurdist = 'Whimsical & Absurdist',
  CustomCalibration = '✨ Custom Calibration (Use Lab)',
}

export enum ProtagonistMode {
  Observer = 'Observer',
  Lover = 'Lover',
  Critic = 'Critic',
  Outsider = 'Outsider',
  Survivor = 'Survivor',
  Artist = 'Artist',
  Intellectual = 'Intellectual',
  Dreamer = 'Dreamer',
  Professional = 'Professional',
  TheEcho = 'The Echo (Fragmented)',
  TheMachine = 'The Machine (Algorithmic)',
  ReluctantArchivist = 'Reluctant Archivist',
  DisplacedExpert = 'Displaced Expert',
  ObserverOfDecay = 'Observer of Decay',
  DigitalNomad = 'Digital Nomad',
  MemoryKeeper = 'Memory-Keeper',
  DataLaborer = 'Data Laborer',
  PrecariousIntellectual = 'Precarious Intellectual',
  AlgorithmicCurator = 'Algorithmic Curator',
  Whistleblower = 'Whistleblower',
  ActivistOrganizer = 'Activist / Organizer',
  InstitutionalInsider = 'Institutional Insider',
  // Contemporary/Romance/Relationship
  TheDesiring = 'The Desiring',
  TheWounded = 'The Wounded',
  TheAmbivalent = 'The Ambivalent',
  ThePerformer = 'The Performer',
  TheCarer = 'The Carer',
  TheRecovering = 'The Recovering',
}

export enum CaseScale {
  ShortStory = 'Short Story',
  Novella = 'Novella',
  Novel = 'Novel',
  Series = 'Series',
}

export enum NarrativeMode {
  Fieldwork = 'Social Observation',
  DeskWork = 'Introspection',
  Surveillance = 'Active Listening',
  Interrogation = 'Deep Dialogue',
  Research = 'Cultural Research',
  Road = 'Road (Van/Car)',
  Rail = 'Rail (Train)',
  Stationary = 'Stationary (Home/Cafe)',
  EpistolaryFragmented = 'Epistolary (Fragmented)',
  StreamOfConsciousness = 'Stream of Consciousness',
  MultiplePerspectives = 'Multiple Perspectives',
  ReportageDocumentary = 'Reportage / Documentary',
  CuskianAnalytical = 'Cuskian Analytical',
  AlgorithmicTracing = 'Algorithmic Tracing',
  InstitutionalDeconstruction = 'Institutional Deconstruction',
  DataEthnography = 'Data Ethnography',
  SystemicMapping = 'Systemic Mapping',
  ParasocialAnalysis = 'Parasocial Analysis',
  // Contemporary/Romance/Social Commentary
  DesireTracking = 'Desire Tracking',
  AnecdotalDigressive = 'Anecdotal / Digressive',
  SocialObservationClose = 'Social Observation (Close)',
  AccumulativeLayered = 'Accumulative / Layered',
  RitualisticCeremonial = 'Ritualistic / Ceremonial',
  BodyCentered = 'Body-Centred',
  ConfessionalAccumulation = 'Confessional Accumulation',
}

export enum PlotStructure {
  Linear = 'Linear',
  NonLinear = 'Non-Linear',
  DualTimeline = 'Dual-Timeline',
  Procedural = 'Procedural',
  Whodunit = 'Whodunit',
  Thriller = 'Thriller',
  Episodic = 'Episodic',
  Fragmented = 'Fragmented',
}

// Expedition Specific Enums
export enum RoadState {
  Cruising = 'Cruising (Distance eats detail)',
  Hunting = 'Hunting (Verge attention)',
  Stalled = 'Stalled (Forced stillness)',
  NightDriving = 'Night Driving (Tunnel vision)',
  WeatherBound = 'Weather Bound (Pace dictated)',
  Backroads = 'Backroads (Slower, porous)',
  TownDrift = 'Town Drift (Interruption)',
}

export enum WeatherPressure {
  Calm = 'Calm',
  Marginal = 'Marginal',
  Hostile = 'Hostile',
}

export enum FatigueLevel {
  Fresh = 'Fresh',
  Worn = 'Worn',
  Frayed = 'Frayed',
}

export enum NarrativeTemp {
  Observational = 'Observational',
  Lyrical = 'Lyrical',
  Haunted = 'Haunted',
  Stripped = 'Stripped',
}

export enum SeedType {
  Narrative = 'Full Narrative (Book/Long-form)',
  Essay = 'Short-form Essay / Article',
}

export enum BiomeType {
  CrimeScene = 'Crime Scene',
  ColdCaseArchive = 'Cold Case Archive',
  PoliceStation = 'Police Station',
  CorporateOffice = 'Corporate Office',
  UrbanAlley = 'Urban Alley',
  SuburbanHome = 'Suburban Home',
  RuralHideout = 'Rural Hideout',
  Courtroom = 'Courtroom',
}

export enum InvestigationPacing {
  SlowBurn = 'Slow Burn',
  FastPaced = 'Fast Paced',
  Procedural = 'Procedural',
  Psychological = 'Psychological',
  Chaotic = 'Chaotic',
}

export enum NarrativeScope {
  ShortStory = 'Short Story',
  Novella = 'Novella',
  Novel = 'Novel',
  SeriesArc = 'Series Arc',
}

export enum CrimePerspectiveMode {
  Detective = 'Detective',
  Victim = 'Victim',
  Perpetrator = 'Perpetrator',
  Witness = 'Witness',
  ForensicExpert = 'Forensic Expert',
  Journalist = 'Journalist',
}

export enum CharacterArchetype {
  LocalEccentric = 'Local Eccentric',
  Hippie = 'Hippie',
  LocalPriest = 'Local Priest',
  Neighbor = 'Neighbor',
  Outsider = 'Outsider',
  AuthorityFigure = 'Authority Figure',
  Recluse = 'Recluse',
  Historian = 'Historian',
}

export enum TwistLevel {
  None = 'None',
  Subtle = 'Subtle',
  Moderate = 'Moderate',
  Complex = 'Complex',
}

export enum RedHerringIntensity {
  None = 'None',
  Minor = 'Minor',
  Significant = 'Significant',
}

export enum StructureBias {
  Tight = 'Tight / Conceptual',
  Balanced = 'Balanced',
  Loose = 'Loose / Exploratory',
}

export interface SeedGeneratorParams {
  seedType: SeedType;
  narrativeAnchor: NarrativeAnchor;
  narrativePerspective: NarrativePerspective;
  creativeForm: CreativeForm[];
  locationName: string;
  useRouteMode: boolean; 
  startPoint?: string; 
  endPoint?: string; 
  waypoints?: string[]; 
  groundingContext?: string; 
  socialSetting: SocialSetting[]; 
  atmosphericTone: AtmosphereMode[];
  timePeriod: TimePeriodMode[];
  tensionLevel: TensionLevel[]; 
  voicePreset: VoicePreset;
  voiceTone?: VoiceTone;
  protagonistMode: ProtagonistMode[];
  caseScale: CaseScale;
  narrativeMode: NarrativeMode[];
  plotStructure: PlotStructure[];
  seedCount: number;
  // Series Mode Parameters
  isSeriesMode: boolean;
  seriesSpine?: string;
  seriesSubjectList?: string;
  // Narrative Engine Parameters
  thematicFocus?: ThematicFocus[];
  atmospherePressure?: AtmosphereMode;
  fatigue?: FatigueLevel;
  narrativeTemp?: NarrativeTemp;
  mediaInfluence?: string;
  // New Narrative Control Parameters
  castCharacters?: CharacterArchetype[];
  focalSpecies?: string;
  focalFigure?: string;
  focalArtifact?: string;
  roadState?: RoadState;
  weatherPressure?: WeatherPressure;
  recalibratedElements?: RecalibratedElements;
  // Looseness Dial
  structureBias: StructureBias;
}

export interface Seed {
  title: string;
  premise: string;
  motifs: string[];
  toneProfile: string;
  structuralSuggestion: string;
}

export enum NarrativeStructureTemplate {
  ThreeAct = 'Three-Act Structure',
  FichteanCurve = 'Fichtean Curve',
  InMediaRes = 'In Media Res',
  HeroJourney = 'Hero\'s Journey (Short)',
  RooneyWeb = 'Rooney-esque Interpersonal Web',
  CuskianFragment = 'Cuskian Fragmented / Observational',
  Circular = 'Circular / Eternal Return',
  Braided = 'Braided (Multi-threaded)',
}

export interface NarrativeBeat {
  id: string;
  title: string;
  description: string;
  tension: number; // 0-100
  charactersPresent: string[];
  kinesis: 'internal' | 'action' | 'dialogue' | 'description';
  sensoryFocus: string[];
}

export interface BlueprintCharacter {
  id: string;
  name: string;
  role: string;
  motivation: string;
  arc: string;
}

export interface NarrativeBlueprint {
  id: string;
  name: string;
  authorMix: AuthorMix;
  params: SeedGeneratorParams;
  seedSource?: Seed;
  structureTemplate?: NarrativeStructureTemplate;
  beats?: NarrativeBeat[];
  characters?: BlueprintCharacter[];
  tensionMap?: { beatId: string; tension: number }[];
  createdAt: string;
  updatedAt: string;
}

export interface TraceabilityReport {
  voiceInfluence: string;
  settingInfluence: string;
}

export interface NarrativeSynopsis {
  title: string;
  synopsis: string;
  characterArcs: { name: string; motivation: string; arc: string }[];
  thematicBeats: { beat: string; description: string }[];
  traceability: TraceabilityReport;
}

export interface CharacterProfile {
  name: string;
  backstory: string;
  voiceDescription: string;
  physicalDescription: string;
  internalConflict: string;
}

export interface SceneDraft {
  beatTitle: string;
  sceneContent: string;
  sensoryDetails: string[];
}

export interface NarrativeOutline {
  synopsisTitle: string;
  beatSheet: { title: string; description: string }[];
}

export type AuthorId = 
  | 'rankin' | 'mina' | 'greene' 
  | 'french' | 'rooney' | 'barry' | 'ishiguro'
  | 'mankell' | 'nesbo' | 'larsson'
  | 'murakami' | 'higashino' | 'braithwaite' | 'borges'
  | 'connelly' | 'leon' | 'silva' | 'cleeves' | 'boyne'
  | 'lackberg' | 'jonasson' | 'sigurdardottir' | 'adlerolsen' | 'sjowallwahlöö' | 'fossum'
  | 'simenon' | 'izzo' | 'montalban' | 'sciascia' | 'vargas' | 'indridason' | 'kirino' | 'wetering'
  // UK/Ireland
  | 'mcdermid' | 'billingham' | 'james' | 'galbraith' | 'horowitz' | 'nugent' | 'connolly' | 'mckinty' | 'casey'
  // NZ/Australia
  | 'marsh' | 'cleave' | 'symon' | 'harper' | 'disher' | 'robotham' | 'temple'
  // New Authors
  | 'robinson' | 'griffiths' | 'ross' | 'kirk' | 'cornwell' | 'reichs' | 'deaver' | 'krueger'
  // Latest Authors
  | 'stuart' | 'lehane' | 'yanagihara' | 'enriquez' | 'trias' | 'moshfegh'
  | 'milam' | 'child' | 'carter' | 'cameron'
  | 'park' | 'berry'
  | 'ferrante' | 'adichie' | 'henry' | 'thorne' | 'saunders' | 'smith' | 'cusk' | 'knausgard'
  | 'tartt' | 'mcewan' | 'butler' | 'nelson'
  | 'lockwood' | 'crooks'
  | 'huxley' | 'bradbury' | 'steinbeck' | 'milton' | 'arendt' | 'hemingway'
  | 'chandler' | 'hammett' | 'highsmith'
  | 'hannah' | 'boyne'
  | 'alexievich' | 'ugresic' | 'tawada' | 'strout' | 'ward' | 'ditlevsen' | 'batuman' | 'fosse' | 'gardam' | 'shriver' | 'houellebecq' | 'rand'
  | 'roy' | 'whitehead' | 'reid' | 'gay' | 'vuong' | 'jones' | 'james_m' | 'gyasi' | 'evaristo' | 'emezi'
  | 'edugyan' | 'coates' | 'kang' | 'kawakami' | 'murata' | 'kureishi' | 'hamid' | 'shamsie' | 'ghosh' | 'adiga'
  | 'dangarembga' | 'bulawayo' | 'gurnah' | 'slimani' | 'nayeri' | 'shafak' | 'matar' | 'maclaverty' | 'orange' | 'erdrich'
  | 'vermette' | 'dimaline' | 'talaga' | 'wagamese' | 'wright' | 'winch' | 'makumbi' | 'mbue' | 'john' | 'mirza'
  | 'beatty' | 'melchor' | 'ma' | 'burns' | 'erpenbeck' | 'rankine' | 'louis' | 'luiselli' | 'dyer'
  | 'yuknavitch' | 'lispector' | 'mishima' | 'winterson' | 'ephron' | 'sittenfeld' | 'wolitzer' | 'khong' | 'leilani'
  | 'broder' | 'kraus' | 'glaser' | 'ellis' | 'didion' | 'groff'
  | 'king' | 'aciman' | 'nolan' | 'washington' | 'dolan' | 'daverly'
  | 'mauriac' | 'bernanos' | 'scott' | 'coetzee' | 'toibin' | 'waugh' | 'spark' | 'lecarre';

export interface AuthorDef {
  id: AuthorId;
  name: string;
  traits: string;
  signatureMove?: string;
}

export interface AuthorMixPreset {
  id: string;
  name: string;
  description: string;
  mix: Partial<AuthorMix>;
}

export type AuthorMix = Record<AuthorId, number>;

export enum VoiceTone {
  Whimsical = 'Whimsical',
  Absurd = 'Absurd',
  Urgent = 'Urgent',
  Serious = 'Serious',
  Banal = 'Banal',
  Digressive = 'Digressive',
  LightHearted = 'Light-hearted',
  Melancholic = 'Melancholic',
  Analytical = 'Analytical',
  Provocative = 'Provocative',
  Nostalgic = 'Nostalgic',
  Detached = 'Detached',
  Elegiac = 'Elegiac',
  Polemical = 'Polemical',
  Cynical = 'Cynical',
  Empathetic = 'Empathetic',
  Haunted = 'Haunted',
  Clinical = 'Clinical',
  Satirical = 'Satirical',
}

export enum CalibrationMode {
  VoiceDescription = 'Voice Description',
  ApplyToSeed = 'Apply to Seed Generator',
  ApplyToProse = 'Apply to Prose Engine',
}

export interface VoiceSuggestions {
    suggestedLocations: string[];
    suggestedBiomes: BiomeType[];
    thematicSeeds: string[];
    narrativeStyleForm: string;
    journeyIdeas: string[];
    suggestedArtifacts: string[];
    suggestedFigures: string[];
    recommendedAnchor: NarrativeAnchor;
}

export interface CreativeSuggestions {
  suggestedLocations: string[];
  suggestedSocialSettings: string[];
  suggestedRelationalCores: string[];
  suggestedProtagonistPersonas: string[];
  suggestedNarrativeAnchors: string[];
  suggestedThemes: string[];
  suggestedAtmosphericFields: string[];
  suggestedConflictDrivers: string[];
  suggestedSymbolicObjects: string[];
  criticalLenses: string[];
  groundedLocation: {
    location: string;
    reasoning: string;
  }[];
}

export interface VoiceAnalysisResult {
    authorForceBreakdown: string;
    overlaps: string;
    tensionsFrictions: string;
    compositeVoiceProfile: string;
    operationalTendencies: string;
    guardrails: string;
    suggestedLocations: string[];
    suggestedSocialSettings: string[];
    suggestedSymbolicObjects: string[];
    suggestedNarrativeAnchors: NarrativeAnchor[];
    suggestedAtmosphericTones: AtmosphereMode[];
    suggestedThematicFocuses: ThematicFocus[];
}

export interface LocationCalibrationParams {
  voiceProfile: VoiceAnalysisResult;
  location: { location: string; reasoning: string };
  selectedElements: {
    socialSetting: string;
    relationalCore: string;
    persona: string;
    anchor: string;
    themes: string[];
    atmosphere: string[];
    conflicts: string[];
    objects: string[];
    lens: string[];
  };
}

export interface LocationCalibrationResult {
  overallFitScore: 'High' | 'Medium' | 'Low';
  frictionPoints: string;
  socialCalibration: string;
  classPowerCalibration: string;
  institutionalRealityCheck: string;
  relationalBehaviorAdjustment: string;
  conflictCalibration: string;
  symbolicObjectAdjustment: string;
  whatThisPlaceNaturallyProduces: string;
  whatToAvoid: string[];
}

export interface RecalibratedElements {
  socialSetting: string;
  relationalCore: string;
  persona: string;
  conflicts: string[];
  objects: string[];
  atmosphere: string;
  recalibrationReasoning: {
    removedElements: { element: string; reason: string }[];
    characterAdjustments: string[];
    structuralChanges: string[];
  };
}

export enum ExpansionMode {
  SensoryMap = 'Sensory Map (Texture & Atmosphere)',
  NarrativeArc = 'Narrative Arc (Plot & Pacing)',
  EssayStructure = 'Essay Structure (Thematic Weave)',
  SceneBreakdown = 'Scene Breakdown (Cinematic)',
  DeepTimeAudit = 'Deep Time Audit (Geology & History)',
  EcologicalWeb = 'Ecological Web (Systemic Connections)',
  PsychogeographicRoute = 'Psychogeographic Route (Hauntology)',
  MythicOverlay = 'Mythic Overlay (Folklore & Legend)',
  BookArchitecture = 'Book Architecture (Chapter Architect)',
  ContinuityMap = 'Continuity Map (Series Flow)',
}

// Added missing enums for Seed Expander and Chapter Beat Sheets
export enum ExpansionDepth {
  Standard = 'Standard',
  Deep = 'Deep',
  Forensic = 'Forensic',
}

export enum ExpansionLength {
  Concise = 'Concise',
  Standard = 'Standard',
  Comprehensive = 'Comprehensive',
}

export enum ExpansionFormat {
  BulletPoints = 'Bullet Points',
  Paragraphs = 'Paragraphs',
  StructuredSections = 'Structured Sections',
}

export interface SeedExpansionParams {
  seedText: string;
  expansionMode: ExpansionMode;
  customFocus?: string;
  expansionDepth?: ExpansionDepth;
  expansionLength?: ExpansionLength;
  expansionFormat?: ExpansionFormat;
  includeMotifTimeline?: boolean;
  includeFactSheet?: boolean;
}

export enum ProseMode {
  LyricVignette = 'Lyric Vignette (Dense, Poetic)',
  NarrativeChapter = 'Narrative Chapter (Flowing, Story-led)',
  FieldNoteEntry = 'Field Note Entry (Immediate, Raw)',
  DeepTimeEssay = 'Deep Time Essay (Intellectual, Slow)',
  StreamOfConsciousness = 'Stream of Consciousness (Internal/Modernist)',
  Travelogue = 'Travelogue / Reportage (External/Social)',
  SpeculativeEcology = 'Speculative Ecology (Future/Sci-Fi)',
  ExpeditionLog = 'Expedition Log (Chronological, Detailed)',
}

export enum ProseLength {
  Micro = 'Micro (100-300 words)',
  Brief = 'Brief (300-500 words)',
  Standard = 'Standard (500-800 words)',
  Extended = 'Extended (800-1200 words)',
  Epic = 'Epic (1200-2000 words)',
  Feature = 'Feature Article (1500-2500 words)',
  LongForm = 'Long-form (2500-5000 words)',
}

export enum ProseStructure {
  SingleBlock = 'Single Block (Continuous)',
  MultiSection = 'Multi-Section (Structured with Headers)',
}

export enum SentenceCadence {
  Staccato = 'Staccato (Short, Urgent)',
  Standard = 'Standard (Balanced)',
  Ciceronian = 'Ciceronian (Long, Winding)',
}

export interface ProseGenerationParams {
  scaffoldText: string; 
  proseMode: ProseMode;
  proseLength: ProseLength;
  proseStructure: ProseStructure;
  primaryAuthorId?: AuthorId;
  ghostAuthorId?: AuthorId;
  cadence?: SentenceCadence;
  forceSensoryAnchoring?: boolean;
  expansion?: string; // For legacy/draft support
  length?: string;    // For legacy/draft support
  customWordCount?: number;
}

export interface ProseSection {
  id: string;
  title: string;
  content: string;
  status: 'pending' | 'generating' | 'completed';
}

export enum RevisionFocus {
  EnhanceEcology = 'Enhance Ecological Specificity',
  DeepenAtmosphere = 'Deepen Atmospheric Pressure',
  FixRhythm = 'Fix Rhythm & Cadence (Musicality)',
  MythicLayering = 'Add Mythic/Historical Layering',
  StripBack = 'Strip Back (Minimalist/Bleak)',
  EtymologicalRewilding = 'Etymological Excavator (Old English/Norse Roots)',
  ClicheHunter = 'Cliche Hunter (Rewild Tropes)',
  Marginalia = 'Marginalia (Surgical Edit)',
}

export interface RevisionParams {
  draftText: string; 
  revisionFocus: RevisionFocus;
  marginaliaNote?: string;
  selectedText?: string;
  sensoryTuner?: {
      abstraction: number;
      temperature: number;
      humanPresence: number;
  };
  primaryAuthorId?: AuthorId;
  ghostAuthorId?: AuthorId;
  cadence?: SentenceCadence;
  forceSensoryAnchoring?: boolean;
}

export interface BookChapter {
  id: string;
  title: string;
  content: string;
  timestamp: number;
}

export interface BraidedThread {
  title: string;
  focus: string; // e.g., "Historical", "Ecological", "Personal"
  description: string;
}

export interface FieldNote {
  id: string;
  content: string;
  timestamp: number;
}

export interface VisualContext {
  imageUrl: string;
  analysis: string;
}

export interface EssaySeed {
  title: string;
  thesis: string;
  keyArguments: string[];
  motifs: string[];
  toneProfile: string;
  structuralSuggestion: string;
  braidedThreads?: BraidedThread[];
  focalPeople?: string[];
  focalArtifacts?: string[];
  focalPoems?: string[];
  visualContext?: VisualContext;
}

export interface EssayDraft {
  id: string;
  title: string;
  content: string;
  thesis: string;
  timestamp: number;
}

export interface Snippet {
  id: string;
  content: string;
  timestamp: number;
  source?: string;
}

export interface EcologicalResearchResult {
  location: string;
  summary: string;
  flora: string[];
  fauna: string[];
  geology: string[];
  climate: string[];
  sources: { uri: string; title: string }[];
}

export interface SensoryPalette {
  smells: string[];
  sounds: string[];
  textures: string[];
  tastes: string[];
  lighting: string[];
}

export interface AtmosphereMoodboard {
  imageUrl: string;
  prompt: string;
}

export interface CharacterMycelium {
  name: string;
  role: string;
  environmentalTraits: string[];
  sensoryHabits: string[];
  metaphors: string[];
  backstory: string;
}

export enum WeatherEvent {
  CoastalSquall = 'Coastal Squall',
  Heatwave = 'Heatwave / Drought',
  Whiteout = 'Whiteout / Blizzard',
  SuddenThaw = 'Sudden Thaw',
  Thunderstorm = 'Thunderstorm',
  FogBank = 'Fog Bank',
  GaleForce = 'Gale Force Wind',
}

export interface CritiqueResult {
  thematicConsistency: {
    score: number;
    analysis: string;
    missingMotifs: string[];
  };
  pacing: {
    score: number;
    analysis: string;
    suggestions: string[];
  };
  ecologicalDepth: {
    score: number;
    analysis: string;
  };
  overallFeedback: string;
}
