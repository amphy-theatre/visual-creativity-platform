
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { event_name, user_id, properties } = await req.json();
    
    // Get IP address from request headers
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = req.headers.get('user-agent') || 'unknown';
    
    // Enrich page_view events with more detailed information
    if (event_name === 'page_view') {
      properties.browser_info = extractBrowserInfo(userAgent);
    }
    
    // Create Supabase client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') || '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    );
    
    // Store analytics data
    const { data, error } = await supabaseAdmin
      .from('usage_analytics')
      .insert({
        event_name: event_name,
        user_id: user_id || 'anonymous',
        is_anonymous: user_id === 'anonymous',
        properties: {
          ...properties,
          ip_address: clientIP,
          user_agent: userAgent,
          timestamp: new Date().toISOString()
        }
      });
    
    if (error) throw error;
    
    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('Error tracking analytics:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An unexpected error occurred' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Helper function to extract browser info from user agent
function extractBrowserInfo(userAgent: string): Record<string, string> {
  const info: Record<string, string> = { full: userAgent };
  
  try {
    // Extract browser name
    if (userAgent.includes('Firefox/')) {
      info.browser = 'Firefox';
    } else if (userAgent.includes('Chrome/')) {
      info.browser = 'Chrome';
    } else if (userAgent.includes('Safari/') && !userAgent.includes('Chrome/')) {
      info.browser = 'Safari';
    } else if (userAgent.includes('Edge/')) {
      info.browser = 'Edge';
    } else if (userAgent.includes('MSIE ') || userAgent.includes('Trident/')) {
      info.browser = 'Internet Explorer';
    } else {
      info.browser = 'Unknown';
    }
    
    // Extract device type (mobile vs desktop)
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      info.device_type = 'Mobile';
    } else {
      info.device_type = 'Desktop';
    }
    
    // Extract OS info
    if (userAgent.includes('Windows')) {
      info.os = 'Windows';
    } else if (userAgent.includes('Mac OS')) {
      info.os = 'macOS';
    } else if (userAgent.includes('Linux')) {
      info.os = 'Linux';
    } else if (userAgent.includes('Android')) {
      info.os = 'Android';
    } else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) {
      info.os = 'iOS';
    } else {
      info.os = 'Unknown';
    }
  } catch (e) {
    // In case of any errors in parsing, return basic info
    return { full: userAgent };
  }
  
  return info;
}
