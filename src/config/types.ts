
export interface AppConfig {
  name: string;
  version: string;
  description: string;
  repo?: string;
  // Environment information
  environment: 'production' | 'testing';
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
    trackAnalytics: string; // Added missing trackAnalytics endpoint
    handlePayments: string;
    checkoutSession: string;
  };
  // App configuration
  app: {
    defaultTheme: 'light' | 'dark' | 'system';
    debug: boolean;
  };
}

export interface ConfigStrategy {
  getConfig(): AppConfig;
}
