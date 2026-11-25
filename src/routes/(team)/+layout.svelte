<script lang="ts">
	import { House, Store, Layers, GraduationCap, Briefcase, Presentation } from '@lucide/svelte';
	import AppShell, { type NavItem } from '$lib/components/layout/AppShell.svelte';
	import { DEMO, getSemester, getTeam } from '$lib/data';

	let { children } = $props();
	const team = getTeam(DEMO.teamId)!;
	const semester = getSemester();

	const nav: NavItem[] = [
		{ href: '/home', label: 'Home', icon: House },
		{ href: '/challenges', label: 'Challenge Marketplace', icon: Store },
		{ href: '/product', label: 'My Product', icon: Layers },
		{ href: '/academy', label: 'PM Academy', icon: GraduationCap },
		{ href: '/career', label: 'Career Center', icon: Briefcase },
		{ href: '/demo-day', label: 'Demo Day', icon: Presentation }
	];
</script>

<AppShell {nav} workspaceName={team.name} workspaceSub="{semester.name} · {semester.theme}" roleLabel="Team workspace" settingsHref="/settings">
	{@render children()}
</AppShell>
