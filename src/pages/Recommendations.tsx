
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import MovieCard from "../components/MovieCard";
import { Button } from "../components/ui/button";
import { ArrowLeft } from "lucide-react";

const Recommendations: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { selectedQuote, selectedGenre, fromPreset } = location.state || {};
  
  // Sample movie data
  const movies = [
    {
      title: "Lady Bird",
      image: "https://source.unsplash.com/random/800x600/?movie",
      description: "A high school senior navigates the challenges of adolescence and her complex relationship with her mother, all while preparing to leave for college.",
      rating: 7.3,
      platforms: [
        { name: "Netflix", logo: "" },
        { name: "Netflix", logo: "", variant: "basic with Ads" }
      ]
    },
    {
      title: "Reality Bites",
      image: "https://source.unsplash.com/random/800x600/?film",
      description: "A group of friends faces the uncertainties of post-college life, dealing with love, career choices, and the transition into adulthood.",
      rating: 6.6,
      platforms: [
        { name: "Apple TV", logo: "" },
        { name: "Google Play Movies", logo: "" },
        { name: "Cineplex", logo: "" }
      ]
    },
    {
      title: "Kicking and Screaming",
      image: "https://source.unsplash.com/random/800x600/?cinema",
      description: "A group of college friends struggles with the transition into adulthood, each facing their own challenges and uncertainties about the future.",
      rating: 6.2,
      platforms: [
        { name: "Amazon Prime Video", logo: "" },
        { name: "Amazon Prime Video", logo: "", variant: "with Ads" }
      ]
    }
  ];
  
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
        
        <h1 className="text-3xl font-bold text-foreground">{headerText}</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {movies.map((movie, index) => (
            <div key={index} style={{ animationDelay: `${index * 0.1}s` }}>
              <MovieCard
                title={movie.title}
                image={movie.image}
                description={movie.description}
                rating={movie.rating}
                platforms={movie.platforms}
              />
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Recommendations;
