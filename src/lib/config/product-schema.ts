// Declarative definition of the My Product workspace (PRD §7).
// Every field rendered in the workspace, the mentor read-only view and the export
// comes from this file. To add/rename a field, edit it here — no component changes needed.
// Field keys are stable identifiers stored in `product_fields.field_key`: never rename a key
// once teams have data; change the label instead.

import type { LogKind, PhaseKey } from '$lib/types/domain';

export type FieldType = 'text' | 'textarea' | 'select' | 'multiselect' | 'url' | 'number' | 'checklist';

export interface FieldDef {
	key: string;
	label: string;
	type: FieldType;
	prompt?: string; // helper text under the label
	placeholder?: string; // example answer
	options?: string[];
	/** Show the Assumption / Validated toggle for this field. */
	evidence?: boolean;
	wide?: boolean;
}

export interface ColumnDef {
	key: string;
	label: string;
	type?: 'text' | 'textarea' | 'date' | 'select';
	options?: string[];
	width?: string;
}

export interface TableDef {
	kind: LogKind;
	title: string;
	description: string;
	addLabel: string;
	/** 'cards' for long-form entries (interviews), 'grid' for comparison tables. */
	layout: 'cards' | 'grid';
	columns: ColumnDef[];
}

export interface SectionDef {
	phase: PhaseKey;
	intro: string;
	groups: { title: string; fields: FieldDef[] }[];
	tables?: TableDef[];
}

export const REVENUE_MODELS = [
	'Subscription',
	'Freemium',
	'Transaction fees',
	'Licensing',
	'Usage-based pricing',
	'Advertising',
	'One-time purchase',
	'Enterprise contracts',
	'Cost savings / efficiency (no direct revenue)',
	'Other'
];

export const PRIORITIES = ['Must have', 'Should have', 'Could have', 'Not now'];

