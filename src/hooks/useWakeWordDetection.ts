
import { useState, useCallback, useRef } from 'react';

export const useWakeWordDetection = () => {
  const [isWakeWordDetected, setIsWakeWordDetected] = useState(false);
  const [isDetectionActive, setIsDetectionActive] = useState(false);
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);

  const startWakeWordDetection = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      console.log('Wake word detection started');
      setIsDetectionActive(true);
      isListeningRef.current = true;
    };

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('')
        .toLowerCase();

      console.log('Wake word detection transcript:', transcript);

      // Check for wake word variations
      if (transcript.includes('hey literal') || 
          transcript.includes('hello literal') || 
          transcript.includes('literal')) {
        console.log('Wake word detected!');
        setIsWakeWordDetected(true);
        recognition.stop();
        
        // Reset after a short delay to prevent immediate re-triggering
        setTimeout(() => {
          setIsWakeWordDetected(false);
          if (isListeningRef.current) {
            recognition.start();
          }
        }, 3000);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Wake word detection error:', event.error);
      if (event.error === 'not-allowed') {
        console.error('Microphone access denied');
        setIsDetectionActive(false);
        return;
      }
      
      // Restart on most errors
      setTimeout(() => {
        if (isListeningRef.current) {
          recognition.start();
        }
      }, 1000);
    };

    recognition.onend = () => {
      console.log('Wake word detection ended');
      if (isListeningRef.current) {
        // Restart detection if it should be active
        setTimeout(() => {
          if (isListeningRef.current) {
            recognition.start();
          }
        }, 100);
      }
    };

    recognitionRef.current = recognition;
    
    try {
      recognition.start();
    } catch (error) {
      console.error('Error starting wake word detection:', error);
    }
  }, []);

  const stopWakeWordDetection = useCallback(() => {
    console.log('Stopping wake word detection');
    isListeningRef.current = false;
    setIsDetectionActive(false);
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  }, []);

  return {
    isWakeWordDetected,
    isDetectionActive,
    startWakeWordDetection,
    stopWakeWordDetection
  };
};
