
import { AppConfig, ConfigStrategy } from "../types";

export class ProductionConfigStrategy implements ConfigStrategy {
  getConfig(): AppConfig {
    const supabaseUrl = "https://sdwuhuuyyrwzwyqdtdkb.supabase.co";
    
    return {
      environment: 'production',
      supabase: {
        url: supabaseUrl,
        publishableKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkd3VodXV5eXJ3end5cWR0ZGtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNzQ4MDMsImV4cCI6MjA1NzY1MDgwM30.KChq8B3U0ioBkkK3CjqCmzilveHFTZEHXbE81HGhx28"
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
