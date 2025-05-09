
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14?target=denonext';
import { createClient } from 'https://esm.sh/@supabase/supabase-js?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }
    
  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, { apiVersion: '2024-04-10' });
  
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') as string,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
  );

  const { userId, tier } = await req.json();

  // Ensure the user has a Stripe customer ID
  const { data: userRec } = await supabase
    .from('users')
    .select('stripe_customer_id')
    .eq('id', userId)
    .single();

  let customerId = userRec?.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({ metadata: { userId } });
    customerId = customer.id;
    await supabase.from('users').update({ stripe_customer_id: customerId }).eq('id', userId);
  }

  // Create subscription in `default_incomplete` mode to get PaymentIntent
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: tier }],
    payment_behavior: 'default_incomplete',
    expand: ['latest_invoice.payment_intent'],
    metadata: { userId, tier }
  });

  // Persist subscription record immediately
  await supabase.from('subscriptions').insert({
    user_id: userId,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    tier,
    status: subscription.status,
    current_period_start: new Date((subscription.current_period_start as number) * 1000),
    current_period_end: new Date((subscription.current_period_end as number) * 1000),
    cancel_at_period_end: subscription.cancel_at_period_end,
    created_at: new Date(),
    updated_at: new Date(),
  });

  // Return the PaymentIntent client secret for Elements
  const clientSecret = subscription.latest_invoice?.payment_intent?.client_secret;
  return new Response(
    JSON.stringify({ clientSecret }),
    {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    }
  );
});
