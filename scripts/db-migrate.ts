// Applies supabase/migrations/*.sql in filename order, once each.
// Usage: npm run db:migrate   (needs SUPABASE_DB_URL in .env — Supabase → Connect → Session pooler)
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import postgres from 'postgres';

const url = process.env.SUPABASE_DB_URL;
if (!url) {
	console.error('Missing SUPABASE_DB_URL in .env (Supabase → Connect → Session pooler connection string).');
	process.exit(1);
}

const sql = postgres(url, { ssl: 'require', max: 1, onnotice: () => {} });
const dir = join(import.meta.dirname, '..', 'supabase', 'migrations');

try {
	// Bookkeeping lives outside `public` so it is never exposed through the API.
	await sql`create schema if not exists studio_private`;
	await sql`create table if not exists studio_private.migrations (name text primary key, applied_at timestamptz not null default now())`;
	const applied = new Set((await sql`select name from studio_private.migrations`).map((r) => r.name as string));

	const files = (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort();
	let ran = 0;
	for (const file of files) {
		if (applied.has(file)) continue;
		const body = await readFile(join(dir, file), 'utf8');
		process.stdout.write(`Applying ${file}… `);
		await sql.begin(async (tx) => {
			await tx.unsafe(body);
			await tx`insert into studio_private.migrations (name) values (${file})`;
		});
		console.log('done');
		ran++;
	}
	console.log(ran ? `Applied ${ran} migration(s).` : 'Database is up to date.');
} catch (e) {
	console.error('\nMigration failed — nothing from the failing file was applied.\n', e);
	process.exitCode = 1;
} finally {
	await sql.end();
}
