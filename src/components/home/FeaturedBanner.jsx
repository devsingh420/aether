import { useState, useEffect } from 'react';
import { T } from '../../data/constants';

const BANNERS = [
  {
    id: 1,
    title: 'Farm Fresh, Delivered Fast',
    subtitle: 'Premium Thai produce from verified local farms',
    bg: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)',
    image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800&q=80',
  },
  {
    id: 2,
    title: 'Seasonal Mangoes',
    subtitle: 'Nam Dok Mai at peak sweetness',
    bg: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&q=80',
  },
];

export function FeaturedBanner({ onAction }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % BANNERS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const banner = BANNERS[current];

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: 20,
        overflow: 'hidden',
        marginBottom: 32,
        height: 160,
        background: banner.bg,
      }}
    >
      {/* Background image */}
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: 0,
          bottom: 0,
          width: '50%',
          backgroundImage: `url(${banner.image})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.25,
          maskImage: 'linear-gradient(to right, transparent, black)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black)',
        }}
      />

      <div
        style={{
          position: 'relative',
          padding: 24,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#fff' }}>
          {banner.title}
        </h2>
        <p style={{ margin: '8px 0 0', fontSize: 14, color: 'rgba(255,255,255,0.85)' }}>
          {banner.subtitle}
        </p>
      </div>

      {/* Dots */}
      <div style={{ position: 'absolute', bottom: 12, right: 16, display: 'flex', gap: 6 }}>
        {BANNERS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            style={{
              width: 6,
              height: 6,
              borderRadius: '50%',
              border: 'none',
              background: idx === current ? '#fff' : 'rgba(255,255,255,0.4)',
              cursor: 'pointer',
            }}
          />
        ))}
      </div>
    </div>
  );
}
