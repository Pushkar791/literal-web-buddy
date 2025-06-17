
import { useState, useCallback, useRef } from 'react';

export const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [detectedGender, setDetectedGender] = useState<'male' | 'female' | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check for browser support
  useState(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);
    }
  });

  const detectGender = useCallback((transcript: string) => {
    // Simple heuristic based on voice patterns and common speech characteristics
    // This is a basic implementation - in a real app you'd use more sophisticated audio analysis
    const femaleIndicators = [
      'please', 'thank you', 'sorry', 'excuse me', 'could you', 'would you',
      'lovely', 'wonderful', 'amazing', 'gorgeous', 'beautiful'
    ];
    
    const maleIndicators = [
      'hey', 'yo', 'dude', 'man', 'bro', 'cool', 'awesome', 'nice',
      'open', 'launch', 'start', 'go'
    ];

    const lowerTranscript = transcript.toLowerCase();
    
    let femaleScore = 0;
    let maleScore = 0;
    
    femaleIndicators.forEach(indicator => {
      if (lowerTranscript.includes(indicator)) femaleScore++;
    });
    
    maleIndicators.forEach(indicator => {
      if (lowerTranscript.includes(indicator)) maleScore++;
    });
    
    // Default to male if no clear indicators or if scores are equal
    const gender = femaleScore > maleScore ? 'female' : 'male';
    setDetectedGender(gender);
    return gender;
  }, []);

  const speak = useCallback((text: string, transcript?: string, onComplete?: () => void) => {
    if (!isSupported || !text) {
      console.warn('Speech synthesis not supported or no text provided');
      onComplete?.();
      return;
    }

    // Detect gender if transcript is provided
    let gender = detectedGender;
    if (transcript) {
      gender = detectGender(transcript);
    }

    // Replace name placeholder with detected gender name
    const userName = gender === 'female' ? 'Kashvi' : 'Pushkar';
    const personalizedText = text.replace(/\{userName\}/g, userName);

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(personalizedText);
    
    // Configure voice settings for UK English Male-like voice
    utterance.rate = 0.9;
    utterance.pitch = 0.8;
    utterance.volume = 0.8;
    
    // Try to find a suitable voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.lang.includes('en-GB') || 
      voice.lang.includes('en-US')
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      console.log('Speech synthesis started');
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      console.log('Speech synthesis ended');
      setIsSpeaking(false);
      onComplete?.();
    };

    utterance.onerror = (error) => {
      console.error('Speech synthesis error:', error);
      setIsSpeaking(false);
      onComplete?.();
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [isSupported, detectedGender, detectGender]);

  const stopSpeaking = useCallback(() => {
    if (isSupported) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isSupported]);

  return {
    speak,
    stopSpeaking,
    isSpeaking,
    isSupported,
    detectedGender
  };
};
