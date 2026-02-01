export type NavItem = {
  label: string;
  path: string;
  icon: string;
  exact?: boolean;
};

export const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: 'pi pi-home' },
  { label: 'Users', path: '/users', icon: 'pi pi-users' },
  { label: 'Roles', path: '/roles', icon: 'pi pi-shield' },
  { label: 'Courses', path: '/courses', icon: 'pi pi-book' },
  { label: 'Content', path: '/content', icon: 'pi pi-file' },
  { label: 'Moderation', path: '/moderation', icon: 'pi pi-briefcase' },
  { label: 'Categories', path: '/categories', icon: 'pi pi-tags' },
  { label: 'Configuration', path: '/configuration', icon: 'pi pi-cog' },
  { label: 'Audit Logs', path: '/audit', icon: 'pi pi-list' },
  {
    label: 'Errors & Support',
    path: '/errors',
    icon: 'pi pi-exclamation-circle',
  },
];
