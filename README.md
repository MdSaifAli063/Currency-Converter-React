# Currency Converter (React)

Simple React currency converter with live rates and offline defaults.

## Overview

This app converts between currencies using a public API (exchangerate.host) with a fallback to frankfurter.app. If live fetch fails the app uses built-in default rates so conversion still works. Features include:

- Live rate fetching with timeout and fallback
- Manual "Refresh Rates" control
- Swap currencies
- Type either "From" or "To" amount and derive the counterpart
- Friendly error banner when online rates cannot be fetched

## Prerequisites

- Node.js (14+ recommended)
- npm or yarn

## Install

1. Clone or copy the repository to your machine.
2. From project root:

```bash
npm install
# or
yarn
```

## Run (development)

- If using Create React App:

```bash
npm start
# or
yarn start
```

- If using Vite:

```bash
npm run dev
# or
yarn dev
```

## Build

```bash
npm run build
# or
yarn build
```

## Usage

- Enter an amount in the "From" field and pick currencies from the dropdowns.
- Click "Convert" to compute or type in the "To" box to update the "From" value automatically.
- Use "⇄ Swap" to swap from/to currencies and values.
- Click "Refresh Rates" to force a re-fetch of live rates.

## Implementation notes

- Hook: `src/hooks/useCurrencyInfo.js`
  - Returns `{ rates, loading, error, refresh }`.
  - `rates` keys are lowercase currency codes.
  - `refresh()` triggers a re-fetch.
  - When network fetch fails the hook falls back to built-in `DEFAULT_RATES`.
- The UI component `src/components/inputBox.jsx` allows typing in both inputs and selecting currency types.

## Troubleshooting

- If you see network timeout errors (ERR_CONNECTION_TIMED_OUT) the app will show a banner and use built-in rates. Ensure your environment allows outbound requests to the public APIs.
- To modify default offline rates, edit `DEFAULT_RATES` in `src/hooks/useCurrencyInfo.js`.
- If selects are empty, verify network and that the hook returned `rates`; the app also initializes with defaults so selects should populate immediately.

## License & Credits

MIT-style — adapt as needed. APIs used:

- https://api.exchangerate.host
- https://api.frankfurter.app

## Contact

For issues or improvements, open an issue or submit a PR in your repository.
