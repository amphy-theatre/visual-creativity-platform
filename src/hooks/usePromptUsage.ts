
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";

// Number of prompts allowed per month - easy to change
export const MONTHLY_PROMPT_LIMIT = 75;

export type PromptUsageType = {
  prompt_count: number;
  limit_reached: boolean;
  remaining: number;
  monthly_limit: number;
};

export const usePromptUsage = () => {
  const [promptUsage, setPromptUsage] = useState<PromptUsageType>({
    prompt_count: 0,
    limit_reached: false,
    remaining: MONTHLY_PROMPT_LIMIT,
    monthly_limit: MONTHLY_PROMPT_LIMIT,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchPromptUsage = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.rpc("get_prompt_usage", {
          uid: user.id,
          monthly_limit: MONTHLY_PROMPT_LIMIT,
        });

        if (error) {
          console.error("Error fetching prompt usage:", error);
          return;
        }

        // Type assertion to ensure the data matches our expected structure
        const usage = data as PromptUsageType;
        setPromptUsage(usage);

        // Show the modal if user has reached their limit
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
  }, [user]);

  const incrementPromptCount = async () => {
    if (!user) return null;

    try {
      const { data: usageData, error: usageError } = await supabase.rpc(
        "increment_prompt_count",
        {
          uid: user.id,
          monthly_limit: MONTHLY_PROMPT_LIMIT,
        }
      );

      if (usageError) {
        throw new Error(`Failed to update prompt usage: ${usageError.message}`);
      }

      // Update local state with the new prompt usage, with type assertion
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
