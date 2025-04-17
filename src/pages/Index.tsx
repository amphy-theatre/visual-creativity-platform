import React, { useState } from "react";
import Layout from "../components/Layout";
import PresetMood from "../components/PresetMood";
import FreeTrialBanner from "../components/FreeTrialBanner";
import AnimatedText from "../components/AnimatedText";
import { useAuth } from "../context/AuthContext";
import { phrases } from "../phrases";
import TextAreaInput from "../components/TextAreaInput";
import SubmitButton from "../components/SubmitButton";
import CSVUploader from "../components/CSVUploader";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

const Index: React.FC = () => {
  const { isGuestMode } = useAuth();
  const [showAnimatedText, setShowAnimatedText] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [csvData, setCsvData] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAnimatedTextClick = () => {
    setShowAnimatedText(false);
  };
  
  const handleInputChange = (value: string) => {
    setInputValue(value);
  };
  
  const handleCsvDataChange = (data: string | null) => {
    setCsvData(data);
  };
  
  const handleSubmit = () => {
    if (!inputValue.trim() && !csvData) {
      toast({
        title: "Error",
        description: "Please enter a mood or upload a CSV file",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    // Store the input value in session storage for use in the quotes page
    sessionStorage.setItem("userMood", inputValue);
    
    // Navigate to the quotes page
    navigate("/quotes");
  };
  
  return (
    <Layout>
      <div className="space-y-16 pb-12">
        {isGuestMode && <FreeTrialBanner />}
        
        <div className="text-center space-y-4 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground relative">
              <div className="min-h-[120px] flex items-center justify-center">
                <AnimatedText 
                  texts={phrases}
                  typingSpeed={80} 
                  deletingSpeed={40} 
                  delayBetweenTexts={2000}
                  className="w-full"
                  onTextClick={handleAnimatedTextClick}
                />
              </div>
          </h1>
          
          <SubmitButton
            onClick={handleSubmit}
            isLoading={isLoading}
            isDisabled={!inputValue.trim() && !csvData}
            />
          
          <CSVUploader onCsvDataChange={handleCsvDataChange} />
        </div>
        
        <div className="space-y-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          <div className="text-lg text-foreground/80">Or choose a preset prompt:</div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <PresetMood 
              title="Inspiration" 
              genre="inspiration" 
              description="Something uplifting"
            />
            <PresetMood 
              title="Thriller" 
              genre="thriller" 
              description="A gripping adventure"
            />
            <PresetMood 
              title="Drama" 
              genre="drama" 
              description="A heartbreaking story"
            />
            <PresetMood 
              title="Romance" 
              genre="romance" 
              description="Something romantic"
            />
            <PresetMood 
              title="Philosophical" 
              genre="philosophical" 
              description="A thought-provoking film"
            />
            <PresetMood 
              title="Comedy" 
              genre="comedy" 
              description="Something lighthearted"
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Index;
