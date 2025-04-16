
import { useMemo } from 'react';
import { configProvider } from '../config/ConfigProvider';
import { AppConfig } from '../config/types';

export function useAppConfig(): AppConfig {
  // UseMemo helps avoid unnecessary recalculations on re-renders
  return useMemo(() => {
    return configProvider.getStrategy().getConfig();
  }, []);
}
