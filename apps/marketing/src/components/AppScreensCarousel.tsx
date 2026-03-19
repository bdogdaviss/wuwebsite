'use client'

import { Carousel } from 'antd'

const slides = [
  { src: '/screenshots/screen1.png', alt: 'Focus Sessions' },
  { src: '/screenshots/screen2.png', alt: 'Block Distractions' },
  { src: '/screenshots/screen3.png', alt: 'Progress Tracking' },
  { src: '/screenshots/screen4.png', alt: 'Smart Routines' },
]

const slideStyle: React.CSSProperties = {
  height: 400,
  background: '#111827',
  borderRadius: 12,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#9ca3af',
  fontSize: 18,
  overflow: 'hidden',
}

export function AppScreensCarousel() {
  return (
    <div style={{ maxWidth: 900, margin: '0 auto', position: 'relative', zIndex: 2 }}>
      <Carousel arrows infinite={false} autoplay autoplaySpeed={4000}>
        {slides.map((slide) => (
          <div key={slide.alt}>
            <div style={slideStyle}>
              <img
                src={slide.src}
                alt={slide.alt}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
                onError={(e) => {
                  const target = e.currentTarget
                  target.style.display = 'none'
                  if (target.parentElement) {
                    target.parentElement.innerHTML = `<span style="color:#6b7280">${slide.alt} — Add screenshot at ${slide.src}</span>`
                  }
                }}
              />
            </div>
          </div>
        ))}
      </Carousel>
    </div>
  )
}
