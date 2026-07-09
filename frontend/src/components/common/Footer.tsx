'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  const isProfilePage = pathname === '/profile';

  return (
    <footer className={`layout-footer ${isProfilePage ? 'show-on-mobile' : 'hide-on-mobile'}`}>
      <p>&copy; {new Date().getFullYear()} Sprout. All rights reserved. Cultivate consistency, grow together.</p>
    </footer>
  );
}
