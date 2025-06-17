
import React, { useEffect, useState } from 'react';

interface WaveformVisualizerProps {
  isActive: boolean;
}

const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({ isActive }) => {
  const [bars, setBars] = useState<number[]>(Array(20).fill(0));

  useEffect(() => {
    if (!isActive) {
      setBars(Array(20).fill(0));
      return;
    }

    const interval = setInterval(() => {
      setBars(prev => prev.map(() => Math.random() * 100));
    }, 100);

    return () => clearInterval(interval);
  }, [isActive]);

  return (
    <div className="flex items-end justify-center space-x-1 h-16">
      {bars.map((height, index) => (
        <div
          key={index}
          className="bg-gradient-to-t from-blue-500 to-purple-500 w-2 rounded-full transition-all duration-100 ease-out"
          style={{
            height: isActive ? `${Math.max(height, 10)}%` : '4px',
            opacity: isActive ? 0.8 : 0.3
          }}
        />
      ))}
    </div>
  );
};

export default WaveformVisualizer;
