import { describe, expect, it } from "vitest";
import { evaluateOffer, MAX_OFFERS_PER_PRODUCT } from "./evaluate";

const base = { listCents: 6000, minimumCents: 4500, previousOffers: 0 };

describe("evaluateOffer", () => {
  it("treats a product with no minimum as fixed price", () => {
    expect(evaluateOffer({ ...base, minimumCents: null, offerCents: 5000 })).toEqual({
      decision: "fixed_price",
      allowedCents: 6000,
    });
  });

  it("accepts an offer at or above the minimum at the offered price", () => {
    expect(evaluateOffer({ ...base, offerCents: 4500 })).toEqual({
      decision: "accept",
      allowedCents: 4500,
    });
  });

  it("never charges more than list when the buyer overbids", () => {
    expect(evaluateOffer({ ...base, offerCents: 9000 })).toEqual({
      decision: "accept",
      allowedCents: 6000,
    });
  });

  it("counters an offer just under the minimum", () => {
    const result = evaluateOffer({ ...base, offerCents: 4000 });
    expect(result.decision).toBe("counter");
    expect(result.allowedCents).toBe(5000);
  });

  it("rejects lowball offers without a counter", () => {
    expect(evaluateOffer({ ...base, offerCents: 1000 })).toEqual({
      decision: "reject",
      allowedCents: 6000,
      reason: "too_low",
    });
  });

  it("stops after the offer limit", () => {
    const result = evaluateOffer({
      ...base,
      offerCents: 5900,
      previousOffers: MAX_OFFERS_PER_PRODUCT,
    });
    expect(result).toMatchObject({ decision: "reject", reason: "offer_limit" });
  });

  it.each([0, -500, 12.5, Number.NaN])("rejects invalid offer %s", (offerCents) => {
    expect(evaluateOffer({ ...base, offerCents }).decision).toBe("reject");
  });

  it("never allows a price below the minimum, and counters never equal it", () => {
    for (let listCents = 1000; listCents <= 20000; listCents += 700) {
      for (let minimumCents = 500; minimumCents < listCents; minimumCents += 900) {
        for (let offerCents = 1; offerCents <= listCents + 500; offerCents += 333) {
          for (let previousOffers = 0; previousOffers < MAX_OFFERS_PER_PRODUCT; previousOffers++) {
            const r = evaluateOffer({ listCents, minimumCents, offerCents, previousOffers });
            expect(r.allowedCents).toBeGreaterThanOrEqual(minimumCents);
            expect(r.allowedCents).toBeLessThanOrEqual(listCents);
            if (r.decision === "counter") expect(r.allowedCents).toBeGreaterThan(minimumCents);
          }
        }
      }
    }
  });

  it("never exposes the minimum in its result shape", () => {
    const result = evaluateOffer({ ...base, offerCents: 4000 });
    expect(Object.keys(result)).not.toContain("minimumCents");
    expect(JSON.stringify(result)).not.toContain("4500");
  });
});
