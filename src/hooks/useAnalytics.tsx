
import { useCallback, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";

export type AnalyticsEvent = 
  | 'quotes_generated'
  | 'movies_generated'
  | 'page_view'
  | 'button_click';

export const useAnalytics = () => {
  const { user } = useAuth();
  const viewedPages = useRef<Set<string>>(new Set());
  
  const trackEvent = useCallback(async (
    eventName: AnalyticsEvent,
    properties: Record<string, any> = {}
  ) => {
    try {
      // For page_view events, check if we've already tracked this page
      if (eventName === 'page_view') {
        const pageKey = `${properties.path || ''}${properties.search || ''}`;
        if (viewedPages.current.has(pageKey)) {
          // Skip tracking duplicate page views
          return;
        }
        // Mark this page as viewed
        viewedPages.current.add(pageKey);
      }
      
      await fetch('https://sdwuhuuyyrwzwyqdtdkb.supabase.co/functions/v1/track_analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          event_name: eventName,
          user_id: user?.email || "anonymous",
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
