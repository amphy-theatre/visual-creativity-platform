
export interface AppConfig {
  name: string;
  version: string;
  description: string;
  repo?: string;
  // Supabase configuration
  supabase: {
    url: string;
    publishableKey: string;
  };
  // Edge functions URL
  edgeFunctions: {
    baseUrl: string;
    generateQuotes: string;
    generateMovies: string;
    summarizeCsv: string;
    analyzePrompt: string;
  };
  // App configuration
  app: {
    defaultTheme: 'light' | 'dark' | 'system';
    debug: boolean;
  };
}
