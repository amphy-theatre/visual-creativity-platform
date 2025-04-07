
import { useCallback } from "react";
import { useAuth } from "@/context/AuthContext";

export type AnalyticsEvent = 
  | 'quotes_generated'
  | 'movies_generated'
  | 'page_view'
  | 'button_click';

export const useAnalytics = () => {
  const { user } = useAuth();
  
  const trackEvent = useCallback(async (
    eventName: AnalyticsEvent,
    properties: Record<string, any> = {}
  ) => {
    try {
      await fetch('https://sdwuhuuyyrwzwyqdtdkb.supabase.co/functions/v1/track_analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_name: eventName,
          user_id: user?.id || null,
          properties: properties
        }),
      });
    } catch (error) {
      // Silent fail for analytics to not disrupt user experience
      console.error('Analytics error:', error);
    }
  }, [user]);
  
  return { trackEvent };
};
