
import { ConfigStrategy } from "./types";
import { ProductionConfigStrategy } from "./strategies/ProductionConfigStrategy";
import { TestingConfigStrategy } from "./strategies/TestingConfigStrategy";

class ConfigProvider {
  private strategy: ConfigStrategy;

  constructor() {
    this.strategy = this.detectEnvironment() === 'testing' 
      ? new TestingConfigStrategy() 
      : new ProductionConfigStrategy();
  }

  private detectEnvironment(): 'production' | 'testing' {
    // Check for DEPLOYMENT_ENVIRONMENT variable
    // In a browser context, environment variables need to be exposed to the client
    // through import.meta.env (for Vite) with VITE_ prefix
    const deploymentEnv = import.meta.env.VITE_DEPLOYMENT_ENVIRONMENT;
    
    if (deploymentEnv === 'testing') {
      return 'testing';
    }
    
    // Default to production if not explicitly set to testing
    return 'production';
  }

  getStrategy(): ConfigStrategy {
    return this.strategy;
  }

  setStrategy(strategy: ConfigStrategy): void {
    this.strategy = strategy;
  }
}

// Export a singleton instance
export const configProvider = new ConfigProvider();
