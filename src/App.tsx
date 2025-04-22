import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import Index from "./pages/Index";
import QuoteSelection from "./pages/QuoteSelection";
import Recommendations from "./pages/Recommendations";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import { AuthProvider } from "./context/AuthContext";
import { DebugProvider } from "./context/DebugContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { useEffect } from "react";
import { useAnalytics } from "./hooks/useAnalytics";

const queryClient = new QueryClient();

// Analytics wrapper component
const AnalyticsTracker = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const { trackEvent } = useAnalytics();
  
  useEffect(() => {
    // Track page view for each route change with detailed path information
    trackEvent('page_view', {
      path: location.pathname,
      search: location.search,
      title: document.title || 'Unknown Page',
      referrer: document.referrer || 'Direct Navigation'
    });
  }, [location.pathname, location.search, trackEvent]);
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HashRouter>
      <AuthProvider>
        <DebugProvider>
          <ThemeProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/auth" element={<Auth />} />
                <Route path="/" element={
                  <ProtectedRoute>
                    <AnalyticsTracker>
                      <Index />
                    </AnalyticsTracker>
                  </ProtectedRoute>
                } />
                <Route path="/quotes" element={
                  <ProtectedRoute>
                    <AnalyticsTracker>
                      <QuoteSelection />
                    </AnalyticsTracker>
                  </ProtectedRoute>
                } />
                <Route path="/recommendations" element={
                  <ProtectedRoute>
                    <AnalyticsTracker>
                      <Recommendations />
                    </AnalyticsTracker>
                  </ProtectedRoute>
                } />
                {/* This catch-all route ensures any unknown routes are handled by NotFound */}
                <Route path="*" element={
                  <ProtectedRoute>
                    <AnalyticsTracker>
                      <NotFound />
                    </AnalyticsTracker>
                  </ProtectedRoute>
                } />
              </Routes>
            </TooltipProvider>
          </ThemeProvider>
        </DebugProvider>
      </AuthProvider>
    </HashRouter>
  </QueryClientProvider>
);

export default App;
