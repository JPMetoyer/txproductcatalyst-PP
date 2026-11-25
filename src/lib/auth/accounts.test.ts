import { describe, expect, it } from 'vitest';
import { emailToLogin, loginToEmail, slugify } from './accounts';

describe('account helpers', () => {
	it('maps usernames to synthetic emails', () => {
		expect(loginToEmail(' Team-Nestled ')).toBe('team-nestled@studio.texasproductcatalyst.com');
		expect(loginToEmail('someone@utexas.edu')).toBe('someone@utexas.edu');
		expect(emailToLogin('team-nestled@studio.texasproductcatalyst.com')).toBe('team-nestled');
	});
	it('slugifies team names', () => {
		expect(slugify('Paycheck Pals!')).toBe('paycheck-pals');
		expect(slugify('  Café   Crew ')).toBe('cafe-crew');
	});
});
