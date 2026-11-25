// Feasibility Explorer areas and statuses (PRD §9.2). No overall score — on purpose.

export const AREAS = [
	{ key: 'technology', label: 'Technology requirements', prompt: 'What must exist technically for this to work? Is it proven?' },
	{ key: 'data', label: 'Data availability', prompt: 'Which data do you need, who owns it, and can you get it?' },
	{ key: 'integrations', label: 'Integration availability', prompt: 'Do the APIs or partners you depend on exist and allow your use case?' },
	{ key: 'access', label: 'Access and permissions', prompt: 'What accounts, approvals, or user permissions are required?' },
	{ key: 'privacy', label: 'Privacy and security', prompt: 'What sensitive information is involved, and how would you protect it?' },
	{ key: 'complexity', label: 'Development complexity', prompt: 'Could a small team build the MVP? What is the hardest part?' },
	{ key: 'costs', label: 'Operating costs', prompt: 'What would it cost to run monthly (hosting, APIs, support)?' },
	{ key: 'prototype', label: 'Prototype scope', prompt: 'What will your prototype really do vs. simulate?' }
] as const;

export type AreaKey = (typeof AREAS)[number]['key'];

export const STATUSES = [
	{ key: 'not-investigated', label: 'Not investigated', tone: 'neutral' },
	{ key: 'investigating', label: 'Investigating', tone: 'blue' },
	{ key: 'supported', label: 'Supported by evidence', tone: 'green' },
	{ key: 'blocker', label: 'Significant blocker', tone: 'red' },
	{ key: 'not-applicable', label: 'Not applicable', tone: 'neutral' }
] as const;

export type FeasibilityStatus = (typeof STATUSES)[number]['key'];

export interface Assessment {
	area: AreaKey;
	status: FeasibilityStatus;
	notes: string;
	evidence: string;
	version: number;
}
