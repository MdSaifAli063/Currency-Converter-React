import { useState, useEffect } from "react";
import "./App.css";
import InputBox from "./components";
import useCurrencyInfo from "./hooks/useCurrencyInfo";

function App() {
  const [amount, setAmount] = useState(1);
  const [from, setFrom] = useState("usd");
  const [to, setTo] = useState("inr");
  const [convertedAmount, setConvertedAmount] = useState(0);
  const [activeInput, setActiveInput] = useState("from"); // 'from' or 'to'

  const { rates: currencyInfo, loading, error, refresh } = useCurrencyInfo(from);
  const options = Object.keys(currencyInfo || {}).sort();

  // keep selected currencies in sync with available options
  useEffect(() => {
    if (!options || options.length === 0) return;
    // ensure 'from' exists
    if (!options.includes(String(from))) {
      setFrom(options[0]);
    }
    // ensure 'to' exists and is different if possible
    if (!options.includes(String(to))) {
      const fallback = options.find((c) => c !== from) || options[0];
      setTo(fallback);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.join(",")]);

  const swap = (e) => {
    if (e && typeof e.preventDefault === "function") e.preventDefault();
    // read current values and swap them reliably
    const prevFrom = from;
    const prevTo = to;
    const prevAmount = amount;
    const prevConverted = convertedAmount;

    setFrom(prevTo);
    setTo(prevFrom);
    setAmount(prevConverted ?? 0);
    // clear converted value until user converts again
    setConvertedAmount(0);
  };

  const convert = () => {
    const rate = (currencyInfo && currencyInfo[to]) ?? 0;
    const numericAmount = Number(amount) || 0;
    const result = numericAmount * rate;
    // avoid setting NaN
    setConvertedAmount(Number.isFinite(result) ? Number(result.toFixed(4)) : 0);
  };

  // handle typing in 'from' input: update amount and derived to-value
  const handleFromChange = (val) => {
    setActiveInput("from");
    const numeric = Number(val) || 0;
    setAmount(numeric);
    const rate = (currencyInfo && currencyInfo[to]) ?? 0;
    const toVal = Number.isFinite(numeric * rate) ? Number((numeric * rate).toFixed(4)) : 0;
    setConvertedAmount(toVal);
  };

  // handle typing in 'to' input: update convertedAmount and derive from-value
  const handleToChange = (val) => {
    setActiveInput("to");
    const numeric = Number(val) || 0;
    setConvertedAmount(numeric);
    const rate = (currencyInfo && currencyInfo[to]) ?? 0;
    const fromVal = rate > 0 ? Number((numeric / rate).toFixed(4)) : 0;
    setAmount(Number.isFinite(fromVal) ? fromVal : 0);
  };

  const currentRate = ((currencyInfo && currencyInfo[to]) || 0);

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

            {/* show friendly warning when live fetch failed and app is using defaults */}
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
                  onAmountChange={(val) => handleFromChange(val)}
                  onCurrencyChange={(currency) => setFrom(currency)}
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
                  onAmountChange={(val) => handleToChange(val)}
                  onCurrencyChange={(currency) => setTo(currency)}
                  currencyOptions={options}
                  selectedCurrency={to}
                  amountDisabled={false} /* allow typing in 'To' as requested */
                />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  type="submit"
                  className="col-span-2 w-full py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-green-500 to-emerald-600 disabled:opacity-60"
                  disabled={loading}
                >
                  {loading ? "Loading rates..." : `Convert ${from.toUpperCase()} → ${to.toUpperCase()}`}
                </button>
              </div>

              <div className="mt-3 text-sm text-gray-600 text-center">
                {loading && <span>Fetching latest rates…</span>}
                {!loading && currentRate > 0 && (
                  <span>
                    1 {from.toUpperCase()} = {Number(currentRate).toFixed(6)} {to.toUpperCase()}
                  </span>
                )}
                {error && <div className="text-red-500 mt-2">Live fetch failed; using offline rates.</div>}
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;

