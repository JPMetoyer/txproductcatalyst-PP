// Realistic mock data for the frontend prototype.
// Mirrors the shape of the future Supabase tables; replaced in Phase 1 by queries in $lib/data/*.server.ts.

import type {
	Announcement,
	Challenge,
	Decision,
	FeedbackItem,
	FieldComment,
	Lesson,
	LogEntry,
	Milestone,
	MilestoneReview,
	Product,
	ProductFields,
	Profile,
	Semester,
	Task,
	Team,
	TeamMember
} from '$lib/types/domain';

/** The prototype pretends "today" is mid-February so the dashboards have something to show. */
export const MOCK_TODAY = '2027-02-17';

export const semester: Semester = {
	id: 'sem-sp27',
	name: 'Spring 2027',
	theme: 'Life in Motion',
	startDate: '2027-01-19',
	endDate: '2027-05-07',
	status: 'active',
	publicMarketplace: true
};

export const challenges: Challenge[] = [
	{
		id: 'ch-1',
		semesterId: semester.id,
		code: 'LM-01',
		title: 'The First Apartment',
		summary: 'Leases, roommates, utilities, and the first time everything is your responsibility.',
		icon: 'home',
		accent: 'blue',
		experience:
			'Moving into a first apartment introduces unfamiliar financial commitments, responsibilities, decisions, and interactions with service providers.',
		mission:
			'Investigate the experience of moving into and managing a home independently. Identify a meaningful problem and develop a product that addresses it.',
		stakeholders: ['Renters', 'Roommates', 'Landlords', 'Property managers', 'Service providers'],
		researchConsiderations: [
			'First-time renters and experienced renters will describe the problem very differently.',
			'Landlords and property managers may be willing paying customers even when renters are the users.',
			'Ask about the last time something went wrong, not what “usually” happens.'
		],
		boundaries: [
			'Avoid products that require providing legal or financial advice.',
			'Do not collect lease documents or personal financial records during research.'
		],
		expectations: [
			'Demonstrate a meaningful customer problem.',
			'Identify differentiation from existing alternatives.',
			'Establish a realistic business or value-creation model.',
			'Investigate technical feasibility.',
			'Develop a testable MVP.'
		],
		published: true
	},
	{
		id: 'ch-2',
		semesterId: semester.id,
		code: 'LM-02',
		title: 'Financial Independence',
		summary: 'The first paycheck, the first budget, the first time money decisions are entirely yours.',
		icon: 'wallet',
		accent: 'orange',
		experience:
			'Becoming financially independent means managing income, bills, credit, and savings — often without a model for how to do it well.',
		mission:
			'Explore how young adults take ownership of their finances. Identify a moment where people struggle, and build something that genuinely helps.',
		stakeholders: ['Young professionals', 'Students with jobs', 'Parents', 'Banks & credit unions', 'Employers'],
		researchConsiderations: [
			'Money is personal — let participants share stories without sharing numbers.',
			'Look beyond budgeting apps: what do people do when they feel behind?'
		],
		boundaries: ['Do not build products that move money or provide investment advice in the MVP.'],
		expectations: [
			'Demonstrate a meaningful customer problem.',
			'Identify differentiation from existing alternatives.',
			'Establish a realistic business or value-creation model.',
			'Investigate technical feasibility.',
			'Develop a testable MVP.'
		],
		published: true
	},
	{
		id: 'ch-3',
		semesterId: semester.id,
		code: 'LM-03',
		title: 'Entering the Workforce',
		summary: 'Offer letters, onboarding, benefits enrollment, and figuring out the unwritten rules.',
		icon: 'briefcase',
		accent: 'lavender',
		experience:
			'Starting a first full-time role brings unfamiliar systems — benefits, taxes, workplace norms — at the same time as high expectations to perform.',
		mission: 'Investigate the transition from student to employee and find where new hires lose time, confidence, or money.',
		stakeholders: ['New graduates', 'Hiring managers', 'HR & people teams', 'Career centers', 'Mentors'],
		researchConsiderations: ['Employers may be the buyer even if new hires are the users.', 'Talk to people 3–18 months into their first job.'],
		boundaries: ['Avoid products that depend on access to private employer HR systems for the MVP.'],
		expectations: [
			'Demonstrate a meaningful customer problem.',
			'Identify differentiation from existing alternatives.',
			'Establish a realistic business or value-creation model.',
			'Investigate technical feasibility.',
			'Develop a testable MVP.'
		],
		published: true
	},
	{
		id: 'ch-4',
		semesterId: semester.id,
		code: 'LM-04',
		title: 'Navigating New Places',
		summary: 'New cities, new transit systems, new neighborhoods — and nobody to ask.',
		icon: 'map',
		accent: 'pink',
		experience: 'Relocating for school, work, or family means rebuilding routines, finding services, and learning how a place works.',
		mission: 'Explore what makes a new place feel navigable and find a problem worth solving for newcomers or the places that welcome them.',
		stakeholders: ['Newcomers', 'Local businesses', 'Cities & transit agencies', 'Universities', 'Employers'],
		researchConsiderations: ['Consider international newcomers and people moving for non-school reasons.'],
		boundaries: ['Avoid real-time location tracking of individuals.'],
		expectations: [
			'Demonstrate a meaningful customer problem.',
			'Identify differentiation from existing alternatives.',
			'Establish a realistic business or value-creation model.',
			'Investigate technical feasibility.',
			'Develop a testable MVP.'
		],
		published: true
	},
	{
		id: 'ch-5',
		semesterId: semester.id,
		code: 'LM-05',
		title: 'Taking Care of Others',
		summary: 'Caring for a sibling, a parent, a pet, or a friend — often without preparation.',
		icon: 'heart-handshake',
		accent: 'pink',
		experience: 'Many young adults take on caregiving responsibilities while managing school, work, and their own lives.',
		mission: 'Investigate the realities of caregiving and identify where coordination, information, or support breaks down.',
		stakeholders: ['Family caregivers', 'Care recipients', 'Healthcare providers', 'Employers', 'Community organizations'],
		researchConsiderations: ['Caregiving can be sensitive — let participants set boundaries.', 'Do not collect health information.'],
		boundaries: ['No diagnostic or medical-advice products.'],
		expectations: [
			'Demonstrate a meaningful customer problem.',
			'Identify differentiation from existing alternatives.',
			'Establish a realistic business or value-creation model.',
			'Investigate technical feasibility.',
			'Develop a testable MVP.'
		],
		published: true
	},
	{
		id: 'ch-6',
		semesterId: semester.id,
		code: 'LM-06',
		title: 'Building Something of Your Own',
		summary: 'Side projects, small businesses, and creative work that wants to become real.',
		icon: 'rocket',
		accent: 'orange',
		experience: 'Starting something of your own — a side business, a creative practice, a community project — requires skills nobody teaches.',
		mission: 'Explore the early journey of independent builders and find the moment where momentum stalls.',
		stakeholders: ['Solo founders', 'Creators', 'Freelancers', 'Small business owners', 'Customers of small businesses'],
		researchConsiderations: ['Compare people who kept going with people who stopped.'],
		boundaries: ['Avoid products that require handling payments or taxes in the MVP.'],
		expectations: [
			'Demonstrate a meaningful customer problem.',
			'Identify differentiation from existing alternatives.',
			'Establish a realistic business or value-creation model.',
			'Investigate technical feasibility.',
			'Develop a testable MVP.'
		],
		published: true
	},
	{
		id: 'ch-7',
		semesterId: semester.id,
		code: 'LM-07',
		title: 'Finding Your People',
		summary: 'Making friends after school, joining communities, and staying connected through change.',
		icon: 'users',
		accent: 'lavender',
		experience: 'Life transitions disrupt social circles. Building new connections as an adult is harder and less structured than it used to be.',
		mission: 'Investigate how people build belonging during transitions and identify an unmet need.',
		stakeholders: ['Young adults', 'Community organizers', 'Employers', 'Local venues', 'Clubs & associations'],
		researchConsiderations: ['Loneliness can be a sensitive topic — frame questions around activities and routines.'],
		boundaries: ['Avoid dating products and anything that matches minors.'],
		expectations: [
			'Demonstrate a meaningful customer problem.',
			'Identify differentiation from existing alternatives.',
			'Establish a realistic business or value-creation model.',
			'Investigate technical feasibility.',
			'Develop a testable MVP.'
		],
		published: true
	},
	{
		id: 'ch-8',
		semesterId: semester.id,
		code: 'LM-08',
		title: 'Navigating Adult Responsibilities',
		summary: 'Insurance, taxes, car registration, doctor’s appointments — the admin of being an adult.',
		icon: 'clipboard-list',
		accent: 'blue',
		experience: 'Adulthood comes with recurring administrative tasks that are easy to forget, confusing to complete, and costly to get wrong.',
		mission: 'Find a responsibility people dread or miss, understand why, and design a product that makes it manageable.',
		stakeholders: ['Young adults', 'Government agencies', 'Insurers', 'Healthcare offices', 'Parents'],
		researchConsiderations: ['Ask participants to walk through the last time they completed a specific task.'],
		boundaries: ['Do not store government ID numbers or sensitive records.'],
		expectations: [
			'Demonstrate a meaningful customer problem.',
			'Identify differentiation from existing alternatives.',
			'Establish a realistic business or value-creation model.',
			'Investigate technical feasibility.',
			'Develop a testable MVP.'
		],
		published: true
	}
];

