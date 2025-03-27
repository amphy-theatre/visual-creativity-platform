import React, { useState, useEffect } from "react";
import { Separator } from "./ui/separator";

interface Platform {
  name: string;
  logo: string;
  variant?: string;
  url?: string;
}

interface MovieCardProps {
  title: string;
  image: string;
  description: string;
  rating: number;
  platforms: Platform[];
  onClick: () => void;
}

const MovieCard: React.FC<MovieCardProps> = ({
  title,
  image,
  description,
  rating,
  platforms = [],
  onClick,
}) => {
  const [imageRetries, setImageRetries] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);
  
  const fallbackImage = "https://picsum.photos/800/600";
  
  // Reset states when the image prop changes (new movie is loaded)
  useEffect(() => {
    setImageRetries(0);
    setImageFailed(false);
  }, [image, title]);
  
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    if (imageRetries < 2) {
      // Try up to 2 more times with the original URL (3 attempts total)
      setImageRetries(prev => prev + 1);
      e.currentTarget.src = image;
    } else {
      // After 3 failed attempts, use a fallback image
      setImageFailed(true);
      e.currentTarget.src = fallbackImage;
    }
  };

  return (
    <div 
      className="movie-card rounded-lg overflow-hidden flex flex-col h-full border border-foreground/10 shadow-md transition-all duration-300 ease-in-out cursor-pointer group hover:border-foreground/40 hover:shadow-xl hover:scale-[1.02] dark:hover:border-foreground/60 dark:hover:shadow-[0_0_20px_3px_rgba(200,200,200,0.15)]"
      onClick={onClick}
    >
      <div className="relative aspect-[2/3] overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover"
          onError={handleImageError}
        />
        {imageFailed && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/30 backdrop-blur-sm">
            <span className="text-sm text-foreground/70 bg-background/80 px-2 py-1 rounded">
              No poster available
            </span>
          </div>
        )}
        {/* Expand Icon Indicator */}
        <div className="absolute top-3 right-3 p-1.5 bg-black/50 rounded-full pointer-events-none">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5" // Adjusted strokeWidth for visual balance with smaller size
            stroke="currentColor"
            className="w-5 h-5 text-white" // Made icon smaller
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6"
            />
          </svg>
        </div>
      </div>
      
      <div className="p-6 space-y-5 flex-1 flex flex-col">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-semibold text-foreground">{title}</h3>
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-foreground font-medium">{rating.toFixed(1)}</span>
          </div>
        </div>
        
        <p className="text-foreground/70 text-sm flex-1">{description}</p>
        
        {platforms && platforms.length > 0 && (
          <>
            <Separator className="my-2" />
            
            <div>
              <div className="flex flex-col space-y-2">
                <p className="text-sm text-foreground/70">Available on:</p>
                <div className="flex flex-wrap gap-2">
                  {platforms.map((platform, index) => (
                    <a 
                      key={index}
                      href={platform.url || "#"} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 bg-secondary rounded-full px-3 py-1 hover:bg-secondary/80 transition-colors"
                    >
                      {platform.logo ? (
                        <img src={platform.logo} alt={platform.name} className="w-4 h-4 rounded-full" />
                      ) : (
                        <span className="w-4 h-4 bg-background rounded-full"></span>
                      )}
                      <span className="text-xs text-secondary-foreground">
                        {platform.name}{platform.variant ? ` ${platform.variant}` : ""}
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MovieCard;
