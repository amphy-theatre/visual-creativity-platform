
import { AppConfig } from "../types";

/**
 * Testing environment configuration strategy
 */
export class TestingConfigStrategy {
  getConfig(): AppConfig {
    const supabaseUrl = 'https://sdwuhuuyyrwzwyqdtdkb.supabase.co';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkd3VodXV5eXJ3end5cWR0ZGtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNzQ4MDMsImV4cCI6MjA1NzY1MDgwM30.KChq8B3U0ioBkkK3CjqCmzilveHFTZEHXbE81HGhx28';
    const edgeFunctionsBaseUrl = `${supabaseUrl}/functions/v1`;
    
    return {
      name: 'Cineflect [TEST]',
      version: '1.0.0',
      description: 'Movie recommendations based on your mood (Test Environment)',
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
      },
      app: {
        defaultTheme: 'system',
        debug: true,
      }
    };
  }
}
