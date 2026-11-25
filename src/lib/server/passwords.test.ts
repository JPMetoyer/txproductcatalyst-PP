import { describe, expect, it } from 'vitest';
import { generatePassword } from './passwords';

describe('generatePassword', () => {
	it('has the expected shape and no ambiguous characters', () => {
		for (let i = 0; i < 200; i++) {
			const p = generatePassword();
			expect(p).toMatch(/^[a-zA-Z2-9]{5}(-[a-zA-Z2-9]{5}){3}$/);
			expect(p).not.toMatch(/[01ilIoO]/);
		}
	});
	it('is not repeated', () => {
		expect(new Set(Array.from({ length: 500 }, generatePassword)).size).toBe(500);
	});
});
