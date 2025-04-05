
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import MovieCard from "../components/MovieCard";
import { Button } from "../components/ui/button";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { toast } from "../components/ui/use-toast";
import { supabase } from "../integrations/supabase/client";
import { useAuth } from "../context/AuthContext";
import { MONTHLY_PROMPT_LIMIT } from "../hooks/usePromptUsage";

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
  const { selectedQuote, recommendations: initialRecommendations, mood, selectedGenre, fromPreset, userPreferences: initialUserPreferences } = location.state || {};
  const [userPreferences, setUserPreferences] = useState<string | null>(initialUserPreferences || null);
  const { user } = useAuth();
  
  const [recommendations, setRecommendations] = useState<RecommendationsResponse | null>(initialRecommendations);
  const [isLoading, setIsLoading] = useState<boolean>(!initialRecommendations);
  
  // Fetch movie recommendations if coming directly from preset
  useEffect(() => {
    const fetchRecommendations = async () => {
      if ((fromPreset && !recommendations) || (fromPreset && recommendations && recommendations.movies.length === 0)) {
        try {
          setIsLoading(true);
          
          // If we don't have user preferences yet, try to fetch them
          if (!userPreferences && user) {
            try {
              const { data, error } = await supabase
                .from('file_summaries')
                .select('summary')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();
              
              if (data && !error) {
                setUserPreferences(data.summary);
              }
            } catch (error) {
              console.error('Error fetching user preferences:', error);
            }
          }
          
          const response = await fetch('https://sdwuhuuyyrwzwyqdtdkb.supabase.co/functions/v1/generate_movies', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkd3VodXV5eXJ3end5cWR0ZGtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNzQ4MDMsImV4cCI6MjA1NzY1MDgwM30.KChq8B3U0ioBkkK3CjqCmzilveHFTZEHXbE81HGhx28`
            },
            body: JSON.stringify({
              originalEmotion: mood,
              userPreferences: userPreferences,
              genre: selectedGenre,
              previousMovies: []
            }),
          });
          
          if (!response.ok) {
            throw new Error(`Failed to get recommendations: ${response.status}`);
          }
          
          const data = await response.json();
          setRecommendations(data);
        } catch (error) {
          console.error('Error fetching recommendations:', error);
          toast({
            title: "Error",
            description: "Failed to get recommendations. Please try again.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    fetchRecommendations();
  }, [fromPreset, recommendations, mood, selectedGenre, userPreferences, user]);
  
  // Fetch user preferences if not provided from state
  useEffect(() => {
    const fetchUserPreferences = async () => {
      if (!user || userPreferences) return;
      
      try {
        const { data, error } = await supabase
          .from('file_summaries')
          .select('summary')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (error) {
          console.log('No file summaries found or error:', error);
          return;
        }
        
        if (data) {
          console.log('Found user preferences from file summary:', data.summary);
          setUserPreferences(data.summary);
        }
      } catch (error) {
        console.error('Error fetching user preferences:', error);
      }
    };
    
    fetchUserPreferences();
  }, [user, userPreferences]);
  
  // Determine the header text based on user path
  let headerText = "Based on your mood";
  let backButtonText = "Back";
  let backButtonPath = -1;
  
  if (selectedQuote) {
    headerText = "Based on your selected quote";
    backButtonText = "Back to Quotes";
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
    backButtonText = "Back to Input";
    backButtonPath = "/";
  }
  
  const handleBack = () => {
    if (typeof backButtonPath === 'string') {
      navigate(backButtonPath);
    } else {
      navigate(backButtonPath);
    }
  };
  
  const handleRegenerateMovies = async () => {
    if (!mood && !selectedQuote && !selectedGenre) {
      toast({
        title: "Error",
        description: "Missing required information to generate more movies",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    // Extract current movie titles to avoid duplicates
    const previousMovies = recommendations?.movies?.map(movie => movie.title) || [];
    
    try {
      const response = await fetch('https://sdwuhuuyyrwzwyqdtdkb.supabase.co/functions/v1/generate_movies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkd3VodXV5eXJ3end5cWR0ZGtiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIwNzQ4MDMsImV4cCI6MjA1NzY1MDgwM30.KChq8B3U0ioBkkK3CjqCmzilveHFTZEHXbE81HGhx28`
        },
        body: JSON.stringify({
          selectedQuote,
          originalEmotion: mood,
          userPreferences: userPreferences,
          previousMovies: previousMovies,
          genre: selectedGenre
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.text();
        console.error('Error response:', errorData);
        throw new Error(`Failed to get new movie recommendations: ${response.status} ${response.statusText}`);
      }

      // Parse the response
      const newRecommendations = await response.json();
      console.log('Received new movie recommendations:', newRecommendations);
      
      // Replace existing movies with new ones
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
  
  // Show loading state
  if (isLoading) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <RefreshCw className="h-8 w-8 animate-spin mb-4" />
          <p className="text-foreground/80">Finding the perfect recommendations for you...</p>
        </div>
      </Layout>
    );
  }
  
  // Show placeholder recommendations if none are loaded
  const movieList = recommendations?.movies || [
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
      description: "A group of friends struggles with the transition into adulthood, each facing their own challenges and uncertainties about the future.",
      link: "#",
      posterUrl: "https://source.unsplash.com/random/800x600/?cinema",
      rating: 6.2,
      streamingProviders: [
        { name: "Amazon Prime Video", url: "#", logoUrl: "" },
        { name: "Amazon Prime Video", url: "#", logoUrl: "", variant: "with Ads" }
      ]
    }
  ];
  
  return (
    <Layout>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex items-center mb-4">
          <Button 
            variant="ghost" 
            className="text-foreground/70 hover:text-foreground transition-colors p-0 flex items-center gap-2"
            onClick={handleBack}
          >
            <ArrowLeft className="h-4 w-4" />
            {backButtonText}
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
          {movieList.map((movie, index) => (
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
