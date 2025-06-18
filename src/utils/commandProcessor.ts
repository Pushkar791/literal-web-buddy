interface CommandResponse {
  message: string;
  action?: () => void;
}

const intentMap: Record<string, string> = {
  instagram: "https://www.instagram.com",
  youtube: "https://www.youtube.com",
  facebook: "https://www.facebook.com",
  gmail: "https://mail.google.com",
  spotify: "https://open.spotify.com",
  google: "https://www.google.com",
  twitter: "https://www.twitter.com",
  linkedin: "https://www.linkedin.com",
  netflix: "https://www.netflix.com",
  amazon: "https://www.amazon.com",
  reddit: "https://www.reddit.com",
  github: "https://www.github.com",
  stackoverflow: "https://stackoverflow.com",
  wikipedia: "https://www.wikipedia.org",
  fitbuddy: "https://fit-buddy-ai.vercel.app/",
  "fit buddy": "https://fit-buddy-ai.vercel.app/"
};

const greetings = [
  "Hello! How can I help you today?",
  "Hi there! What can I do for you?",
  "Good to see you! How can I assist?",
  "Hello Pushkar! Ready to help you out."
];

const openApp = (url: string, appName: string): CommandResponse => {
  return {
    message: `Opening ${appName}`,
    action: () => {
      window.open(url, '_blank');
    }
  };
};

const searchGoogle = (query: string): CommandResponse => {
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  return {
    message: `Searching Google for ${query}`,
    action: () => {
      window.open(searchUrl, '_blank');
    }
  };
};

export const processCommand = (transcript: string): CommandResponse => {
  const command = transcript.toLowerCase().trim();
  console.log('Processing command:', command);

  // Special case for FitBuddy
  if (command.includes('fit buddy') || command.includes('fitbuddy')) {
    console.log('FitBuddy command detected');
    return openApp(intentMap.fitbuddy, 'FitBuddy');
  }

  // Handle greetings
  if (command.includes('hello') || command.includes('hi') || command.includes('hey')) {
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];
    return { message: greeting };
  }

  // Handle opening apps/websites
  if (command.includes('open') || command.includes('launch') || command.includes('go to')) {
    for (const [appName, url] of Object.entries(intentMap)) {
      if (command.includes(appName)) {
        return openApp(url, appName.charAt(0).toUpperCase() + appName.slice(1));
      }
    }
  }

  // Handle search queries
  if (command.includes('search') || command.includes('google')) {
    // Extract search query
    let searchQuery = command
      .replace(/search|google|for|on/g, '')
      .replace(/open|launch/g, '')
      .trim();
    
    if (searchQuery) {
      return searchGoogle(searchQuery);
    } else {
      return openApp(intentMap.google, 'Google');
    }
  }

  // Handle YouTube specific queries
  if (command.includes('play') && (command.includes('music') || command.includes('video'))) {
    return openApp(intentMap.youtube, 'YouTube');
  }

  // Handle time queries
  if (command.includes('time') || command.includes('clock')) {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    return { message: `The current time is ${timeString}` };
  }

  // Handle date queries
  if (command.includes('date') || command.includes('today')) {
    const today = new Date();
    const dateString = today.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    return { message: `Today is ${dateString}` };
  }

  // Handle weather (placeholder)
  if (command.includes('weather')) {
    return { message: "I'd love to help with weather, but I need access to weather data. Try asking me to open a weather website!" };
  }

  // Handle thanks
  if (command.includes('thank') || command.includes('thanks')) {
    return { message: "You're welcome! Happy to help anytime." };
  }

  // Handle goodbye
  if (command.includes('bye') || command.includes('goodbye') || command.includes('see you')) {
    return { message: "Goodbye! Have a great day!" };
  }

  // Default response for unrecognized commands
  return { 
    message: "I'm not sure how to help with that. Try asking me to open an app like YouTube or Instagram, or search for something on Google." 
  };
};
