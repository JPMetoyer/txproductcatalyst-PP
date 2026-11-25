<script lang="ts">
	import { LayoutDashboard, Users, UserCog, Store, BookOpen, Flag, Presentation, CalendarCog, Briefcase } from '@lucide/svelte';
	import AppShell, { type NavItem } from '$lib/components/layout/AppShell.svelte';

	let { data, children } = $props();
	const nav: NavItem[] = [
		{ href: '/admin', label: 'Overview', icon: LayoutDashboard, exact: true },
		{ href: '/admin/teams', label: 'Teams', icon: Users },
		{ href: '/admin/mentors', label: 'Mentors', icon: UserCog },
		{ href: '/admin/challenges', label: 'Challenge Marketplace', icon: Store },
		{ href: '/admin/curriculum', label: 'Curriculum', icon: BookOpen },
		{ href: '/admin/milestones', label: 'Milestones', icon: Flag },
		{ href: '/admin/career', label: 'Career Center', icon: Briefcase },
		{ href: '/admin/demo-day', label: 'Demo Day', icon: Presentation },
		{ href: '/admin/semester', label: 'Semester Settings', icon: CalendarCog }
	];
</script>

<AppShell {nav} workspaceName="Academics Committee" workspaceSub={data.semesterName} roleLabel="Admin">
	{@render children()}
</AppShell>
