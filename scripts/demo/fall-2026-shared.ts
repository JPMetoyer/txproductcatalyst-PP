// Fall 2026 demo semester: shared content (semester, challenges, curriculum, milestones, Demo Day, Career Center).
// EVERYTHING HERE IS FICTIONAL DEMO DATA. GM1–GM8 titles and content are representative, not historical records.
// Challenge assignments are a retrospective demonstration of the marketplace, not real Fall 2026 assignments.

export const TODAY = '2026-11-25';

export const semester = {
	name: 'Fall 2026',
	theme: 'Demo data · fictional teams and research',
	startDate: '2026-08-24',
	endDate: '2026-12-11',
	publicMarketplace: false
};

type Accent = 'blue' | 'pink' | 'orange' | 'lavender';
export interface DemoChallenge {
	code: string;
	title: string;
	icon: string;
	accent: Accent;
	summary: string;
	experience: string;
	mission: string;
	stakeholders: string[];
	researchConsiderations: string[];
	boundaries: string[];
	expectations: string[];
}

const commonExpectations = [
	'Interview at least 10 people who live this experience',
	'Document a validated problem statement before designing screens',
	'Test a clickable prototype with at least 5 people',
	'Keep a decision log of what changed and why'
];

export const challenges: DemoChallenge[] = [
	{
		code: 'C1', title: 'The First Apartment', icon: 'home', accent: 'blue',
		summary: 'Moving out, signing a lease, and sharing a home for the first time.',
		experience: 'Signing a first lease brings a wave of unfamiliar responsibilities: deposits, utilities, roommates, maintenance requests and shared bills. Most people learn by making expensive mistakes.',
		mission: 'Help first-time renters feel in control of their home, their money and their roommate relationships.',
		stakeholders: ['First-time renters', 'Roommates', 'Property managers', 'Parents or guarantors', 'Campus housing offices'],
		researchConsiderations: ['Talk to renters in their first and second year of renting, not only people about to sign', 'Separate money problems from communication problems', 'Look at the workarounds people already use (spreadsheets, group chats, sticky notes)'],
		boundaries: ['Do not build legal advice or lease review tools', 'No direct handling of rent payments in the MVP'],
		expectations: commonExpectations
	},
	{
		code: 'C2', title: 'Financial Independence', icon: 'wallet', accent: 'orange',
		summary: 'Managing money on your own for the first time.',
		experience: 'Young adults start earning, spending and saving without a safety net. Budgeting apps track the past, but the hard part is deciding before money leaves the account.',
		mission: 'Help young adults make confident everyday and major financial decisions.',
		stakeholders: ['Students with part-time income', 'Recent graduates', 'Campus financial wellness offices', 'Parents'],
		researchConsiderations: ['Money is personal: build trust before asking about numbers', 'Ask about a specific recent purchase, not general habits', 'Notice the language people use for money; jargon is a barrier'],
		boundaries: ['No investment recommendations', 'No connection to real bank accounts in the prototype'],
		expectations: commonExpectations
	},
	{
		code: 'C3', title: 'Entering the Workforce', icon: 'briefcase', accent: 'lavender',
		summary: 'Getting from student to first job.',
		experience: 'Applying, interviewing and choosing a first role is confusing and lonely. Advice is generic, and feedback after an interview rarely arrives.',
		mission: 'Help students and early-career professionals prepare for and land the right first role.',
		stakeholders: ['Juniors and seniors', 'Recent graduates', 'Career center advisors', 'Recruiters', 'Student organizations'],
		researchConsiderations: ['Compare students with and without access to mentors', 'Ask about the last interview they prepared for, step by step', 'Talk to at least one career advisor or recruiter'],
		boundaries: ['No automated job applications', 'Do not store real resumes in the prototype'],
		expectations: commonExpectations
	},
	{
		code: 'C4', title: 'Navigating New Places', icon: 'map', accent: 'pink',
		summary: 'Finding your way in a city, campus or country you do not know.',
		experience: 'Travelers and newcomers rely on reviews and photos that are often sponsored, outdated or staged. Deciding where to go and what to trust takes hours.',
		mission: 'Help people discover new places with information they can trust.',
		stakeholders: ['Independent travelers', 'Students studying abroad', 'Local businesses', 'Content creators'],
		researchConsiderations: ['Ask about the last trip they planned and where they looked', 'Find out what makes a review feel trustworthy', 'Include people who distrust online reviews entirely'],
		boundaries: ['No direct booking or payments', 'No itinerary generation in the MVP'],
		expectations: commonExpectations
	},
	{
		code: 'C5', title: 'Taking Care of Others', icon: 'heart-handshake', accent: 'blue',
		summary: 'Supporting a family member, friend or neighbor.',
		experience: 'Caregivers and the people they support juggle technology, health, appointments and daily tasks. Many older adults want independence but feel left behind by technology.',
		mission: 'Help people care for others, and help those being cared for stay independent.',
		stakeholders: ['Older adults', 'Family caregivers', 'Senior living communities', 'Community organizations', 'Libraries'],
		researchConsiderations: ['Interview the person being supported, not only the caregiver', 'Watch how people use their own devices', 'Be patient: schedule longer sessions and use plain language'],
		boundaries: ['No remote device control', 'No medical advice'],
		expectations: commonExpectations
	},
	{
		code: 'C6', title: 'Building Something of Your Own', icon: 'rocket', accent: 'orange',
		summary: 'Starting a side project, club or small business.',
		experience: 'Student founders and creators have ideas but struggle with where to start, who to ask and how to know if anyone cares.',
		mission: 'Help students turn an idea into something real.',
		stakeholders: ['Student founders', 'Club officers', 'Campus entrepreneurship programs', 'Local small businesses'],
		researchConsiderations: ['Separate people who want to start something from people who already have', 'Ask what stopped their last idea'],
		boundaries: ['No fundraising or investment platform', 'No legal entity formation'],
		expectations: commonExpectations
	},
	{
		code: 'C7', title: 'Finding Your People', icon: 'users', accent: 'lavender',
		summary: 'Building community after a move or transition.',
		experience: 'Transfer students, new graduates and people who move for work often feel isolated. Meeting people takes energy, and existing apps feel awkward.',
		mission: 'Help people build real connections in a new place.',
		stakeholders: ['Transfer and first-year students', 'New graduates in a new city', 'Student organizations', 'Community event hosts'],
		researchConsiderations: ['Ask about the last time they met someone new who stuck', 'Respect privacy: loneliness is a sensitive topic'],
		boundaries: ['No dating features', 'No location sharing between strangers'],
		expectations: commonExpectations
	},
	{
		code: 'C8', title: 'Navigating Adult Responsibilities', icon: 'clipboard-list', accent: 'pink',
		summary: 'Insurance, taxes, paperwork and deadlines nobody teaches.',
		experience: 'Adulthood comes with forms, renewals and deadlines that are easy to miss and costly to get wrong.',
		mission: 'Help young adults stay on top of the responsibilities nobody explains.',
		stakeholders: ['Students and recent graduates', 'Parents', 'Campus student services', 'Local government offices'],
		researchConsiderations: ['Find the most recent deadline someone missed and why', 'Map which tasks are yearly, monthly and one-time'],
		boundaries: ['No tax filing or legal advice', 'No storage of government ID numbers'],
		expectations: commonExpectations
	}
];

