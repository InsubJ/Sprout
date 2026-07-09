import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sprout - Gamified Habit Tracker & Shared Forests',
  description: 'Water your virtual plants by completing real-life habits. Grow beautiful forests together with friends!',
};

import { AppProviders } from '../components/common/AppProviders';
import { Navigation } from '../components/common/Navigation';

import Footer from '../components/common/Footer';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AppProviders>
          <Navigation />
          <main className="layout-main">{children}</main>
          <Footer />
        </AppProviders>
      </body>
    </html>
  );
}