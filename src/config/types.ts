
export interface SupabaseConfig {
  url: string;
  publishableKey: string;
}

export interface AppConfig {
  environment: 'production' | 'testing';
  supabase: SupabaseConfig;
  edgeFunctions: {
    generateQuotes: string;
    generateMovies: string;
    summarizeCsv: string;
    trackAnalytics: string;
  };
}

export interface ConfigStrategy {
  getConfig(): AppConfig;
}
