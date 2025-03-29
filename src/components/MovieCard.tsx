
import React from "react";
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
}

const MovieCard: React.FC<MovieCardProps> = ({
  title,
  image,
  description,
  rating,
  platforms = [],
}) => {
  return (
    <div className="movie-card rounded-lg overflow-hidden flex flex-col h-full border border-foreground/10 hover:border-foreground/30 transition-colors shadow-sm">
      <div className="relative h-[400px] overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = "https://source.unsplash.com/random/800x600/?movie";
          }}
        />
      </div>
      
      <div className="p-6 space-y-5 flex-1 flex flex-col">
        <h3 className="text-2xl font-semibold text-foreground">{title}</h3>
        
        <p className="text-foreground/70 text-sm flex-1">{description}</p>
        
        <Separator className="my-2" />
        
        <div className="flex items-center w-full">
          <div className="flex items-center space-x-2">
            <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-foreground font-medium">{rating.toFixed(1)}</span>
          </div>
        </div>
        
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
