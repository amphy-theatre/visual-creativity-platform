
import React from "react";
import Layout from "../components/Layout";
import GuestMoodInput from "../components/GuestMoodInput";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";
import { LogIn } from "lucide-react";

const Guest: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="space-y-16 pb-12">
        <div className="text-center space-y-4 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">Try Our Mood-Based Movie Recommender</h1>
          <p className="text-xl text-foreground/70">One free recommendation, no account required</p>
          
          <Button 
            variant="outline" 
            onClick={() => navigate("/auth")}
            className="mt-4 flex items-center gap-2"
          >
            <LogIn className="h-4 w-4" />
            Sign in for full access
          </Button>
        </div>
        
        <GuestMoodInput />
      </div>
    </Layout>
  );
};

export default Guest;
