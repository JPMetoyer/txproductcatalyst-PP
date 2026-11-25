<script lang="ts">
	import { House, Wallet, Briefcase, Map, HeartHandshake, Rocket, Users, ClipboardList } from '@lucide/svelte';
	import type { ChallengeIcon } from '$lib/types/domain';
	let { icon, size = 22 }: { icon: ChallengeIcon; size?: number } = $props();
	const icons = { home: House, wallet: Wallet, briefcase: Briefcase, map: Map, 'heart-handshake': HeartHandshake, rocket: Rocket, users: Users, 'clipboard-list': ClipboardList };
	const Cmp = $derived(icons[icon]);
</script>

<Cmp {size} aria-hidden="true" />
