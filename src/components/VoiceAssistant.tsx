
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2 } from 'lucide-react';
import { useVoiceRecognition } from '../hooks/useVoiceRecognition';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import { useWakeWordDetection } from '../hooks/useWakeWordDetection';
import { processCommand } from '../utils/commandProcessor';
import WaveformVisualizer from './WaveformVisualizer';
import { Button } from '@/components/ui/button';

const VoiceAssistant = () => {
  const [isActive, setIsActive] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [currentMessage, setCurrentMessage] = useState('');
  const [assistantState, setAssistantState] = useState<'idle' | 'listening' | 'processing' | 'responding'>('idle');

  const { startListening, stopListening, transcript, isRecognitionActive } = useVoiceRecognition();
  const { speak, isSpeaking } = useSpeechSynthesis();
  const { isWakeWordDetected, startWakeWordDetection, stopWakeWordDetection } = useWakeWordDetection();

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
        const response = processCommand(transcript);
        setAssistantState('responding');
        speak(response.message, () => {
          if (response.action) {
            response.action();
          }
          setAssistantState('idle');
          setIsActive(false);
          setCurrentMessage('');
        });
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
      setAssistantState('listening');
      startListening();
    } else {
      setIsActive(false);
      setAssistantState('idle');
      stopListening();
    }
  };

  const toggleWakeWordDetection = () => {
    if (isWakeWordDetected) {
      stopWakeWordDetection();
    } else {
      startWakeWordDetection();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Main Assistant Interface */}
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-bold text-white mb-2">Literal</h1>
          <p className="text-gray-300 text-sm">Your Personal Voice Assistant</p>

          {/* Central Activation Button */}
          <div className="relative flex items-center justify-center">
            <div 
              className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer ${
                isActive 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 shadow-xl shadow-blue-500/25 animate-pulse' 
                  : 'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700'
              }`}
              onClick={handleManualActivation}
            >
              {isListening ? (
                <Mic className="w-12 h-12 text-white animate-pulse" />
              ) : (
                <MicOff className="w-12 h-12 text-white" />
              )}
            </div>
            
            {/* Ripple effect for active state */}
            {isActive && (
              <div className="absolute inset-0 rounded-full bg-blue-400 opacity-20 animate-ping"></div>
            )}
          </div>

          {/* Waveform Visualizer */}
          {isListening && (
            <div className="h-20 flex items-center justify-center">
              <WaveformVisualizer isActive={isListening} />
            </div>
          )}

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

          {/* Wake Word Detection Toggle */}
          <div className="flex items-center justify-center space-x-4">
            <Button
              onClick={toggleWakeWordDetection}
              variant={isWakeWordDetected ? "default" : "outline"}
              className="flex items-center space-x-2"
            >
              <Volume2 className="w-4 h-4" />
              <span>{isWakeWordDetected ? 'Wake Word: ON' : 'Wake Word: OFF'}</span>
            </Button>
          </div>

          {/* Instructions */}
          <div className="text-center space-y-2 text-gray-400 text-sm">
            <p>Say "Hey Literal" or click the microphone</p>
            <p>Try: "Open YouTube", "Launch Instagram", "Search Google"</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceAssistant;
