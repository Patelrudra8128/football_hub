# ⚽ Football Score — World Cup AI Dashboard

**Football Score** is a premium, real-time FIFA World Cup dashboard and matches telemetry visualizer. Built with a focus on immersive aesthetics and advanced analytics, it features live scores, tactical squad lineups, tournament bracket modeling, and an algorithmic AI forecast system.

---

## ✨ Features Spotlight

* 🌐 **Localization & RTL Suite**: Fully localized in English, Spanish, French, German, Portuguese, and Arabic with dynamic Right-to-Left (RTL) layout switching.
* 🌓 **Dynamic Theme Integration**: Curated light/dark templates utilizing fluid CSS variables and transitions.
* 🤖 **AI Match Predictor**: A rule-based machine engine computing winning probabilities, draw percentages, expected goals (xG), and contextual tactical reasoning.
* 📊 **ESPN API Telemetry**: Dynamic live feeds fetched via a custom API routing proxy, returning goal timeline events, match statistics (possession, shots, card counts), and lineups.
* 🏆 **Standings & Bracket Projection**: Real-time World Cup group standings tables, FIFA world ranking indexing, and visual knockout projection diagrams.
* 🎛️ **Reactivity**: Integrated subscriber hooks on team favorite pins, state updates, and local caching layers.

---

## 📸 Screenshots & Architecture

For a deep dive into the code implementation details, the mathematical weights of the prediction engine, proxy route handlers, and database fallbacks, please refer to:
👉 **[Detailed Project Documentation](file:///g:/FIFA-web/DOCUMENTATION.md)**

---

## 🚀 Getting Started

Follow these steps to run the application locally on your system:

### 1. Install Dependencies
```bash
npm install
```

### 2. Launch Local Dev Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser to interact with the dashboard.

### 3. Build for Production
To generate and run optimized production builds:
```bash
npm run build
npm run start
```

---

## 🛠️ Technology Stack
* **Framework**: Next.js 15 (App Router) & React 19
* **Styles**: Tailwind CSS v4 & PostCSS
* **Animations**: Framer Motion v12
* **Graphics**: Recharts v3 & Lucide Icons