export interface DemoLesson {
	gm: number;
	title: string;
	date: string;
	phase: string;
	description: string;
	topics: string[];
	objectives: string[];
	keyConcepts: string[];
	examples: string;
	activity: string;
	resources: string[]; // descriptions only, shown without links (no real files exist for demo data)
}

const S = 'StudySpot (a fictional campus study-space discovery app)';

export const lessons: DemoLesson[] = [
	{
		gm: 1, title: 'THINK IT — Product Management Fundamentals', date: '2026-09-02', phase: 'overview',
		description: 'What product managers do, how the Product Project works, and how a team moves from an experience to a product backed by evidence.',
		topics: ['Role of a PM', 'Product lifecycle', 'Team norms'],
		objectives: ['Explain what a product manager is responsible for', 'Describe the seven phases of the Product Project journey', 'Agree on team norms and a weekly working rhythm'],
		keyConcepts: ['Outcomes over outputs', 'Problem space vs. solution space', 'Evidence-based decisions', 'The PM as a connector between users, business and technology'],
		examples: `${S}: the StudySpot team starts with the experience "finding a place to study during finals" instead of the idea "an app with a map of libraries". That keeps them open to what students actually need.`,
		activity: 'As a team, write your working agreement (meeting time, response expectations, how you decide). Then browse the Challenge Marketplace and rank your top three challenges with one sentence each on why.',
		resources: ['GM1 slide deck (demo placeholder)', 'Team charter template (demo placeholder)']
	},
	{
		gm: 2, title: 'DISCOVER IT — Customer Discovery', date: '2026-09-09', phase: 'discover',
		description: 'How to run customer interviews that uncover real behavior and pain, not polite opinions.',
		topics: ['Interview design', 'Recruiting participants', 'Note-taking'],
		objectives: ['Write open-ended interview questions about past behavior', 'Recruit participants who live the experience', 'Capture observations, quotes and pain points consistently'],
		keyConcepts: ['Ask about the past, not hypotheticals', 'The Mom Test', 'Saturation: when new interviews stop surprising you', 'Pseudonymous participant IDs'],
		examples: `${S}: instead of "Would you use an app to find study rooms?", the team asks "Tell me about the last time you looked for a place to study. Where did you go first?" Three students describe walking between four buildings before giving up.`,
		activity: 'Draft 8–10 interview questions in Discover → Interview questions. Each teammate schedules two interviews before GM3 and logs them in the Research interview log.',
		resources: ['Interview guide checklist (demo placeholder)', 'Example interview notes from StudySpot (demo placeholder)']
	},
	{
		gm: 3, title: 'DEFINE IT — Problem Definition', date: '2026-09-16', phase: 'discover',
		description: 'Turn interview notes into patterns, then into a problem statement the team can defend.',
		topics: ['Affinity mapping', 'Problem statements', 'Target segment'],
		objectives: ['Cluster interview findings into themes', 'Write a problem statement backed by evidence', 'Choose one target customer segment'],
		keyConcepts: ['Affinity mapping', 'Jobs to be done', 'Assumption vs. validated evidence', 'Narrowing the segment'],
		examples: `${S}: 9 of 12 students mention wasting 15+ minutes finding an open seat during midterms. The team writes: "Students studying on campus during peak weeks lose time and focus because they can't tell which study spaces have room."`,
		activity: 'Run a 30-minute affinity mapping session on your interview notes. Fill in Discover → Key research findings and Validated problem statement, and mark each as Assumption or Validated.',
		resources: ['Affinity mapping walkthrough (demo placeholder)']
	},
	{
		gm: 4, title: 'POSITION IT — Competitive Analysis', date: '2026-09-30', phase: 'position',
		description: 'Map the alternatives people already use, including spreadsheets and group chats, and find a reason to switch.',
		topics: ['Competitor mapping', 'Positioning', 'Business model basics'],
		objectives: ['Compare direct, indirect and non-digital alternatives', 'Write a positioning statement', 'Name the reasons a customer would switch'],
		keyConcepts: ['Direct vs. indirect competitors', 'Workarounds are competitors', 'Positioning statement', 'Switching costs'],
		examples: `${S}: the real competitor isn't another app, it's "walk to the library and hope." The team positions StudySpot as the fastest way to find an open seat right now, unlike static campus maps.`,
		activity: 'Add at least four alternatives to Position → Competitor comparison. Draft your positioning statement, then start Monetize: who pays and why?',
		resources: ['Positioning statement template (demo placeholder)', 'Business Model Studio walkthrough (in Studio)']
	},
	{
		gm: 5, title: 'SCOPE IT — MVP and Prioritization', date: '2026-10-14', phase: 'scope',
		description: 'Decide what the first version must do, what can wait, and what you can realistically demo.',
		topics: ['MoSCoW prioritization', 'MVP', 'Feasibility'],
		objectives: ['Prioritize features with MoSCoW', 'Define an MVP that tests the riskiest assumption', 'Identify technical dependencies and feasibility risks'],
		keyConcepts: ['Minimum viable product', 'MoSCoW', 'Riskiest assumption test', 'Prototype-only vs. implemented'],
		examples: `${S}: the team cuts room booking, friend finding and noise ratings. The MVP is a live list of study spaces with a crowd level, because "can we get occupancy data?" is the riskiest assumption.`,
		activity: 'Fill in Scope → Feature prioritization and mark what is in the MVP. Then open the Feasibility Explorer and give every area a status.',
		resources: ['MoSCoW worksheet (demo placeholder)', 'Feasibility Explorer (in Studio)']
	},
	{
		gm: 6, title: 'DESIGN IT — User Journeys and Design', date: '2026-10-21', phase: 'build',
		description: 'Design the core journey a real customer takes, from first open to the moment of value.',
		topics: ['User journeys', 'Wireframes', 'Design rationale'],
		objectives: ['Map the core user journey step by step', 'Sketch low-fidelity wireframes for the MVP', 'Explain each design decision with evidence'],
		keyConcepts: ['Core journey', 'Low vs. high fidelity', 'Design rationale', 'Accessibility basics'],
		examples: `${S}: the journey is "open app → see nearest open spaces → pick one → get directions." The team puts the crowd level on the first screen because interviewees said they decide in seconds.`,
		activity: 'Write Build → Core user journey, then sketch wireframes for each step. Record at least two design decisions in the Decision log.',
		resources: ['Journey mapping template (demo placeholder)', 'Accessibility checklist (demo placeholder)']
	},
	{
		gm: 7, title: 'BUILD IT — Prototyping', date: '2026-10-28', phase: 'build',
		description: 'Turn wireframes into a clickable prototype that is honest about what is real and what is simulated.',
		topics: ['Clickable prototypes', 'Prototype scope', 'Known limitations'],
		objectives: ['Build a clickable prototype of the core journey', 'Separate simulated features from implemented ones', 'List known prototype limitations'],
		keyConcepts: ['Fidelity matched to the question', 'Wizard-of-Oz testing', 'Prototype honesty'],
		examples: `${S}: crowd levels in the prototype are hard-coded. The team labels them "simulated" in Build → Known prototype limitations, so judges know what is real.`,
		activity: 'Link your prototype in Build. Update Scope → Feature prioritization so each feature says Prototype only, Implemented or Verified.',
		resources: ['Prototyping tips (demo placeholder)']
	},
	{
		gm: 8, title: 'VALIDATE IT — Testing and Iteration', date: '2026-11-04', phase: 'validate',
		description: 'Run usability tests, learn what breaks, and change the product because of evidence.',
		topics: ['Usability testing', 'Task scenarios', 'Iteration'],
		objectives: ['Write realistic task scenarios', 'Run moderated usability sessions', 'Log iterations with the evidence behind them'],
		keyConcepts: ['Think-aloud protocol', 'Task success rate', 'Severity of usability issues', 'Representative testers'],
		examples: `${S}: 4 of 6 testers didn't understand the crowd icons. The team replaces them with labels ("Quiet", "Busy", "Full") and success rises from 2/6 to 5/6.`,
		activity: 'Run at least five sessions and log each in Validate → Testing session log. Record every change in the Iteration log.',
		resources: ['Usability test script template (demo placeholder)', 'Severity rating guide (demo placeholder)']
	},
	{
		gm: 9, title: 'PITCH IT — Product Storytelling', date: '2026-11-18', phase: 'showcase',
		description: 'Build the story of how evidence shaped your product, plan the MVP demo, and practice privately with your team.',
		topics: ['Storyboarding', 'MVP demo planning', 'Private pitch practice'],
		objectives: ['Storyboard a 10-minute pitch around one customer', 'Plan a live MVP demo with a backup', 'Run a private team pitch practice and collect feedback'],
		keyConcepts: ['Story arc: problem → insight → product → proof', 'Show, don’t tell', 'Demo backup plans', 'Time-boxing'],
		examples: `${S}: the pitch opens with "Priya, a junior, walked between four buildings during finals week," then shows the evidence, the demo and what testing changed.`,
		activity: 'Storyboard the pitch in six frames. Write Showcase → Demo flow and record a backup video of the demo. Run one private, timed practice and note three improvements.',
		resources: ['Storyboard template (demo placeholder)', 'Demo backup checklist (demo placeholder)']
	},
	{
		gm: 10, title: 'PROVE IT — Demo Day Preparation', date: '2026-12-02', phase: 'showcase',
		description: 'Understand how judges score, practice defending your decisions, and use the final work session to polish.',
		topics: ['Judging expectations', 'Hot-seat questions', 'Final work session'],
		objectives: ['Explain how each rubric category is judged', 'Defend key product decisions with evidence', 'Finish demo preparation in a final team work session'],
		keyConcepts: ['Rubric-driven preparation', 'Defending trade-offs', 'Judge hot seat', 'Rehearsal under time pressure'],
		examples: `${S}: in the hot seat a judge asks, "Why not just use Google Maps' busy times?" The team answers with interview evidence: campus rooms aren't listed there, and students need per-room detail.`,
		activity: 'Go through the rubric category by category. Each teammate answers two hot-seat questions in under 60 seconds. Use the rest of the session to finish the checklist on the Demo Day page.',
		resources: ['Fall 2026 judging rubric (on the Demo Day page)', 'Hot-seat question bank (demo placeholder)']
	}
];

