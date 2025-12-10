
import { useEffect, useState } from 'react';

export interface SubscriptionStatus {
  isActive: boolean;
  isExpired: boolean;
  isLimitReached: boolean;
  status: 'trial' | 'active' | 'past_due' | 'canceled' | 'expired' | null;
  plan: {
    displayName: string;
    jobLimit: number;
    jobsCreatedThisMonth: number;
  } | null;
  trialEndDate: Date | null;
  endDate: Date | null;
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionStatus>({
    isActive: true,
    isExpired: false,
    isLimitReached: false,
    status: null,
    plan: null,
    trialEndDate: null,
    endDate: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      const response = await fetch('/api/subscriptions/check');
      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { subscription, isLoading, refresh: checkSubscription };
}
