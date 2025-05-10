
import { AppConfig } from "../types";

/**
 * Production environment configuration strategy
 */
export class ProductionConfigStrategy {
  getConfig(): AppConfig {
    const supabaseUrl = 'https://sdwuhuuyyrwzwyqdtdkb.supabase.co';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkd3VodXV5eXJ3end5cWR0ZGtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNzQ4MDMsImV4cCI6MjA1NzY1MDgwM30.KChq8B3U0ioBkkK3CjqCmzilveHFTZEHXbE81HGhx28';
    const edgeFunctionsBaseUrl = `${supabaseUrl}/functions/v1`;
    
    return {
      name: 'Cineflect',
      version: '1.0.0',
      description: 'Movie recommendations based on your mood',
      environment: 'production',
      supabase: {
        url: supabaseUrl,
        publishableKey: supabaseAnonKey
      },
      edgeFunctions: {
        baseUrl: edgeFunctionsBaseUrl,
        generateQuotes: `${edgeFunctionsBaseUrl}/generate_quotes`,
        generateMovies: `${edgeFunctionsBaseUrl}/generate_movies`,
        summarizeCsv: `${edgeFunctionsBaseUrl}/summarize_csv`,
        analyzePrompt: `${edgeFunctionsBaseUrl}/analyze_prompt`,
        expandedMovieInfo: `${edgeFunctionsBaseUrl}/expanded_movie_info`,
        trackAnalytics: `${edgeFunctionsBaseUrl}/track_analytics`,
      },
      app: {
        defaultTheme: 'system',
        debug: false,
      }
    };
  }
}