export const milestones = [
	{
		number: 1, title: 'Opportunity Review', afterGm: 'GM4', targetDate: '2026-10-09', phases: ['discover', 'position'],
		description: 'Is the problem real, specific and worth solving, and how is it solved today?',
		areas: ['Interview evidence', 'Problem statement', 'Target segment', 'Competitive landscape'],
		questions: ['What surprised you most in your interviews?', 'Which finding is still an assumption?', 'Why would someone switch from what they use today?']
	},
	{
		number: 2, title: 'Business and Feasibility Review', afterGm: 'GM5', targetDate: '2026-10-23', phases: ['monetize', 'scope'],
		description: 'Who pays, can it be built, and what is the smallest version worth testing?',
		areas: ['Business model', 'Pricing evidence', 'MVP scope', 'Feasibility risks'],
		questions: ['Which pricing assumption is weakest?', 'What is the riskiest technical dependency?', 'What did you cut from the MVP and why?']
	},
	{
		number: 3, title: 'Prototype Review', afterGm: 'GM7', targetDate: '2026-11-06', phases: ['build'],
		description: 'Does the prototype walk through the core journey, and is it honest about what is real?',
		areas: ['Core journey', 'Design rationale', 'Prototype scope'],
		questions: ['Walk me through the core journey in under two minutes.', 'What is simulated in this prototype?', 'Which design decision are you least sure about?']
	},
	{
		number: 4, title: 'Validation Review', afterGm: 'GM8', targetDate: '2026-11-20', phases: ['validate', 'showcase'],
		description: 'What did testing show, what changed, and is the team ready for Demo Day?',
		areas: ['Testing evidence', 'Iterations', 'Demo Day story'],
		questions: ['What did testing change about your product?', 'Were your testers representative of your customer?', 'What is the one thing judges must remember?']
	}
];

