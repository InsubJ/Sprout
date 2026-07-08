import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sprout - Gamified Habit Tracker & Shared Forests',
  description: 'Water your virtual plants by completing real-life habits. Grow beautiful forests together with friends!',
};

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
        <header style={{
          borderBottom: '1px solid rgba(27, 59, 43, 0.1)',
          backdropFilter: 'blur(10px)',
          background: 'rgba(250, 247, 242, 0.8)',
          position: 'sticky', top: 0, zIndex: 100,
          padding: '1rem 2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🌱</span>
            <strong style={{ fontSize: '1.25rem', color: 'var(--color-evergreen)', fontWeight: 700 }}>Sprout</strong>
          </div>
          <nav>
            <ul style={{ display: 'flex', listStyle: 'none', gap: '1.5rem', fontWeight: 500 }}>
              <li><a href="#" style={{ color: 'var(--color-evergreen)', textDecoration: 'none' }}>Forest</a></li>
              <li><a href="#" style={{ color: 'var(--color-evergreen)', textDecoration: 'none' }}>Habits</a></li>
              <li><a href="#" style={{ color: 'var(--color-evergreen)', textDecoration: 'none' }}>Friends</a></li>
            </ul>
          </nav>
        </header>
        
        <main>{children}</main>

        <footer style={{
          background: 'var(--color-evergreen)',
          color: 'var(--color-sand)',
          padding: '2rem',
          textAlign: 'center',
          fontSize: '0.875rem'
        }}>
          <p>&copy; {new Date().getFullYear()} Sprout. All rights reserved. Cultivate consistency, grow together.</p>
        </footer>
      </body>
    </html>
  );
}