
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
    // Check for URL parameters - useful for testing in the same domain
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('env') === 'testing') {
      return 'testing';
    }

    // Check for hostname patterns
    const hostname = window.location.hostname;
    if (
      hostname.includes('staging') || 
      hostname.includes('test') || 
      hostname.includes('dev') ||
      hostname === 'localhost'
    ) {
      return 'testing';
    }

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
