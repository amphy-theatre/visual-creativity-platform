
import React from "react";
import Layout from "../components/Layout";
import GuestMoodInput from "../components/GuestMoodInput";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";

const GuestExperience: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <Layout>
      <div className="space-y-16 pb-12">
        <div className="text-center space-y-4 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">Try a free recommendation</h1>
          <p className="text-xl text-foreground/70">How are you feeling today?</p>
        </div>
        
        <GuestMoodInput />
        
        <div className="text-center animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <p className="mb-4 text-foreground/70">Want more features?</p>
          <Button onClick={() => navigate("/auth")} variant="outline">
            Sign up for unlimited recommendations
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default GuestExperience;
