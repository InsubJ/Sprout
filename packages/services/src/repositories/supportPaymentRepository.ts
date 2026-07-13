export interface SupportPaymentRepository {
  createCheckout(
    amountUsdCents: number,
    userId?: string,
  ): Promise<{ checkoutUrl: string | null; completed: boolean }>;
}
