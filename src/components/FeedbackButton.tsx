
import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

const FeedbackButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const handleSubmit = async () => {
    if (!feedback.trim()) {
      toast({
        title: "Feedback is empty",
        description: "Please enter your feedback before submitting",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { error } = await supabase.from('feedback').insert({
        feedback_text: feedback,
        user_id: user?.id || null,
      });

      if (error) throw error;
      
      toast({
        title: "Thank you for your feedback!",
        description: "We appreciate your input.",
      });
      
      setOpen(false);
      setFeedback('');
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Error submitting feedback",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setOpen(false);
    setFeedback('');
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <Button 
          onClick={() => setOpen(true)}
          className="rounded-full h-14 w-14 shadow-lg hover:shadow-xl transition-all duration-300 bg-primary"
          aria-label="Leave feedback"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px] bg-[#0A0F1D] border-zinc-800">
          <DialogHeader>
            <DialogTitle className="text-xl text-white">Share your feedback</DialogTitle>
            <DialogDescription className="text-gray-400">
              We'd love to hear your thoughts on how we can improve your experience.
            </DialogDescription>
          </DialogHeader>
          
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Tell us what you think..."
            className="min-h-[150px] border-zinc-700 bg-[#0A0F1D] text-white focus:ring-offset-0"
          />
          
          <div className="flex justify-end gap-3 mt-2">
            <Button 
              variant="outline" 
              onClick={handleCancel} 
              className="text-white border-zinc-700"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting}
              className="bg-white text-black hover:bg-gray-200"
            >
              Submit Feedback
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default FeedbackButton;
