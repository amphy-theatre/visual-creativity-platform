
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
        
        // Add page name based on path for better readability in analytics
        const pageName = getPageNameFromPath(properties.path || '');
        properties.page_name = pageName;
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
  
  // Helper function to map paths to readable page names
  const getPageNameFromPath = (path: string): string => {
    switch (path) {
      case '/':
        return 'Home';
      case '/quotes':
        return 'Quote Selection';
      case '/recommendations':
        return 'Movie Recommendations';
      case '/auth':
        return 'Authentication';
      default:
        if (path === '/*' || !path) {
          return 'Not Found';
        }
        // For any unknown paths, return a cleaned version of the path
        return path.replace(/^\//, '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };
  
  return { trackEvent };
};
