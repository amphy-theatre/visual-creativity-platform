import React, { useRef } from 'react';

interface MovieDetails {
  // Define the structure of the movie details you want to show
  // This could be similar to MovieCardProps or more extensive
  title: string;
  image: string;
  description: string;
  rating: number;
  // Add any other details like releaseDate, director, cast, extendedSynopsis, etc.
  releaseDate?: string;
  director?: string;
  // ... other fields
}

interface MovieModalProps {
  movie: MovieDetails | null;
  isOpen: boolean;
  onClose: () => void;
}

const MovieModal: React.FC<MovieModalProps> = ({ movie, isOpen, onClose }) => {
  const modalContentRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !movie) {
    return null;
  }

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    // Check if the click target is the backdrop itself (not the content)
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
      onClick={handleBackdropClick} // Add click handler to the backdrop
    >
      <div 
        ref={modalContentRef} // This ref is not strictly needed for this specific change but can be useful for other interactions
        className="bg-background p-6 rounded-lg shadow-xl max-w-2xl w-full relative"
        // Stop propagation to prevent backdrop click when clicking inside content.
        // This is an alternative to checking event.target === event.currentTarget in handleBackdropClick
        // onClick={(e) => e.stopPropagation()} 
      >
        <button 
          onClick={onClose} 
          className="absolute top-3 right-3 text-foreground/70 hover:text-foreground text-2xl"
          aria-label="Close modal"
        >
          &times; {/* A simple 'x' icon */}
        </button>
        <h2 className="text-3xl font-semibold mb-4 text-foreground">{movie.title}</h2>
        {/* You can reuse parts of MovieCard's layout or create a new one */}
        <img src={movie.image} alt={movie.title} className="w-full h-auto object-contain rounded mb-4 max-h-96" />
        <p className="text-foreground/80 mb-2"><strong>Rating:</strong> {movie.rating.toFixed(1)}</p>
        {/* Add more movie details here */}
        {movie.releaseDate && <p className="text-foreground/80 mb-2"><strong>Release Date:</strong> {movie.releaseDate}</p>}
        {movie.director && <p className="text-foreground/80 mb-2"><strong>Director:</strong> {movie.director}</p>}
        <p className="text-foreground/70 text-sm mt-4">{movie.description}</p>
        {/* Add more sections as needed: Cast, Reviews, etc. */}
      </div>
    </div>
  );
};

export default MovieModal; 