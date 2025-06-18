import React, { useState, useEffect, useMemo } from 'react';
import { Volume2, Globe } from 'lucide-react';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useWakeWordDetection } from '../hooks/useWakeWordDetection';
import { processCommand, voiceOptions, currentVoice } from '../utils/commandProcessor';
import WaveformVisualizer from './WaveformVisualizer';
import AuroraOrb from './AuroraOrb';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';

// Component for creating stars
const StarryBackground = () => {
  const stars = useMemo(() => {
    return Array.from({ length: 100 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 2 + 1,
      animationDelay: `${Math.random() * 5}s`,
      animationDuration: `${Math.random() * 3 + 3}s`,
    }));
  }, []);

  return (
    <div className="starry-bg">
      {stars.map(star => (
        <div
          key={star.id}
          className="star"
          style={{
            left: star.left,
            top: star.top,
            width: `${star.size}px`,
            height: `${star.size}px`,
            animationDelay: star.animationDelay,
            animationDuration: star.animationDuration,
          }}
        />
      ))}
    </div>
  );
};

const VoiceAssistant = () => {
  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [assistantState, setAssistantState] = useState<'idle' | 'listening' | 'processing' | 'responding'>('idle');
  const [wakeWordEnabled, setWakeWordEnabled] = useState(true);
  const [selectedVoice, setSelectedVoice] = useState(currentVoice.name);

  const { startListening, stopListening, transcript, isRecognitionActive } = useVoiceRecognition();
  const { speak, isSpeaking } = useSpeechSynthesis();
  const { isWakeWordDetected, startWakeWordDetection, stopWakeWordDetection, isDetectionActive } = useWakeWordDetection();

  // Initialize wake word detection on component mount
  useEffect(() => {
    startWakeWordDetection();
  }, [startWakeWordDetection]);

  // Initial greeting
  useEffect(() => {
    const timer = setTimeout(() => {
      speak("Hello Pushkar! I'm Literal, your voice assistant. How can I help you today?");
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [speak]);

  // Handle wake word detection
  useEffect(() => {
    if (isWakeWordDetected && !isActive) {
      console.log('Wake word detected!');
      setIsActive(true);
      setAssistantState('responding');
      speak("Yes Pushkar, I'm listening.", () => {
        setAssistantState('listening');
        startListening();
      });
    }
  }, [isWakeWordDetected, isActive, speak, startListening]);

  // Handle voice commands
  useEffect(() => {
    if (transcript && isActive && assistantState === 'listening') {
      console.log('Processing command:', transcript);
      setAssistantState('processing');
      setCurrentMessage(transcript);
      
      setTimeout(() => {
        try {
          const response = processCommand(transcript);
          console.log('Command response:', response);
          setAssistantState('responding');
          speak(response.message, () => {
            if (response.action) {
              try {
                response.action();
              } catch (error) {
                console.error('Error executing action:', error);
              }
            }
            setAssistantState('idle');
            setIsActive(false);
            setCurrentMessage('');
          });
        } catch (error) {
          console.error('Error processing command:', error);
          setAssistantState('responding');
          speak("Sorry, I couldn't process that command.", () => {
            setAssistantState('idle');
            setIsActive(false);
            setCurrentMessage('');
          });
        }
      }, 500);
    }
  }, [transcript, isActive, assistantState, speak]);

  // Update listening state
  useEffect(() => {
    setIsListening(isRecognitionActive);
  }, [isRecognitionActive]);

  const handleManualActivation = () => {
    if (!isActive) {
      setIsActive(true);
      setAssistantState('responding');
      speak("Yes Pushkar, I'm listening.", () => {
        setAssistantState('listening');
        startListening();
      });
    } else {
      setIsActive(false);
      setAssistantState('idle');
      stopListening();
    }
  };

  const toggleWakeWordDetection = () => {
    if (isDetectionActive) {
      stopWakeWordDetection();
      setWakeWordEnabled(false);
    } else {
      startWakeWordDetection();
      setWakeWordEnabled(true);
    }
  };

  const handleVoiceChange = (voiceName: string) => {
    setSelectedVoice(voiceName);
    const response = processCommand(`change voice to ${voiceName}`);
    speak(response.message);
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Starry background */}
      <StarryBackground />
      
      {/* Background gradient effects */}
      <div className="absolute inset-0 bg-gradient-radial from-purple-900/20 via-black to-black z-0"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-3xl z-0"></div>
      <div className="absolute top-1/3 left-1/3 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-3xl z-0"></div>
      
      {/* Aurora glow effect */}
      <div className="aurora-glow"></div>
      
      <div className="max-w-md w-full space-y-8 z-10 relative">
        {/* Main Assistant Interface */}
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500 mb-2">Literal</h1>
          <p className="text-gray-300 text-sm">Your Personal Voice Assistant</p>

          {/* Central Aurora Orb */}
          <div className="relative flex items-center justify-center my-8">
            <div className="w-72 h-72 flex items-center justify-center">
              <AuroraOrb 
                isActive={isActive}
                onClick={handleManualActivation}
              />
              
              {/* Ripple effect for active state */}
              {isActive && (
                <div className="absolute inset-0 rounded-full bg-blue-400 opacity-10 animate-ping"></div>
              )}
            </div>
          </div>

          {/* Waveform Visualizer */}
          <div className="h-20 flex items-center justify-center">
            <WaveformVisualizer isActive={isListening} />
          </div>

          {/* Status Display */}
          <div className="space-y-3">
            <div className={`text-lg font-medium transition-colors duration-300 ${
              assistantState === 'idle' ? 'text-gray-400' :
              assistantState === 'listening' ? 'text-blue-400' :
              assistantState === 'processing' ? 'text-yellow-400' :
              'text-green-400'
            }`}>
              {assistantState === 'idle' && 'Ready to help'}
              {assistantState === 'listening' && 'Listening...'}
              {assistantState === 'processing' && 'Processing command...'}
              {assistantState === 'responding' && 'Responding...'}
            </div>

            {currentMessage && (
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border border-gray-700">
                <p className="text-white text-sm">{currentMessage}</p>
              </div>
            )}
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-center space-x-4 mt-8">
            {/* Wake Word Detection Toggle */}
            <Button
              onClick={toggleWakeWordDetection}
              variant={isDetectionActive ? "default" : "outline"}
              className="flex items-center space-x-2"
            >
              <Volume2 className="w-4 h-4" />
              <span>{isDetectionActive ? 'Wake Word: ON' : 'Wake Word: OFF'}</span>
            </Button>
            
            {/* Voice Accent Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center space-x-2">
                  <Globe className="w-4 h-4" />
                  <span>Accent: {selectedVoice}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {voiceOptions.map((voice) => (
                  <DropdownMenuItem 
                    key={voice.name}
                    onClick={() => handleVoiceChange(voice.name)}
                    className={voice.name === selectedVoice ? "bg-purple-900/30" : ""}
                  >
                    {voice.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Instructions */}
          <div className="text-center space-y-2 text-gray-400 text-sm mt-6">
            <p>Say "Hey Literal", "Hello Literal", or "OK Literal" to activate</p>
            <p>Try: "What is fitness?", "Play music on Spotify", "Open YouTube"</p>
            <p className="text-xs mt-2">You can also say "Change voice to British" or ask "Who chose your name?"</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;
