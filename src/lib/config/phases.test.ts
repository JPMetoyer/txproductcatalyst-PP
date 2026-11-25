import { describe, expect, it } from 'vitest';
import { recommendedPhase } from './phases';

const lessons = [
	{ scheduledDate: '2027-01-27', relatedPhase: 'overview' },
	{ scheduledDate: '2027-02-03', relatedPhase: 'discover' },
	{ scheduledDate: '2027-02-10', relatedPhase: 'position' },
	{ scheduledDate: '2027-04-07', relatedPhase: null },
	{ scheduledDate: '2027-04-14', relatedPhase: 'showcase' }
];

describe('recommendedPhase', () => {
	it('defaults to discover before any phase GM', () => expect(recommendedPhase(lessons, '2027-01-28')).toBe('discover'));
	it('follows the latest past GM', () => expect(recommendedPhase(lessons, '2027-02-17')).toBe('position'));
	it('skips GMs without a journey phase', () => expect(recommendedPhase(lessons, '2027-04-08')).toBe('position'));
	it('ignores undated GMs', () => expect(recommendedPhase([{ scheduledDate: null, relatedPhase: 'build' }], '2027-05-01')).toBe('discover'));
});