export const profiles: Profile[] = [
	{ id: 'p-team-1', displayName: 'Team Nestled', role: 'team', active: true },
	{ id: 'p-mentor-1', displayName: 'Priya Raman', role: 'mentor', active: true, email: 'priya@example.org' },
	{ id: 'p-mentor-2', displayName: 'Marcus Lee', role: 'mentor', active: true, email: 'marcus@example.org' },
	{ id: 'p-mentor-3', displayName: 'Sofia Alvarez', role: 'mentor', active: true, email: 'sofia@example.org' },
	{ id: 'p-admin-1', displayName: 'Academics Committee', role: 'admin', active: true }
];

export const mentors = profiles.filter((p) => p.role === 'mentor');

export const teams: Team[] = [
	{
		id: 't-1',
		semesterId: semester.id,
		name: 'Nestled',
		challengeId: 'ch-1',
		mentorIds: ['p-mentor-1'],
		status: 'active',
		currentPhase: 'position',
		phasesStarted: ['discover', 'position'],
		lastActivityAt: '2027-02-17T02:14:00Z'
	},
	{
		id: 't-2',
		semesterId: semester.id,
		name: 'Paycheck Pals',
		challengeId: 'ch-2',
		mentorIds: ['p-mentor-1'],
		status: 'active',
		currentPhase: 'discover',
		phasesStarted: ['discover'],
		lastActivityAt: '2027-02-11T19:40:00Z'
	},
	{
		id: 't-3',
		semesterId: semester.id,
		name: 'Onboard',
		challengeId: 'ch-3',
		mentorIds: ['p-mentor-2'],
		status: 'active',
		currentPhase: 'position',
		phasesStarted: ['discover', 'position', 'monetize'],
		lastActivityAt: '2027-02-16T22:05:00Z'
	},
	{
		id: 't-4',
		semesterId: semester.id,
		name: 'Wayfinders',
		challengeId: 'ch-4',
		mentorIds: ['p-mentor-2'],
		status: 'active',
		currentPhase: 'position',
		phasesStarted: ['discover', 'position'],
		lastActivityAt: '2027-02-15T15:30:00Z'
	},
	{
		id: 't-5',
		semesterId: semester.id,
		name: 'CareCircle',
		challengeId: 'ch-5',
		mentorIds: ['p-mentor-3'],
		status: 'active',
		currentPhase: 'discover',
		phasesStarted: ['discover'],
		lastActivityAt: '2027-02-09T18:00:00Z'
	},
	{
		id: 't-6',
		semesterId: semester.id,
		name: 'Side Quest',
		challengeId: 'ch-6',
		mentorIds: ['p-mentor-3'],
		status: 'active',
		currentPhase: 'position',
		phasesStarted: ['discover', 'position'],
		lastActivityAt: '2027-02-16T20:45:00Z'
	},
	{
		id: 't-7',
		semesterId: semester.id,
		name: 'Common Ground',
		challengeId: 'ch-7',
		mentorIds: ['p-mentor-1'],
		status: 'active',
		currentPhase: 'discover',
		phasesStarted: ['discover'],
		lastActivityAt: '2027-02-14T17:20:00Z'
	}
];

