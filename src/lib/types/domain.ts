// Domain types. These mirror the planned Postgres schema (docs/PLAN.md §4)
// so the mock data layer can be swapped for Supabase without touching components.

export type ID = string;
export type ISODate = string; // 'YYYY-MM-DD'
export type ISODateTime = string;

export type Role = 'team' | 'mentor' | 'admin';

export type PhaseKey =
	| 'overview'
	| 'discover'
	| 'position'
	| 'monetize'
	| 'scope'
	| 'build'
	| 'validate'
	| 'showcase';

/** The seven journey phases (overview is a workspace section, not a phase). */
export type JourneyPhase = Exclude<PhaseKey, 'overview'>;

export interface Semester {
	id: ID;
	name: string; // "Spring 2027"
	theme: string; // "Life in Motion"
	startDate: ISODate;
	endDate: ISODate;
	status: 'upcoming' | 'active' | 'archived';
	publicMarketplace: boolean;
}

export interface Profile {
	id: ID;
	displayName: string;
	role: Role;
	active: boolean;
	email?: string;
}

export interface TeamMember {
	id: ID;
	teamId: ID;
	name: string;
	active: boolean;
}

export interface Team {
	id: ID;
	semesterId: ID;
	name: string;
	challengeId: ID | null;
	mentorIds: ID[];
	status: 'active' | 'archived';
	currentPhase: JourneyPhase;
	/** Phases the team has meaningfully worked on (informational only). */
	phasesStarted: JourneyPhase[];
	lastActivityAt: ISODateTime;
}

export type ChallengeIcon =
	| 'home'
	| 'wallet'
	| 'briefcase'
	| 'map'
	| 'heart-handshake'
	| 'rocket'
	| 'users'
	| 'clipboard-list';

export interface Challenge {
	id: ID;
	semesterId: ID;
	code: string; // unique human identifier, e.g. "LM-01"
	title: string;
	summary: string;
	icon: ChallengeIcon;
	accent: 'blue' | 'pink' | 'orange' | 'lavender';
	experience: string;
	mission: string;
	stakeholders: string[];
	researchConsiderations: string[];
	boundaries: string[];
	expectations: string[];
	published: boolean;
}

export type TaskStatus = 'open' | 'done';
export interface Task {
	id: ID;
	teamId: ID;
	title: string;
	assignedMemberId: ID | null;
	dueDate: ISODate | null;
	status: TaskStatus;
}

export interface Lesson {
	id: ID;
	gmNumber: number;
	title: string; // "DISCOVER IT"
	/** Null until admins set the GM schedule. */
	scheduledDate: ISODate | null;
	description: string;
	topics: string[];
	relatedPhase: PhaseKey | null;
	published: boolean;
	objectives?: string[];
	slideUrl?: string;
	keyConcepts?: string[];
	examples?: string;
	activity?: string;
	resources?: { title: string; url: string }[];
}

export type MilestoneStatus = 'upcoming' | 'ready' | 'reviewed' | 'follow-up';

export interface Milestone {
	id: ID;
	number: 1 | 2 | 3 | 4;
	title: string;
	afterGm: string; // "After GM3"
	targetDate: ISODate;
	reviewAreas: string[];
	reviewQuestions: string[];
	relatedPhases: JourneyPhase[];
}

export interface MilestoneReview {
	id: ID;
	milestoneId: ID;
	teamId: ID;
	reviewerId: ID | null;
	status: MilestoneStatus;
	feedback: string;
	nextSteps: string;
	blockers: string;
	reviewedAt: ISODateTime | null;
	readyAt: ISODateTime | null;
}

export type DecisionStatus = 'proposed' | 'accepted' | 'reconsidering' | 'reversed';
export interface Decision {
	id: ID;
	productId: ID;
	title: string;
	date: ISODate;
	phase: JourneyPhase;
	description: string;
	alternatives: string;
	evidence: string;
	reasoning: string;
	attribution: string;
	status: DecisionStatus;
	/** Row version for conflict detection (absent on unsaved drafts). */
	version?: number;
}

/* ---------- Product documentation ---------- */

export type FieldEvidence = 'assumption' | 'validated' | null;

export interface ProductFieldValue {
	value: unknown;
	evidence: FieldEvidence;
	version: number;
	updatedAt: ISODateTime;
}

/** Map of field_key → value. Backed by the `product_fields` table. */
export type ProductFields = Record<string, ProductFieldValue>;

export type LogKind = 'research' | 'competitor' | 'feature' | 'testing' | 'iteration';

export interface LogEntry {
	id: ID;
	productId: ID;
	kind: LogKind;
	data: Record<string, string>;
	position: number;
	version: number;
}

export interface Product {
	id: ID;
	teamId: ID;
	name: string;
	fields: ProductFields;
	logs: LogEntry[];
	decisions: Decision[];
}

export interface FieldComment {
	id: ID;
	productId: ID;
	fieldKey: string;
	/** Set on replies; null for the comment that starts a thread. */
	parentId: ID | null;
	authorId: ID;
	authorName: string;
	authorRole: Role | null;
	body: string;
	createdAt: ISODateTime;
	/** Only meaningful on thread roots. */
	resolved: boolean;
	resolvedAt: ISODateTime | null;
}

export interface FeedbackItem {
	id: ID;
	teamId: ID;
	milestoneId: ID;
	mentorName: string;
	body: string;
	createdAt: ISODateTime;
}

export interface Announcement {
	id: ID;
	title: string;
	body: string;
	publishedAt: ISODateTime;
}

/* ---------- Save state for autosave UI ---------- */
export type SaveState = 'idle' | 'saving' | 'saved' | 'error' | 'conflict';
