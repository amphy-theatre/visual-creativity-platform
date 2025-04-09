
import React from "react";
import { Instagram, Youtube } from "lucide-react";
import { Link } from "react-router-dom";

const TiktokIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-tiktok">
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"></path>
  </svg>
);

const Footer: React.FC = () => {
  return (
    <footer className="w-full py-4 bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} amphytheatre. All rights reserved.
          </div>
          
          <div className="flex items-center gap-6">
            <a 
              href="https://www.instagram.com/amphytheatre_movierecs/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-foreground hover:text-primary transition-colors duration-200"
              aria-label="Instagram"
            >
              <Instagram size={20} />
            </a>
            <a 
              href="https://www.tiktok.com/@amphytheatre_movierecs?_t=ZM-8vNJV9deQ9V&_r=1" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-foreground hover:text-primary transition-colors duration-200"
              aria-label="TikTok"
            >
              <TiktokIcon />
            </a>
            <a 
              href="https://www.youtube.com/@Amphytheatre" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-foreground hover:text-primary transition-colors duration-200"
              aria-label="YouTube"
            >
              <Youtube size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
