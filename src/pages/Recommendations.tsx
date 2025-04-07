import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import MovieCard from "../components/MovieCard";
import { Button } from "../components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { toast } from "../components/ui/use-toast";
import { supabase } from "../integrations/supabase/client";
import { useAuth } from "../context/AuthContext";
import { useUserPreferences } from "../hooks/useUserPreferences";

interface StreamingProvider {
  name: string;
  url: string;
  logoUrl: string;
  variant?: string;
}

interface MovieData {
  title: string;
  description: string;
  link: string;
  posterUrl: string;
  streamingProviders?: StreamingProvider[];
  rating: number;
}

interface RecommendationsResponse {
  movies: MovieData[];
}

const Recommendations: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedQuote, recommendations: initialRecommendations, mood, selectedGenre, fromPreset } = location.state || {};
  const { user, session } = useAuth();
  const { userPreferences } = useUserPreferences();
  
  const [recommendations, setRecommendations] = useState<RecommendationsResponse>(initialRecommendations || {
    movies: [
      {
        title: "Lady Bird",
        description: "A high school senior navigates the challenges of adolescence and her complex relationship with her mother, all while preparing to leave for college.",
        link: "#",
        posterUrl: "https://source.unsplash.com/random/800x600/?movie",
        rating: 7.3,
        streamingProviders: [
          { name: "Netflix", url: "#", logoUrl: "" },
          { name: "Netflix", url: "#", logoUrl: "", variant: "basic with Ads" }
        ]
      },
      {
        title: "Reality Bites",
        description: "A group of friends faces the uncertainties of post-college life, dealing with love, career choices, and the transition into adulthood.",
        link: "#", 
        posterUrl: "https://source.unsplash.com/random/800x600/?film",
        rating: 6.6,
        streamingProviders: [
          { name: "Apple TV", url: "#", logoUrl: "" },
          { name: "Google Play Movies", url: "#", logoUrl: "" },
          { name: "Cineplex", url: "#", logoUrl: "" }
        ]
      },
      {
        title: "Kicking and Screaming",
        description: "A group of college friends struggles with the transition into adulthood, each facing their own challenges and uncertainties about the future.",
        link: "#",
        posterUrl: "https://source.unsplash.com/random/800x600/?cinema",
        rating: 6.2,
        streamingProviders: [
          { name: "Amazon Prime Video", url: "#", logoUrl: "" },
          { name: "Amazon Prime Video", url: "#", logoUrl: "", variant: "with Ads" }
        ]
      }
    ]
  });
  
  const [isLoading, setIsLoading] = useState(false);
  
  let headerText = "Based on your mood";
  if (selectedQuote) {
    headerText = "Based on your selected quote";
  } else if (fromPreset && selectedGenre) {
    const genreMap: Record<string, string> = {
      inspiration: "Inspirational",
      thriller: "Thriller",
      drama: "Drama",
      romance: "Romance",
      philosophical: "Philosophical",
      comedy: "Comedy"
    };
    headerText = `${genreMap[selectedGenre]} recommendations`;
  }
  
  const handleBackToQuotes = () => {
    navigate(-1);
  };
  
  const handleRegenerateMovies = async () => {
    if (!selectedQuote && !mood) {
      toast({
        title: "Error",
        description: "Missing required information to generate more movies",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    const previousMovies = recommendations.movies.map(movie => movie.title);
    
    try {
      const response = await fetch('https://sdwuhuuyyrwzwyqdtdkb.supabase.co/functions/v1/generate_movies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkd3VodXV5eXJ3end5cWR0ZGtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNzQ4MDMsImV4cCI6MjA1NzY1MDgwM30.KChq8B3U0ioBkkK3CjqCmzilveHFTZEHXbE81HGhx28'}`
        },
        body: JSON.stringify({
          selectedQuote,
          originalEmotion: mood,
          userPreferences: userPreferences,
          previousMovies: previousMovies
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error response:', errorData);
        throw new Error(`Failed to get new movie recommendations: ${response.status} ${response.statusText}`);
      }

      const newRecommendations = await response.json();
      console.log('Received new movie recommendations:', newRecommendations);
      
      setRecommendations(newRecommendations);
      
      toast({
        title: "Success",
        description: "Found new movies for you!",
      });
    } catch (error) {
      console.error('Error getting new movie recommendations:', error);
      toast({
        title: "Error",
        description: "Failed to get new movie recommendations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center mb-4">
          <Button 
            variant="ghost" 
            className="text-foreground/70 hover:text-foreground transition-colors p-0 flex items-center gap-2"
            onClick={handleBackToQuotes}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Quotes
          </Button>
        </div>
        
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground">{headerText}</h1>
          <Button 
            onClick={handleRegenerateMovies} 
            disabled={isLoading}
            size="sm"
            className="flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                Try again?
              </>
            )}
          </Button>
        </div>
        
        {selectedQuote && (
          <div className="italic text-xl text-foreground/80 max-w-full px-4 overflow-hidden break-words">
            "{selectedQuote}"
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.movies.map((movie, index) => (
            <div key={index} style={{ animationDelay: `${index * 0.1}s` }}>
              <MovieCard
                title={movie.title}
                image={movie.posterUrl || "https://source.unsplash.com/random/800x600/?movie"}
                description={movie.description}
                rating={movie.rating || 0}
                platforms={(movie.streamingProviders || []).map(provider => ({
                  name: provider.name,
                  logo: provider.logoUrl || "",
                  variant: provider.variant,
                  url: provider.url
                }))}
              />
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Recommendations;