const names = [
	['Ava Nguyen', 'Diego Torres', 'Hannah Kim', 'Rohan Patel', 'Maya Johnson'],
	['Ethan Brooks', 'Lila Chen', 'Samir Haddad', 'Grace Okafor'],
	['Noah Garcia', 'Zara Ahmed', 'Owen Park', 'Chloe Martin', 'Isaac Wu'],
	['Mia Rossi', 'Jayden Scott', 'Aisha Bello', 'Leo Fischer'],
	['Emma Davis', 'Kai Tanaka', 'Nora Silva', 'Arjun Mehta'],
	['Lucas White', 'Sophie Laurent', 'Ben Adeyemi', 'Ivy Zhang', 'Theo Romero'],
	['Ella Brown', 'Marco Bianchi', 'Yara Nasser', 'Jonah Cole']
];

export const teamMembers: TeamMember[] = teams.flatMap((t, i) =>
	names[i].map((n, j) => ({ id: `m-${i + 1}-${j + 1}`, teamId: t.id, name: n, active: true }))
);

export const tasks: Task[] = [
	{ id: 'task-1', teamId: 't-1', title: 'Synthesize interviews 6–9 into pain point themes', assignedMemberId: 'm-1-1', dueDate: '2027-02-18', status: 'open' },
	{ id: 'task-2', teamId: 't-1', title: 'Fill in competitor table (include group chats + spreadsheets)', assignedMemberId: 'm-1-3', dueDate: '2027-02-19', status: 'open' },
	{ id: 'task-3', teamId: 't-1', title: 'Draft positioning statement', assignedMemberId: 'm-1-2', dueDate: null, status: 'open' },
	{ id: 'task-4', teamId: 't-1', title: 'Schedule 3 property manager interviews', assignedMemberId: 'm-1-4', dueDate: '2027-02-22', status: 'open' },
	{ id: 'task-5', teamId: 't-1', title: 'Write interview guide v2', assignedMemberId: 'm-1-5', dueDate: '2027-02-08', status: 'done' }
];

