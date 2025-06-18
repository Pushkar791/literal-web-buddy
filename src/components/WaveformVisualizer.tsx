import React, { useEffect, useState } from 'react';

interface WaveformVisualizerProps {
  isActive: boolean;
}

const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({ isActive }) => {
  const [bars, setBars] = useState<number[]>(Array(25).fill(0));

  useEffect(() => {
    if (!isActive) {
      setBars(Array(25).fill(0));
      return;
    }

    const interval = setInterval(() => {
      setBars(prev => 
        prev.map((_, i) => {
          // Create a more natural wave pattern
          const baseHeight = 30 + Math.random() * 40;
          const position = i / prev.length;
          const wave = Math.sin(position * Math.PI * 2 + Date.now() / 300) * 20;
          return Math.max(10, baseHeight + wave);
        })
      );
    }, 50);

    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div className="flex items-end justify-center space-x-[2px] h-16 py-2">
      {bars.map((height, index) => (
        <div
          key={index}
          className="bg-gradient-to-t from-purple-500 via-blue-400 to-purple-300 w-1 rounded-full transition-all duration-75 ease-out"
          style={{
            height: isActive ? `${height}%` : '4px',
            opacity: isActive ? 0.8 : 0.3,
            transform: `scaleY(${isActive ? 1 : 0.5})`,
            transition: 'height 0.1s ease-in-out, opacity 0.2s ease'
          }}
        />
      ))}
    </div>
  );
};

export default WaveformVisualizer;
