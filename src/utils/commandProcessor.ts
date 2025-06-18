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

// Knowledge base for common questions
const knowledgeBase: Record<string, string> = {
  "fitness": "Fitness refers to the state of being physically fit and healthy. It involves regular physical activity, proper nutrition, adequate rest, and maintaining a healthy lifestyle. Fitness components include cardiovascular endurance, muscular strength, muscular endurance, flexibility, and body composition.",
  
  "exercise": "Exercise is physical activity that is planned, structured, and repetitive with the purpose of improving or maintaining physical fitness. Regular exercise has numerous benefits including improved cardiovascular health, stronger muscles and bones, weight management, better mental health, and reduced risk of chronic diseases.",
  
  "healthy diet": "A healthy diet is one that helps maintain or improve overall health by providing the body with essential nutrition. It contains a balanced mix of macronutrients (proteins, carbohydrates, and fats) and micronutrients (vitamins and minerals). A healthy diet typically includes fruits, vegetables, whole grains, lean proteins, and limits processed foods, added sugars, and unhealthy fats.",
  
  "meditation": "Meditation is a practice where an individual uses techniques like mindfulness or focusing the mind on a particular object, thought, or activity to train attention and awareness. This practice often leads to a mentally clear and emotionally calm and stable state. Regular meditation can reduce stress, improve concentration, increase self-awareness, and promote emotional health.",
  
  "yoga": "Yoga is a group of physical, mental, and spiritual practices that originated in ancient India. It combines physical postures, breathing exercises, and meditation. Regular practice of yoga can improve flexibility, strength, balance, and reduce stress and anxiety.",
  
  "artificial intelligence": "Artificial Intelligence, or AI, refers to systems or machines that mimic human intelligence to perform tasks and can iteratively improve themselves based on the information they collect. AI encompasses various technologies including machine learning, natural language processing, computer vision, and robotics. It's used in numerous applications from virtual assistants to autonomous vehicles.",
  
  "blockchain": "Blockchain is a distributed ledger technology that maintains a continuously growing list of records, called blocks, which are linked and secured using cryptography. Each block contains a timestamp and transaction data, making the system resistant to modification. Blockchain is the foundation of cryptocurrencies like Bitcoin but has applications in many fields including supply chain, healthcare, and voting systems.",
  
  "climate change": "Climate change refers to long-term shifts in temperatures and weather patterns, primarily caused by human activities, especially the burning of fossil fuels which increases heat-trapping greenhouse gases. Effects include rising sea levels, extreme weather events, and disruptions to ecosystems. Addressing climate change requires reducing greenhouse gas emissions and adapting to its impacts.",
  
  "renewable energy": "Renewable energy comes from sources that are naturally replenished on a human timescale, such as sunlight, wind, rain, tides, waves, and geothermal heat. Unlike fossil fuels, renewable energy sources won't run out and generally have a much lower environmental impact. Common types include solar, wind, hydroelectric, biomass, and geothermal power."
};

// Available voice options
export const voiceOptions = [
  { name: "Default", lang: "en-US" },
  { name: "British", lang: "en-GB" },
  { name: "Australian", lang: "en-AU" },
  { name: "Indian", lang: "en-IN" },
  { name: "Spanish", lang: "es-ES" },
  { name: "French", lang: "fr-FR" },
  { name: "German", lang: "de-DE" },
  { name: "Italian", lang: "it-IT" },
  { name: "Japanese", lang: "ja-JP" },
  { name: "Korean", lang: "ko-KR" }
];

// Current voice setting
export let currentVoice = voiceOptions[0];

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

const playOnSpotify = (query: string): CommandResponse => {
  // Format the search query for Spotify
  const formattedQuery = query
    .replace(/play|music|song|track|artist|album|on spotify/gi, '')
    .trim();
  
  // If query is too generic, just open Spotify
  if (!formattedQuery || formattedQuery === 'this' || formattedQuery.length < 3) {
    return {
      message: "Opening Spotify for you",
      action: () => {
        window.open(intentMap.spotify, '_blank');
      }
    };
  }

  // Create Spotify search URL with the query
  const spotifySearchUrl = `https://open.spotify.com/search/${encodeURIComponent(formattedQuery)}`;
  
  return {
    message: `Playing "${formattedQuery}" on Spotify`,
    action: () => {
      window.open(spotifySearchUrl, '_blank');
    }
  };
};