export const lessons: Lesson[] = [
	{ id: 'l-1', gmNumber: 1, title: 'THINK IT', scheduledDate: '2027-01-27', description: 'Product management fundamentals, the four product risks, and challenge kickoff.', topics: ['PM fundamentals', 'Four product risks', 'Challenge kickoff', 'Stakeholder exploration'], relatedPhase: 'overview', published: true },
	{ id: 'l-2', gmNumber: 2, title: 'DISCOVER IT', scheduledDate: '2027-02-03', description: 'Run customer interviews that uncover real behavior, not polite opinions.', topics: ['Customer discovery', 'User research', 'Problem validation'], relatedPhase: 'discover', published: true },
	{ id: 'l-3', gmNumber: 3, title: 'POSITION IT', scheduledDate: '2027-02-10', description: 'Map the alternatives and find the angle that makes switching worth it.', topics: ['Competitive analysis', 'Market opportunities', 'Differentiation'], relatedPhase: 'position', published: true },
	{ id: 'l-4', gmNumber: 4, title: 'MONETIZE IT', scheduledDate: '2027-02-24', description: 'Who pays, how much, and does the math work? Revenue models, pricing, and costs.', topics: ['Revenue models', 'Business viability', 'Pricing', 'Customer acquisition', 'Costs'], relatedPhase: 'monetize', published: true },
	{ id: 'l-5', gmNumber: 5, title: 'SCOPE IT', scheduledDate: '2027-03-03', description: 'Technical feasibility, dependencies, and cutting to a real MVP.', topics: ['Technical feasibility', 'Dependencies', 'Prioritization', 'MVP'], relatedPhase: 'scope', published: true },
	{ id: 'l-6', gmNumber: 6, title: 'BUILD IT', scheduledDate: '2027-03-24', description: 'User journeys, wireframes, and interactive prototypes.', topics: ['User journeys', 'Wireframing', 'Prototyping'], relatedPhase: 'build', published: false },
	{ id: 'l-7', gmNumber: 7, title: 'VALIDATE IT', scheduledDate: '2027-03-31', description: 'Usability testing, metrics, and iteration.', topics: ['Usability testing', 'Metrics', 'Experimentation', 'Iteration'], relatedPhase: 'validate', published: false },
	{ id: 'l-8', gmNumber: 8, title: 'SELL YOUR STORY', scheduledDate: '2027-04-07', description: 'Turn your project into interview stories, resume bullets, and a case study.', topics: ['PM interviews', 'Resumes', 'Portfolio case studies'], relatedPhase: null, published: false },
	{ id: 'l-9', gmNumber: 9, title: 'PROVE IT', scheduledDate: '2027-04-14', description: 'Product storytelling and Demo Day preparation.', topics: ['Storytelling', 'Demo Day prep', 'Judge questions'], relatedPhase: 'showcase', published: false }
];