export const PRODUCT_SCHEMA: SectionDef[] = [
	{
		phase: 'overview',
		intro: 'A living summary of your product. Keep it current — mentors and judges read this first.',
		groups: [
			{
				title: 'The product',
				fields: [
					{ key: 'ov.name', label: 'Product name', type: 'text', placeholder: 'e.g. Nestled' },
					{
						key: 'ov.status',
						label: 'Current product status',
						type: 'select',
						options: ['Exploring problems', 'Problem validated', 'Designing solution', 'Prototyping', 'Testing', 'Demo-ready']
					},
					{ key: 'ov.description', label: 'Product description', type: 'textarea', wide: true, prompt: 'One or two sentences a stranger would understand.' },
					{ key: 'ov.customer', label: 'Target customer', type: 'textarea', evidence: true },
					{ key: 'ov.problem', label: 'Problem statement', type: 'textarea', evidence: true },
					{ key: 'ov.value', label: 'Value proposition', type: 'textarea', wide: true, evidence: true }
				]
			},
			{
				title: 'Links',
				fields: [
					{ key: 'ov.prototype', label: 'Prototype link', type: 'url', placeholder: 'https://figma.com/proto/…' },
					{ key: 'ov.resources', label: 'Additional resource links', type: 'textarea', prompt: 'One link per line — Google Docs, decks, research folders.' }
				]
			}
		]
	},
	{
		phase: 'discover',
		intro: 'Start with the experience, not the solution. Talk to people and let evidence shape your problem statement.',
		groups: [
			{
				title: 'Framing',
				fields: [
					{ key: 'di.experience', label: 'Experience being investigated', type: 'textarea', wide: true },
					{ key: 'di.assumptions', label: 'Initial assumptions', type: 'textarea', prompt: 'What do you believe is true before talking to anyone?' },
					{ key: 'di.stakeholders', label: 'Potential stakeholders', type: 'textarea' },
					{ key: 'di.segment', label: 'Target customer segment', type: 'textarea', evidence: true },
					{ key: 'di.objectives', label: 'Research objectives', type: 'textarea' },
					{ key: 'di.questions', label: 'Interview questions', type: 'textarea', wide: true, prompt: 'Open-ended, about past behavior. Avoid “Would you use…?”' }
				]
			},
			{
				title: 'What you learned',
				fields: [
					{ key: 'di.findings', label: 'Key research findings', type: 'textarea', wide: true },
					{ key: 'di.pains', label: 'Identified pain points', type: 'textarea', evidence: true },
					{ key: 'di.problem', label: 'Validated problem statement', type: 'textarea', evidence: true },
					{ key: 'di.uncertain', label: 'Remaining uncertainties', type: 'textarea', wide: true }
				]
			}
		],
		tables: [
			{
				kind: 'research',
				title: 'Research interview log',
				description: 'Use a pseudonym or ID — never collect names, contact info, or other unnecessary personal details.',
				addLabel: 'Add interview',
				layout: 'cards',
				columns: [
					{ key: 'participant', label: 'Participant ID', width: '140px' },
					{ key: 'category', label: 'Participant category' },
					{ key: 'date', label: 'Date', type: 'date' },
					{ key: 'observations', label: 'Key observations', type: 'textarea' },
					{ key: 'quotes', label: 'Important quotes', type: 'textarea' },
					{ key: 'pains', label: 'Pain points', type: 'textarea' },
					{ key: 'notes', label: 'Research notes', type: 'textarea' }
				]
			}
		]
	},
	{
		phase: 'position',
		intro: 'Every problem already has a workaround. Understand what people do today and why yours would be worth switching to.',
		groups: [
			{
				title: 'Market',
				fields: [
					{ key: 'po.market', label: 'Target market', type: 'textarea', evidence: true },
					{ key: 'po.alternatives', label: 'Existing alternatives', type: 'textarea' },
					{ key: 'po.workarounds', label: 'Customer workarounds', type: 'textarea', prompt: 'Spreadsheets, group chats, asking a parent…' },
					{ key: 'po.opportunity', label: 'Market opportunity', type: 'textarea', evidence: true }
				]
			},
			{
				title: 'Differentiation',
				fields: [
					{ key: 'po.advantage', label: 'Competitive advantage', type: 'textarea' },
					{ key: 'po.positioning', label: 'Product positioning', type: 'textarea', prompt: 'For [customer] who [need], [product] is a [category] that [benefit]. Unlike [alternative], we [difference].' },
					{ key: 'po.switch', label: 'Reasons customers would switch', type: 'textarea', evidence: true },
					{ key: 'po.unvalidated', label: 'Unvalidated market assumptions', type: 'textarea' }
				]
			}
		],
		tables: [
			{
				kind: 'competitor',
				title: 'Competitor comparison',
				description: 'Include indirect competitors and non-digital workarounds.',
				addLabel: 'Add alternative',
				layout: 'grid',
				columns: [
					{ key: 'name', label: 'Competitor / alternative', width: '180px' },
					{ key: 'customer', label: 'Target customer' },
					{ key: 'features', label: 'Key features' },
					{ key: 'pricing', label: 'Pricing', width: '110px' },
					{ key: 'strengths', label: 'Strengths' },
					{ key: 'limits', label: 'Limitations' },
					{ key: 'opportunity', label: 'Opportunity' }
				]
			}
		]
	},
	{
		phase: 'monetize',
		intro: 'Who pays, how much, and why? Value can also come from cost savings or risk reduction.',
		groups: [
			{
				title: 'Model',
				fields: [
					{ key: 'mo.type', label: 'Business model type', type: 'select', options: ['B2C', 'B2B', 'B2B2C', 'Marketplace', 'Internal / non-profit', 'Other'] },
					{ key: 'mo.streams', label: 'Revenue streams', type: 'multiselect', options: REVENUE_MODELS, wide: true },
					{ key: 'mo.user', label: 'Primary user', type: 'text' },
					{ key: 'mo.payer', label: 'Paying customer', type: 'text', evidence: true },
					{ key: 'mo.value', label: 'Customer value proposition', type: 'textarea', wide: true }
				]
			},
			{
				title: 'Pricing & costs',
				fields: [
					{ key: 'mo.pricing', label: 'Pricing strategy', type: 'textarea', evidence: true },
					{ key: 'mo.rationale', label: 'Pricing rationale', type: 'textarea' },
					{ key: 'mo.acquisition', label: 'Customer acquisition approach', type: 'textarea' },
					{ key: 'mo.costs', label: 'Estimated operating costs', type: 'textarea' },
					{ key: 'mo.revenueAssumptions', label: 'Revenue assumptions', type: 'textarea' },
					{ key: 'mo.risks', label: 'Business viability risks', type: 'textarea' },
					{ key: 'mo.evidence', label: 'Supporting evidence', type: 'textarea', wide: true }
				]
			}
		]
	},
	{
		phase: 'scope',
		intro: 'Separate what you can demo from what you can actually build. Name your dependencies before they surprise you.',
		groups: [
			{
				title: 'Solution',
				fields: [
					{ key: 'sc.solution', label: 'Proposed solution', type: 'textarea', wide: true },
					{ key: 'sc.core', label: 'Core product functionality', type: 'textarea' },
					{ key: 'sc.mvp', label: 'Proposed MVP', type: 'textarea' },
					{ key: 'sc.outOfScope', label: 'Out-of-scope functionality', type: 'textarea', wide: true }
				]
			},
			{
				title: 'Feasibility',
				fields: [
					{ key: 'sc.tech', label: 'Required technology', type: 'textarea' },
					{ key: 'sc.data', label: 'Required data sources', type: 'textarea', evidence: true },
					{ key: 'sc.apis', label: 'External APIs & integrations', type: 'textarea', evidence: true },
					{ key: 'sc.access', label: 'Permissions & access requirements', type: 'textarea' },
					{ key: 'sc.privacy', label: 'Privacy & security considerations', type: 'textarea' },
					{ key: 'sc.regulatory', label: 'Regulatory considerations', type: 'textarea', prompt: 'If applicable.' },
					{ key: 'sc.dependencies', label: 'Technical dependencies', type: 'textarea' },
					{ key: 'sc.limits', label: 'Implementation limitations', type: 'textarea' },
					{ key: 'sc.risks', label: 'Major feasibility risks', type: 'textarea', wide: true }
				]
			}
		],
		tables: [
			{
				kind: 'feature',
				title: 'Feature prioritization',
				description: 'Mark whether each feature is shown in the prototype only, or technically implemented / verified.',
				addLabel: 'Add feature',
				layout: 'grid',
				columns: [
					{ key: 'name', label: 'Feature', width: '170px' },
					{ key: 'value', label: 'User value' },
					{ key: 'effort', label: 'Effort', type: 'select', options: ['S', 'M', 'L', 'XL'], width: '90px' },
					{ key: 'priority', label: 'Priority', type: 'select', options: PRIORITIES, width: '130px' },
					{ key: 'mvp', label: 'In MVP?', type: 'select', options: ['Yes', 'No'], width: '90px' },
					{ key: 'proof', label: 'Status', type: 'select', options: ['Idea', 'Prototype only', 'Implemented', 'Verified'], width: '140px' },
					{ key: 'reasoning', label: 'Reasoning' }
				]
			}
		]
	},
	{
		phase: 'build',
		intro: 'Design the path a real customer takes. Link your Figma files — no uploads needed.',
		groups: [
			{
				title: 'Experience',
				fields: [
					{ key: 'bu.journey', label: 'Core user journey', type: 'textarea', wide: true },
					{ key: 'bu.flow', label: 'User flow description', type: 'textarea' },
					{ key: 'bu.interactions', label: 'Key product interactions', type: 'textarea' },
					{ key: 'bu.rationale', label: 'Design rationale', type: 'textarea' },
					{ key: 'bu.decisions', label: 'Design decisions', type: 'textarea' },
					{ key: 'bu.limits', label: 'Known prototype limitations', type: 'textarea', wide: true }
				]
			},
			{
				title: 'Links',
				fields: [
					{ key: 'bu.wireframes', label: 'Wireframe link', type: 'url' },
					{ key: 'bu.prototype', label: 'Interactive prototype link', type: 'url' },
					{ key: 'bu.resources', label: 'Supporting resources', type: 'textarea', wide: true }
				]
			}
		]
	},
	{
		phase: 'validate',
		intro: 'Put the prototype in front of real people. Record what changed and why.',
		groups: [
			{
				title: 'Plan',
				fields: [
					{ key: 'va.objectives', label: 'Testing objectives', type: 'textarea' },
					{ key: 'va.method', label: 'Testing methodology', type: 'textarea' },
					{ key: 'va.metrics', label: 'Success metrics', type: 'textarea', wide: true }
				]
			},
			{
				title: 'Results',
				fields: [
					{ key: 'va.findings', label: 'Key findings', type: 'textarea', wide: true },
					{ key: 'va.usability', label: 'Usability issues', type: 'textarea' },
					{ key: 'va.validated', label: 'Validated assumptions', type: 'textarea' },
					{ key: 'va.invalidated', label: 'Invalidated assumptions', type: 'textarea' },
					{ key: 'va.improvements', label: 'Product improvements', type: 'textarea' },
					{ key: 'va.risks', label: 'Remaining risks', type: 'textarea' },
					{ key: 'va.next', label: 'Recommended next steps', type: 'textarea' }
				]
			}
		],
		tables: [
			{
				kind: 'testing',
				title: 'Testing session log',
				description: 'One entry per participant session.',
				addLabel: 'Add session',
				layout: 'cards',
				columns: [
					{ key: 'participant', label: 'Participant ID' },
					{ key: 'date', label: 'Date', type: 'date' },
					{ key: 'task', label: 'Task / scenario', type: 'textarea' },
					{ key: 'observations', label: 'Observations', type: 'textarea' },
					{ key: 'issues', label: 'Issues encountered', type: 'textarea' },
					{ key: 'feedback', label: 'Feedback', type: 'textarea' },
					{ key: 'outcome', label: 'Outcome', type: 'select', options: ['Completed', 'Completed with help', 'Failed'] }
				]
			},
			{
				kind: 'iteration',
				title: 'Iteration log',
				description: 'What you changed because of evidence.',
				addLabel: 'Add iteration',
				layout: 'grid',
				columns: [
					{ key: 'original', label: 'Original decision' },
					{ key: 'evidence', label: 'New evidence' },
					{ key: 'change', label: 'Change made' },
					{ key: 'reason', label: 'Reason' },
					{ key: 'date', label: 'Date', type: 'date', width: '140px' }
				]
			}
		]
	},
	{
		phase: 'showcase',
		intro: 'Tell the story of how evidence shaped your product. Most of it is already written in earlier sections.',
		groups: [
			{
				title: 'Story',
				fields: [
					{ key: 'sh.story', label: 'Product story', type: 'textarea', wide: true },
					{ key: 'sh.problem', label: 'Problem summary', type: 'textarea' },
					{ key: 'sh.insights', label: 'Customer insights', type: 'textarea' },
					{ key: 'sh.diff', label: 'Product differentiation', type: 'textarea' },
					{ key: 'sh.business', label: 'Business model summary', type: 'textarea' },
					{ key: 'sh.feasibility', label: 'Feasibility summary', type: 'textarea' },
					{ key: 'sh.testing', label: 'Testing & iteration summary', type: 'textarea' },
					{ key: 'sh.roadmap', label: 'Future roadmap', type: 'textarea', wide: true }
				]
			},
			{
				title: 'Presentation',
				fields: [
					{ key: 'sh.deck', label: 'Presentation link', type: 'url' },
					{ key: 'sh.prototype', label: 'Prototype link', type: 'url' },
					{ key: 'sh.demoFlow', label: 'Demo flow', type: 'textarea' },
					{ key: 'sh.judgeQs', label: 'Potential judge questions', type: 'textarea' },
					{ key: 'sh.evidence', label: 'Supporting evidence', type: 'textarea', wide: true }
				]
			}
		]
	}
];

export const sectionFor = (phase: PhaseKey) => PRODUCT_SCHEMA.find((s) => s.phase === phase)!;

/** Fraction of fields with a non-empty value — informational only, never a "score". */
export function sectionFill(phase: PhaseKey, fields: Record<string, { value: unknown }>): { filled: number; total: number } {
	const defs = sectionFor(phase).groups.flatMap((g) => g.fields);
	const filled = defs.filter((d) => {
		const v = fields[d.key]?.value;
		return Array.isArray(v) ? v.length > 0 : typeof v === 'string' ? v.trim() !== '' : v != null;
	}).length;
	return { filled, total: defs.length };
}
