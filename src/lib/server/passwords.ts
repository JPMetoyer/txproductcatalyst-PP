/**
 * Strong, readable shared password: 4 groups of 5 from an unambiguous alphabet (~113 bits).
 * Rejection sampling avoids modulo bias. Uses Web Crypto so it runs on Cloudflare.
 */
const ALPHABET = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const LIMIT = 256 - (256 % ALPHABET.length);

export function generatePassword(): string {
	const out: string[] = [];
	while (out.length < 20) {
		for (const b of crypto.getRandomValues(new Uint8Array(32))) {
			if (b < LIMIT && out.length < 20) out.push(ALPHABET[b % ALPHABET.length]);
		}
	}
	return out.join('').match(/.{5}/g)!.join('-');
}
