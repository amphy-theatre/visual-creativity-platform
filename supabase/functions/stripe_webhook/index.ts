import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14?target=denonext';
import { createClient } from 'https://esm.sh/@supabase/supabase-js?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Initialize Stripe and Supabase clients
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, { apiVersion: '2024-04-10' });
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') as string,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
);

const cryptoProvider = Stripe.createSubtleCryptoProvider()

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  const signature = req.headers.get('stripe-signature');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') as string;
  if (!signature || !webhookSecret) {
    return new Response('Missing Stripe signature or webhook secret',
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }

  const payload = await req.text();
  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(payload, signature, webhookSecret, undefined, cryptoProvider);
  } catch (err) {
    console.error('Webhook signature verification failed.', err.message);
    return new Response(`Webhook Error: ${err.message}`,
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }

  console.log("received", event);
  
  try {
    switch (event.type) {
      // Subscription creation (custom flow)
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        const { data, error } = await supabase.from('subscriptions').insert({
          user_id: subscription.metadata?.userId,
          stripe_customer_id: subscription.customer,
          stripe_subscription_id: subscription.id,
          tier: `free`,
          status: subscription.status,
          current_period_start: new Date((subscription.items.data[0].current_period_start as number) * 1000),
          current_period_end: new Date((subscription.items.data[0].current_period_end as number) * 1000),
          cancel_at_period_end: subscription.cancel_at_period_end,
          created_at: new Date(),
          updated_at: new Date(),
        }).select();
        console.log("insertion complete", data, error)
        break;
      }
      // Payment success: activates or renews subscription
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.parent.subscription_details.subscription;
        const { data: subRec } = await supabase
          .from('subscriptions')
          .select('id, user_id')
          .eq('stripe_subscription_id', subscriptionId as string)
          .single();
        if (!subRec) break;

        const paymentIntent = invoice.payment_intent
          ? await stripe.paymentIntents.retrieve(invoice.payment_intent as string)
          : null;
        const { data, error } = await supabase.from('payments').insert({
          subscription_id: subRec.id,
          stripe_payment_intent_id: invoice.payment_intent as string,
          amount: invoice.amount_paid,
          currency: invoice.currency,
          status: 'succeeded',
          method_details: paymentIntent?.charges.data[0].payment_method_details || {},
          created_at: new Date(),
        }).select();
        console.log("added payment", data, error)

        await supabase.from('subscriptions').update({
          status: 'active',
          tier: 'premium',
          current_period_start: new Date((invoice.lines.data[0].period?.start as number) * 1000),
          current_period_end: new Date((invoice.lines.data[0].period?.end as number) * 1000),
          updated_at: new Date(),
        }).eq('stripe_subscription_id', subscriptionId as string);

        await supabase.from('users').update({ subscription_status: 'active'})
          .eq('id', subRec.user_id);
        break;
      }

      // Payment failure: mark subscription past due
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const subscriptionId = invoice.parent.subscription_details.subscription;
        const { data: subRec } = await supabase
          .from('subscriptions')
          .select('id, user_id')
          .eq('stripe_subscription_id', subscriptionId as string)
          .single();
        if (!subRec) break;

        const { data, error } = await supabase.from('payments').insert({
          subscription_id: subRec.id,
          stripe_payment_intent_id: invoice.payment_intent as string,
          amount: invoice.amount_paid,
          currency: invoice.currency,
          status: 'failed',
          method_details: {},
          created_at: new Date(),
        }).select();
        console.log("created payments", data, error)

        await supabase.from('subscriptions').update({ status: 'past_due', updated_at: new Date() })
          .eq('stripe_subscription_id', subscriptionId as string);
        await supabase.from('users').update({ subscription_status: 'past_due'})
          .eq('id', subRec.user_id);
        break;
      }

      // Subscription cancellation
      case 'customer.subscription.deleted': {
        const canceled = event.data.object as Stripe.Subscription;
        await supabase.from('subscriptions').update({
          status: 'cancelled',
          canceled_at: new Date((canceled.canceled_at as number) * 1000),
          cancel_at_period_end: canceled.cancel_at_period_end,
          updated_at: new Date(),
        }).eq('stripe_subscription_id', canceled.id);

        const { data: subInfo } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', canceled.id)
          .single();
        if (subInfo) {
          await supabase.from('users').update({ subscription_status: 'free' })
            .eq('id', subInfo.user_id);
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (err) {
    console.error('Error handling webhook event', err);
    return new Response('Internal Server Error',
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    );
  }
});
