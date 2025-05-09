
export interface StreamingProvider {
    name: string;
    url: string;
    logoUrl: string;
  }
  
  export interface Movie {
    title: string;
    release_year: string;
    description: string;
    link: string;
    posterUrl?: string;
    streamingProviders?: StreamingProvider[];
    rating?: number | null;
    tmdbId: string;
  }
