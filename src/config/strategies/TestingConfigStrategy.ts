
import { AppConfig, ConfigStrategy } from "../types";

export class TestingConfigStrategy implements ConfigStrategy {
  getConfig(): AppConfig {
    const supabaseUrl = "https://ncxxegaimrmaltrxjgxc.supabase.co";
    
    return {
      environment: 'testing',
      supabase: {
        url: supabaseUrl,
        publishableKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jeHhlZ2FpbXJtYWx0cnhqZ3hjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3NDc2ODEsImV4cCI6MjA2MDMyMzY4MX0._3QvhXKEg6-dt8aYaASANivOHVKihzh8h_bBvVa1UlE"
      },
      edgeFunctions: {
        generateQuotes: `${supabaseUrl}/functions/v1/generate_quotes`,
        generateMovies: `${supabaseUrl}/functions/v1/generate_movies`,
        summarizeCsv: `${supabaseUrl}/functions/v1/summarize_csv`,
        trackAnalytics: `${supabaseUrl}/functions/v1/track_analytics`
      }
    };
  }
}
