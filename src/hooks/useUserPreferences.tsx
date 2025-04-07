
import { useState, useEffect } from "react";
import { supabase } from "../integrations/supabase/client";
import { useAuth } from "../context/AuthContext";

/**
 * Custom hook to fetch user preferences from file_summaries table
 * @returns {Object} User preferences data and loading state
 */
export const useUserPreferences = () => {
  const [userPreferences, setUserPreferences] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserPreferences = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('file_summaries')
          .select('summary')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
        
        if (error) {
          console.log('No file summaries found or error:', error);
          setUserPreferences(null);
        } else if (data) {
          console.log('Found user preferences from file summary:', data.summary);
          setUserPreferences(data.summary);
        }
      } catch (error) {
        console.error('Error fetching user preferences:', error);
        setUserPreferences(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserPreferences();
  }, [user]);

  return { userPreferences, isLoading };
};
