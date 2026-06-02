import React, { useEffect, useRef, useState } from 'react';

export default function ScrollAnimate({ children }) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Mengambil entry pertama dari array entries tanpa destructuring di parameter
        const entry = entries[0];
        
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.unobserve(entry.target); // Animasi berjalan sekali saja
        }
      },
      { threshold: 0.1 } // Aktif saat 10% elemen masuk layar
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-300 ${
        isIntersecting ? 'animate-fade-in-up' : 'opacity-0 translate-y-[30px]'
      }`}
    >
      {children}
    </div>
  );
}