export const demoDay = {
	date: '2026-12-05',
	time: '6:00–8:30 PM',
	location: 'Demo venue to be announced (demo data)',
	instructions:
		'Each team has 10 minutes to present, followed by 3 minutes of judge Q&A. Tell the story of how evidence shaped your product: the problem, what you learned, the MVP, what testing changed, and what comes next.\n\nPresentation guidance: open with one real (anonymized) customer, show the prototype live, and keep each speaker to one section.\n\nBackup plan: record a 90-second demo video and keep screenshots in your deck in case the live demo or Wi-Fi fails.',
	rubric: [
		{ label: 'Problem & User Insight', points: 20, description: 'Clear problem, specific customer, strong interview evidence' },
		{ label: 'Product & MVP', points: 20, description: 'The MVP addresses the core problem with a focused scope' },
		{ label: 'Prototype & Execution', points: 20, description: 'The prototype demonstrates the core journey and is honest about what is real' },
		{ label: 'Testing & Iteration', points: 20, description: 'Testing with representative users changed the product' },
		{ label: 'Product Strategy & Future', points: 10, description: 'Business model, differentiation and a credible roadmap' },
		{ label: 'Pitch & Storytelling', points: 10, description: 'Clear, engaging and within time' }
	],
	checklist: [
		'Product story drafted in Showcase',
		'Storyboard reviewed with your mentor',
		'Prototype opens without signing in',
		'Presentation link shared with view access',
		'Demo flow rehearsed end to end in under 10 minutes',
		'Backup demo video recorded',
		'Each teammate knows their speaking part',
		'Answers drafted for likely judge questions'
	],
	judgeQuestions: [
		'What evidence convinced you this problem is worth solving?',
		'Why would someone choose this over what they use today?',
		'What is real in this prototype and what is simulated?',
		'What did testing change about your product?',
		'Which assumption is still unproven, and how would you test it?',
		'What would you build next with three more months?'
	],
	resources: [] as { title: string; url: string }[]
};

