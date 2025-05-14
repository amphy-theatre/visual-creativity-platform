import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useSubscription } from "@/context/SubscriberContext";

// Number of prompts allowed per month - easy to change
export const MONTHLY_PROMPT_LIMIT = 50;
export const MONTHLY_PROMPT_LIMIT_PREMIUM = 200;

export type PromptUsageType = {
  prompt_count: number;
  limit_reached: boolean;
  remaining: number;
  monthly_limit: number;
};

export const usePromptUsage = () => {
  const { user } = useAuth();
  const { canRender } = useSubscription();
  const monthlyLimit = canRender() ? MONTHLY_PROMPT_LIMIT_PREMIUM : MONTHLY_PROMPT_LIMIT;
  const [promptUsage, setPromptUsage] = useState<PromptUsageType>({
    prompt_count: 0,
    limit_reached: false,
    remaining: monthlyLimit,
    monthly_limit: monthlyLimit,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showLimitModal, setShowLimitModal] = useState(false);

  useEffect(() => {
    const fetchPromptUsage = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc("get_prompt_usage", {
          uid: user.id,
          monthly_limit: monthlyLimit, 
        });

        if (error) {
          console.error("Error fetching prompt usage:", error);
          return;
        }

        const usage = data as PromptUsageType;
        setPromptUsage(usage);

        if (usage.limit_reached) {
          setShowLimitModal(true);
        }
      } catch (err) {
        console.error("Failed to fetch prompt usage:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPromptUsage();
  }, [user, canRender]);

  const incrementPromptCount = async () => {
    if (!user) return null;

    try {
      const { data: usageData, error: usageError } = await supabase.rpc(
        "increment_prompt_count",
        {
          uid: user.id,
          monthly_limit: monthlyLimit,
        }
      );

      if (usageError) {
        throw new Error(`Failed to update prompt usage: ${usageError.message}`);
      }

      const updatedUsage = usageData as PromptUsageType;
      setPromptUsage(updatedUsage);

      return updatedUsage;
    } catch (error) {
      console.error("Error incrementing prompt count:", error);
      return null;
    }
  };

  return {
    promptUsage,
    isLoading,
    showLimitModal,
    setShowLimitModal,
    incrementPromptCount,
  };
};
