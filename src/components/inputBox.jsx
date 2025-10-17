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
          value={amount ?? ""}
          onChange={(e) => onAmountChange?.(Number(e.target.value))}
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
          value={selectedCurrency}
          onChange={(e) => onCurrencyChange?.(e.target.value)}
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