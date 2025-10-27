import React from 'react';
import { useAuth } from '../../auth/AuthContext';
import { ExactHeader } from '@santonastaso/shared';

export function Header() {
  const { user, signOut } = useAuth();

  const navigationItems = [
    { label: 'Dashboard', to: '/', isActive: true },
    { label: 'Schedule', to: '/schedule' },
    { label: 'Phases', to: '/phases' },
    { label: 'Machines', to: '/machines' },
    { label: 'Backlog', to: '/backlog' },
  ];

  return (
    <ExactHeader
      title="Scheduler Demo"
      navigationItems={navigationItems}
      user={{
        name: user?.email?.split('@')[0] || 'User',
        email: user?.email,
        avatar: user?.avatar_url
      }}
      onLogout={() => signOut()}
      onRefresh={() => window.location.reload()}
    />
  );
}
