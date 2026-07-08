import React from 'react';

export default function HomePage() {
  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '4rem 2rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '3rem'
    }}>
      <section style={{
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1.5rem',
        maxWidth: '800px'
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.5rem 1rem',
          borderRadius: '50px',
          background: 'var(--color-sage)',
          border: '1px solid rgba(45, 90, 39, 0.2)',
          fontSize: '0.875rem',
          color: 'var(--color-forest-green)',
          fontWeight: 600
        }}>
          <span>🌱</span> Welcome to the next level of habit tracking
        </div>
        <h1 style={{
          fontSize: '3.5rem',
          fontWeight: 700,
          color: 'var(--color-evergreen)',
          lineHeight: 1.15,
          letterSpacing: '-0.02em'
        }}>
          Grow Healthy Habits, <br />
          <span style={{
            backgroundImage: 'linear-gradient(135deg, var(--color-forest-green), var(--color-pink))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            One Drop at a Time
          </span>
        </h1>
        <p style={{
          fontSize: '1.25rem',
          color: 'var(--color-evergreen)',
          opacity: 0.8,
          lineHeight: 1.6,
          maxWidth: '600px'
        }}>
          Every habit you keep waters a virtual plant in your personal forest. 
          Connect with friends, nudge each other, and see your collective resilience bloom.
        </p>
      </section>

      <section style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        width: '100%'
      }}>
        <div style={{
          padding: '2rem',
          borderRadius: '16px',
          background: 'rgba(255, 255, 255, 0.4)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.6)',
          boxShadow: '0 8px 32px 0 rgba(27, 59, 43, 0.05)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          cursor: 'pointer'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>💧</div>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--color-evergreen)', marginBottom: '0.5rem' }}>Consistency is Care</h2>
          <p style={{ color: 'var(--color-evergreen)', opacity: 0.8, fontSize: '0.95rem', lineHeight: 1.5 }}>
            Water your plants regularly. Miss too many days, and your plant will begin to wither, requiring a friend's helper droplet to revive.
          </p>
        </div>

        <div style={{
          padding: '2rem',
          borderRadius: '16px',
          background: 'rgba(255, 255, 255, 0.4)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.6)',
          boxShadow: '0 8px 32px 0 rgba(27, 59, 43, 0.05)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          cursor: 'pointer'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🌸</div>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--color-evergreen)', marginBottom: '0.5rem' }}>Botanical Tiers</h2>
          <p style={{ color: 'var(--color-evergreen)', opacity: 0.8, fontSize: '0.95rem', lineHeight: 1.5 }}>
            Nurture everything from Common Pothos to Mythical Ethereal Sakura. Your consistency shapes the symmetry, blooms, and story of your mature plants.
          </p>
        </div>

        <div style={{
          padding: '2rem',
          borderRadius: '16px',
          background: 'rgba(255, 255, 255, 0.4)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.6)',
          boxShadow: '0 8px 32px 0 rgba(27, 59, 43, 0.05)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          cursor: 'pointer'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>✨</div>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--color-evergreen)', marginBottom: '0.5rem' }}>Shared Monument Forests</h2>
          <p style={{ color: 'var(--color-evergreen)', opacity: 0.8, fontSize: '0.95rem', lineHeight: 1.5 }}>
            Harvest completed plants to write a nostalgic, AI-generated poetic journey summary. Showcase your trees in a shared canopy with friends.
          </p>
        </div>
      </section>
    </div>
  );
}