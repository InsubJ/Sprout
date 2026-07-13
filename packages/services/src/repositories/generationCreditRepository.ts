import type { GenerationCreditBalance } from "@sprout/shared";
export interface GenerationCreditRepository {
  getBalance(userId: string): Promise<GenerationCreditBalance>;
}
