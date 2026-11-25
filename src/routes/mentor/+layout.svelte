<script lang="ts">
	import { House, Users, ClipboardCheck, GraduationCap } from '@lucide/svelte';
	import AppShell, { type NavItem } from '$lib/components/layout/AppShell.svelte';

	let { data, children } = $props();
	const nav: NavItem[] = [
		{ href: '/mentor', label: 'Home', icon: House, exact: true },
		{ href: '/mentor/teams', label: 'Assigned Teams', icon: Users },
		{ href: '/mentor/reviews', label: 'Milestone Reviews', icon: ClipboardCheck },
		{ href: '/mentor/academy', label: 'PM Academy', icon: GraduationCap }
	];
</script>

<AppShell {nav} workspaceName={data.displayName} workspaceSub="Mentor · {data.semesterName}" roleLabel="Mentor">
	{@render children()}
</AppShell>
