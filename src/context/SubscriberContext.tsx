// Example: src/context/SubscriptionContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client'; // Adjust path

type SubscriptionStatus = {
    cancel_at_period_end: boolean;
    tier: 'free' | 'premium' | null; // Allow null for initial/no user state
    loading: boolean;
    canRender: () => boolean,
    cancelledButActive: () => boolean,
    
};


const SubscriptionContext = createContext<SubscriptionStatus | undefined>(undefined);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    // Initialize with loading true and tier null
    const [ cancelPeriodEnd, setCancelPeriodEnd ] = useState(false);
    const [ tier, setTier ] = useState<'free'|'premium'|null>(null);
    const [ loading, setLoading ] = useState(true);
    
    const canRender = () => {
        return (!loading && tier === `premium`)
    };

    const cancelledButActive = () => {
        return (tier === `premium` && cancelPeriodEnd === true) 
    };

    const fetchSubscription = async () => {
        if (!user) { // Ensure user exists before fetching
            setCancelPeriodEnd(false);
            setTier(null);
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            // Explicitly type the expected data shape from .single()
            const { data, error } = await supabase
            .from('profiles')
            .select('subscription_tier, subscription_status, cancel_at_period_end')
            .eq('id', user.id)
            .single<{
                subscription_tier: string | null,
                subscription_status: string | null,
                cancel_at_period_end: boolean | null,
            }>();
    
            if (error) throw error;

            // Ensure data is not null before accessing properties
            const tierValue = data?.subscription_tier === 'premium' && data?.subscription_status !== 'canceled' 
                ? data.subscription_tier 
                : 'free';

            setCancelPeriodEnd(!!(data?.cancel_at_period_end));
            setTier(tierValue as 'free' | 'premium');
            setLoading(false);
        } catch (error) {
            console.error("Error fetching subscription:", error);
            setCancelPeriodEnd(false);
            setTier('free');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubscription();
    }, [user]); // Re-fetch when user changes

    return (
    <SubscriptionContext.Provider value={{
        cancel_at_period_end: cancelPeriodEnd,
        tier: tier,
        loading: loading,
        canRender: canRender,
        cancelledButActive: cancelledButActive,
    }}>
        {children}
    </SubscriptionContext.Provider>
    );
};

export const useSubscription = () => {
    const context = useContext(SubscriptionContext);
    if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
    }
    return context;
};
