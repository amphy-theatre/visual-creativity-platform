
import React from "react";
import Header from "./Header";
import FeedbackButton from "./FeedbackButton";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Header />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
        {children}
      </main>
      <FeedbackButton />
    </div>
  );
};

export default Layout;