// Function to change the voice accent
export const changeVoiceAccent = (accentName: string): CommandResponse => {
  const foundVoice = voiceOptions.find(voice => voice.name.toLowerCase() === accentName.toLowerCase());
  
  if (foundVoice) {
    currentVoice = foundVoice;
    return { 
      message: `Voice accent changed to ${foundVoice.name}. How does this sound?` 
    };
  }
  
  return { 
    message: `I couldn't find the ${accentName} accent. Available accents are: ${voiceOptions.map(v => v.name).join(', ')}.` 
  };
};

// Function to provide information about a topic
const getKnowledgeResponse = (query: string): CommandResponse => {
  // Check for name-related questions
  const nameQuestionPatterns = [
    /who (named|choose|chose|picked|selected|gave) you.* name/i,
    /where.* (get|got) your name/i,
    /why.* (called|named) literal/i,
    /who.* (created|made|built|designed) you/i,
    /what.* your name/i,
    /your name.* (mean|stands for)/i
  ];
  
  if (nameQuestionPatterns.some(pattern => pattern.test(query))) {
    return { message: "ak 18 saal ki gadhi jiska name hai kashee kalra" };
  }
  
  // Clean up the query
  let cleanQuery = query.toLowerCase()
    .replace(/what is|what are|tell me about|explain|who is|define|meaning of|definition of/gi, '')
    .trim();
  
  // Check if we have exact match in knowledge base
  for (const [topic, info] of Object.entries(knowledgeBase)) {
    if (cleanQuery === topic || cleanQuery.includes(topic)) {
      return { message: info };
    }
  }
  
  // Check for partial matches
  for (const [topic, info] of Object.entries(knowledgeBase)) {
    // Check if the topic is a substring of the query or vice versa
    if (topic.includes(cleanQuery) || cleanQuery.includes(topic)) {
      return { message: info };
    }
  }
  
  // If no match found in our knowledge base, offer to search the web
  return {
    message: `I don't have specific information about ${cleanQuery} in my knowledge base. Would you like me to search the web for you?`,
    action: () => {
      // Open a Google search in the background
      window.open(`https://www.google.com/search?q=${encodeURIComponent(cleanQuery)}`, '_blank');
    }
  };
};

export const processCommand = (transcript: string): CommandResponse => {
  const command = transcript.toLowerCase().trim();
  console.log('Processing command:', command);

  // Handle accent change requests
  if (command.match(/change (your |the |)(?:voice|accent) to (\w+)/i)) {
    const accentMatch = command.match(/change (your |the |)(?:voice|accent) to (\w+)/i);
    if (accentMatch && accentMatch[2]) {
      return changeVoiceAccent(accentMatch[2]);
    }
  }

  // Handle knowledge queries
  if (command.match(/^(what|who|how|why|when|where|which|tell me|explain|define)/i) || 
      command.includes('meaning of') || command.includes('definition of')) {
    return getKnowledgeResponse(command);
  }

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

  // Handle Spotify music playback
  if ((command.includes('play') || command.includes('listen to')) && 
      (command.includes('music') || command.includes('song') || command.includes('spotify'))) {
    return playOnSpotify(command);
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
  if (command.includes('play') && (command.includes('video') || command.includes('youtube'))) {
    // If it's specifically for YouTube
    if (command.includes('youtube')) {
      const query = command.replace(/play|video|on youtube|youtube/gi, '').trim();
      if (query) {
        const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
        return {
          message: `Playing ${query} on YouTube`,
          action: () => {
            window.open(youtubeSearchUrl, '_blank');
          }
        };
      }
    }
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
