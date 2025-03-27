
import { useState, useEffect } from "react";
import { supabase } from "../integrations/supabase/client";
import { useAuth } from "../context/AuthContext";

// Cache object to store preferences by user ID
const preferencesCache: Record<string, { data: string | null; timestamp: number }> = {};
// Cache expiration time (5 minutes)
const CACHE_EXPIRATION_MS = 5 * 60 * 1000;

/**
 * Custom hook to fetch user preferences from file_summaries table with caching
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
      
      // Check if we have a valid cached value
      const cachedData = preferencesCache[user.id];
      const now = Date.now();
      
      if (cachedData && (now - cachedData.timestamp) < CACHE_EXPIRATION_MS) {
        console.log('Using cached user preferences');
        setUserPreferences(cachedData.data);
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
          
          // Cache the result
          preferencesCache[user.id] = {
            data: data.summary,
            timestamp: now
          };
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
