
export interface StreamingProvider {
    name: string;
    url: string;
    logoUrl: string;
  }
  
  export interface Movie {
    title: string;
    director: string;
    description: string;
    link: string;
    posterUrl?: string;
    streamingProviders?: StreamingProvider[];
    rating?: number | null;
  }
