// Helper function to get streaming provider logo
export function getProviderLogoUrl(providerName: string): string {
    const providers: Record<string, string> = {
      'Netflix': 'https://assets.nflxext.com/us/ffe/siteui/common/icons/nficon2016.ico',
      'Disney+': 'https://www.disneyplus.com/favicon.ico',
      'Prime Video': 'https://m.media-amazon.com/images/G/01/digital/video/DVUI/favicons/favicon.ico',
      'Amazon Prime Video': 'https://m.media-amazon.com/images/G/01/digital/video/DVUI/favicons/favicon.ico',
      'Hulu': 'https://www.hulu.com/favicon.ico',
      'HBO Max': 'https://www.max.com/favicon.ico',
      'Apple TV': 'https://tv.apple.com/favicon.ico',
      'Apple TV Plus': 'https://tv.apple.com/favicon.ico',
      'Crave': 'https://www.crave.ca/favicon.ico',
      'CBC Gem': 'https://gem.cbc.ca/favicon.ico',
      'Paramount Plus': 'https://www.paramountplus.com/favicon.ico'
    };
    
    return providers[providerName] || '';
  }
  
  // Get fallback movies when needed
  export function getFallbackMovies(): any[] {
    return [
      {
        title: "Inside Out",
        release_year: "2015",
        description: "After young Riley is uprooted from her Midwest life and moved to San Francisco, her emotions - Joy, Fear, Anger, Disgust and Sadness - conflict on how best to navigate a new city, house, and school.",
        link: '',
        streamingProviders: [],
        tmdbId: ""
      },
      {
        title: "Good Will Hunting",
        release_year: "1997",
        description: "A janitor at MIT has a gift for mathematics but needs help from a psychologist to find direction.",
        link: '',
        streamingProviders: [],
        tmdbId: ""
      },
      {
        title: "Soul",
        release_year: "2020",
        description: "A musician who has lost his passion for music is transported out of his body and must find his way back.",
        link: '',
        streamingProviders: [],
        tmdbId: ""
      }
    ];
  }
