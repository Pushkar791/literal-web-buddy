import { useState, useCallback, useRef, useEffect } from 'react';

export const useWakeWordDetection = () => {
  const [isWakeWordDetected, setIsWakeWordDetected] = useState(false);
  const [isDetectionActive, setIsDetectionActive] = useState(false);
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const restartTimeoutRef = useRef<number | null>(null);
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

      // Check for wake word variations with more flexible matching
      const wakeWords = [
        'hey literal', 'hello literal', 'hi literal', 'literal', 
        'hey little', 'hello little', 'hey little girl',
        'ok literal', 'yo literal', 'listen literal', 'wake up literal',
        'hey buddy', 'hey assistant', 'hey there literal', 'hey web buddy',
        'hey litter', 'hey litter all', 'a literal', 'hey little all'
      ];
      
      const hasWakeWord = wakeWords.some(word => {
        // Use fuzzy matching to account for speech recognition errors
        return transcript.includes(word) || 
               // Allow for slight variations
               transcript.replace(/\s+/g, '').includes(word.replace(/\s+/g, '')) ||
               // Check for substrings
               (word.includes('literal') && transcript.includes('literal')) ||
               // Check for common speech recognition errors with "literal"
               (word.includes('literal') && 
                (transcript.includes('little') || 
                 transcript.includes('litter') || 
                 transcript.includes('litral') || 
                 transcript.includes('litterol'))) ||
               // More flexible matching for "hey" variations
               (word.includes('hey') && 
                transcript.match(/\b(hey|hay|hi|ok|okay)\b/i) && 
                (transcript.includes('lit') || transcript.includes('little')));
      });
      
      if (hasWakeWord) {
        console.log('Wake word detected in transcript:', transcript);
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
        restartTimeoutRef.current = window.setTimeout(() => {
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
        restartTimeoutRef.current = window.setTimeout(() => {
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

  // Initialize listening state
  useEffect(() => {
    // Start by default but allow browser to load first
    const timer = setTimeout(() => {
      isListeningRef.current = true;
      startWakeWordDetection();
    }, 1000);
    
    return () => {
      clearTimeout(timer);
      stopWakeWordDetection();
    };
  }, [startWakeWordDetection, stopWakeWordDetection]);

  return {
    isWakeWordDetected,
    isDetectionActive,
    startWakeWordDetection,
    stopWakeWordDetection
  };
};
