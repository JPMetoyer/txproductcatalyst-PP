// Career Center sections. Items live in the `resources` table with category `career:<key>`.
export const CAREER_SECTIONS = [
	{ key: 'frameworks', label: 'Interview frameworks', blurb: 'Structures for answering PM interview questions.' },
	{ key: 'product-sense', label: 'Product sense', blurb: 'Design and improvement questions to practice.' },
	{ key: 'strategy', label: 'Product strategy', blurb: 'Market, competition and direction questions.' },
	{ key: 'metrics', label: 'Metrics & analytics', blurb: 'Questions about measuring and diagnosing products.' },
	{ key: 'behavioral', label: 'Behavioral', blurb: 'Questions about how you work — use your Product Project stories.' },
	{ key: 'resume', label: 'Resume bullets', blurb: 'Examples of turning Product Project work into resume lines.' },
	{ key: 'portfolio', label: 'Portfolio templates', blurb: 'Outlines for a product case study.' },
	{ key: 'recruiting', label: 'Recruiting resources', blurb: 'Guides and links for the PM recruiting process.' },
	{ key: 'reflection', label: 'Reflection prompts', blurb: 'Questions to turn your semester into lessons and stories.' }
] as const;

export type CareerSection = (typeof CAREER_SECTIONS)[number]['key'];

export interface CareerItem {
	id: string;
	section: CareerSection;
	title: string;
	body: string;
	url: string;
	position: number;
}

export const toCareerItem = (r: { id: string; category: string; title: string; body: string; url: string | null; position: number }): CareerItem => ({
	id: r.id,
	section: r.category.replace('career:', '') as CareerSection,
	title: r.title,
	body: r.body,
	url: r.url ?? '',
	position: r.position
});