export const milestones: Milestone[] = [
	{
		id: 'ms-1',
		number: 1,
		title: 'Opportunity Review',
		afterGm: 'After GM3',
		targetDate: '2027-02-19',
		reviewAreas: ['Customer problem', 'Research evidence', 'Target customer', 'Existing alternatives', 'Differentiation', 'Initial feasibility concerns'],
		reviewQuestions: [
			'What did you hear in interviews that surprised you?',
			'Who exactly has this problem, and how often?',
			'What do people do today instead? Why isn’t that good enough?',
			'Which assumption, if wrong, would end this direction?'
		],
		relatedPhases: ['discover', 'position']
	},
	{
		id: 'ms-2',
		number: 2,
		title: 'Business & Feasibility Review',
		afterGm: 'After GM5',
		targetDate: '2027-03-05',
		reviewAreas: ['Business model', 'Paying customer', 'Pricing assumptions', 'Technical dependencies', 'Data availability', 'MVP scope', 'Major risks'],
		reviewQuestions: [
			'Who pays, and what evidence suggests they would?',
			'What data or integrations does this depend on? Do they exist?',
			'What is the smallest version that proves the value?'
		],
		relatedPhases: ['monetize', 'scope']
	},
	{
		id: 'ms-3',
		number: 3,
		title: 'Prototype Review',
		afterGm: 'After GM6',
		targetDate: '2027-03-26',
		reviewAreas: ['Core user journey', 'Interactive prototype', 'MVP functionality', 'Design decisions', 'Readiness for testing'],
		reviewQuestions: ['Walk me through the core journey.', 'What is real vs. mocked in this prototype?', 'What will you test first?'],
		relatedPhases: ['build']
	},
	{
		id: 'ms-4',
		number: 4,
		title: 'Validation Review',
		afterGm: 'After GM7 or GM8',
		targetDate: '2027-04-09',
		reviewAreas: ['Testing evidence', 'Success metrics', 'Product improvements', 'Remaining assumptions', 'Demo Day readiness'],
		reviewQuestions: ['What changed because of testing?', 'Which assumptions are still unproven?', 'What’s the one thing judges must remember?'],
		relatedPhases: ['validate', 'showcase']
	}
];

