// Fall 2026 demo teams. ALL NAMES, RESEARCH, NUMBERS AND FEEDBACK ARE FICTIONAL DEMO DATA.
// Interview and testing records are generated from each team's own pools (see demo-seed.ts),
// so counts match the brief without repeating text across teams.

import type { Assumptions } from '../../src/lib/tools/business-model.ts';

type Ev = 'validated' | 'assumption';
export type FieldVal = string | string[] | [string, Ev];
type Phase = 'discover' | 'position' | 'monetize' | 'scope' | 'build' | 'validate' | 'showcase';
type Feas = 'not-investigated' | 'investigating' | 'supported' | 'blocker' | 'not-applicable';

export interface DemoComment {
	field: string;
	at: string;
	body: string;
	by?: 'mentor' | 'admin';
	resolved?: string; // resolved-at timestamp (by the team account)
	replies?: { by: 'team' | 'mentor'; at: string; body: string }[];
}

export interface DemoTeam {
	key: string;
	name: string;
	challenge: string; // challenge code
	mentor: string;
	members: string[];
	phase: Phase;
	readiness: 'not-started' | 'in-progress' | 'ready';
	checklistDone: number;
	fields: Record<string, FieldVal>;
	interviews: { count: number; start: string; categories: string[]; observations: string[]; quotes: string[]; pains: string[] };
	testing: { count: number; start: string; changeOn: string; tasks: string[]; before: string[]; after: string[]; feedback: string[] };
	competitors: Record<string, string>[];
	features: Record<string, string>[];
	iterations: Record<string, string>[];
	businessModel: Assumptions;
	feasibility: Partial<Record<string, [Feas, string]>>;
	decisions: { title: string; date: string; phase: Phase; status: 'proposed' | 'accepted' | 'reconsidering' | 'reversed'; description: string; alternatives: string; evidence: string; reasoning: string; by: string }[];
	tasks: { title: string; member: number; due: string; done?: boolean; created: string }[];
	reviews: { feedback: string; next: string; blockers?: string; followUp?: boolean }[];
	comments: DemoComment[];
	flag?: { reason: string; at: string };
}

const bm = (p: Partial<Assumptions>): Assumptions => ({
	subscription: { enabled: false, potentialCustomers: 0, conversionRate: 0, monthlyPrice: 0 },
	transaction: { enabled: false, monthlyTransactions: 0, averageValue: 0, feePercent: 0 },
	licensing: { enabled: false, organizations: 0, price: 0, billing: 'monthly' },
	costs: { fixedMonthly: 0, variableCost: 0, variableBasis: 'customer', otherMonthly: 0 },
	notes: 'Demo data: fictional assumptions for illustration only.',
	...p
});

const PLACEHOLDER = 'Demo placeholder: this fictional team has no real files. Links are intentionally left blank.';

