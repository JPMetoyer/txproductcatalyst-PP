<script lang="ts">
	import { House, Store, Layers, GraduationCap, Briefcase, Presentation } from '@lucide/svelte';
	import AppShell, { type NavItem } from '$lib/components/layout/AppShell.svelte';

	let { data, children } = $props();

	const nav: NavItem[] = [
		{ href: '/home', label: 'Home', icon: House },
		{ href: '/challenges', label: 'Challenge Marketplace', icon: Store },
		{ href: '/product', label: 'My Product', icon: Layers },
		{ href: '/academy', label: 'PM Academy', icon: GraduationCap },
		{ href: '/career', label: 'Career Center', icon: Briefcase },
		{ href: '/demo-day', label: 'Demo Day', icon: Presentation }
	];
	const sub = $derived(data.semester ? `${data.semester.name} · ${data.semester.theme}` : 'Public preview');
</script>

<AppShell {nav} workspaceName={data.team?.name ?? 'TPC Studio'} workspaceSub={sub} roleLabel={data.team ? 'Team workspace' : 'Browsing'} settingsHref={data.team ? '/settings' : undefined} signedIn={!!data.team}>
	{@render children()}
</AppShell>
