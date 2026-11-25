// Creates an Academics Committee admin account. Run once at launch (and when a new officer joins):
//   npm run create-admin -- "Full Name"
// Prints the login and a generated password ONCE. Share it privately; the person can't change it
// themselves, so another admin can rotate it later (Admin → Mentors pattern) or re-run with a new name.
import { createClient } from '@supabase/supabase-js';
import { ACCOUNT_DOMAIN, slugify } from '../src/lib/auth/accounts.ts';
import { generatePassword } from '../src/lib/server/passwords.ts';

const name = process.argv.slice(2).join(' ').trim();
if (name.length < 2) {
	console.error('Usage: npm run create-admin -- "Full Name"');
	process.exit(1);
}
const url = process.env.PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;
if (!url || !secret) throw new Error('PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY must be set in .env');

const db = createClient(url, secret, { auth: { persistSession: false, autoRefreshToken: false } });
const login = `admin-${slugify(name)}`;
const password = generatePassword();
const { data, error } = await db.auth.admin.createUser({ email: `${login}@${ACCOUNT_DOMAIN}`, password, email_confirm: true });
if (error || !data.user) {
	console.error(`Could not create ${login}: ${error?.message}`);
	process.exit(1);
}
const p = await db.from('profiles').insert({ id: data.user.id, display_name: name, role: 'admin' });
if (p.error) {
	await db.auth.admin.deleteUser(data.user.id);
	console.error('Could not create the admin profile:', p.error.message);
	process.exit(1);
}
console.log(`\nAdmin account created for ${name}\n  Login:    ${login}\n  Password: ${password}\n\nThis password is not stored anywhere else. Share it privately.\n`);