export const milestoneReviews: MilestoneReview[] = teams.flatMap((t) =>
	milestones.map((m) => {
		const status: MilestoneReview['status'] =
			m.number === 1
				? t.id === 't-1' || t.id === 't-3'
					? 'ready'
					: t.id === 't-6'
						? 'reviewed'
						: t.id === 't-5'
							? 'follow-up'
							: 'upcoming'
				: 'upcoming';
		return {
			id: `mr-${t.id}-${m.id}`,
			milestoneId: m.id,
			teamId: t.id,
			reviewerId: status === 'reviewed' || status === 'follow-up' ? t.mentorIds[0] : null,
			status,
			feedback: status === 'reviewed' ? 'Strong evidence from 11 interviews. Differentiation is clear.' : status === 'follow-up' ? 'Only 3 interviews so far — problem is not yet validated.' : '',
			nextSteps: status === 'follow-up' ? 'Complete 5 more caregiver interviews before GM4.' : '',
			blockers: t.id === 't-5' ? 'Struggling to recruit caregivers for interviews.' : '',
			reviewedAt: status === 'reviewed' || status === 'follow-up' ? '2027-02-15T18:00:00Z' : null,
			readyAt: status === 'ready' ? '2027-02-16T21:00:00Z' : null
		};
	})
);

export const feedback: FeedbackItem[] = [
	{
		id: 'fb-1',
		teamId: 't-1',
		milestoneId: 'ms-1',
		mentorName: 'Priya Raman',
		body: 'Great interview depth. Before the Opportunity Review, sharpen the target segment — “first-time renters” is broad. Is it students in shared housing, or new grads living alone? Your quotes point to the former.',
		createdAt: '2027-02-12T20:10:00Z'
	}
];

export const announcements: Announcement[] = [
	{ id: 'a-1', title: 'Milestone 1 reviews this week', body: 'Mentors will reach out to schedule 15-minute Opportunity Reviews. Mark yourselves ready in My Product.', publishedAt: '2027-02-15T16:00:00Z' }
];

const f = (value: unknown, evidence: 'assumption' | 'validated' | null = null): ProductFields[string] => ({
	value,
	evidence,
	version: 1,
	updatedAt: '2027-02-16T21:00:00Z'
});

const nestledLogs: LogEntry[] = [
	{
		id: 'log-1',
		productId: 'prod-1',
		kind: 'research',
		position: 0,
		version: 1,
		data: {
			participant: 'R-01',
			category: 'First-time renter (student, 3 roommates)',
			date: '2027-02-04',
			observations: 'Tracks shared bills in a group chat; lost track of who paid internet in December.',
			quotes: '“I Venmo’d twice for the same bill and nobody noticed for a month.”',
			pains: 'Splitting recurring bills; no single source of truth',
			notes: 'Uses a notes app for move-in checklist.'
		}
	},
	{
		id: 'log-2',
		productId: 'prod-1',
		kind: 'research',
		position: 1,
		version: 1,
		data: {
			participant: 'PM-01',
			category: 'Property manager (180 units)',
			date: '2027-02-08',
			observations: 'Most maintenance tickets in August are from first-time renters who did not know what is tenant responsibility.',
			quotes: '“Half my move-in calls are people asking how to set up electricity.”',
			pains: 'Repetitive onboarding questions',
			notes: 'Potential paying customer — would pay to reduce support calls.'
		}
	},
	{ id: 'log-3', productId: 'prod-1', kind: 'competitor', position: 0, version: 1, data: { name: 'Splitwise', customer: 'Friends & roommates', features: 'Expense splitting, balances', pricing: 'Freemium', strengths: 'Widely known', limits: 'No move-in or utilities setup guidance', opportunity: 'Bundle setup + splitting' } },
	{ id: 'log-4', productId: 'prod-1', kind: 'competitor', position: 1, version: 1, data: { name: 'Group chat + spreadsheet', customer: 'Roommates', features: 'Ad-hoc tracking', pricing: 'Free', strengths: 'Zero setup', limits: 'Gets lost, no reminders', opportunity: 'Reminders tied to real due dates' } },
	{ id: 'log-5', productId: 'prod-1', kind: 'feature', position: 0, version: 1, data: { name: 'Move-in checklist', value: 'Reduces missed setup steps', effort: 'S', priority: 'Must have', mvp: 'Yes', proof: 'Prototype only', reasoning: 'Most-mentioned pain in interviews' } }
];

