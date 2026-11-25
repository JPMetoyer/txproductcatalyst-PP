// Shared team logins are Supabase Auth users with synthetic addresses on this domain.
// Students type just the username ("team-nestled"); we append the domain.
// No mail is ever sent to these addresses (accounts are admin-provisioned, resets are admin-only).

export const ACCOUNT_DOMAIN = 'studio.texasproductcatalyst.com';

export const slugify = (s: string) =>
	s
		.toLowerCase()
		.normalize('NFKD')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(0, 40);

/** "team-nestled" → "team-nestled@studio.texasproductcatalyst.com"; full emails pass through. */
export const loginToEmail = (login: string) => {
	const v = login.trim().toLowerCase();
	return v.includes('@') ? v : `${v}@${ACCOUNT_DOMAIN}`;
};

/** Display form of an account email (strips our synthetic domain). */
export const emailToLogin = (email: string) => email.replace(`@${ACCOUNT_DOMAIN}`, '');

export const homeFor = (role: 'team' | 'mentor' | 'admin') => (role === 'team' ? '/home' : `/${role}`);
