
import { useState, useCallback, useRef } from 'react';

export const useWakeWordDetection = () => {
  const [isWakeWordDetected, setIsWakeWordDetected] = useState(false);
  const [isDetectionActive, setIsDetectionActive] = useState(false);
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isStartingRef = useRef(false);

  const cleanup = useCallback(() => {
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }
  }, []);

  const startWakeWordDetection = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    // Prevent multiple simultaneous starts
    if (isStartingRef.current) {
      console.log('Wake word detection already starting, skipping');
      return;
    }

    // Check if recognition is already active
    if (recognitionRef.current && isListeningRef.current) {
      console.log('Wake word detection already active, skipping');
      return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported');
      return;
    }

    isStartingRef.current = true;

    // Cleanup any existing recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (error) {
        console.log('Error aborting existing recognition:', error);
      }
      recognitionRef.current = null;
    }
    cleanup();

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      console.log('Wake word detection started');
      setIsDetectionActive(true);
      isListeningRef.current = true;
      isStartingRef.current = false;
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
        
        // Stop current recognition
        isListeningRef.current = false;
        try {
          recognition.stop();
        } catch (error) {
          console.log('Error stopping recognition:', error);
        }
        
        // Reset after a delay to prevent immediate re-triggering
        setTimeout(() => {
          setIsWakeWordDetected(false);
          // Only restart if we should still be listening
          if (isListeningRef.current) {
            startWakeWordDetection();
          }
        }, 3000);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Wake word detection error:', event.error);
      isStartingRef.current = false;
      
      if (event.error === 'not-allowed') {
        console.error('Microphone access denied');
        setIsDetectionActive(false);
        isListeningRef.current = false;
        return;
      }
      
      // Only restart on recoverable errors and if we should be listening
      if (isListeningRef.current && event.error !== 'aborted') {
        restartTimeoutRef.current = setTimeout(() => {
          if (isListeningRef.current && !isStartingRef.current) {
            startWakeWordDetection();
          }
        }, 1000);
      }
    };

    recognition.onend = () => {
      console.log('Wake word detection ended');
      setIsDetectionActive(false);
      isStartingRef.current = false;
      
      // Only restart if we should still be listening and there's no pending restart
      if (isListeningRef.current && !restartTimeoutRef.current && !isStartingRef.current) {
        restartTimeoutRef.current = setTimeout(() => {
          if (isListeningRef.current && !isStartingRef.current) {
            startWakeWordDetection();
          }
        }, 100);
      }
    };

    recognitionRef.current = recognition;
    
    try {
      recognition.start();
    } catch (error) {
      console.error('Error starting wake word detection:', error);
      setIsDetectionActive(false);
      isStartingRef.current = false;
    }
  }, [cleanup]);

  const stopWakeWordDetection = useCallback(() => {
    console.log('Stopping wake word detection');
    isListeningRef.current = false;
    isStartingRef.current = false;
    setIsDetectionActive(false);
    cleanup();
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (error) {
        console.log('Error stopping recognition:', error);
      }
      recognitionRef.current = null;
    }
  }, [cleanup]);

  return {
    isWakeWordDetected,
    isDetectionActive,
    startWakeWordDetection,
    stopWakeWordDetection
  };
};
