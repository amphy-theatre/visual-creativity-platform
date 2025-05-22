import React, { useState, useEffect } from 'react';

// RE-ADDED and UPDATED: Helper function to format runtime
const formatRuntime = (runtimeInput: string | number): string => {
  if (!runtimeInput) {
    return '';
  }
  let totalMinutes: number;
  if (typeof runtimeInput === 'number') {
    totalMinutes = runtimeInput;
  } else {
    const minutesMatch = runtimeInput.match(/(\\d+)/); // Extracts digits
    if (!minutesMatch || !minutesMatch[1]) {
      return runtimeInput; // Return original if number not found
    }
    totalMinutes = parseInt(minutesMatch[1], 10);
  }

  if (isNaN(totalMinutes) || totalMinutes <= 0) {
    return typeof runtimeInput === 'string' ? runtimeInput : ''; // Return original string or empty
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  let formatted = "";
  if (hours > 0) {
    formatted += `${hours}h`;
  }
  if (minutes > 0) {
    if (hours > 0) formatted += " ";
    formatted += `${minutes}m`;
  }
  return formatted || (typeof runtimeInput === 'string' ? runtimeInput : `${totalMinutes}m`); // Fallback
};

export interface ExpandedMovieDetails {
  title: string,
  overview: string,
  genres: string[],
  runtime: string,
  directors: string[],
  starring: string[],
  video: string,
  backdrop: string,
}

interface MovieModalProps {
  movie: ExpandedMovieDetails | null;
  isOpen: boolean;
  onClose: () => void;
}

const MovieModal: React.FC<MovieModalProps> = ({ movie, isOpen, onClose }) => {
  const [playVideo, setPlayVideo] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Delay setting visibility to allow for CSS transition
      const timer = setTimeout(() => {
        setIsModalVisible(true);
      }, 50); // Small delay to ensure the element is in the DOM before transitioning
      return () => clearTimeout(timer);
    } else {
      setIsModalVisible(false);
    }
  }, [isOpen]);

  if (!isOpen && !isModalVisible) { // Keep modal in DOM during fade-out
    return null;
  }

  const handleClose = () => {
    setIsModalVisible(false); // Start fade-out
    // Delay actual close to allow for fade-out transition
    setTimeout(() => {
      setPlayVideo(false);
      onClose();
    }, 300); // Match this duration to your CSS transition
  };

  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      handleClose();
    }
  };


  return (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-75 z-50 flex justify-center items-center p-4 transition-opacity duration-300 ease-in-out ${isModalVisible && isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-background text-foreground rounded-lg shadow-xl w-full max-w-3xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full aspect-video">
          {(!playVideo && movie.backdrop) && (
            <>
              <div className="w-full h-full overflow-hidden">
                <img 
                  src={movie.backdrop} 
                  alt={`Backdrop for ${movie.title}`} 
                  className="w-full h-full object-cover object-top"
                />
              </div>
              {movie.video && (
                <div 
                  className="absolute inset-0 flex justify-center items-center cursor-pointer group bg-black bg-opacity-20 hover:bg-opacity-10 transition-colors"
                  onClick={() => setPlayVideo(true)}
                  aria-label="Play trailer"
                >
                  <svg className="w-16 h-16 md:w-20 md:h-20 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transform transition-all duration-300" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"></path></svg>
                </div>
              )}
            </>
          )}

          {(playVideo && movie.video) && (
            <div className="w-full h-full">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${movie.video}?autoplay=1&rel=0&modestbranding=1`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          )}
          
          {(!movie.backdrop && !playVideo) && (
            <div className="w-full h-full flex justify-center items-center text-neutral-400">
              <p>No preview available</p>
            </div>
          )}

          {/* Title Overlay: Shown only when video is NOT playing */}
          {(!playVideo) && (
            <div className="absolute bottom-0 left-0 right-0 px-4 md:px-6 bg-gradient-to-t from-background via-background/80 to-transparent">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold">{movie.title}</h2>
            </div>
          )}
        </div>
        
        {/* Movie details section: Overview and other info - always visible below image/video */}
        <div className="p-4 md:p-6">
          {/* Overview - Moved here, conditionally rendered to avoid duplication if part of an overlay elsewhere, but now it's standalone */}
          <p className="text-xs sm:text-lg mb-3 md:mb-4 max-h-24 sm:max-h-28 md:max-h-32 overflow-y-auto leading-relaxed">
            {movie.overview}
          </p>
          
          <div className="text-md sm:text-md space-y-1">
            {movie.genres && movie.genres.length > 0 && 
              <div><strong>Genres:</strong> {movie.genres.join(', ')}</div>}
            {movie.runtime && 
              <div><strong>Runtime:</strong> {formatRuntime(movie.runtime)}</div>} {/* MODIFIED: Used updated formatRuntime */}
            {movie.directors && movie.directors.length > 0 && (
              <div><strong>Director{movie.directors.length > 1 ? 's' : ''}:</strong> {movie.directors.join(', ')}</div>
            )}
            {movie.starring && movie.starring.length > 0 && (
              <div><strong>Starring:</strong> {movie.starring.join(', ')}</div>
            )}
          </div>
        </div>

        <button 
          onClick={handleClose} 
          className="absolute top-3 right-3 text-white bg-black/50 hover:bg-black/75 rounded-full w-8 h-8 md:w-9 md:h-9 flex items-top justify-center text-xl md:text-2xl z-20 transition-colors" // ENSURED: items-center
          aria-label="Close modal"
        >
          &times;
        </button>
      </div>
    </div>
  );
};

export default MovieModal; 