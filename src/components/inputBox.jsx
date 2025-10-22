import React from "react";

const CURRENCY_EMOJI = {
  usd: "🇺🇸",
  eur: "🇪🇺",
  inr: "🇮🇳",
  gbp: "🇬🇧",
  jpy: "🇯🇵",
  aud: "🇦🇺",
  cad: "🇨🇦",
  chf: "🇨🇭",
  cny: "🇨🇳",
};

function InputBox({
  label,
  amount,
  onCurrencyChange,
  onAmountChange,
  currencyOptions = [],
  selectedCurrency = "usd",
  amountDisabled = false,
  currencyDisabled = false,
  className = "",
}) {
  // use React.useId when available (React 18+), otherwise create a short random id
  const id =
    typeof React.useId === "function"
      ? React.useId()
      : `input-${Math.random().toString(36).slice(2, 9)}`;

  // Handle amount changes safely: avoid NaN on empty input and allow partial decimals.
  const handleAmountChange = (e) => {
    const val = e.target.value;

    // Allow empty input to clear the field
    if (val === "" || val === null) {
      onAmountChange?.("");
      return;
    }

    // Coerce to number if finite; otherwise ignore the change
    const num = Number(val);
    if (Number.isFinite(num)) {
      onAmountChange?.(num);
    } else {
      // If parent expects string handling instead, you can pass val through:
      // onAmountChange?.(val);
      // For now, ignore invalid to prevent NaN propagation.
    }
  };

  // Normalize selectedCurrency to lowercase to match option values
  const selectedLower = String(selectedCurrency ?? "usd").toLowerCase();

  return (
    <div
      className={`bg-white p-3 rounded-lg text-sm flex gap-3 items-center ${className}`}
    >
      <div className="flex-1">
        <label htmlFor={id} className="text-black/60 mb-1 inline-block text-xs">
          {label}
        </label>
        <input
          id={id}
          type="number"
          inputMode="decimal"
          className="outline-none w-full bg-transparent py-2 text-lg font-medium"
          placeholder="Amount"
          disabled={amountDisabled}
          // Allow empty string; otherwise show amount
          value={amount === "" || amount === null || amount === undefined ? "" : amount}
          onChange={handleAmountChange}
        />
      </div>

      <div className="w-36 pl-3 border-l border-black/10">
        <label
          htmlFor={`${id}-select`}
          className="text-black/60 mb-1 inline-block text-xs"
        >
          Currency
        </label>
        <select
          id={`${id}-select`}
          className="outline-none w-full bg-transparent py-2 text-sm"
          disabled={currencyDisabled}
          value={selectedLower}
          onChange={(e) => onCurrencyChange?.(String(e.target.value).toLowerCase())}
        >
          {currencyOptions.map((currency) => {
            const lower = String(currency).toLowerCase();
            const emoji = CURRENCY_EMOJI[lower] ? `${CURRENCY_EMOJI[lower]} ` : "";
            return (
              <option key={lower} value={lower}>
                {emoji}
                {String(currency).toUpperCase()}
              </option>
            );
          })}
        </select>
      </div>
    </div>
  );
}

export default InputBox;