export const MAX_OFFERS_PER_PRODUCT = 3;

// Offers under this share of the minimum get no counter, so lowballing can't walk the price down.
const REJECT_BELOW_SHARE = 0.6;
// Counters stay this far above the minimum, so a counter never reveals the minimum itself.
const COUNTER_MARGIN_SHARE = 0.25;

export type OfferInput = {
  listCents: number;
  minimumCents: number | null;
  offerCents: number;
  previousOffers: number;
};

// Deliberately has no minimum field: this is what the model is allowed to see.
export type OfferResult =
  | { decision: "accept"; allowedCents: number }
  | { decision: "counter"; allowedCents: number; finalOffer: boolean }
  | { decision: "reject"; allowedCents: number; reason: "too_low" | "offer_limit" }
  | { decision: "fixed_price"; allowedCents: number };

const roundUpToDollar = (amountCents: number) => Math.ceil(amountCents / 100) * 100;

export function evaluateOffer(input: OfferInput): OfferResult {
  const { listCents, minimumCents, offerCents, previousOffers } = input;

  if (minimumCents === null || minimumCents >= listCents) {
    return { decision: "fixed_price", allowedCents: listCents };
  }
  if (previousOffers >= MAX_OFFERS_PER_PRODUCT) {
    return { decision: "reject", allowedCents: listCents, reason: "offer_limit" };
  }
  if (!Number.isInteger(offerCents) || offerCents <= 0) {
    return { decision: "reject", allowedCents: listCents, reason: "too_low" };
  }
  if (offerCents >= listCents) return { decision: "accept", allowedCents: listCents };
  if (offerCents >= minimumCents) return { decision: "accept", allowedCents: offerCents };
  if (offerCents < minimumCents * REJECT_BELOW_SHARE) {
    return { decision: "reject", allowedCents: listCents, reason: "too_low" };
  }

  const margin = Math.ceil((listCents - minimumCents) * COUNTER_MARGIN_SHARE);
  const midpoint = Math.round((offerCents + listCents) / 2);
  const counter = Math.max(midpoint, minimumCents + margin);
  return {
    decision: "counter",
    allowedCents: Math.min(roundUpToDollar(counter), listCents),
    finalOffer: previousOffers === MAX_OFFERS_PER_PRODUCT - 1,
  };
}
