import React, { useState } from "react";
import Layout from "../components/Layout";
import PresetMood from "../components/PresetMood";
import MoodInput from "../components/MoodInput";
import { useAuth } from "../context/AuthContext";
import AnimatedText from "@/components/AnimatedText";
import PricingModal from "@/components/PricingModal/PricingModal";
import { SubscriptionProvider } from "@/context/SubscriberContext";
import CSVUploader from "@/components/CSVUploader";
import {
  Lightbulb,
  Compass,
  Heart,
  HeartCrack,
  BookOpen,
  Smile,
} from "lucide-react";

const Index: React.FC = () => {
  const { isGuestMode, isTrialUsed, showPricingModal, setShowPricingModal } = useAuth();
  const [inputValue, setInputValue] = useState("");
  const [csvData, setCsvData] = useState<string | null>(null);
  const handleInputChange = (value: string) => {
    setInputValue(value);
  };

  return (
    <Layout>
      <div className="space-y-10 pb-12">        
        {/* Pricing Modal controlled by AuthContext's showPricingModal state */}
        <PricingModal 
          isOpen={showPricingModal} 
          onClose={() => setShowPricingModal(false)} 
        />
        
        <div className="text-center space-y-2 animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold text-center text-foreground mb-2 animate-fade-in">
            amphytheatre
          </h1>
          <h2 className="text-3xl md:text-4xl text-center text-foreground/80 mb-12 animate-fade-in">
            movies to match your mood
          </h2>

          <h1 className="text-4xl md:text-3xl text-foreground relative">
            {/* <AnimatedText 
              texts={phrases}
              typingSpeed={80} 
              deletingSpeed={40} 
              delayBetweenTexts={2000}
              className="inline-block"
            /> */}
          </h1>
            <MoodInput initialValue={inputValue}/>
        </div>
        
        <div className="opacity-75 flex-row w-[80%] mx-auto">
          <div className="space-y-6 animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="text-xl text-foreground/80">Or choose a preset prompt:</div>
            
            <div className="flex flex-wrap gap-3 pb-2">
              <PresetMood 
                title="Inspiration" 
                genre="inspiration" 
                description="Something uplifting"
                icon={<Lightbulb />}
              />
              <PresetMood 
                title="Thriller" 
                genre="thriller" 
                description="A gripping adventure"
                icon={<Compass />}
              />
              <PresetMood 
                title="Drama" 
                genre="drama" 
                description="A heartbreaking story"
                icon={<HeartCrack />}
              />
              <PresetMood 
                title="Romance" 
                genre="romance" 
                description="Something romantic"
                icon={<Heart />}
              />
              <PresetMood 
                title="Philosophical" 
                genre="philosophical" 
                description="A thought-provoking film"
                icon={<BookOpen />}
              />
              <PresetMood 
                title="Comedy" 
                genre="comedy" 
                description="Something lighthearted"
                icon={<Smile />}
              />
            </div>
          </div>
        </div>

        <SubscriptionProvider>
          <CSVUploader onCsvDataChange={setCsvData}/>
        </SubscriptionProvider>
      </div>
    </Layout>
  );
};

export default Index;
