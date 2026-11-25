import { describe, expect, it } from 'vitest';
import { DEFAULT_DEMO_DAY, parseDemoDay, rubricTotal } from './demo-day';

describe('demo day settings', () => {
	it('default rubric totals 100 points', () => expect(rubricTotal(DEFAULT_DEMO_DAY.rubric)).toBe(100));
	it('falls back to defaults for empty settings', () => expect(parseDemoDay({}).rubric).toEqual(DEFAULT_DEMO_DAY.rubric));
	it('drops invalid rows, dates and links', () => {
		const d = parseDemoDay({ date: 'tomorrow', rubric: [{ label: 'A', points: '7.6' }, { label: '', points: 5 }], resources: [{ title: 'x', url: 'javascript:1' }], checklist: ['a', '', 3] });
		expect(d.date).toBeNull();
		expect(d.rubric).toEqual([{ label: 'A', points: 8, description: '' }]);
		expect(d.resources).toEqual([]);
		expect(d.checklist).toEqual(['a']);
	});
});
