import { useEffect, useState } from "react";

const DEFAULT_RATES = {
  usd: 1,
  eur: 0.85,
  inr: 83.5,
  gbp: 0.75,
  jpy: 110,
  aud: 1.3,
  cad: 1.25,
  chf: 0.92,
  cny: 7.2,
};

async function fetchWithTimeout(url, options = {}, timeout = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

function normalizeRates(baseCurrency, ratesObj) {
  const baseKey = (baseCurrency || baseCurrency).toLowerCase();
  const mapped = { [baseKey]: 1 };
  if (ratesObj) {
    Object.keys(ratesObj).forEach((k) => {
      mapped[k.toLowerCase()] = ratesObj[k];
    });
  }
  return mapped;
}

function useCurrencyInfo(currency) {
  const [rates, setRates] = useState(DEFAULT_RATES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0); // increment to force refresh

  useEffect(() => {
    let mounted = true;

    if (!currency) {
      setRates(DEFAULT_RATES);
      setLoading(false);
      setError(null);
      return;
    }

    setRates(DEFAULT_RATES);
    setLoading(true);
    setError(null);

    (async () => {
      // primary endpoint
      const primary = `https://api.exchangerate.host/latest?base=${encodeURIComponent(
        currency
      )}`;
      // fallback endpoint (frankfurter) - different param style but returns {rates}
      const fallback = `https://api.frankfurter.app/latest?from=${encodeURIComponent(
        currency
      )}`;

      try {
        const res = await fetchWithTimeout(primary, {}, 8000);
        if (!res.ok) throw new Error("Primary API not ok");
        const data = await res.json();
        if (!mounted) return;
        const mapped = normalizeRates(data.base || currency, data.rates);
        setRates(mapped);
        setLoading(false);
        setError(null);
        return;
      } catch (errPrimary) {
        // try fallback
        try {
          const res2 = await fetchWithTimeout(fallback, {}, 7000);
          if (!res2.ok) throw new Error("Fallback API not ok");
          const data2 = await res2.json();
          if (!mounted) return;
          // frankfurter returns { rates, base, date }
          const mapped2 = normalizeRates(data2.base || currency, data2.rates);
          setRates(mapped2);
          setLoading(false);
          setError(null);
          return;
        } catch (errFallback) {
          // both failed: keep defaults, set an error flag (no noisy console.error)
          if (!mounted) return;
          setRates(DEFAULT_RATES);
          setLoading(false);
          setError("Failed to fetch live rates — using offline defaults.");
          return;
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [currency, tick]);

  const refresh = () => setTick((t) => t + 1);
  return { rates, loading, error, refresh };
}
export default useCurrencyInfo;
