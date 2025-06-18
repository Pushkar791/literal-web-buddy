import React from 'react';

interface AuroraOrbProps {
  isActive: boolean;
  onClick: () => void;
}

const AuroraOrb: React.FC<AuroraOrbProps> = ({ isActive, onClick }) => {
  return (
    <div 
      className={`w-64 h-64 rounded-full cursor-pointer relative flex items-center justify-center ${
        isActive ? 'animate-pulse' : ''
      }`}
      onClick={onClick}
    >
      {/* Main orb */}
      <div className="absolute inset-0 rounded-full bg-gradient-radial from-purple-600/30 via-blue-500/20 to-transparent animate-pulse"></div>
      
      {/* Inner orbs */}
      <div className="w-56 h-56 rounded-full bg-gradient-radial from-purple-500/40 via-blue-600/20 to-transparent absolute"></div>
      <div className="w-48 h-48 rounded-full bg-gradient-radial from-blue-500/50 via-purple-600/30 to-transparent absolute animate-pulse"></div>
      <div className="w-40 h-40 rounded-full bg-gradient-radial from-indigo-500/60 via-purple-500/40 to-transparent absolute"></div>
      
      {/* Core */}
      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-500 absolute 
        shadow-[0_0_30px_15px_rgba(138,43,226,0.4)] animate-pulse"></div>
      
      {/* Particles */}
      <div className="absolute w-full h-full">
        {Array.from({ length: 20 }).map((_, i) => (
          <div 
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.7 + 0.3,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${Math.random() * 3 + 2}s`
            }}
          ></div>
        ))}
      </div>
      
      {/* Light beams */}
      <div className={`absolute w-full h-full ${isActive ? 'opacity-70' : 'opacity-40'}`}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-4 bg-purple-500/20 rounded-full blur-md rotate-45"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-4 bg-blue-500/20 rounded-full blur-md -rotate-45"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-72 bg-indigo-500/20 rounded-full blur-md rotate-45"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-72 bg-purple-500/20 rounded-full blur-md -rotate-45"></div>
      </div>
      
      {/* Active state ring */}
      {isActive && (
        <div className="absolute -inset-4 rounded-full border-2 border-purple-500/30 animate-ping"></div>
      )}
    </div>
  );
};

export default AuroraOrb;