export const products: Product[] = [
	{
		id: 'prod-1',
		teamId: 't-1',
		name: 'Nestled',
		fields: {
			'ov.name': f('Nestled'),
			'ov.status': f('Problem validated'),
			'ov.description': f('A shared move-in hub for roommates that turns lease, utilities, and bill setup into one checklist with automatic reminders.'),
			'ov.customer': f('Students moving into their first shared off-campus apartment.', 'assumption'),
			'ov.problem': f('First-time renters miss setup steps and lose track of shared recurring bills, causing late fees and roommate conflict.', 'validated'),
			'ov.prototype': f('https://www.figma.com/proto/example'),
			'di.experience': f('Moving into a first off-campus apartment with roommates.'),
			'di.assumptions': f('Roommates already use Splitwise and are happy with it.\nThe landlord handles utilities setup.'),
			'di.segment': f('Undergraduate students, 2–4 roommates, first lease.', 'validated'),
			'di.findings': f('9 of 11 renters had at least one missed or duplicated shared payment in their first semester. Property managers field repetitive setup questions every August.'),
			'di.pains': f('Utilities setup is confusing; shared bills are tracked in group chats and get lost.', 'validated'),
			'po.alternatives': f('Splitwise, Venmo requests, group chats, Google Sheets, property manager welcome emails.'),
			'mo.streams': f(['Freemium', 'Licensing'])
		},
		logs: nestledLogs,
		decisions: [
			{
				id: 'dec-1',
				productId: 'prod-1',
				title: 'Focus on shared apartments, not solo renters',
				date: '2027-02-09',
				phase: 'discover',
				description: 'Narrow target segment to students with roommates.',
				alternatives: 'All first-time renters; new grads living alone.',
				evidence: '9/11 interviewees with roommates described bill-splitting conflict; solo renters did not.',
				reasoning: 'Strongest, most frequent pain was coordination between roommates.',
				attribution: 'Ava, Diego',
				status: 'accepted'
			},
			{
				id: 'dec-2',
				productId: 'prod-1',
				title: 'Explore property managers as paying customer',
				date: '2027-02-15',
				phase: 'monetize',
				description: 'Investigate B2B licensing to property managers who onboard tenants.',
				alternatives: 'Charge renters directly via subscription.',
				evidence: 'PM-01 interview: “would pay to cut August support calls.”',
				reasoning: 'Students are price-sensitive; PMs have budget and a clear cost to save.',
				attribution: '',
				status: 'proposed'
			}
		]
	}
];

export const fieldComments: FieldComment[] = [
	{
		id: 'fc-1',
		productId: 'prod-1',
		fieldKey: 'ov.customer',
		authorName: 'Priya Raman',
		body: 'This is still marked as an assumption — your interview log suggests it’s close to validated. What would you need to confirm it?',
		createdAt: '2027-02-12T20:12:00Z',
		resolved: false
	}
];

/* Helpers used by the mock repository */
export const byId = <T extends { id: string }>(list: T[], id: string | null | undefined) => list.find((x) => x.id === id);
