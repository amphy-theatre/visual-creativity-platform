
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
        director: "",
        description: "A heartwarming story about emotions and growing up.",
        posterUrl: "https://image.tmdb.org/t/p/w500/2AT32WI3iaGkVPzjcs9n0hQHtNw.jpg",
        link: "https://www.disneyplus.com/movies/inside-out",
        streamingProviders: [
          { 
            name: "Disney+", 
            url: "https://www.disneyplus.com",
            logoUrl: getProviderLogoUrl("Disney+")
          }
        ]
      },
      {
        title: "Good Will Hunting",
        director: "",
        description: "A janitor at MIT has a gift for mathematics but needs help from a psychologist to find direction.",
        posterUrl: "https://image.tmdb.org/t/p/w500/bABCBKYBK7A5G1x0wSB5no4Iscs.jpg",
        link: "https://www.netflix.com/title/17405997",
        streamingProviders: [
          { 
            name: "Netflix", 
            url: "https://www.netflix.com",
            logoUrl: getProviderLogoUrl("Netflix")
          }
        ]
      },
      {
        title: "Soul",
        director: "",
        description: "A musician who has lost his passion for music is transported out of his body and must find his way back.",
        posterUrl: "https://image.tmdb.org/t/p/w500/hm58Jw4Lw8OIeECIq5qyPYhAeRJ.jpg",
        link: "https://www.disneyplus.com/movies/soul",
        streamingProviders: [
          { 
            name: "Disney+", 
            url: "https://www.disneyplus.com",
            logoUrl: getProviderLogoUrl("Disney+")
          }
        ]
      }
    ];
  }
