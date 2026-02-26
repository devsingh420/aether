import { useState, useEffect } from 'react';
import { T } from '../../data/constants';
import { Button } from '../ui/Button';

const BANNERS = [
  {
    id: 1,
    title: 'Fresh From Farm to Table',
    subtitle: 'Get 15% off on your first wholesale order',
    cta: 'Shop Now',
    bg: 'linear-gradient(135deg, #2D5A27 0%, #4A7C43 100%)',
    image: 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=800',
  },
  {
    id: 2,
    title: 'Flash Sale: Premium Fruits',
    subtitle: 'Up to 30% off on Grade A produce',
    cta: 'View Deals',
    bg: 'linear-gradient(135deg, #E85D04 0%, #F48C06 100%)',
    image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=800',
  },
  {
    id: 3,
    title: 'Support Local Farmers',
    subtitle: 'Direct from verified Thai farms',
    cta: 'Explore Farms',
    bg: 'linear-gradient(135deg, #1B4332 0%, #2D6A4F 100%)',
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800',
  },
];

export function FeaturedBanner({ onAction }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % BANNERS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const banner = BANNERS[current];

  return (
    <div
      style={{
        position: 'relative',
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 24,
        height: 180,
        background: banner.bg,
        transition: 'background 0.5s ease',
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
          opacity: 0.3,
          maskImage: 'linear-gradient(to right, transparent, black)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black)',
        }}
      />

      {/* Content */}
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
        <h2
          style={{
            margin: 0,
            fontSize: 24,
            fontWeight: 700,
            color: '#fff',
            marginBottom: 8,
          }}
        >
          {banner.title}
        </h2>
        <p
          style={{
            margin: 0,
            fontSize: 14,
            color: 'rgba(255,255,255,0.9)',
            marginBottom: 16,
          }}
        >
          {banner.subtitle}
        </p>
        <div>
          <Button
            onClick={() => onAction?.(banner)}
            style={{
              background: '#fff',
              color: T.green,
              fontWeight: 600,
            }}
          >
            {banner.cta}
          </Button>
        </div>
      </div>

      {/* Dots */}
      <div
        style={{
          position: 'absolute',
          bottom: 12,
          right: 16,
          display: 'flex',
          gap: 6,
        }}
      >
        {BANNERS.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              border: 'none',
              background: idx === current ? '#fff' : 'rgba(255,255,255,0.4)',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          />
        ))}
      </div>
    </div>
  );
}