export const teams: DemoTeam[] = [
	// ───────────────────────────────── CareerCompass ─────────────────────────────────
	{
		key: 'careercompass', name: 'CareerCompass', challenge: 'C3', mentor: 'Maya Chen', phase: 'showcase', readiness: 'ready', checklistDone: 7,
		members: ['Ava Thompson', 'Marcus Lee', 'Sofia Alvarez', 'Ethan Brooks', 'Nia Patel'],
		fields: {
			'ov.name': 'CareerCompass',
			'ov.status': 'Demo-ready',
			'ov.description': 'An AI-powered career coach that gives college students and recent graduates interview practice for the specific role they want, plus personalized feedback on how to improve.',
			'ov.customer': ['College juniors, seniors and recent graduates preparing for their first professional interviews, especially those without access to industry mentors.', 'validated'],
			'ov.problem': ['Students and early-career professionals struggle to prepare for interviews and find relevant opportunities because career advice is generic and personalized feedback is hard to get.', 'validated'],
			'ov.value': ['Practice the exact interview you are about to face and get specific, actionable feedback after every answer.', 'validated'],
			'ov.resources': PLACEHOLDER,
			'di.experience': 'Preparing for a first professional interview: figuring out what the interviewer expects, practicing answers, and knowing whether you are improving.',
			'di.assumptions': 'Students do not practice because they lack time.\nCareer center appointments are hard to book.\nStudents would trust AI feedback on their answers.',
			'di.stakeholders': 'Students and recent graduates, career center advisors, recruiters, student organizations that run mock interviews.',
			'di.segment': ['Juniors and seniors in business, engineering and liberal arts who are actively applying for internships or first jobs.', 'validated'],
			'di.objectives': 'Understand how students prepare for interviews today.\nFind where preparation breaks down.\nLearn what feedback students receive and from whom.',
			'di.questions': 'Tell me about the last interview you prepared for.\nWhat did you do in the 48 hours before it?\nWhere did you look for example questions?\nWho gave you feedback, if anyone? What did they say?\nWhat happened after the interview?\nWhat would you do differently next time?',
			'di.findings': '10 of 12 interviewees relied on generic question lists that did not match the role.\n8 of 12 never received feedback after a mock or real interview.\nStudents without mentors in their field felt they were guessing what "good" looks like.\nCareer center appointments were valued but booked two weeks out during recruiting season.',
			'di.pains': ['Generic advice that does not match the role.\nNo idea what the interviewer expects.\nNo feedback after practice or real interviews.', 'validated'],
			'di.problem': ['Students preparing for role-specific interviews lack personalized practice and feedback, so they walk in unsure what "good" looks like.', 'validated'],
			'di.uncertain': 'Whether students trust AI feedback as much as a human advisor.\nWhether usage continues after the student gets an offer.',
			'po.market': ['Roughly 2 million US bachelor\'s graduates per year, plus juniors recruiting for internships. Initial focus: one large public university.', 'assumption'],
			'po.alternatives': 'LinkedIn, Handshake, Big Interview, ChatGPT, campus career centers, friends who already have offers.',
			'po.workarounds': 'Copying question lists from Glassdoor, recording themselves on a phone, asking a roommate to play interviewer, pasting answers into ChatGPT.',
			'po.opportunity': ['General AI tools are popular but not structured for practice; career platforms focus on job listings, not preparation.', 'assumption'],
			'po.advantage': 'Role-specific question sets and feedback tied to a rubric, with progress tracked across sessions.',
			'po.positioning': 'For students preparing for their first professional interviews who don\'t know what good looks like, CareerCompass is an interview coach that gives role-specific practice and feedback. Unlike ChatGPT, it structures practice and tracks improvement over time.',
			'po.switch': ['Interviewees said they would switch if feedback referenced the actual role and showed progress between sessions.', 'validated'],
			'po.unvalidated': 'That students will return weekly outside recruiting season.',
			'mo.type': 'B2C',
			'mo.streams': ['Freemium', 'Subscription'],
			'mo.user': 'Students and recent graduates',
			'mo.payer': ['Students who are actively recruiting (premium tier)', 'assumption'],
			'mo.value': 'Free practice sessions for everyone; premium unlocks unlimited role-specific sessions and a detailed feedback dashboard.',
			'mo.pricing': ['$7.99/month premium subscription, cancel anytime.', 'assumption'],
			'mo.rationale': 'Priced below Big Interview and comparable to a streaming subscription. Six of twelve interviewees said under $10/month felt reasonable during recruiting season.',
			'mo.acquisition': 'Student organizations, career fair QR codes, referral credits.',
			'mo.costs': '$450/month estimated: AI inference, hosting, and a small moderation budget.',
			'mo.revenueAssumptions': '1,000 active users × 8% paid conversion × $7.99 = $639.20/month.',
			'mo.risks': 'AI costs grow with usage on the free tier; seasonal demand around recruiting.',
			'mo.evidence': 'Pricing comments from 6 interviews; competitor pricing comparison. Conversion rate is an assumption.',
			'sc.solution': 'A guided practice app: set a career goal, practice role-specific questions, get feedback after each answer, and track improvement on a dashboard.',
			'sc.core': 'Career goal onboarding, question generation by role, recorded or typed answers, rubric-based feedback.',
			'sc.mvp': 'Career goal onboarding.\nPersonalized interview questions.\nPractice sessions.\nFeedback dashboard.',
			'sc.outOfScope': 'Automated job applications.\nRecruiter marketplace.\nVideo analysis of body language.',
			'sc.tech': 'Web app, large language model API for question generation and feedback, database for session history.',
			'sc.data': ['Role descriptions and question banks written by the team; no scraped job listings.', 'assumption'],
			'sc.apis': ['Hosted language model API.', 'validated'],
			'sc.access': 'Student account with email sign-in.',
			'sc.privacy': 'Answers can contain personal details. Store minimal data, let users delete sessions, never use answers to train models.',
			'sc.dependencies': 'Language model API pricing and availability.',
			'sc.limits': 'Feedback quality varies by role; prototype covers three roles only.',
			'sc.risks': 'AI operating costs.\nInaccurate or overconfident feedback.\nPersonal data protection.',
			'bu.journey': 'Pick target role → answer three onboarding questions → start a 5-question practice session → read feedback after each answer → see progress on the dashboard.',
			'bu.flow': 'Landing → three-step onboarding → session screen → feedback card → dashboard.',
			'bu.interactions': 'Answer by typing or speaking; tap "Try again" on any answer to see improvement.',
			'bu.rationale': 'Feedback appears immediately after each answer because testers lost context when it came at the end.',
			'bu.decisions': 'Three-step onboarding (down from seven). Feedback uses a simple rubric: structure, specificity, relevance.',
			'bu.limits': 'Feedback is pre-written for three roles in the prototype; live AI feedback is not connected.',
			'bu.resources': PLACEHOLDER,
			'va.objectives': 'Can students finish onboarding and a practice session without help? Is the feedback understandable and actionable?',
			'va.method': 'Eight moderated think-aloud sessions on the clickable prototype, 20 minutes each.',
			'va.metrics': 'Onboarding completion without help; time to first practice question; percent of testers who can explain one change they would make after reading feedback.',
			'va.findings': 'Testers struggled with the original seven-step onboarding. After simplifying to three steps, all remaining testers reached the first question in under two minutes.',
			'va.usability': 'Onboarding too long; "rubric" label unclear; dashboard chart hard to read.',
			'va.validated': 'Students value feedback right after each answer.',
			'va.invalidated': 'Students do not want to set up a detailed profile before practicing.',
			'va.improvements': 'Three-step onboarding, plain-language feedback labels, simpler progress chart.',
			'va.risks': 'Whether students choose this over free general-purpose AI tools.',
			'va.next': 'Test live AI feedback quality with a career advisor; run a pricing survey.',
			'sh.story': 'Ava had four interviews in a week and no one to practice with. Her friends used ChatGPT, but it didn\'t know what a consulting case interview expects. CareerCompass gives her role-specific practice and feedback she can act on.',
			'sh.problem': 'Interview preparation is generic, and students rarely get feedback.',
			'sh.insights': '8 of 12 interviewees never got feedback after practicing. Generic lists did not match the role.',
			'sh.diff': 'Structured, role-specific practice with progress tracking, not a blank chat box.',
			'sh.business': 'Freemium; $7.99/month premium. Scenario: $639.20/month revenue against $450 costs.',
			'sh.feasibility': 'Buildable with a hosted language model API; main risk is cost and feedback accuracy.',
			'sh.testing': '8 sessions. Onboarding cut from seven steps to three.',
			'sh.roadmap': 'Spring: live AI feedback for five roles. Summer: partner with one career center. Later: peer mock interviews.',
			'sh.demoFlow': 'Pick "Product Analyst" → onboarding → answer one question → feedback → dashboard.',
			'sh.judgeQs': 'Why not just use ChatGPT?\nHow accurate is the feedback?\nWhat happens after a student gets an offer?',
			'sh.evidence': '12 interviews, 8 usability sessions, competitor comparison, pricing comments.'
		},
		interviews: {
			count: 12, start: '2026-09-10',
			categories: ['Senior, business', 'Junior, computer science', 'Recent graduate', 'Senior, liberal arts', 'Junior, engineering', 'Career center advisor'],
			observations: ['Prepared using a generic question list from a forum.', 'Practiced alone in front of a mirror the night before.', 'Asked a friend in the industry but felt bad asking twice.', 'Used ChatGPT to draft answers but did not practice saying them.', 'Booked a career center mock interview that was two weeks out.', 'Did not know what the interviewer was evaluating.'],
			quotes: ['"I had no idea if my answers were good or just long."', '"The questions I practiced weren\'t the ones they asked."', '"Nobody ever tells you why you didn\'t get it."', '"ChatGPT says everything I write is great."', '"I wish someone in consulting could just tell me what they look for."', '"I only practice the night before because I don\'t know how else to."', '"My friends with internships had parents in the industry."'],
			pains: ['No feedback after practice', 'Questions don\'t match the role', 'Unclear expectations', 'Practice is lonely and unstructured', 'Hard to book advisor time']
		},
		testing: {
			count: 8, start: '2026-10-29', changeOn: '2026-11-03',
			tasks: ['Set up a goal for a product analyst role and start practicing.', 'Answer one question and find one thing to improve.', 'Find your progress from last week.'],
			before: ['Stopped at step 5 of onboarding and asked why it needed so much information.', 'Skipped the onboarding questions and got generic questions.', 'Did not understand the word "rubric" on the feedback card.'],
			after: ['Reached the first question in about 90 seconds.', 'Read the feedback and rewrote the answer with a specific example.', 'Found the dashboard but wanted the chart simplified.'],
			feedback: ['"The feedback is the best part."', '"Why do you need my GPA?"', '"I\'d use this the week before an interview."', '"This is way more focused than ChatGPT."']
		},
		competitors: [
			{ name: 'ChatGPT', customer: 'Everyone', features: 'Open-ended chat; can role-play interviews', pricing: 'Free / $20', strengths: 'Flexible, familiar, free', limits: 'No structure, no progress tracking, overly positive feedback', opportunity: 'Structured practice with honest, role-specific feedback' },
			{ name: 'Big Interview', customer: 'Students via university licenses', features: 'Video lessons, recorded practice', pricing: '$79+', strengths: 'Established, used by career centers', limits: 'Generic questions, dated experience', opportunity: 'Personalized questions and instant feedback' },
			{ name: 'Handshake', customer: 'College students', features: 'Job listings, employer events', pricing: 'Free', strengths: 'Where students already look for jobs', limits: 'Not focused on preparation', opportunity: 'Prepare for roles found on Handshake' },
			{ name: 'LinkedIn', customer: 'Professionals', features: 'Networking, jobs, AI interview prep (premium)', pricing: 'Free / $39.99', strengths: 'Huge network', limits: 'Prep features buried behind premium; not student-focused', opportunity: 'Student pricing and early-career focus' },
			{ name: 'Campus career center', customer: 'Enrolled students', features: 'Advisor mock interviews', pricing: 'Free', strengths: 'Trusted human feedback', limits: 'Booked weeks out during recruiting', opportunity: 'Practice between appointments' }
		],
		features: [
			{ name: 'Career goal onboarding', value: 'Personalizes every session', effort: 'S', priority: 'Must have', mvp: 'Yes', proof: 'Prototype only', reasoning: 'Questions are only useful if they match the role' },
			{ name: 'Personalized interview questions', value: 'Practice what you will actually be asked', effort: 'M', priority: 'Must have', mvp: 'Yes', proof: 'Prototype only', reasoning: 'Core pain from 10 of 12 interviews' },
			{ name: 'Practice sessions', value: 'Structured repetition', effort: 'M', priority: 'Must have', mvp: 'Yes', proof: 'Prototype only', reasoning: 'Replaces practicing alone' },
			{ name: 'Feedback dashboard', value: 'See improvement over time', effort: 'M', priority: 'Must have', mvp: 'Yes', proof: 'Prototype only', reasoning: 'Feedback was the most-requested missing piece' },
			{ name: 'Voice answers', value: 'Closer to a real interview', effort: 'L', priority: 'Should have', mvp: 'No', proof: 'Idea', reasoning: 'Valuable but adds speech-to-text cost' },
			{ name: 'Automated job applications', value: 'Saves time applying', effort: 'XL', priority: 'Not now', mvp: 'No', proof: 'Idea', reasoning: 'Out of scope; not the validated problem' },
			{ name: 'Recruiter marketplace', value: 'Connects students to recruiters', effort: 'XL', priority: 'Not now', mvp: 'No', proof: 'Idea', reasoning: 'Two-sided marketplace is too large for the semester' }
		],
		iterations: [
			{ original: 'Seven-step onboarding with GPA, major, schools, and goals', evidence: '4 of the first 4 testers hesitated or quit before step 5', change: 'Three-step onboarding: role, experience level, interview date', reason: 'Get students to their first question fast', date: '2026-11-03' },
			{ original: 'Feedback labeled with a "rubric" score', evidence: '3 testers asked what "rubric" meant', change: 'Plain labels: Structure, Specific example, Relevance', reason: 'Feedback must be understandable to act on', date: '2026-11-05' },
			{ original: 'Feedback shown at the end of the session', evidence: 'Testers forgot their answers by the end', change: 'Feedback shown after each answer', reason: 'Keep context while it is fresh', date: '2026-10-22' }
		],
		businessModel: bm({ subscription: { enabled: true, potentialCustomers: 1000, conversionRate: 8, monthlyPrice: 7.99 }, costs: { fixedMonthly: 450, variableCost: 0, variableBasis: 'customer', otherMonthly: 0 } }),
		feasibility: {
			technology: ['supported', 'Hosted language model APIs can generate questions and feedback; tested with sample prompts.'],
			data: ['supported', 'Team-written question banks for three roles.'],
			integrations: ['supported', 'Single API dependency.'],
			access: ['not-applicable', 'No special permissions beyond student sign-in.'],
			privacy: ['investigating', 'Answers may include personal stories; drafting a deletion policy.'],
			complexity: ['supported', 'Core flow is a small web app.'],
			costs: ['investigating', 'Inference cost per session estimated at $0.02–0.05; free-tier cap needed.'],
			prototype: ['supported', 'Prototype simulates AI feedback with pre-written examples.']
		},
		decisions: [
			{ title: 'Focus on students and recent graduates', date: '2026-09-24', phase: 'discover', status: 'accepted', description: 'Narrow the target customer from "job seekers" to students and recent graduates.', alternatives: 'All job seekers; mid-career switchers.', evidence: '12 interviews: students lacked mentors and feedback most acutely.', reasoning: 'Sharpest pain and easiest to reach on campus.', by: 'Ava Thompson' },
			{ title: 'Freemium with $7.99 premium', date: '2026-10-08', phase: 'monetize', status: 'accepted', description: 'Free practice with a paid tier for unlimited sessions and the dashboard.', alternatives: 'Licensing to career centers; one-time purchase.', evidence: 'Six interviewees said under $10/month was reasonable during recruiting.', reasoning: 'Lets students try before paying; career center sales cycles are too slow for the semester.', by: 'Marcus Lee' },
			{ title: 'Drop recruiter marketplace from MVP', date: '2026-10-15', phase: 'scope', status: 'accepted', description: 'Remove the recruiter-facing side entirely.', alternatives: 'Keep a simple recruiter profile page.', evidence: 'No interviewee mentioned recruiters as a need.', reasoning: 'Two-sided marketplace doubles scope without addressing the validated problem.', by: 'Sofia Alvarez' },
			{ title: 'Detailed profile before first practice', date: '2026-10-20', phase: 'build', status: 'reversed', description: 'Collect GPA, major, schools and goals up front to personalize questions.', alternatives: 'Ask only for the target role.', evidence: 'Usability testing: testers abandoned at step 5 of 7.', reasoning: 'Reversed on Nov 3: personalization was not worth the drop-off. Now three steps.', by: 'Ethan Brooks' },
			{ title: 'Show feedback after every answer', date: '2026-10-22', phase: 'build', status: 'accepted', description: 'Move feedback from the end of the session to after each answer.', alternatives: 'End-of-session summary only.', evidence: 'Early testers forgot their answers by the end.', reasoning: 'Immediate feedback is easier to act on.', by: 'Nia Patel' }
		],
		tasks: [
			{ title: 'Update competitor comparison with LinkedIn premium prep', member: 1, due: '2026-10-03', done: true, created: '2026-09-28' },
			{ title: 'Simplify onboarding flow to three steps', member: 3, due: '2026-11-04', done: true, created: '2026-11-01' },
			{ title: 'Finalize prototype for Demo Day', member: 2, due: '2026-11-22', done: true, created: '2026-11-10' },
			{ title: 'Prepare Demo Day slides', member: 0, due: '2026-11-28', created: '2026-11-18' },
			{ title: 'Practice judge questions (ChatGPT comparison)', member: 4, due: '2026-12-03', created: '2026-11-20' },
			{ title: 'Validate pricing assumptions with a short survey', member: 1, due: '2026-11-20', created: '2026-11-08' },
			{ title: 'Record backup demo video', member: 3, due: '2026-12-01', created: '2026-11-21' }
		],
		reviews: [
			{ feedback: 'Strong problem validation. Twelve interviews with clear patterns, and the problem statement is specific.', next: 'Add LinkedIn premium to the competitor table and explain why students would switch.' },
			{ feedback: 'Pricing logic is reasonable, but conversion is an assumption. Good call cutting the recruiter marketplace.', next: 'Estimate AI cost per session and decide on a free-tier cap.' },
			{ feedback: 'Prototype walks through the full journey. Onboarding is long; watch for drop-off in testing.', next: 'Test onboarding with at least five students.' },
			{ feedback: 'Great iteration on onboarding. Explain why users would choose this product over general-purpose AI tools; judges will ask.', next: 'Prepare a 30-second answer to "Why not ChatGPT?" with evidence.' }
		],
		comments: [
			{ field: 'po.advantage', at: '2026-10-07T18:20:00Z', body: 'How is this different from asking ChatGPT to run a mock interview? Judges will ask.', replies: [{ by: 'team', at: '2026-10-08T02:10:00Z', body: 'Good point. Adding structure and progress tracking as the key difference, plus the test where ChatGPT rated every answer "great."' }, { by: 'mentor', at: '2026-10-08T15:00:00Z', body: 'That test is great evidence. Put it in Showcase too.' }], resolved: '2026-10-09T16:00:00Z' },
			{ field: 'mo.pricing', at: '2026-10-21T17:05:00Z', body: 'Where does $7.99 come from? Can you show evidence students would pay for this?', replies: [{ by: 'team', at: '2026-10-22T01:30:00Z', body: 'Six interviewees said under $10/month. We know that\'s thin; running a survey next.' }] },
			{ field: 'di.findings', at: '2026-09-30T19:00:00Z', body: 'Very clear findings with counts. Nice work.', resolved: '2026-10-01T14:00:00Z' },
			{ field: 'va.findings', at: '2026-11-07T20:15:00Z', body: 'Did onboarding completion change after the three-step redesign? Please add the before and after numbers.', replies: [{ by: 'team', at: '2026-11-08T03:00:00Z', body: 'Added: 0 of 4 finished the old flow unaided vs. 4 of 4 on the new one.' }], resolved: '2026-11-09T15:00:00Z' },
			{ field: 'sh.diff', at: '2026-11-19T18:40:00Z', body: 'This still reads as a feature list. Lead with the evidence about ChatGPT feedback being overly positive.', resolved: '2026-11-20T17:00:00Z', replies: [{ by: 'team', at: '2026-11-20T16:30:00Z', body: 'Rewrote it around the evidence.' }, { by: 'mentor', at: '2026-11-21T15:10:00Z', body: 'Reopening: better, but cut it to two sentences for the pitch.' }] }
		]
	},
	// ───────────────────────────────── TechBridge ─────────────────────────────────
	{
		key: 'techbridge', name: 'TechBridge', challenge: 'C5', mentor: 'Daniel Okafor', phase: 'validate', readiness: 'in-progress', checklistDone: 3,
		members: ['Grace Nguyen', 'Omar Haddad', 'Lily Carter', 'Jonah Reyes'],
		fields: {
			'ov.name': 'TechBridge',
			'ov.status': 'Testing',
			'ov.description': 'Step-by-step technology guidance for adults 60 and older, built around everyday tasks like video-calling family or refilling a prescription online.',
			'ov.customer': ['Adults aged 60+ who want to use technology independently; caregivers are secondary stakeholders.', 'validated'],
			'ov.problem': ['Older adults struggle to navigate unfamiliar apps, digital services and AI tools independently because terminology is confusing and generic tutorials move too fast.', 'validated'],
			'ov.value': ['Large, plain-language guides for the exact task you are trying to do, with a way to ask for help when you get stuck.', 'assumption'],
			'ov.resources': PLACEHOLDER,
			'di.experience': 'An older adult trying to complete a new digital task on their own, such as joining a video call or using a patient portal.',
			'di.assumptions': 'Older adults avoid technology because they are not interested.\nCaregivers want to do the tasks for them.\nYouTube tutorials are good enough.',
			'di.stakeholders': 'Older adults, adult children and caregivers, senior living activity coordinators, public libraries.',
			'di.segment': ['Adults 60+ living independently or in senior living communities who own a smartphone or tablet.', 'validated'],
			'di.objectives': 'Learn which tasks older adults try to do alone.\nUnderstand where and why they get stuck.\nFind out who they ask for help today.',
			'di.questions': 'Tell me about the last time you tried something new on your phone.\nWhat happened when you got stuck?\nWho did you ask for help?\nHow did you feel afterward?\nHave you ever watched a video to learn something on your device?',
			'di.findings': 'Assumption invalidated: interviewees were interested but afraid of "breaking something."\nTerminology ("browser," "app store," "sync") was the most common barrier.\nGeneric tutorials assumed a different device or moved too quickly.\nCaregivers wanted their parents to be independent, not dependent on them.',
			'di.pains': ['Confusing terminology.\nFear of making irreversible mistakes.\nTutorials that do not match their device.', 'validated'],
			'di.problem': ['Older adults want to handle everyday digital tasks on their own but stop when unfamiliar words or fast tutorials make them afraid of mistakes.', 'validated'],
			'di.uncertain': 'Whether senior living communities will pay.\nHow many devices we must support.',
			'po.market': ['Senior living communities and community organizations that run technology programs.', 'assumption'],
			'po.alternatives': 'Senior Planet, YouTube tutorials, Geek Squad, family members, library tech help hours.',
			'po.workarounds': 'Calling a grandchild, writing steps on paper, waiting for a weekly library session.',
			'po.opportunity': ['Communities already run tech classes but lack material residents can use between classes.', 'assumption'],
			'po.advantage': 'Task-based guides written in plain language and designed for large text and slow pacing.',
			'po.positioning': 'For older adults who want to use technology on their own, TechBridge is a guided tutorial app for everyday tasks. Unlike YouTube, every step matches your device and uses words you already know.',
			'mo.type': 'B2B2C',
			'mo.streams': ['Licensing'],
			'mo.user': 'Older adults',
			'mo.payer': ['Senior living communities and community organizations', 'assumption'],
			'mo.value': 'Communities offer residents always-available tech help and reduce staff time spent on repeated questions.',
			'mo.pricing': ['$150 per organization per month.', 'assumption'],
			'mo.rationale': 'Two activity coordinators said their tech programs cost more than this per month in staff time.',
			'mo.costs': '$500/month: hosting, tutorial upkeep, support.',
			'mo.revenueAssumptions': '5 organizations × $150 = $750/month.',
			'mo.risks': 'Slow sales cycles; tutorials go out of date when apps change.',
			'sc.solution': 'A large-text tutorial app organized by everyday tasks, with a help request button that reaches a caregiver or coordinator.',
			'sc.mvp': 'Guided technology tutorials.\nLarge-text accessible interface.\nTask-based navigation.\nHelp request functionality.',
			'sc.outOfScope': 'Remote device control.\nVoice assistant integration.',
			'sc.tech': 'Mobile-friendly web app; content management for tutorials.',
			'sc.privacy': 'Help requests may include health or account details. Requests go only to people the user chooses.',
			'sc.dependencies': 'Tutorials depend on third-party app interfaces that change without notice.',
			'sc.risks': 'Supporting multiple devices.\nKeeping tutorials accurate.\nAccessibility.\nPrivacy of help requests.',
			'bu.journey': 'Open TechBridge → tap "Video call family" → follow one large step at a time → tap "I\'m stuck" if needed.',
			'bu.rationale': 'One step per screen with large labeled buttons; icons always paired with words.',
			'bu.decisions': 'Replaced small icons with large labeled controls after testing.',
			'bu.limits': 'Tutorials exist for three tasks on one phone model only.',
			'va.objectives': 'Can older adults complete a tutorial without help? Is the help request button discoverable?',
			'va.method': 'Six moderated sessions. Note: four testers were students role-playing older adults.',
			'va.findings': 'Small navigation buttons and unfamiliar icons caused errors; larger labeled controls fixed most of them.',
			'va.usability': 'Small buttons, unlabeled icons, unclear "Back" vs. "Home."',
			'va.improvements': 'Larger labeled controls; one step per screen.',
			'va.risks': 'Most testing so far used student testers rather than adults 60+.'
		},
		interviews: {
			count: 10, start: '2026-09-12',
			categories: ['Older adult, 60s, lives independently', 'Older adult, 70s, senior living', 'Adult child caregiver', 'Activity coordinator', 'Older adult, 80s, lives with family'],
			observations: ['Kept a handwritten list of steps for video calls next to the phone.', 'Stopped an update halfway because a pop-up looked dangerous.', 'Called a grandchild for every new app.', 'Watched a tutorial three times but the buttons looked different on their phone.', 'Avoided the patient portal and drove to the pharmacy instead.'],
			quotes: ['"I\'m not scared of the phone, I\'m scared of pressing the wrong thing."', '"They talk so fast in those videos."', '"I don\'t want to bother my son again."', '"What is a browser, exactly?"', '"Once someone shows me, I can do it, but I forget by next week."', '"Our residents ask the same five questions every week."'],
			pains: ['Fear of irreversible mistakes', 'Unfamiliar terminology', 'Tutorials don\'t match their device', 'Feeling like a burden', 'Forgetting steps between sessions']
		},
		testing: {
			count: 6, start: '2026-11-05', changeOn: '2026-11-10',
			tasks: ['Start a video call with a family member using the guide.', 'Find the guide for refilling a prescription online.', 'Ask for help when stuck.'],
			before: ['Tapped the wrong small icon twice and went back to the start.', 'Did not recognize the "help" icon.', 'Could not tell "Back" from "Home."'],
			after: ['Completed the video call guide using large labeled buttons.', 'Found "I\'m stuck" right away.', 'Read each step aloud and followed along.'],
			feedback: ['"Bigger is better."', '"I like that it says what the button does."', '"Can it remember where I stopped?"']
		},
		competitors: [
			{ name: 'Senior Planet', customer: 'Adults 60+', features: 'Classes and online courses', pricing: 'Free', strengths: 'Trusted, community-based', limits: 'Scheduled classes; not task-on-demand', opportunity: 'Help between classes' },
			{ name: 'YouTube tutorials', customer: 'Everyone', features: 'Video how-tos', pricing: 'Free', strengths: 'Huge library', limits: 'Fast, device mismatch, ads', opportunity: 'Slow, device-matched steps' },
			{ name: 'Geek Squad', customer: 'Consumers', features: 'In-person and remote support', pricing: '$$', strengths: 'Hands-on help', limits: 'Expensive for small tasks', opportunity: 'Self-serve for everyday tasks' }
		],
		features: [
			{ name: 'Guided technology tutorials', value: 'Complete tasks independently', effort: 'M', priority: 'Must have', mvp: 'Yes', proof: 'Prototype only', reasoning: 'Core of the validated problem' },
			{ name: 'Large-text accessible interface', value: 'Readable and tappable', effort: 'S', priority: 'Must have', mvp: 'Yes', proof: 'Prototype only', reasoning: 'Testing showed small controls caused errors' },
			{ name: 'Task-based navigation', value: 'Find help by what you want to do', effort: 'S', priority: 'Must have', mvp: 'Yes', proof: 'Prototype only', reasoning: 'Interviewees describe tasks, not apps' },
			{ name: 'Help request', value: 'Reach a person when stuck', effort: 'M', priority: 'Must have', mvp: 'Yes', proof: 'Prototype only', reasoning: 'Reduces fear of mistakes' },
			{ name: 'Remote device control', value: 'Someone fixes it for you', effort: 'XL', priority: 'Not now', mvp: 'No', proof: 'Idea', reasoning: 'Privacy and complexity; undermines independence' }
		],
		iterations: [
			{ original: 'Small icon-only navigation buttons', evidence: '3 of the first 3 testers tapped the wrong control', change: 'Large buttons with text labels', reason: 'Accessibility and confidence', date: '2026-11-10' },
			{ original: 'Several steps per screen', evidence: 'Testers lost their place', change: 'One step per screen', reason: 'Matches how interviewees used paper lists', date: '2026-11-12' }
		],
		businessModel: bm({ licensing: { enabled: true, organizations: 5, price: 150, billing: 'monthly' }, costs: { fixedMonthly: 500, variableCost: 0, variableBasis: 'customer', otherMonthly: 0 } }),
		feasibility: {
			technology: ['supported', 'Standard web technology.'],
			data: ['investigating', 'Tutorials are written by hand; upkeep effort unknown.'],
			integrations: ['not-applicable', 'No integrations in the MVP.'],
			access: ['supported', 'No account needed for residents; coordinators sign in.'],
			privacy: ['investigating', 'Help requests may contain health details.'],
			complexity: ['blocker', 'Supporting many phone models multiplies tutorial work.'],
			costs: ['not-investigated', ''],
			prototype: ['supported', 'Three tutorials on one phone model.']
		},
		decisions: [
			{ title: 'Design for older adults, not caregivers', date: '2026-09-26', phase: 'discover', status: 'accepted', description: 'Primary user is the older adult; caregivers are secondary.', alternatives: 'Caregiver dashboard as the main product.', evidence: 'Caregivers said they want their parents to be independent.', reasoning: 'Independence was the shared goal.', by: 'Grace Nguyen' },
			{ title: 'License to senior living communities', date: '2026-10-09', phase: 'monetize', status: 'accepted', description: '$150/month per organization.', alternatives: 'Direct-to-consumer subscription.', evidence: 'Two coordinators described budget for tech programs.', reasoning: 'Older adults were reluctant to pay for apps.', by: 'Omar Haddad' },
			{ title: 'Support every phone model', date: '2026-10-16', phase: 'scope', status: 'reconsidering', description: 'Write tutorials for all major phone models.', alternatives: 'One model per community, chosen with the coordinator.', evidence: 'Feasibility review: tutorial work multiplies per device.', reasoning: 'Reconsidering after the Business and Feasibility Review; likely limiting to two models.', by: 'Lily Carter' },
			{ title: 'Large labeled controls', date: '2026-11-10', phase: 'validate', status: 'accepted', description: 'Replace icon-only buttons with large labeled ones.', alternatives: 'Keep icons, add a tutorial.', evidence: 'Testers tapped the wrong icon repeatedly.', reasoning: 'Words beat icons for this audience.', by: 'Jonah Reyes' }
		],
		tasks: [
			{ title: 'Conduct additional usability testing with adults 60+', member: 0, due: '2026-11-21', created: '2026-11-12' },
			{ title: 'Review technical dependencies for supported devices', member: 2, due: '2026-11-14', created: '2026-11-01' },
			{ title: 'Replace icons with labeled controls', member: 3, due: '2026-11-11', done: true, created: '2026-11-08' },
			{ title: 'Call two senior living coordinators about pricing', member: 1, due: '2026-10-30', done: true, created: '2026-10-20' },
			{ title: 'Write the prescription refill tutorial', member: 2, due: '2026-11-07', done: true, created: '2026-10-28' },
			{ title: 'Prepare Demo Day slides', member: 1, due: '2026-12-01', created: '2026-11-20' }
		],
		reviews: [
			{ feedback: 'Excellent interviews, and great that you invalidated the "not interested" assumption.', next: 'Talk to at least two activity coordinators about budget.' },
			{ feedback: 'Licensing makes sense. Supporting every device is a real risk.', next: 'Decide how many phone models the MVP supports.' },
			{ feedback: 'One step per screen is a good direction. Help request button is easy to miss.', next: 'Make "I\'m stuck" larger and test it.' },
			{ feedback: 'Testing found real issues, but four of six testers were students role-playing. Conduct additional testing with the intended age group rather than relying primarily on student testers.', next: 'Run at least three sessions with adults 60+ before Demo Day.', blockers: 'Need access to a senior living community or library group for testing.', followUp: true }
		],
		comments: [
			{ field: 'va.method', at: '2026-11-18T19:30:00Z', body: 'Four of six testers were students. Can you test with adults 60+ before Demo Day?', replies: [{ by: 'team', at: '2026-11-19T02:00:00Z', body: 'We\'re contacting a library tech-help group. Two sessions tentatively scheduled.' }] },
			{ field: 'di.findings', at: '2026-10-02T17:00:00Z', body: 'Love that you invalidated your first assumption. That\'s exactly the point of interviews.', resolved: '2026-10-03T13:00:00Z' },
			{ field: 'mo.pricing', at: '2026-10-21T18:00:00Z', body: 'Is $150/month based on what coordinators said, or a guess?', replies: [{ by: 'team', at: '2026-10-22T00:40:00Z', body: 'Two coordinators said their programs cost more in staff time. Still an assumption, so it\'s marked that way.' }], resolved: '2026-10-23T15:00:00Z' },
			{ field: 'sc.risks', at: '2026-10-23T16:10:00Z', body: 'How many devices will the MVP actually support? This feels like the biggest risk.' },
			{ field: 'bu.rationale', at: '2026-11-07T15:45:00Z', body: 'Why one step per screen instead of a checklist? Curious what drove that.', replies: [{ by: 'team', at: '2026-11-07T23:10:00Z', body: 'Interviewees wrote steps on paper one per line and lost their place on long pages.' }, { by: 'mentor', at: '2026-11-08T14:00:00Z', body: 'Great. Put that in your design rationale.' }] }
		],
		flag: { reason: 'Team needs additional representative usability testing before Demo Day. Most testers so far were students; they need access to adults 60+.', at: '2026-11-21T16:00:00Z' }
	},
	// ───────────────────────────────── TravelLens ─────────────────────────────────
	{
		key: 'travellens', name: 'TravelLens', challenge: 'C4', mentor: 'Priya Raman', phase: 'showcase', readiness: 'in-progress', checklistDone: 5,
		members: ['Isabella Moreno', 'Kai Watanabe', 'Chloe Bennett', 'Ryan Shah', 'Zoe Martin'],
		fields: {
			'ov.name': 'TravelLens',
			'ov.status': 'Demo-ready',
			'ov.description': 'A travel discovery app built on short, recent video reviews tied to a verified location, so travelers can see what a place is really like today.',
			'ov.customer': ['Independent leisure travelers, 20–35, who plan their own trips and research heavily before going.', 'validated'],
			'ov.problem': ['Travelers cannot tell whether online reviews and photos accurately represent destinations because content is sponsored, outdated or staged.', 'validated'],
			'ov.value': ['See recent, real video from people who were actually there, with a clear label explaining how it was verified.', 'validated'],
			'ov.resources': PLACEHOLDER,
			'di.experience': 'Planning a trip to an unfamiliar place and deciding which reviews, photos and recommendations to trust.',
			'di.assumptions': 'Travelers want more reviews.\nVideo is more trustworthy than text.\nInfluencer content is the main problem.',
			'di.stakeholders': 'Independent travelers, local businesses, content creators, travel platforms.',
			'di.segment': ['Independent leisure travelers who plan their own trips.', 'validated'],
			'di.objectives': 'Learn how travelers research destinations.\nUnderstand what makes content trustworthy.\nFind where research fails.',
			'di.questions': 'Walk me through planning your last trip.\nWhere did you look first?\nTell me about a time a place was different from what you expected.\nHow do you decide if a review is trustworthy?\nWhat do you do when reviews disagree?',
			'di.findings': '13 of 15 had visited a place that looked very different from photos.\nTravelers distrust sponsored content but cannot always spot it.\nRecency matters more than volume: "a review from 2019 is useless."\nVideo felt more honest than photos, but only if recent.',
			'di.pains': ['Sponsored content they can\'t identify.\nOutdated reviews.\nMisleading photography.', 'validated'],
			'di.problem': ['Independent travelers waste time and money because reviews and photos are often sponsored, outdated or misleading, and there is no easy way to tell.', 'validated'],
			'di.uncertain': 'Whether enough travelers will post videos.\nHow to verify location without being invasive.',
			'po.market': ['Independent leisure travelers in the US; start with weekend trips to large cities.', 'assumption'],
			'po.alternatives': 'TripAdvisor, TikTok, Google Maps, Instagram, Reddit travel forums.',
			'po.workarounds': 'Sorting reviews by newest, searching Reddit, checking tagged Instagram photos instead of official ones.',
			'po.opportunity': ['Trust in reviews is declining while short video is growing.', 'assumption'],
			'po.advantage': 'Recent, location-tied video with transparent verification labels.',
			'po.positioning': 'For independent travelers who don\'t trust online reviews, TravelLens is a discovery app of recent, verified video reviews. Unlike TikTok, every video is tied to a real visit and dated.',
			'po.switch': ['Interviewees would switch for recency and verification, not for more content.', 'validated'],
			'po.unvalidated': 'That creators will post without being paid.',
			'mo.type': 'B2C',
			'mo.streams': ['Transaction fees'],
			'mo.user': 'Independent travelers',
			'mo.payer': ['Booking partners (affiliate commissions)', 'assumption'],
			'mo.value': 'Free for travelers; booking partners pay commission on referred bookings.',
			'mo.pricing': ['5% affiliate commission on referred bookings.', 'assumption'],
			'mo.rationale': 'Affiliate programs for hotels and experiences commonly pay 3–8%.',
			'mo.acquisition': 'Study-abroad groups, travel clubs, creators posting their first verified review.',
			'mo.costs': '$800/month: video hosting, moderation, storage.',
			'mo.revenueAssumptions': '200 referred bookings × $120 average × 5% = $1,200/month.',
			'mo.risks': 'Video hosting costs scale with uploads; affiliate rates can change.',
			'mo.evidence': 'Affiliate program research; 15 interviews on booking behavior.',
			'sc.solution': 'Search a destination, watch a feed of recent verified video reviews, and save places for later.',
			'sc.core': 'Destination search, video feed, verification labels, saved destinations.',
			'sc.mvp': 'Destination search.\nVideo review feed.\nReview verification indicators.\nSaved destinations.',
			'sc.outOfScope': 'Direct travel booking.\nItinerary generation.',
			'sc.tech': 'Mobile web app, video hosting service, location check at upload time.',
			'sc.data': ['User-uploaded videos with upload location and date.', 'assumption'],
			'sc.apis': ['Video hosting API; maps API for place search.', 'validated'],
			'sc.access': 'Camera and location permission at upload time only.',
			'sc.privacy': 'Store place-level location, never exact coordinates. Blur faces of bystanders in the future.',
			'sc.regulatory': 'Affiliate disclosures required on booking links.',
			'sc.dependencies': 'Video hosting, maps API.',
			'sc.limits': 'Verification in the prototype is simulated.',
			'sc.risks': 'Video hosting costs.\nLocation verification.\nContent moderation.\nFraudulent reviews.',
			'bu.journey': 'Search "Austin" → browse recent verified videos → open a place → see verification label → save it.',
			'bu.flow': 'Search → feed → place detail → verification explainer → saved list.',
			'bu.interactions': 'Swipe through videos; tap the verification label to see what it means.',
			'bu.rationale': 'Dates and verification labels are visible on every video because recency was the top trust signal.',
			'bu.decisions': 'Redesigned verification labels after testers misread them.',
			'bu.limits': 'Verification badges are simulated; no real location check runs in the prototype.',
			'bu.resources': PLACEHOLDER,
			'va.objectives': 'Do travelers understand what "verified" means? Can they find and save a place?',
			'va.method': 'Ten moderated sessions with independent travelers.',
			'va.metrics': 'Percent of testers who can explain the verification label; task completion for search and save.',
			'va.findings': 'Users wanted clearer explanations of what verified meant. Redesigned labels improved understanding from 3/5 to 5/5.',
			'va.usability': 'Checkmark badge assumed to mean "sponsored" or "official."',
			'va.validated': 'Recency is the main trust signal.',
			'va.invalidated': 'A checkmark alone communicates trust.',
			'va.improvements': 'Text labels: "Filmed here · 3 days ago" with a tap-to-explain sheet.',
			'va.risks': 'Real verification is not built; fraud is untested.',
			'va.next': 'Prototype real location verification; test with creators.',
			'sh.story': 'Chloe booked a "quiet beachfront hotel" from glossy photos and arrived next to a construction site. TravelLens shows recent video from people who were really there.',
			'sh.problem': 'Travel content is sponsored, outdated or staged.',
			'sh.insights': '13 of 15 travelers had a place look different than online. Recency beats volume.',
			'sh.diff': 'Recent, location-tied video with transparent verification.',
			'sh.business': 'Affiliate commissions: $1,200/month scenario vs. $800 costs.',
			'sh.feasibility': 'Video hosting and maps are available; verification and moderation are the hard parts.',
			'sh.testing': '10 sessions; verification labels redesigned.',
			'sh.roadmap': 'Real location verification, creator onboarding, moderation tools.',
			'sh.demoFlow': 'Search Austin → feed → tap verification label → save.',
			'sh.judgeQs': 'How do you actually verify a video?\nWhy would creators post?\nHow do you stop fake reviews?'
		},
		interviews: {
			count: 15, start: '2026-09-11',
			categories: ['Independent traveler, 20s', 'Independent traveler, 30s', 'Study-abroad student', 'Weekend road-tripper', 'Travel content creator'],
			observations: ['Sorted reviews by newest and ignored anything older than a year.', 'Checked tagged Instagram photos instead of the hotel\'s own.', 'Found out a "hidden gem" TikTok was a paid partnership after arriving.', 'Searched Reddit for "is it worth it" threads.', 'Booked based on photos and the room looked half the size.', 'Watched videos at 2x speed to look for the background.'],
			quotes: ['"A review from 2019 is useless."', '"Every place looks amazing on TikTok."', '"I trust the blurry photos more than the pretty ones."', '"I just want to know what it looks like right now."', '"How do I know they were even there?"', '"I spend more time researching than on the trip."'],
			pains: ['Sponsored content is hard to spot', 'Outdated reviews', 'Misleading photography', 'Too much time researching', 'Conflicting reviews']
		},
		testing: {
			count: 10, start: '2026-10-30', changeOn: '2026-11-04',
			tasks: ['Find a coffee shop in Austin that looks quiet right now.', 'Explain what the badge on a video means.', 'Save two places for a weekend trip.'],
			before: ['Assumed the checkmark meant the video was sponsored.', 'Thought "verified" meant the business approved it.', 'Did not notice the upload date.'],
			after: ['Read "Filmed here · 3 days ago" and explained it correctly.', 'Tapped the label and understood the location check.', 'Saved places quickly from the feed.'],
			feedback: ['"Oh, so it proves they were actually there."', '"The date is the most useful thing."', '"I\'d want to filter to this week only."']
		},
		competitors: [
			{ name: 'TripAdvisor', customer: 'Travelers', features: 'Text reviews, rankings, booking', pricing: 'Free', strengths: 'Massive review volume', limits: 'Old reviews, hard to verify', opportunity: 'Recency and verification' },
			{ name: 'TikTok', customer: 'Everyone', features: 'Short video, travel content', pricing: 'Free', strengths: 'Engaging, current', limits: 'Sponsored, not tied to visits', opportunity: 'Verified, location-tied video' },
			{ name: 'Google Maps', customer: 'Everyone', features: 'Places, reviews, photos', pricing: 'Free', strengths: 'Default for local search', limits: 'Mixed quality, few videos', opportunity: 'Video-first trust signals' },
			{ name: 'Reddit travel forums', customer: 'Researchers', features: 'Discussions', pricing: 'Free', strengths: 'Candid', limits: 'Slow to search, no visuals', opportunity: 'Candid plus visual' }
		],
		features: [
			{ name: 'Destination search', value: 'Find places', effort: 'S', priority: 'Must have', mvp: 'Yes', proof: 'Prototype only', reasoning: 'Entry point' },
			{ name: 'Video review feed', value: 'See what it is like now', effort: 'M', priority: 'Must have', mvp: 'Yes', proof: 'Prototype only', reasoning: 'Core value' },
			{ name: 'Verification indicators', value: 'Know what to trust', effort: 'L', priority: 'Must have', mvp: 'Yes', proof: 'Prototype only', reasoning: 'Differentiator; simulated in the prototype' },
			{ name: 'Saved destinations', value: 'Plan later', effort: 'S', priority: 'Should have', mvp: 'Yes', proof: 'Prototype only', reasoning: 'Testers expected it' },
			{ name: 'Direct booking', value: 'Book in-app', effort: 'XL', priority: 'Not now', mvp: 'No', proof: 'Idea', reasoning: 'Out of scope' },
			{ name: 'Itinerary generation', value: 'Plan trips automatically', effort: 'L', priority: 'Not now', mvp: 'No', proof: 'Idea', reasoning: 'Not the validated problem' }
		],
		iterations: [
			{ original: 'Checkmark badge for verified videos', evidence: '2 of the first 5 testers thought it meant sponsored', change: 'Text label "Filmed here · N days ago" plus explainer', reason: 'Verification must be understood to build trust', date: '2026-11-04' },
			{ original: 'Feed sorted by popularity', evidence: 'Interviews: recency is the top trust signal', change: 'Feed sorted by most recent', reason: 'Recency over volume', date: '2026-10-24' }
		],
		businessModel: bm({ transaction: { enabled: true, monthlyTransactions: 200, averageValue: 120, feePercent: 5 }, costs: { fixedMonthly: 800, variableCost: 0, variableBasis: 'transaction', otherMonthly: 0 } }),
		feasibility: {
			technology: ['supported', 'Video hosting services and maps APIs exist.'],
			data: ['investigating', 'Depends on travelers uploading enough video.'],
			integrations: ['supported', 'Affiliate programs available for hotels and experiences.'],
			access: ['supported', 'Camera and location at upload only.'],
			privacy: ['investigating', 'Bystanders appear in videos.'],
			complexity: ['blocker', 'Reliable location verification is hard to build and easy to spoof.'],
			costs: ['investigating', 'Video hosting scales with uploads.'],
			prototype: ['supported', 'Verification is simulated and labeled as such.']
		},
		decisions: [
			{ title: 'Video-first reviews', date: '2026-09-25', phase: 'discover', status: 'accepted', description: 'Make short video the core review format.', alternatives: 'Photo reviews; text with photos.', evidence: 'Interviewees trusted recent video over polished photos.', reasoning: 'Hardest format to stage.', by: 'Isabella Moreno' },
			{ title: 'Affiliate commissions', date: '2026-10-09', phase: 'monetize', status: 'accepted', description: '5% commission on referred bookings.', alternatives: 'Subscription for travelers; ads.', evidence: 'Travelers would not pay to research.', reasoning: 'Free for users, revenue tied to value.', by: 'Kai Watanabe' },
			{ title: 'Sort feed by popularity', date: '2026-10-17', phase: 'scope', status: 'reversed', description: 'Show most-liked videos first.', alternatives: 'Most recent first.', evidence: 'Interview synthesis: recency was the top trust signal.', reasoning: 'Reversed on Oct 24; popular videos skewed old.', by: 'Ryan Shah' },
			{ title: 'Text verification labels', date: '2026-11-04', phase: 'validate', status: 'accepted', description: 'Replace the checkmark with "Filmed here · N days ago."', alternatives: 'Tooltip on the checkmark.', evidence: 'Testers misread the checkmark as sponsored.', reasoning: 'Words explain verification without extra taps.', by: 'Chloe Bennett' },
			{ title: 'Simulate verification in the prototype', date: '2026-10-28', phase: 'build', status: 'accepted', description: 'Show verification labels without a real location check.', alternatives: 'Build a basic GPS check.', evidence: 'Feasibility: reliable verification is a significant blocker.', reasoning: 'Test understanding first; be transparent with judges.', by: 'Zoe Martin' }
		],
		tasks: [
			{ title: 'Redesign verification labels', member: 2, due: '2026-11-05', done: true, created: '2026-11-02' },
			{ title: 'Add "simulated" notes to every prototype screen with verification', member: 4, due: '2026-11-24', created: '2026-11-21' },
			{ title: 'Update competitor comparison with Reddit', member: 3, due: '2026-10-06', done: true, created: '2026-10-01' },
			{ title: 'Prepare Demo Day slides', member: 0, due: '2026-12-01', created: '2026-11-19' },
			{ title: 'Practice judge questions on fraud and verification', member: 1, due: '2026-12-03', created: '2026-11-21' },
			{ title: 'Estimate video hosting cost at 1,000 uploads/month', member: 3, due: '2026-11-15', created: '2026-11-05' },
			{ title: 'Finalize prototype', member: 2, due: '2026-11-23', done: true, created: '2026-11-12' }
		],
		reviews: [
			{ feedback: 'Fifteen interviews and a very clear recency insight.', next: 'Add Reddit and Instagram as alternatives.' },
			{ feedback: 'Affiliate model fits. Verification is your biggest feasibility risk.', next: 'Decide what verification the prototype will actually show.' },
			{ feedback: 'Polished prototype. Good decision to sort by recency.', next: 'Test whether people understand the verification badge.' },
			{ feedback: 'Great label redesign. Clearly distinguish the verification process demonstrated in the prototype from functionality that has actually been implemented.', next: 'Add a "what is real" slide for Demo Day.' }
		],
		comments: [
			{ field: 'sc.risks', at: '2026-10-22T18:00:00Z', body: 'How would verification actually work? GPS can be spoofed.', replies: [{ by: 'team', at: '2026-10-23T01:00:00Z', body: 'We don\'t have a solid answer yet. Marking verification as simulated in the prototype and listing it as a blocker.' }, { by: 'mentor', at: '2026-10-23T14:30:00Z', body: 'Honest answer. That\'s the right call.' }], resolved: '2026-10-24T15:00:00Z' },
			{ field: 'bu.limits', at: '2026-11-19T17:20:00Z', body: 'Please make it explicit on Demo Day which parts of verification are simulated.' },
			{ field: 'di.findings', at: '2026-09-30T16:00:00Z', body: '"A review from 2019 is useless" is a perfect pitch quote.', resolved: '2026-10-01T12:00:00Z' },
			{ field: 'mo.revenueAssumptions', at: '2026-10-21T19:10:00Z', body: 'Where does 200 bookings a month come from?', replies: [{ by: 'team', at: '2026-10-22T02:20:00Z', body: 'It\'s an assumption: 4,000 monthly users with a 5% booking click-through. Added that to the notes.' }] },
			{ field: 'va.findings', at: '2026-11-06T18:00:00Z', body: 'Nice before/after numbers on the label redesign.', resolved: '2026-11-07T13:00:00Z' },
			{ field: 'po.switch', at: '2026-10-07T20:00:00Z', body: 'Would people actually leave TikTok for this, or use both?', replies: [{ by: 'team', at: '2026-10-08T03:00:00Z', body: 'Probably both. We see TravelLens as the "check before you book" step.' }] }
		]
	},
	// ───────────────────────────────── MoneyMind ─────────────────────────────────
	{
		key: 'moneymind', name: 'MoneyMind', challenge: 'C2', mentor: 'Lucas Ferreira', phase: 'validate', readiness: 'not-started', checklistDone: 1,
		members: ['Noah Russo', 'Emma Liu', 'Diego Santos', 'Aaliyah Brown'],
		fields: {
			'ov.name': 'MoneyMind',
			'ov.status': 'Testing',
			'ov.description': 'A decision-support app that helps young adults see the impact of a purchase before they make it, not just track it afterward.',
			'ov.customer': ['Young adults (19–26) managing their own money for the first time.', 'validated'],
			'ov.problem': ['Young adults struggle to understand the financial impact of everyday spending and major purchases until after the money is gone.', 'validated'],
			'ov.value': ['Know whether you can afford it before you buy it.', 'assumption'],
			'ov.resources': PLACEHOLDER,
			'di.experience': 'Deciding whether to make a purchase, big or small, when managing your own money for the first time.',
			'di.assumptions': 'Young adults don\'t budget because they\'re lazy.\nBudgeting apps solve the problem.',
			'di.stakeholders': 'Students with part-time jobs, recent graduates, campus financial wellness office, parents.',
			'di.segment': ['Young adults managing their own money with irregular income or new full-time salaries.', 'validated'],
			'di.objectives': 'Learn how young adults decide on purchases.\nUnderstand why budgets fail.\nFind moments where a tool could help.',
			'di.questions': 'Tell me about the last purchase over $100 you made.\nHow did you decide you could afford it?\nWhat happened to your budget that month?\nHave you used a budgeting app? Why did you stop?',
			'di.findings': '9 of 11 had tried a budgeting app and stopped within a month.\nIrregular expenses (car repairs, flights home) broke budgets.\nPeople check their balance, not their plan, before buying.\nFinancial jargon made apps feel "not for me."',
			'di.pains': ['Hard to plan irregular expenses.\nUnclear what is affordable.\nBudgets abandoned quickly.', 'validated'],
			'di.problem': ['Young adults decide purchases by checking their balance, so irregular expenses and upcoming bills surprise them and budgets fail.', 'validated'],
			'di.uncertain': 'Whether people will pay for decision support.',
			'po.market': ['Young adults 19–26 in the US.', 'assumption'],
			'po.alternatives': 'YNAB, Rocket Money, Monarch Money, bank apps, spreadsheets.',
			'po.workarounds': 'Checking balance before buying, notes app lists, asking parents.',
			'po.advantage': 'Evaluates decisions before spending instead of only tracking transactions afterward.',
			'po.positioning': 'For young adults managing their own money, MoneyMind is a decision tool that shows whether you can afford something before you buy it. Unlike YNAB or Rocket Money, it starts with the decision, not the transaction history.',
			'mo.type': 'B2C',
			'mo.streams': ['Freemium'],
			'mo.user': 'Young adults',
			'mo.payer': ['Young adults on the premium plan', 'assumption'],
			'mo.pricing': ['$5/month premium plan.', 'assumption'],
			'mo.rationale': 'Below YNAB and Monarch; matches what students pay for one streaming service.',
			'mo.costs': '$350/month: hosting and support.',
			'mo.revenueAssumptions': '2,000 active users × 5% conversion × $5 = $500/month.',
			'mo.risks': 'Low willingness to pay; free bank tools improving.',
			'sc.solution': 'An app with a monthly overview, an affordability calculator, scenario comparisons and goal tracking.',
			'sc.mvp': 'Monthly financial overview.\nPurchase affordability calculator.\nSpending scenario comparisons.\nFinancial goal tracking.',
			'sc.outOfScope': 'Bank account integrations.\nInvestment recommendations.\nAutomated payments.',
			'sc.tech': 'Web app with manual income and expense entry.',
			'sc.privacy': 'Financial data is sensitive even without bank links. Store locally where possible.',
			'sc.regulatory': 'Avoid anything that looks like investment advice.',
			'sc.dependencies': 'Future bank integrations would need an aggregator.',
			'sc.risks': 'Financial data privacy.\nCalculation accuracy.\nFuture bank integrations.',
			'bu.journey': 'Enter income and fixed bills → see monthly overview → type a purchase → see "affordable / tight / not this month."',
			'bu.rationale': 'Visual comparison bars instead of numbers because testers found terms confusing.',
			'bu.limits': 'Calculations use manually entered numbers; no bank data.',
			'va.objectives': 'Do users understand the affordability result? Is manual entry tolerable?',
			'va.method': 'Seven moderated sessions with students.',
			'va.findings': 'Users found financial terminology confusing; simpler explanations and visual comparisons helped.',
			'va.usability': '"Discretionary income" and "sinking fund" not understood.',
			'va.improvements': 'Plain-language labels and side-by-side comparison bars.'
		},
		interviews: {
			count: 11, start: '2026-09-13',
			categories: ['Student, part-time job', 'Recent graduate, first salary', 'Student, financially independent', 'Campus financial wellness staff'],
			observations: ['Checked bank balance in the store before buying.', 'Downloaded a budgeting app and stopped after three weeks.', 'A car repair wiped out a month of savings.', 'Kept a notes-app list of upcoming bills.', 'Asked a parent before every purchase over $200.'],
			quotes: ['"If the money\'s in my account, I figure I can spend it."', '"Budgeting apps make me feel bad about stuff I already bought."', '"I don\'t know what a sinking fund is."', '"The flight home at Thanksgiving always breaks my budget."', '"I want someone to tell me yes or no."'],
			pains: ['Irregular expenses', 'Unclear affordability', 'Budgets abandoned', 'Confusing financial terms']
		},
		testing: {
			count: 7, start: '2026-11-06', changeOn: '2026-11-11',
			tasks: ['Check whether you can afford a $300 concert trip this month.', 'Compare buying a new laptop now vs. in two months.', 'Set a savings goal.'],
			before: ['Did not understand "discretionary income."', 'Misread the table of numbers.', 'Asked what "sinking fund" meant.'],
			after: ['Read "Tight this month" and explained why.', 'Compared two bars and picked waiting.', 'Set a goal in under a minute.'],
			feedback: ['"The bars make it obvious."', '"Would I pay? Maybe, if it connected to my bank."', '"I like that it says yes or no."']
		},
		competitors: [
			{ name: 'YNAB', customer: 'Committed budgeters', features: 'Zero-based budgeting', pricing: '$14.99/mo', strengths: 'Loyal users, method', limits: 'Steep learning curve', opportunity: 'Simple decision moment' },
			{ name: 'Rocket Money', customer: 'Consumers', features: 'Subscription tracking, budgets', pricing: 'Free / paid', strengths: 'Easy setup', limits: 'Tracks after the fact', opportunity: 'Before-you-buy decisions' },
			{ name: 'Monarch Money', customer: 'Households', features: 'Full financial dashboard', pricing: '$14.99/mo', strengths: 'Comprehensive', limits: 'Too much for beginners', opportunity: 'Beginner-friendly focus' }
		],
		features: [
			{ name: 'Monthly financial overview', value: 'See the month at a glance', effort: 'M', priority: 'Must have', mvp: 'Yes', proof: 'Prototype only', reasoning: 'Context for every decision' },
			{ name: 'Affordability calculator', value: 'Yes/no before buying', effort: 'M', priority: 'Must have', mvp: 'Yes', proof: 'Prototype only', reasoning: 'Core differentiator' },
			{ name: 'Scenario comparisons', value: 'Now vs. later', effort: 'M', priority: 'Should have', mvp: 'Yes', proof: 'Prototype only', reasoning: 'Big purchases need comparison' },
			{ name: 'Goal tracking', value: 'Save for something', effort: 'S', priority: 'Should have', mvp: 'Yes', proof: 'Prototype only', reasoning: 'Gives a reason to return' },
			{ name: 'Bank integration', value: 'No manual entry', effort: 'XL', priority: 'Not now', mvp: 'No', proof: 'Idea', reasoning: 'Privacy, cost, and aggregator dependency' }
		],
		iterations: [
			{ original: 'Results shown as a table of numbers with finance terms', evidence: '4 of the first 4 testers asked what terms meant', change: 'Plain language and comparison bars', reason: 'Reduce jargon', date: '2026-11-11' }
		],
		businessModel: bm({ subscription: { enabled: true, potentialCustomers: 2000, conversionRate: 5, monthlyPrice: 5 }, costs: { fixedMonthly: 350, variableCost: 0, variableBasis: 'customer', otherMonthly: 0 } }),
		feasibility: {
			technology: ['supported', 'Simple calculations on manual entries.'],
			data: ['supported', 'User-entered data only.'],
			integrations: ['not-investigated', ''],
			privacy: ['investigating', 'Financial data is sensitive even without bank links.'],
			complexity: ['supported', 'Small web app.'],
			costs: ['supported', 'Low hosting costs.'],
			prototype: ['supported', 'Calculator works on sample data.']
		},
		decisions: [
			{ title: 'Decide before spending, not track after', date: '2026-09-27', phase: 'discover', status: 'accepted', description: 'Position around the purchase decision.', alternatives: 'Another budgeting tracker.', evidence: '9 of 11 abandoned tracking apps.', reasoning: 'Tracking makes people feel judged after the fact.', by: 'Noah Russo' },
			{ title: 'Connect to bank accounts in MVP', date: '2026-10-14', phase: 'scope', status: 'reversed', description: 'Pull balances automatically.', alternatives: 'Manual entry.', evidence: 'Feasibility: aggregator costs and privacy.', reasoning: 'Reversed Oct 20: manual entry is enough to test the decision moment.', by: 'Diego Santos' },
			{ title: '$5/month premium', date: '2026-10-10', phase: 'monetize', status: 'reconsidering', description: 'Freemium with a $5 plan.', alternatives: 'Free with campus sponsorship.', evidence: 'Testers hesitated to pay without bank sync.', reasoning: 'Reconsidering after testing; premium value is unproven.', by: 'Emma Liu' },
			{ title: 'Plain-language results', date: '2026-11-11', phase: 'validate', status: 'accepted', description: 'Replace finance terms with everyday words.', alternatives: 'Glossary tooltips.', evidence: 'Testers did not understand terms.', reasoning: 'Jargon made the app feel "not for me."', by: 'Aaliyah Brown' }
		],
		tasks: [
			{ title: 'Validate pricing assumptions with 10 students', member: 1, due: '2026-11-18', created: '2026-11-10' },
			{ title: 'Replace finance terms with plain language', member: 3, due: '2026-11-12', done: true, created: '2026-11-09' },
			{ title: 'Build comparison bars in prototype', member: 2, due: '2026-11-13', done: true, created: '2026-11-09' },
			{ title: 'Write the premium features list', member: 0, due: '2026-11-22', created: '2026-11-15' },
			{ title: 'Update competitor comparison', member: 0, due: '2026-10-05', done: true, created: '2026-09-30' },
			{ title: 'Start Showcase product story', member: 1, due: '2026-11-24', created: '2026-11-20' },
			{ title: 'Prepare Demo Day slides', member: 3, due: '2026-12-02', created: '2026-11-20' }
		],
		reviews: [
			{ feedback: 'Strong insight that people check balance, not their plan.', next: 'Add Monarch Money to the comparison.' },
			{ feedback: 'Good call cutting bank integrations. Pricing is thin.', next: 'Talk to students about what they would pay for.' },
			{ feedback: 'The affordability result is clear. Terminology needs work.', next: 'Test plain-language labels.' },
			{ feedback: 'Plain-language changes worked. Provide stronger evidence that users would pay for premium features.', next: 'Run a pricing test (fake door or survey) and define exactly what premium includes.', blockers: 'Premium plan contents not defined; no willingness-to-pay evidence yet.', followUp: true }
		],
		comments: [
			{ field: 'mo.pricing', at: '2026-10-21T17:30:00Z', body: 'What would premium include that free doesn\'t? Hard to judge $5 without that.', replies: [{ by: 'team', at: '2026-10-22T01:15:00Z', body: 'Scenario comparisons and goals. We\'ll test whether that\'s worth paying for.' }] },
			{ field: 'mo.payer', at: '2026-11-19T18:50:00Z', body: 'Testers said they\'d only pay with bank sync, which is out of scope. How do you reconcile that?' },
			{ field: 'di.findings', at: '2026-10-01T15:00:00Z', body: '"Budgeting apps make me feel bad" is a strong insight. Use it.', resolved: '2026-10-02T12:00:00Z' },
			{ field: 'va.findings', at: '2026-11-13T19:00:00Z', body: 'Nice iteration on terminology. How many of the seven completed the concert task after the change?', replies: [{ by: 'team', at: '2026-11-14T02:00:00Z', body: '3 of 3 after the change vs. 1 of 4 before.' }], resolved: '2026-11-14T16:00:00Z' }
		]
	},
	// ───────────────────────────────── RoomSync ─────────────────────────────────
	{
		key: 'roomsync', name: 'RoomSync', challenge: 'C1', mentor: 'Hannah Kim', phase: 'showcase', readiness: 'ready', checklistDone: 8,
		members: ['Leo Garcia', 'Mia Johnson', 'Arjun Mehta', 'Sara Lindqvist', 'Tyler Owens'],
		fields: {
			'ov.name': 'RoomSync',
			'ov.status': 'Demo-ready',
			'ov.description': 'One shared workspace for roommates to track shared expenses, split chores fairly, and get reminders before payments are late.',
			'ov.customer': ['Renters aged 19–30 living with one to four roommates.', 'validated'],
			'ov.problem': ['Roommates struggle to coordinate shared expenses, chores and communication, leading to forgotten payments and uncomfortable conversations.', 'validated'],
			'ov.value': ['Everything your household shares, in one place, so nobody has to be the one who nags.', 'validated'],
			'ov.resources': PLACEHOLDER,
			'di.experience': 'Living with roommates: splitting bills, sharing chores and raising problems without awkwardness.',
			'di.assumptions': 'Money is the main source of roommate conflict.\nPeople already use Splitwise and are happy.',
			'di.stakeholders': 'Roommates, landlords and property managers, parents paying rent.',
			'di.segment': ['Renters living with roommates, especially in their first two years of renting.', 'validated'],
			'di.objectives': 'Find the most common roommate friction.\nUnderstand current tools and why they fail.',
			'di.questions': 'Tell me about the last disagreement with a roommate.\nHow do you split bills today?\nWho does which chores, and how was that decided?\nWhat happens when someone forgets to pay?',
			'di.findings': 'Chores caused as much conflict as money (assumption partly invalidated).\nSplitwise handles money but not chores or reminders.\n11 of 14 had a forgotten payment in the last semester.\nPeople avoid bringing up problems directly.',
			'di.pains': ['Forgotten payments.\nUnequal chore distribution.\nUncomfortable conversations.', 'validated'],
			'di.problem': ['Roommates juggle expenses and chores across several apps and group chats, so payments are forgotten, chores feel unequal, and nobody wants to be the one to bring it up.', 'validated'],
			'di.uncertain': 'Whether whole households will adopt it, not just one roommate.',
			'po.market': ['Roughly a third of US renters under 30 live with roommates.', 'assumption'],
			'po.alternatives': 'Splitwise, Google Sheets, group messaging apps, whiteboards.',
			'po.workarounds': 'A shared spreadsheet, a chore wheel on the fridge, group chat reminders.',
			'po.opportunity': ['No popular tool combines expenses and chores.', 'validated'],
			'po.advantage': 'Combines shared expenses and household responsibilities in one coordinated workspace with neutral reminders.',
			'po.positioning': 'For roommates who share bills and chores, RoomSync is a household workspace that keeps everyone on track. Unlike Splitwise, it handles chores and reminders too, so nobody has to nag.',
			'po.switch': ['Households would switch if reminders replaced awkward conversations.', 'validated'],
			'mo.type': 'B2C',
			'mo.streams': ['Subscription'],
			'mo.user': 'Roommates',
			'mo.payer': ['One subscription per household, split among roommates.', 'assumption'],
			'mo.value': 'Fewer conflicts and late fees for less than $1.25 per roommate per month.',
			'mo.pricing': ['$4.99 per household per month.', 'assumption'],
			'mo.rationale': 'Split four ways it is about $1.25 each; testers called it "less than a late fee."',
			'mo.acquisition': 'Apartment complexes near campus, move-in week, invite links between roommates.',
			'mo.costs': '$400/month: hosting, notifications, support.',
			'mo.revenueAssumptions': '1,500 households × 10% conversion = 150 paying × $4.99 = $748.50/month.',
			'mo.risks': 'Free alternatives; one roommate must convince the rest.',
			'mo.evidence': '14 interviews; pricing reactions in testing.',
			'sc.solution': 'A shared household dashboard with expenses, chores and reminders.',
			'sc.core': 'Household dashboard, expense tracking, chore assignments, payment reminders.',
			'sc.mvp': 'Shared household dashboard.\nExpense tracking.\nChore assignments.\nPayment reminders.',
			'sc.outOfScope': 'Direct money transfers.\nProperty management integrations.',
			'sc.tech': 'Mobile web app with push or email notifications.',
			'sc.data': ['Entered by household members.', 'validated'],
			'sc.apis': ['Notification service.', 'validated'],
			'sc.access': 'Every roommate needs an account in the household.',
			'sc.privacy': 'Personal expenses stay private; only shared expenses are visible to the household.',
			'sc.dependencies': 'Notification delivery reliability.',
			'sc.limits': 'No real payments; reminders only.',
			'sc.risks': 'Notification reliability.\nShared data permissions.\nPotential payment integrations.',
			'bu.journey': 'Create household → invite roommates → add rent and utilities → assign chores → get a reminder before rent is due.',
			'bu.flow': 'Onboarding → dashboard → add expense → chores → reminders.',
			'bu.interactions': 'Mark a chore done; tap "Remind" to send a neutral reminder.',
			'bu.rationale': 'Reminders come from RoomSync, not a person, to avoid awkwardness.',
			'bu.decisions': 'Separated personal and shared expenses into distinct categories after testing.',
			'bu.limits': 'Notifications are simulated in the prototype.',
			'bu.resources': PLACEHOLDER,
			'va.objectives': 'Can roommates tell personal from shared expenses? Do chores feel fair?',
			'va.method': 'Nine sessions, including two full households tested together.',
			'va.metrics': 'Correctly categorized expenses; time to assign chores; perceived fairness rating.',
			'va.findings': 'Users struggled to distinguish personal and shared expenses; clearer categories fixed it.',
			'va.usability': 'Expense type unclear; chore rotation hidden in settings.',
			'va.validated': 'Neutral reminders reduce awkwardness.',
			'va.invalidated': 'One list for all expenses works.',
			'va.improvements': 'Separate "Shared" and "Just me" categories with color; chore rotation on the dashboard.',
			'va.risks': 'Whole-household adoption.',
			'va.next': 'Pilot with three households for two weeks.',
			'sh.story': 'Mia\'s household had a $50 late fee because everyone thought someone else paid the internet bill. RoomSync keeps bills, chores and reminders in one place so that doesn\'t happen.',
			'sh.problem': 'Roommates forget payments and argue about chores.',
			'sh.insights': '11 of 14 had a forgotten payment. Chores cause as much conflict as money.',
			'sh.diff': 'Expenses and chores in one workspace, with neutral reminders.',
			'sh.business': '$4.99/household/month; $748.50 monthly scenario vs. $400 costs.',
			'sh.feasibility': 'Straightforward to build; notification reliability is the main risk.',
			'sh.testing': '9 sessions; expense categories redesigned.',
			'sh.roadmap': 'Household pilot, landlord-friendly move-in kit, optional payment links later.',
			'sh.demoFlow': 'Create household → add internet bill → assign chores → show reminder.',
			'sh.judgeQs': 'Why not Splitwise plus a chore app?\nHow do you get all roommates to join?\nWhy not handle payments directly?',
			'sh.evidence': '14 interviews, 9 usability sessions, competitor comparison.'
		},
		interviews: {
			count: 14, start: '2026-09-10',
			categories: ['Student renter, 2 roommates', 'Student renter, 3 roommates', 'Young professional, 1 roommate', 'First-year renter', 'Property manager'],
			observations: ['Paid the full internet bill and waited weeks to be paid back.', 'Used Splitwise for rent but a whiteboard for chores.', 'Group chat reminders were ignored or caused tension.', 'Got a late fee because nobody knew whose turn it was to pay.', 'Did more chores but didn\'t want to bring it up.'],
			quotes: ['"I don\'t want to be the roommate who nags."', '"Splitwise is fine for money, but who takes out the trash?"', '"We had a $50 late fee because everyone thought someone else paid."', '"Our chore chart lasted two weeks."', '"I\'d rather pay than have the conversation."', '"Tenants fight about utilities more than anything."'],
			pains: ['Forgotten payments', 'Unequal chores', 'Awkward conversations', 'Too many tools', 'Slow paybacks']
		},
		testing: {
			count: 9, start: '2026-10-30', changeOn: '2026-11-04',
			tasks: ['Add the internet bill as a shared expense.', 'Log a personal grocery purchase.', 'Assign this week\'s chores.'],
			before: ['Logged personal groceries as shared by mistake.', 'Could not tell which expenses roommates could see.', 'Looked for chore rotation on the dashboard.'],
			after: ['Picked "Just me" for groceries without hesitation.', 'Recognized shared expenses by color.', 'Assigned chores from the dashboard.'],
			feedback: ['"Less than a late fee, honestly."', '"The reminder not coming from me is the best part."', '"Can it rotate chores automatically?"']
		},
		competitors: [
			{ name: 'Splitwise', customer: 'Friends, roommates', features: 'Expense splitting', pricing: 'Free / Pro', strengths: 'Widely used', limits: 'No chores or household view', opportunity: 'Combine money and chores' },
			{ name: 'Google Sheets', customer: 'Organized roommates', features: 'Custom tracking', pricing: 'Free', strengths: 'Flexible', limits: 'Manual, no reminders', opportunity: 'Automatic reminders' },
			{ name: 'Group messaging', customer: 'Everyone', features: 'Chat', pricing: 'Free', strengths: 'Already used', limits: 'Reminders get lost; feels personal', opportunity: 'Neutral reminders' },
			{ name: 'Fridge chore chart', customer: 'Households', features: 'Paper chart', pricing: 'Free', strengths: 'Visible', limits: 'Abandoned quickly', opportunity: 'Rotation that sticks' }
		],
		features: [
			{ name: 'Shared household dashboard', value: 'Everything in one place', effort: 'M', priority: 'Must have', mvp: 'Yes', proof: 'Prototype only', reasoning: 'Core differentiator' },
			{ name: 'Expense tracking', value: 'Fair splits', effort: 'M', priority: 'Must have', mvp: 'Yes', proof: 'Prototype only', reasoning: 'Top pain' },
			{ name: 'Chore assignments', value: 'Fair chores', effort: 'S', priority: 'Must have', mvp: 'Yes', proof: 'Prototype only', reasoning: 'As much conflict as money' },
			{ name: 'Payment reminders', value: 'No forgotten bills', effort: 'M', priority: 'Must have', mvp: 'Yes', proof: 'Prototype only', reasoning: '11 of 14 forgot a payment' },
			{ name: 'Automatic chore rotation', value: 'Less admin', effort: 'S', priority: 'Should have', mvp: 'No', proof: 'Idea', reasoning: 'Requested in testing' },
			{ name: 'Direct money transfers', value: 'Pay in-app', effort: 'XL', priority: 'Not now', mvp: 'No', proof: 'Idea', reasoning: 'Regulatory and trust complexity' }
		],
		iterations: [
			{ original: 'One list for all expenses', evidence: '3 of the first 4 testers logged personal items as shared', change: '"Shared" and "Just me" categories with color', reason: 'Prevent mistakes and protect privacy', date: '2026-11-04' },
			{ original: 'Chore rotation in settings', evidence: 'Testers looked for it on the dashboard', change: 'Rotation shown on the dashboard', reason: 'Visibility', date: '2026-11-08' },
			{ original: 'Reminders sent "from" a roommate', evidence: 'Interviews: nobody wants to be the nag', change: 'Reminders sent from RoomSync', reason: 'Reduce awkwardness', date: '2026-10-25' }
		],
		businessModel: bm({ subscription: { enabled: true, potentialCustomers: 1500, conversionRate: 10, monthlyPrice: 4.99 }, costs: { fixedMonthly: 400, variableCost: 0, variableBasis: 'customer', otherMonthly: 0 } }),
		feasibility: {
			technology: ['supported', 'Standard web app.'],
			data: ['supported', 'Entered by households.'],
			integrations: ['investigating', 'Payment integrations considered for later.'],
			access: ['supported', 'Household invites.'],
			privacy: ['supported', 'Personal expenses hidden from roommates.'],
			complexity: ['supported', 'Small team can build the MVP.'],
			costs: ['supported', 'Notifications are low cost at this scale.'],
			prototype: ['supported', 'Notifications are simulated.']
		},
		decisions: [
			{ title: 'Combine expenses and chores', date: '2026-09-26', phase: 'discover', status: 'accepted', description: 'One workspace for money and chores.', alternatives: 'Expenses only (Splitwise competitor).', evidence: 'Chores caused as much conflict as money.', reasoning: 'Combining is the gap in the market.', by: 'Leo Garcia' },
			{ title: 'Household subscription', date: '2026-10-09', phase: 'monetize', status: 'accepted', description: '$4.99 per household per month.', alternatives: 'Per-user pricing; ads.', evidence: 'Testers compared it to a late fee.', reasoning: 'Splits to about $1.25 per roommate.', by: 'Mia Johnson' },
			{ title: 'In-app payments', date: '2026-10-13', phase: 'scope', status: 'reversed', description: 'Let roommates pay each other in the app.', alternatives: 'Reminders with links to existing payment apps.', evidence: 'Feasibility: regulatory and trust complexity.', reasoning: 'Reversed Oct 16: reminders solve the forgotten-payment problem without moving money.', by: 'Arjun Mehta' },
			{ title: 'Neutral reminders', date: '2026-10-25', phase: 'build', status: 'accepted', description: 'Reminders come from RoomSync, not a roommate.', alternatives: 'Roommate-sent nudges.', evidence: '"I don\'t want to be the roommate who nags."', reasoning: 'Removes the awkward conversation.', by: 'Sara Lindqvist' },
			{ title: 'Separate personal and shared expenses', date: '2026-11-04', phase: 'validate', status: 'accepted', description: 'Two categories with distinct colors.', alternatives: 'One list with a toggle.', evidence: 'Testers logged personal items as shared.', reasoning: 'Clarity and privacy.', by: 'Tyler Owens' },
			{ title: 'Automatic chore rotation', date: '2026-11-15', phase: 'showcase', status: 'proposed', description: 'Rotate chores weekly automatically.', alternatives: 'Manual assignment.', evidence: 'Requested by 4 testers.', reasoning: 'Proposed for the roadmap.', by: 'Leo Garcia' }
		],
		tasks: [
			{ title: 'Separate personal and shared expense categories', member: 3, due: '2026-11-05', done: true, created: '2026-11-02' },
			{ title: 'Run full-household test session', member: 1, due: '2026-11-10', done: true, created: '2026-11-03' },
			{ title: 'Finalize prototype', member: 2, due: '2026-11-21', done: true, created: '2026-11-12' },
			{ title: 'Prepare Demo Day slides', member: 0, due: '2026-11-26', created: '2026-11-18' },
			{ title: 'Practice judge questions (Splitwise comparison)', member: 4, due: '2026-12-03', created: '2026-11-20' },
			{ title: 'Review notification service reliability', member: 2, due: '2026-11-19', created: '2026-11-12' },
			{ title: 'Record backup demo video', member: 1, due: '2026-11-30', created: '2026-11-22' },
			{ title: 'Update competitor comparison with fridge charts', member: 4, due: '2026-10-04', done: true, created: '2026-09-29' }
		],
		reviews: [
			{ feedback: 'Great that chores emerged as a major pain. Clear evidence.', next: 'Explain why Splitwise users would switch.' },
			{ feedback: 'Household pricing is clever. Good decision to drop in-app payments.', next: 'Check notification reliability options.' },
			{ feedback: 'Prototype covers the full journey. Expense categories look confusing.', next: 'Test expense categorization specifically.' },
			{ feedback: 'Strong iteration. Demonstrate how the product improves existing roommate workflows beyond combining familiar features.', next: 'Show a before/after household workflow in the pitch.' }
		],
		comments: [
			{ field: 'po.advantage', at: '2026-10-07T17:00:00Z', body: 'Is "combining features" enough? Splitwise could add chores tomorrow.', replies: [{ by: 'team', at: '2026-10-08T01:00:00Z', body: 'The neutral reminders are the real difference; combining is what makes them work.' }], resolved: '2026-10-09T14:00:00Z' },
			{ field: 'sh.diff', at: '2026-11-20T18:00:00Z', body: 'Show how the workflow changes, not just that features are combined.', replies: [{ by: 'team', at: '2026-11-21T02:00:00Z', body: 'Adding a before/after household story to the pitch.' }] },
			{ field: 'di.findings', at: '2026-09-30T17:30:00Z', body: 'The late-fee story is perfect for your pitch.', resolved: '2026-10-01T13:00:00Z' },
			{ field: 'va.method', at: '2026-11-06T16:00:00Z', body: 'Testing two full households together is a great idea.', resolved: '2026-11-07T12:00:00Z' },
			{ field: 'mo.payer', at: '2026-10-21T16:20:00Z', body: 'Who in the household actually pays? One person or a split?', replies: [{ by: 'team', at: '2026-10-22T00:30:00Z', body: 'One person subscribes; RoomSync adds it as a shared expense automatically.' }, { by: 'mentor', at: '2026-10-22T15:00:00Z', body: 'Nice. Make that explicit in your pricing rationale.' }] },
			{ field: 'bu.limits', at: '2026-11-08T17:45:00Z', body: 'Are reminders real or simulated in the prototype?', resolved: '2026-11-09T12:00:00Z', replies: [{ by: 'team', at: '2026-11-09T02:00:00Z', body: 'Simulated. Added that to the limitations.' }, { by: 'mentor', at: '2026-11-20T15:30:00Z', body: 'Reopening: add this to your Demo Day slide too, judges will ask.' }] }
		]
	}
];
