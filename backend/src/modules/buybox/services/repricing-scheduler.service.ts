import { injectable, inject } from 'inversify';
import { Logger } from 'winston';
import { RepricingEngineService } from './repricing-engine.service';
import { AUTOMATED_REPRICING_DAILY_COST } from '../constants/credit-costs';

@injectable()
export class RepricingSchedulerService {
  private schedulerInterval: NodeJS.Timeout | null = null;
  private readonly checkInterval = 1 * 60 * 1000; // Check every minute
  private isExecuting = false;
  
  constructor(
    @inject('Logger') private logger: Logger,
    @inject(RepricingEngineService) private repricingEngine: RepricingEngineService
  ) {}
  
  /**
   * Start the scheduler
   */
  public start(): void {
    this.logger.info('Starting repricing scheduler service');
    
    if (this.schedulerInterval) {
      this.stop();
    }
    
    this.schedulerInterval = setInterval(() => {
      this.executeScheduledRules().catch(err => {
        this.logger.error('Error executing scheduled rules', { error: err });
      });
    }, this.checkInterval);
  }
  
  /**
   * Stop the scheduler
   */
  public stop(): void {
    this.logger.info('Stopping repricing scheduler service');
    
    if (this.schedulerInterval) {
      clearInterval(this.schedulerInterval);
      this.schedulerInterval = null;
    }
  }
  
  /**
   * Execute scheduled rules
   */
  private async executeScheduledRules(): Promise<void> {
    if (this.isExecuting) {
      return;
    }
    
    try {
      this.isExecuting = true;
      await this.repricingEngine.executeScheduledRules();
    } catch (error) {
    const errorMessage = error instanceof Error ? (error instanceof Error ? (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error)) : String(error)) : String(error);
      this.logger.error('Error executing scheduled rules', { error });
    } finally {
      this.isExecuting = false;
    }
  }
  
  /**
   * Get estimated daily credit cost for active repricing rules
   */
  public getEstimatedDailyCost(): number {
    return AUTOMATED_REPRICING_DAILY_COST;
  }
}