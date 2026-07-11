import React from 'react';
import type { DiscoPlantState } from '../../hooks/useDiscoPlant';
import styles from './DiscoPlant.module.css';

interface DiscoPlantProps {
  state: DiscoPlantState;
}

export function DiscoPlant({ state }: DiscoPlantProps) {
  const isDancing = state === 'dancing';
  const isWithered = state === 'withered';

  return (
    <div className={`${styles.wrapper} ${isDancing ? styles.dancing : ''} ${isWithered ? styles.withered : ''}`}>
      <svg
        viewBox="0 0 120 160"
        width="120"
        height="160"
        xmlns="http://www.w3.org/2000/svg"
        aria-label={`Disco plant — ${state}`}
      >
        {/* Light rays (only in dancing mode) */}
        {isDancing && (
          <g className={styles.rays}>
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
              <line
                key={angle}
                x1="60" y1="55"
                x2={60 + 45 * Math.cos((angle * Math.PI) / 180)}
                y2={55 + 45 * Math.sin((angle * Math.PI) / 180)}
                stroke={['#ff6b9d', '#ffd93d', '#6bcb77', '#4d96ff', '#c77dff'][Math.floor(angle / 72) % 5]}
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.85"
              />
            ))}
          </g>
        )}

        {/* Disco ball body */}
        <circle cx="60" cy="55" r="32"
          fill={isWithered ? '#9e9e9e' : 'url(#discoGrad)'}
          stroke={isWithered ? '#757575' : '#b388ff'}
          strokeWidth="2"
          filter={isDancing ? 'url(#glow)' : undefined}
        />

        {/* Disco mirror tiles */}
        {!isWithered && [
          { x: 50, y: 40 }, { x: 62, y: 40 }, { x: 44, y: 52 }, { x: 56, y: 52 }, { x: 68, y: 52 },
          { x: 50, y: 64 }, { x: 62, y: 64 }, { x: 56, y: 76 },
        ].map((tile, i) => (
          <rect
            key={i}
            x={tile.x - 4} y={tile.y - 4} width="8" height="8"
            rx="1"
            fill={isDancing
              ? ['#ffffff', '#ff6b9d', '#ffd93d', '#6bcb77', '#4d96ff', '#c77dff', '#ff9f43', '#fff'][i % 8]
              : '#ececec'}
            opacity={isDancing ? 0.95 : 0.6}
            className={isDancing ? styles.tile : ''}
          />
        ))}

        {/* Sunglasses */}
        <rect x="37" y="46" width="16" height="10" rx="5"
          fill={isWithered ? '#757575' : '#1a1a2e'} />
        <rect x="57" y="46" width="16" height="10" rx="5"
          fill={isWithered ? '#757575' : '#1a1a2e'} />
        <line x1="53" y1="51" x2="57" y2="51"
          stroke={isWithered ? '#888' : '#555'} strokeWidth="2" />
        {/* Shiny lens glints */}
        {!isWithered && <>
          <circle cx="42" cy="49" r="2" fill="white" opacity="0.7" />
          <circle cx="62" cy="49" r="2" fill="white" opacity="0.7" />
        </>}

        {/* Mouth */}
        {isWithered ? (
          <path d="M48 70 Q60 65 72 70" stroke="#333" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        ) : (
          <path d="M48 68 Q60 76 72 68" stroke="#000" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        )}

        {/* Ball string / stem */}
        <line x1="60" y1="23" x2="60" y2="10"
          stroke={isWithered ? '#aaa' : '#7e57c2'} strokeWidth="2.5" strokeLinecap="round" />

        {/* Pot */}
        <path d="M40 115 L44 95 L76 95 L80 115 Z"
          fill={isWithered ? '#8d6e63' : 'url(#potGrad)'} rx="4" />
        <rect x="38" y="110" width="44" height="8" rx="4"
          fill={isWithered ? '#795548' : '#7e57c2'} />

        {/* Soil */}
        <ellipse cx="60" cy="95" rx="18" ry="5"
          fill={isWithered ? '#6d4c41' : '#4a2e1a'} />

        {/* Decorative stars (dancing only) */}
        {isDancing && (
          <>
            <text x="15" y="30" fontSize="14" className={styles.star}>⭐</text>
            <text x="88" y="25" fontSize="12" className={styles.star2}>✨</text>
            <text x="8" y="80" fontSize="10" className={styles.star3}>💫</text>
          </>
        )}

        {/* Sad droplet (withered) */}
        {isWithered && (
          <text x="54" y="148" fontSize="14">😢</text>
        )}

        <defs>
          <radialGradient id="discoGrad" cx="40%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#e1bee7" />
            <stop offset="100%" stopColor="#7b1fa2" />
          </radialGradient>
          <linearGradient id="potGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#9c27b0" />
            <stop offset="100%" stopColor="#5c35a8" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>
    </div>
  );
}
