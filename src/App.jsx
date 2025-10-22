import { useState, useEffect, useMemo, useRef } from "react";
import "./App.css";
import InputBox from "./components";
import useCurrencyInfo from "./hooks/useCurrencyInfo";

function App() {
  const [amount, setAmount] = useState(1);
  const [from, setFrom] = useState("usd");
  const [to, setTo] = useState("inr");
  const [convertedAmount, setConvertedAmount] = useState(0);
  const [activeInput, setActiveInput] = useState("from"); // 'from' or 'to'

  // Fetch rates for the current 'from' base
  const { rates: currencyInfo, loading, error, refresh } = useCurrencyInfo(from);

  // Build lowercase, sorted options from rates
  const computedOptions = useMemo(() => {
    const keys = Object.keys(currencyInfo || {});
    if (!keys.length) return [];
    return keys.map((c) => String(c).toLowerCase()).sort();
  }, [currencyInfo]);

  // Keep a stable non-empty options list so the selects don't go blank while loading
  const optionsRef = useRef([]);
  if (computedOptions.length) {
    optionsRef.current = computedOptions;
  }
  const options = optionsRef.current;

  // Ensure from/to are valid members of options and prefer distinct currencies if possible
  useEffect(() => {
    if (!options.length) return;

    const fromLc = String(from).toLowerCase();
    const toLc = String(to).toLowerCase();

    let nextFrom = options.includes(fromLc) ? fromLc : options[0];
    let nextTo = options.includes(toLc) ? toLc : (options.find((c) => c !== nextFrom) || nextFrom);

    // Commit only if changed
    if (nextFrom !== fromLc) setFrom(nextFrom);
    if (nextTo !== toLc) setTo(nextTo);
  }, [options, from, to]);

  // Helper to get current rate safely
  const getRate = () => {
    const rate = currencyInfo && to ? currencyInfo[to] : 0;
    return Number.isFinite(rate) ? rate : 0;
  };

  // Recompute derived value whenever pair, rates, or the active side changes.
  useEffect(() => {
    const rate = getRate();

    if (activeInput === "from") {
      const numericAmount = Number(amount) || 0;
      const result = numericAmount * rate;
      setConvertedAmount(Number.isFinite(result) ? Number(result.toFixed(4)) : 0);
    } else {
      const numericTo = Number(convertedAmount) || 0;
      const base = rate > 0 ? numericTo / rate : 0;
      setAmount(Number.isFinite(base) ? Number(base.toFixed(4)) : 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to, currencyInfo, activeInput]);

  // Swap currencies and carry the correct value based on active input
  const swap = (e) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();

    const prevFrom = from;
    const prevTo = to;
    const prevAmount = amount;
    const prevConverted = convertedAmount;

    setFrom(prevTo);
    setTo(prevFrom);

    if (activeInput === "from") {
      setAmount(prevAmount);
    } else {
      // carry the visible 'to' value as new base
      setAmount(prevConverted ?? 0);
      // keep editing from after swap
      setActiveInput("from");
    }
  };

  // Explicit convert (also used on submit)
  const convert = () => {
    const rate = getRate();

    if (activeInput === "from") {
      const numericAmount = Number(amount) || 0;
      const result = numericAmount * rate;
      setConvertedAmount(Number.isFinite(result) ? Number(result.toFixed(4)) : 0);
    } else {
      const numericTo = Number(convertedAmount) || 0;
      const base = rate > 0 ? numericTo / rate : 0;
      setAmount(Number.isFinite(base) ? Number(base.toFixed(4)) : 0);
    }
  };

  // User types in "from"
  const handleFromChange = (val) => {
    setActiveInput("from");
    const numeric = Number(val);
    const safe = Number.isFinite(numeric) ? numeric : 0;
    setAmount(safe);

    const rate = getRate();
    const toVal = Number.isFinite(safe * rate) ? Number((safe * rate).toFixed(4)) : 0;
    setConvertedAmount(toVal);
  };

  // User types in "to"
  const handleToChange = (val) => {
    setActiveInput("to");
    const numeric = Number(val);
    const safe = Number.isFinite(numeric) ? numeric : 0;
    setConvertedAmount(safe);

    const rate = getRate();
    const fromVal = rate > 0 ? Number((safe / rate).toFixed(4)) : 0;
    setAmount(Number.isFinite(fromVal) ? fromVal : 0);
  };

  // When currency select changes, set active side so recalculation uses the correct source
  const handleFromCurrencyChange = (currency) => {
    const lc = String(currency).toLowerCase();
    setFrom(lc);
    setActiveInput("from");
  };
  const handleToCurrencyChange = (currency) => {
    const lc = String(currency).toLowerCase();
    setTo(lc);
    setActiveInput("from"); // when changing target currency, recompute 'to' from 'from'
  };

  const currentRate = getRate();

  return (
    <>
      <div
        className="w-full min-h-screen flex items-center justify-center bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)), url(https://cdn.pixabay.com/photo/2024/07/16/02/43/graph-8898188_1280.jpg)",
        }}
      >
        <div className="w-full max-w-lg mx-auto p-6">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-6">
            <h1 className="text-3xl font-extrabold mb-4 text-center">
              Currency Converter
            </h1>
            <p className="text-center text-sm text-gray-600 mb-4">
              Convert between currencies quickly. Rates update live.
            </p>

            {error && (
              <div className="mb-3 px-4 py-2 rounded-md bg-yellow-100 text-yellow-800 text-sm">
                {error} — conversions still work with built-in rates. Try "Refresh Rates".
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                convert();
              }}
            >
              <div className="w-full mb-3">
                <InputBox
                  label="From"
                  amount={amount}
                  onAmountChange={handleFromChange}
                  onCurrencyChange={handleFromCurrencyChange}
                  currencyOptions={options}
                  selectedCurrency={from}
                />
              </div>

              <div className="flex justify-between items-center my-3 gap-3">
                <div className="mx-auto">
                  <button
                    type="button"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-full shadow-md"
                    onClick={swap}
                  >
                    ⇄ Swap
                  </button>
                </div>
                <div>
                  <button
                    type="button"
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-2 rounded-md shadow-sm"
                    onClick={() => refresh()}
                    disabled={loading}
                    title="Refresh rates"
                  >
                    {loading ? "Refreshing…" : "Refresh Rates"}
                  </button>
                </div>
              </div>

              <div className="w-full mb-3">
                <InputBox
                  label="To"
                  amount={convertedAmount}
                  onAmountChange={handleToChange}
                  onCurrencyChange={handleToCurrencyChange}
                  currencyOptions={options}
                  selectedCurrency={to}
                  amountDisabled={false}
                />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="submit"
                  className="col-span-2 w-full py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-green-500 to-emerald-600 disabled:opacity-60"
                  disabled={loading || !options.length}
                >
                  {loading
                    ? "Loading rates..."
                    : `Convert ${from.toUpperCase()} → ${to.toUpperCase()}`}
                </button>
              </div>

              <div className="mt-3 text-sm text-gray-600 text-center">
                {loading && <span>Fetching latest rates…</span>}
                {!loading && currentRate > 0 && (
                  <span>
                    1 {from.toUpperCase()} = {Number(currentRate).toFixed(6)}{" "}
                    {to.toUpperCase()}
                  </span>
                )}
                {error && (
                  <div className="text-red-500 mt-2">
                    Live fetch failed; using offline rates.
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;