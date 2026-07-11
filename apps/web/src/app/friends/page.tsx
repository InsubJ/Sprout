'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/common/AppProviders';
import { FriendsManager } from '../../components/social/FriendsManager';

export default function FriendsPage() {
  const { currentUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!currentUser) {
      router.push('/');
    }
  }, [currentUser, router]);

  if (!currentUser) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '60vh',
        fontFamily: 'var(--font-outfit), sans-serif',
        color: 'var(--color-evergreen)'
      }}>
        Redirecting...
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '2rem 1rem',
      fontFamily: 'var(--font-outfit), sans-serif'
    }}>
      <h1 style={{
        fontSize: '2rem',
        fontWeight: 700,
        color: 'var(--color-evergreen)',
        marginBottom: '1.5rem',
        textAlign: 'center'
      }}>
        {currentUser.display_name || currentUser.username}&apos;s Buds
      </h1>
      <FriendsManager userId={currentUser.id} />
    </div>
  );
}
