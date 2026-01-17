# 💱 Currency Converter (React)

Simple, fast currency converter with live rates, elegant UI, and offline defaults.

<p align="left">
  <a href="https://react.dev" target="_blank">
    <img alt="React" src="https://img.shields.io/badge/React-18+-61DAFB?logo=react&logoColor=white" />
  </a>
  <a href="https://tailwindcss.com" target="_blank">
    <img alt="Tailwind" src="https://img.shields.io/badge/TailwindCSS-3+-38B2AC?logo=tailwindcss&logoColor=white" />
  </a>
  <img alt="Node" src="https://img.shields.io/badge/Node-%E2%89%A514-339933?logo=node.js&logoColor=white" />
  <a href="#license--credits">
    <img alt="License" src="https://img.shields.io/badge/License-MIT-000000.svg?logo=open-source-initiative&logoColor=white" />
  </a>
  <a href="#contributing">
    <img alt="PRs welcome" src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?logo=github" />
  </a>
  <!-- Replace with your repo slug to enable build status -->
  <!-- <a href="https://github.com/your-username/your-repo/actions">
    <img alt="CI" src="https://img.shields.io/github/actions/workflow/status/your-username/your-repo/ci.yml?label=build&logo=github" />
  </a> -->
  <!-- Replace with your live URL -->
  <!-- <a href="https://your-live-demo-url.example.com">
    <img alt="Live Demo" src="https://img.shields.io/badge/Live%20Demo-Visit-10B981?logo=netlify&logoColor=white" />
  </a> -->
</p>


## <img src="https://fav.farm/💱" alt="App icon" height="22" /> Overview

This app converts between currencies using a public API (exchangerate.host) with a fallback to frankfurter.app. If live fetch fails, the app uses built‑in default rates so conversion still works.

- ⚡ Live rate fetching with timeout and fallback
- 🔄 Manual “Refresh Rates” control
- 🔁 One‑tap swap between From/To
- ⌨️ Type in either box; the other updates instantly
- 🧯 Graceful offline/failed fetch handling with banner
- 🎨 Modern, accessible UI


## 📸 Screenshots

![image](https://github.com/MdSaifAli063/Currency-Converter-React/blob/e08be399185d398ad0cf5b8026b3e52e0e73c55d/Screenshot%202025-10-18%20004608_edited.png)


## ✨ Features

- Live rates with intelligent fallback
- Inline conversion while typing (both directions)
- Swap currencies and values
- Quick pairs (configurable)
- Status indicators: last updated, loading spinner
- Keyboard/focus friendly
- Works with Create React App or Vite


## 🧩 Tech stack

- React + Hooks
- Tailwind CSS utility classes
- Fetch with timeouts and graceful error handling
- No backend required


## 📦 Prerequisites

- Node.js 14+ recommended
- npm or yarn

## 🚀 Install

```bash
npm install
# or
yarn
```

### 🧑‍💻 Run (development)

Create React App:
```
npm start
# or
yarn start
```

Vite:
```
npm run dev
# or
yarn dev
```

### 🏗️ Build
```
npm run build
# or
yarn build
```

## 🖱️ Usage

- Enter an amount in the “From” field and pick currencies.
- Click “Convert” to compute, or type in the “To” field to update “From.”
- Click “Swap” to switch currencies and values.
- Click “Refresh” to force re-fetch of live rates.


## 🔧 Implementation notes

- Hook: src/hooks/useCurrencyInfo.js
- Returns { rates, loading, error, refresh }.
- rates keys are lowercase currency codes.
- refresh() triggers a re-fetch.
- On network failure, falls back to built-in DEFAULT_RATES.
- UI components: src/components/… (input/select controls and layout).
  

## 🩺 Troubleshooting

If network times out, the banner appears and offline defaults are used. Ensure your environment allows outbound requests to:
- https://api.exchangerate.host
- https://api.frankfurter.app
- To modify default offline rates, edit DEFAULT_RATES in src/hooks/useCurrencyInfo.js.
- If selects are empty, verify network; the app also initializes with defaults so selects should populate.


## 🌐 APIs used

- exchangerate.host — primary source
- frankfurter.app — fallback source
  

## ⚙️ Configuration

No environment variables required by default. You can:
- Update quick pairs in the App component.
- Tweak the UI in App.css (glassmorphism, gradients, focus, motion-reduction supported).
  

## ☁️ Deployment

- Netlify: drag-and-drop the build folder or connect your repo; set build command npm run build and publish directory build or dist (Vite).
- Vercel: import repo; framework detection picks CRA/Vite automatically.
- GitHub Pages (CRA): npm run build then deploy build with gh-pages.
  
## ⌨️ Shortcuts and a11y

- Tab/Shift+Tab to navigate inputs and buttons.
- Clear focus rings and larger hit targets for controls.
- Reduced motion respected via prefers-reduced-motion.
  
## 🧭 Project structure (excerpt)
```file
src/
  components/
    # UI components (InputBox, etc.)
    hooks/
    useCurrencyInfo.js   # rates, loading, error, refresh
 App.css
 App.jsx
```

## 🤝 Contributing

- Fork + branch from main
- Commit with conventional messages if possible (feat:, fix:, docs:)
- Open a PR — PRs welcome!
  
Quick ideas:

- Add more quick pairs or favorites
- Persist last-used currencies in localStorage
- Add unit tests for the hook
- Add i18n and number formatting locales
  
## 📝 License & Credits

MIT-style — adapt as needed.

APIs:

- https://api.exchangerate.host
- https://api.frankfurter.app
  
Icons/Badges:

- Shields.io badges
- fav.farm emoji icons
  
Made with React and care.
