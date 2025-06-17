
import { useState, useEffect, useRef, useCallback } from 'react';

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const useVoiceRecognition = () => {
  const [transcript, setTranscript] = useState('');
  const [isRecognitionActive, setIsRecognitionActive] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const recognitionRef = useRef<any>(null);
  const isActiveRef = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        setIsSupported(true);
        
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        recognition.onstart = () => {
          console.log('Voice recognition started');
          setIsRecognitionActive(true);
          isActiveRef.current = true;
        };
        
        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const currentTranscript = event.results[0][0].transcript;
          console.log('Voice recognition result:', currentTranscript);
          setTranscript(currentTranscript);
        };
        
        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          console.error('Voice recognition error:', event.error);
          setIsRecognitionActive(false);
          isActiveRef.current = false;
        };
        
        recognition.onend = () => {
          console.log('Voice recognition ended');
          setIsRecognitionActive(false);
          isActiveRef.current = false;
        };
        
        recognitionRef.current = recognition;
      }
    }
  }, []);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isActiveRef.current) {
      setTranscript('');
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Error starting voice recognition:', error);
        setIsRecognitionActive(false);
      }
    } else if (isActiveRef.current) {
      console.log('Recognition already active, skipping start');
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isActiveRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.log('Error stopping recognition:', error);
      }
    }
  }, []);

  return {
    transcript,
    isRecognitionActive,
    isSupported,
    startListening,
    stopListening
  };
};
