import React from 'react';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div className="relative w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 bg-background p-6 md:p-8 rounded-lg shadow-xl transform transition-all duration-300 ease-out translate-y-full data-[state=open]:translate-y-0" data-state={isOpen ? 'open' : 'closed'}>
        {/* Casual Tier */}
        <div className="bg-card p-6 rounded-lg flex flex-col">
          <h3 className="text-2xl font-fredoka font-semibold text-foreground mb-1">Casual</h3>
          <p className="text-5xl font-fredoka font-bold text-foreground mb-1">Free</p>
          <div className="h-px bg-border my-4"></div>
          <p className="text-lg font-semibold text-foreground mb-3">Includes</p>
          <ul className="space-y-2 text-muted-foreground mb-6">
            <li className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
              Pro two-week trial
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
              2000 completions
            </li>
            <li className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
              50 slow requests
            </li>
          </ul>
          <div className="mt-auto grid grid-cols-2 gap-3">
            <button className="bg-primary text-primary-foreground hover:bg-primary/90 font-fredoka font-medium py-3 px-4 rounded-md flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
              Download
            </button>
            <button className="bg-secondary text-secondary-foreground hover:bg-secondary/80 font-fredoka font-medium py-3 px-4 rounded-md">
              Others
            </button>
          </div>
        </div>

        {/* Buff Tier */}
        <div className="relative p-px rounded-lg rainbow-border-container">
          <div className="bg-card p-6 rounded-lg flex flex-col h-full">
            <h3 className="text-2xl font-fredoka font-semibold text-foreground mb-1">Buff</h3>
            <div className="flex items-baseline mb-1">
              <p className="text-5xl font-fredoka font-bold text-foreground mr-1">$20</p>
              <span className="text-muted-foreground">/month</span>
            </div>
            <div className="h-px bg-border my-4"></div>
            <p className="text-lg font-semibold text-foreground mb-3">Everything in Casual, plus</p>
            <ul className="space-y-2 text-muted-foreground mb-6">
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                Unlimited completions
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                500 requests per month
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                Unlimited slow requests <span className="ml-1 text-muted-foreground/70">(?)</span>
              </li>
              <li className="flex items-center">
                <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                Max mode <span className="ml-1 text-muted-foreground/70">(?)</span>
              </li>
            </ul>
            <div className="mt-auto">
              <button className="w-full bg-white text-black hover:bg-white/90 font-fredoka font-semibold py-3 px-4 rounded-md">
                Get Started
              </button>
            </div>
          </div>
        </div>
        
        {/* Close button for mobile */}
        <button 
            onClick={onClose} 
            className="md:hidden absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            aria-label="Close pricing modal"
        >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
      </div>
    </div>
  );
};

export default PricingModal; 