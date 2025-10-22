import { useEffect, useRef, useState } from "react";

/**
 * Offline defaults used when no network is available.
 * All keys are lowercase to keep the app logic consistent.
 */
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

/**
 * fetchWithTimeout wraps fetch with an AbortController-based timeout.
 */
async function fetchWithTimeout(url, options = {}, timeout = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort("timeout"), timeout);
  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

/**
 * Normalize incoming rates map:
 * - Ensure base currency key exists and equals 1
 * - Lowercase all currency codes
 * - Coerce values to numbers and skip invalid ones
 */
function normalizeRates(baseCurrency, ratesObj) {
  const baseKey =
    typeof baseCurrency === "string" && baseCurrency.trim()
      ? baseCurrency.toLowerCase()
      : "usd"; // safe default if API omits base

  // Start with base=1 so base is always present
  const mapped = { [baseKey]: 1 };

  if (ratesObj && typeof ratesObj === "object") {
    for (const k of Object.keys(ratesObj)) {
      const code = String(k).toLowerCase();
      const raw = ratesObj[k];
      const num = typeof raw === "number" ? raw : Number(raw);
      if (Number.isFinite(num) && num > 0) {
        // BUG FIX: use bracket notation for property assignment
        mapped[code] = num;
      }
    }
  }

  // Ensure base equals 1
  mapped[baseKey] = 1;

  return mapped;
}

/**
 * Validate that a rates object is usable (has at least 2 currencies).
 */
function hasUsableRates(obj) {
  return !!obj && typeof obj === "object" && Object.keys(obj).length > 1;
}

/**
 * React hook to fetch currency rates for a given base currency (lowercase codes recommended).
 * Returns { rates, loading, error, refresh }
 */
function useCurrencyInfo(currency) {
  const [rates, setRates] = useState(DEFAULT_RATES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tick, setTick] = useState(0); // increment to force refresh
  const lastCurrencyRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const base = typeof currency === "string" ? currency.toLowerCase() : "";
    lastCurrencyRef.current = base;

    if (!base) {
      // No base provided; expose defaults
      setRates(DEFAULT_RATES);
      setLoading(false);
      setError(null);
      return () => {
        mounted = false;
      };
    }

    // For refreshes, avoid resetting the rates to defaults to prevent UI flicker.
    setLoading(true);
    setError(null);

    (async () => {
      const primary = `https://api.exchangerate.host/latest?base=${encodeURIComponent(
        base
      )}`;
      const fallback = `https://api.frankfurter.app/latest?from=${encodeURIComponent(
        base
      )}`;

      // Helper to safely set state only if still mounted and currency hasn't changed mid-flight
      const safeSet = (fn) => {
        if (mounted && lastCurrencyRef.current === base) {
          fn();
        }
      };

      // Try primary
      try {
        const res = await fetchWithTimeout(primary, {}, 8000);
        if (!res.ok) throw new Error(`Primary API not ok: ${res.status}`);
        const data = await res.json().catch(() => {
          throw new Error("Primary JSON parse error");
        });
        const mapped = normalizeRates(data?.base || base, data?.rates || {});
        if (!hasUsableRates(mapped)) {
          throw new Error("Primary returned empty/invalid rates");
        }
        safeSet(() => {
          setRates(mapped);
          setLoading(false);
          setError(null);
        });
        return;
      } catch (_primaryErr) {
        // Try fallback
        try {
          const res2 = await fetchWithTimeout(fallback, {}, 7000);
          if (!res2.ok) throw new Error(`Fallback API not ok: ${res2.status}`);
          const data2 = await res2.json().catch(() => {
            throw new Error("Fallback JSON parse error");
          });
          // Frankfurter returns rates relative to 'from', same idea
          const mapped2 = normalizeRates(data2?.base || data2?.from || base, data2?.rates || {});
          if (!hasUsableRates(mapped2)) {
            throw new Error("Fallback returned empty/invalid rates");
          }
          safeSet(() => {
            setRates(mapped2);
            setLoading(false);
            setError(null);
          });
          return;
        } catch (_fallbackErr) {
          // Both failed—keep whatever we had (likely defaults or previous live) and report error
          safeSet(() => {
            setRates((prev) => {
              if (prev && Object.keys(prev).length > 0) return prev;
              return DEFAULT_RATES;
            });
            setLoading(false);
            setError("Failed to fetch live rates — using offline defaults.");
          });
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