export type NavItem = {
  label: string;
  path: string;
  icon: string;
  exact?: boolean;
};

export const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: 'pi pi-home' },
  { label: 'Users', path: '/users', icon: 'pi pi-users' },
  { label: 'Content', path: '/content', icon: 'pi pi-file' },
  { label: 'Tags', path: '/tags', icon: 'pi pi-tags' },
  { label: 'Configuration', path: '/configuration', icon: 'pi pi-cog' },
];
