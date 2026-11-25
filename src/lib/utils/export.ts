// Basic documentation export (PRD §18 Data Retention, §19 "Basic documentation export").
// Produces Markdown from the same schema that drives the workspace, so it never drifts.

import { PRODUCT_SCHEMA } from '$lib/config/product-schema';
import { phaseMeta } from '$lib/config/phases';
import type { Product } from '$lib/types/domain';

export function productToMarkdown(product: Product, teamName: string): string {
	const out: string[] = [`# ${product.name || teamName} — Product documentation`, '', `Team: ${teamName}`, ''];
	for (const section of PRODUCT_SCHEMA) {
		out.push(`## ${phaseMeta(section.phase).label}`, '');
		for (const g of section.groups) {
			out.push(`### ${g.title}`, '');
			for (const f of g.fields) {
				const v = product.fields[f.key];
				const text = Array.isArray(v?.value) ? (v.value as string[]).join(', ') : String(v?.value ?? '').trim();
				const tag = v?.evidence ? ` _(${v.evidence})_` : '';
				out.push(`**${f.label}**${tag}`, '', text || '_Not started_', '');
			}
		}
		for (const t of section.tables ?? []) {
			const rows = product.logs.filter((l) => l.kind === t.kind);
			out.push(`### ${t.title}`, '');
			if (!rows.length) {
				out.push('_No entries_', '');
				continue;
			}
			const esc = (s: string) => (s ?? '').replace(/\|/g, '\\|').replace(/\n/g, '<br>');
			out.push(`| ${t.columns.map((c) => c.label).join(' | ')} |`, `| ${t.columns.map(() => '---').join(' | ')} |`);
			for (const r of rows) out.push(`| ${t.columns.map((c) => esc(r.data[c.key])).join(' | ')} |`);
			out.push('');
		}
	}
	out.push('## Decision log', '');
	for (const d of product.decisions) {
		out.push(`### ${d.title} (${d.status})`, '', `${d.date} · ${phaseMeta(d.phase).label}`, '', d.description, '');
		if (d.alternatives) out.push(`**Alternatives:** ${d.alternatives}`, '');
		if (d.evidence) out.push(`**Evidence:** ${d.evidence}`, '');
		if (d.reasoning) out.push(`**Reasoning:** ${d.reasoning}`, '');
	}
	return out.join('\n');
}

export function download(filename: string, text: string) {
	const url = URL.createObjectURL(new Blob([text], { type: 'text/markdown' }));
	const a = Object.assign(document.createElement('a'), { href: url, download: filename });
	a.click();
	URL.revokeObjectURL(url);
}