export const announcements = [
	{ title: 'Welcome to Fall 2026 (demo data)', body: 'This semester is fictional demo data used to show how TPC Studio works. Teams, research and feedback are invented.', at: '2026-08-31T15:00:00Z' },
	{ title: 'Validation Review closes Nov 20', body: 'Mark the Validation Review ready once your testing log and iteration log are up to date.', at: '2026-11-12T15:00:00Z' },
	{ title: 'Demo Day is December 5', body: '10 minutes to present plus 3 minutes of Q&A. Check the Demo Day page for the rubric and checklist.', at: '2026-11-19T15:00:00Z' }
];

// Added on top of the default Career Center items so each section reaches the requested size.
export const career: { section: string; title: string; body?: string }[] = [
	...[
		'Design a product to help students find an open study space during finals.',
		'How would you improve the onboarding of a budgeting app?',
		'Design a product for older adults learning to video-call family.',
		'Pick a product you use daily. What is one feature you would remove, and why?',
		'Design a way for travelers to know whether a review is trustworthy.',
		'How would you help roommates split chores fairly?',
		'Design a product that helps students prepare for their first interview.'
	].map((title) => ({ section: 'product-sense', title })),
	...[
		'A free general-purpose AI tool now does 70% of what your product does. How do you respond?',
		'Should a roommate app move into rent payments? What would you need to believe?',
		'You can sell to individuals or to organizations. How do you choose?'
	].map((title) => ({ section: 'strategy', title })),
	...[
		'What would you measure to know a usability fix worked?',
		'Your free-to-paid conversion is 2%, below the 8% you assumed. What do you check first?',
		'Define success metrics for a tutorial product for older adults.'
	].map((title) => ({ section: 'metrics', title })),
	...[
		'Tell me about a time you had to cut scope to hit a deadline.',
		'Tell me about feedback from a mentor that changed your direction.'
	].map((title) => ({ section: 'behavioral', title })),
	{ section: 'frameworks', title: 'STAR interview framework', body: 'Situation: the context in one or two sentences.\nTask: what you were responsible for.\nAction: what you did, in first person, with the reasoning.\nResult: the outcome, with a number if you have one, and what you learned.' },
	{ section: 'frameworks', title: 'Prioritization: RICE', body: 'Reach × Impact × Confidence ÷ Effort. Use it to compare features when MoSCoW leaves too many "Must haves." State your confidence honestly and say where the numbers came from.' },
	{ section: 'resume', title: 'Testing and iteration', body: 'Led 8 usability sessions on an interview-practice prototype; replaced a 7-step onboarding with 3 steps, cutting time-to-first-practice from 6 minutes to under 2.' },
	{ section: 'resume', title: 'Business model', body: 'Modeled a freemium subscription (1,000 users, 8% conversion, $7.99/month) and identified AI inference as the largest cost risk, informing a usage cap on the free tier.' },
	{ section: 'resume', title: 'Cross-functional leadership', body: 'Coordinated a 5-person team across research, design and pitch tracks over 14 weeks, presenting the final product to a judging panel at Demo Day.' },
	{ section: 'portfolio', title: 'Portfolio case study template', body: 'Title and one-line summary\nMy role and team\nThe problem and who has it (with one quote)\nResearch: methods, numbers, top three insights\nKey decisions (from the decision log), including one you reversed\nThe solution: 3–4 screens of the core journey\nTesting: what broke and what you changed\nResults and what is still unproven\nWhat I learned and what I would do next' },
	{ section: 'reflection', title: 'Which piece of mentor feedback was hardest to hear, and what did you do with it?' },
	{ section: 'reflection', title: 'If you restarted the project tomorrow, what would you do in the first two weeks?' },
	{ section: 'reflection', title: 'What did testing with real users teach you that interviews did not?' }
];
