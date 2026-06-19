export type PlanId = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type FileType = 'normal' | 'ai';

export const LEMON_SQUEEZY_LINKS: Record<string, string> = {
  ID_1: 'LINK_HERE', // Pro Monthly
  ID_2: 'LINK_HERE', // Pro Yearly
  ID_3: 'LINK_HERE', // Advanced Monthly
  ID_4: 'LINK_HERE', // Advanced Yearly
  ID_5: 'LINK_HERE', // Ultra Monthly
  ID_6: 'LINK_HERE', // Ultra Yearly
  ID_7: 'LINK_HERE', // Company Monthly
  ID_8: 'LINK_HERE', // Company Yearly
};

export interface PlanDetails {
  id: PlanId;
  name: string;
  maxFileSizeMB: number;
  dailyNormalFiles: number;
  dailyAiFiles: number;
  hasAds: boolean;
  hasWatermark: boolean;
  nextPlanId: PlanId | null;
}

export const PLANS: Record<PlanId, PlanDetails> = {
  0: { id: 0, name: 'Free', maxFileSizeMB: 25, dailyNormalFiles: 10, dailyAiFiles: 3, hasAds: true, hasWatermark: true, nextPlanId: 1 },
  1: { id: 1, name: 'Pro Monthly', maxFileSizeMB: 250, dailyNormalFiles: 30, dailyAiFiles: 8, hasAds: false, hasWatermark: false, nextPlanId: 3 },
  2: { id: 2, name: 'Pro Yearly', maxFileSizeMB: 250, dailyNormalFiles: 30, dailyAiFiles: 8, hasAds: false, hasWatermark: false, nextPlanId: 4 },
  3: { id: 3, name: 'Advanced Monthly', maxFileSizeMB: 2500, dailyNormalFiles: 60, dailyAiFiles: 15, hasAds: false, hasWatermark: false, nextPlanId: 5 },
  4: { id: 4, name: 'Advanced Yearly', maxFileSizeMB: 2500, dailyNormalFiles: 60, dailyAiFiles: 15, hasAds: false, hasWatermark: false, nextPlanId: 6 },
  5: { id: 5, name: 'Ultra Monthly', maxFileSizeMB: 4000, dailyNormalFiles: 100, dailyAiFiles: 30, hasAds: false, hasWatermark: false, nextPlanId: 7 },
  6: { id: 6, name: 'Ultra Yearly', maxFileSizeMB: 4000, dailyNormalFiles: 100, dailyAiFiles: 30, hasAds: false, hasWatermark: false, nextPlanId: 8 },
  7: { id: 7, name: 'Company Monthly', maxFileSizeMB: 4000, dailyNormalFiles: Infinity, dailyAiFiles: Infinity, hasAds: false, hasWatermark: false, nextPlanId: null },
  8: { id: 8, name: 'Company Yearly', maxFileSizeMB: 4000, dailyNormalFiles: Infinity, dailyAiFiles: Infinity, hasAds: false, hasWatermark: false, nextPlanId: null },
};

interface UserUsage {
  date: string; // YYYY-MM-DD format
  normalCount: number;
  aiCount: number;
}

export interface AccessResult {
  allowed: boolean;
  messageKey?: string;
  values?: Record<string, string | number>;
}

export class GlobalGuard {
  /**
   * Get the current date string in YYYY-MM-DD format for daily reset tracking
   */
  private static getTodayString(): string {
    const today = new Date();
    return `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`;
  }

  /**
   * Get user's current usage from localStorage. Resets if it's a new day.
   */
  private static getUserUsage(userId: string): UserUsage {
    const key = `pdf_king_usage_${userId}`;
    const stored = localStorage.getItem(key);
    const today = this.getTodayString();

    if (stored) {
      try {
        const usage: UserUsage = JSON.parse(stored);
        if (usage.date === today) {
          return usage;
        }
      } catch (e) {
        console.error('Error parsing usage data', e);
      }
    }

    // Reset or initialize for a new day
    const newUsage: UserUsage = { date: today, normalCount: 0, aiCount: 0 };
    localStorage.setItem(key, JSON.stringify(newUsage));
    return newUsage;
  }

  /**
   * Increment user's usage after a successful operation
   */
  public static incrementUsage(userId: string, fileType: FileType): void {
    const usage = this.getUserUsage(userId);
    if (fileType === 'normal') {
      usage.normalCount += 1;
    } else {
      usage.aiCount += 1;
    }
    localStorage.setItem(`pdf_king_usage_${userId}`, JSON.stringify(usage));
  }

  /**
   * Check if user has access to process the file.
   * Returns an object with { allowed: boolean, messageKey?: string, values?: object }
   */
  public static checkAccess(userId: string, planId: PlanId, fileType: FileType, fileSizeMB: number): AccessResult {
    const plan = PLANS[planId];
    if (!plan) {
      return { allowed: false, messageKey: 'ERR_INVALID_PLAN' };
    }

    const nextPlan = plan.nextPlanId !== null ? PLANS[plan.nextPlanId] : null;
    const nextPlanName = nextPlan ? nextPlan.name : '';

    // 1. Check File Size
    if (fileSizeMB > plan.maxFileSizeMB) {
      return { 
        allowed: false, 
        messageKey: 'ERR_FILE_SIZE',
        values: {
          fileSizeMB,
          maxFileSizeMB: plan.maxFileSizeMB,
          nextPlanName
        }
      };
    }

    // 2. Check Daily Limits
    const usage = this.getUserUsage(userId);
    
    if (fileType === 'normal') {
      if (usage.normalCount >= plan.dailyNormalFiles) {
        return { 
          allowed: false, 
          messageKey: 'ERR_NORMAL_LIMIT',
          values: {
            dailyNormalFiles: plan.dailyNormalFiles,
            nextPlanName
          }
        };
      }
    } else if (fileType === 'ai') {
      if (usage.aiCount >= plan.dailyAiFiles) {
        return { 
          allowed: false, 
          messageKey: 'ERR_AI_LIMIT',
          values: {
            dailyAiFiles: plan.dailyAiFiles,
            nextPlanName
          }
        };
      }
    }

    // Access granted
    return { allowed: true };
  }

  /**
   * Check if the user's plan is ad-free
   */
  public static isAdFree(planId: PlanId): boolean {
    const plan = PLANS[planId];
    return plan ? !plan.hasAds : false;
  }

  /**
   * Check if the user's plan is watermark-free
   */
  public static isWatermarkFree(planId: PlanId): boolean {
    const plan = PLANS[planId];
    return plan ? !plan.hasWatermark : false;
  }
}
