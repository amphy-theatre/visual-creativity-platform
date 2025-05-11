
import { AppConfig } from "../types";

/**
 * Testing environment configuration strategy
 */
export class TestingConfigStrategy {
  getConfig(): AppConfig {
    const supabaseUrl = 'https://ncxxegaimrmaltrxjgxc.supabase.co';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jeHhlZ2FpbXJtYWx0cnhqZ3hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3NDc2ODEsImV4cCI6MjA2MDMyMzY4MX0._3QvhXKEg6-dt8aYaASANivOHVKihzh8h_bBvVa1UlE';
    const edgeFunctionsBaseUrl = `${supabaseUrl}/functions/v1`;
    
    return {
      name: 'Cineflect [TEST]',
      version: '1.0.0',
      description: 'Movie recommendations based on your mood (Test Environment)',
      environment: 'testing',
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
        handlePayments: `${edgeFunctionsBaseUrl}/stripe_webhook`,
        checkoutSession: `${edgeFunctionsBaseUrl}/checkout_session`,
      },
      app: {
        defaultTheme: 'system',
        debug: true,
      }
    };
  }
}
