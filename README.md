# Future Wealth Planner (Bangladeshi Taka BDT)

A modern, responsive financial planning and retirement web application tailored specifically for Bangladeshi Taka (৳, BDT) economics, inflation, salary growth, family dependents, and investment vehicles (DPS, Sanchayapatra, Fixed Deposits, and Stocks).

---

## Features

1. **Income & Family Section**: Monthly income (default 27,000 TK), expected yearly salary increase %, dynamic family members management (Spouse, Child, Parent, Other with age and personal monthly costs), and automatic counters for total members and dependents.
2. **Monthly Expenses Section**: House rent, food & groceries (with auto-suggest based on family count), utility bills, transport, education, medical, loan/EMI, festival/misc, and custom unlimited expenses.
3. **Live Summary & Deficit Warning**: Real-time Total Income, Total Expenses, Monthly Saving, and Saving Rate %. Automatic red deficit warning if expenses exceed income.
4. **Pure Financial Projection Simulator (`projectFinances`)**: Month-by-month simulation for up to 30 years with salary growth, expense inflation (default 9% for Bangladesh), and compounding savings return (default 7%+). Includes unit tests.
5. **Value of Taka Section**: Nominal vs. Real purchasing power comparison, inflation slider, purchasing power degradation of 1 TK, real return %, and plain-language interpretation.
6. **Scenario Comparison & Goal Calculator**: Compare up to 3 scenarios side-by-side (Current, Cut Expenses 10%, Higher Return) with a combined line chart and goal wealth calculator.
7. **Strictly Black & White (Monochrome) Design**: Minimalist high-contrast aesthetic with light and dark mode support.
8. **Data Persistence & Export**: Saves all inputs to `localStorage` with a Reset option, and supports CSV and PDF / Print export.
9. **Bilingual Support**: Toggle instantly between English and Bangla with tooltip guidance.

---

## Setup & Installation

1. Clone or download the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run development server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```

---

## Deployment (Vercel / Netlify)

### Vercel
1. Push your repository to GitHub.
2. Import the project into [Vercel](https://vercel.com).
3. Build command: `npm run build`
4. Output directory: `dist`
5. Click **Deploy**.

### Netlify
1. Connect your GitHub repository to [Netlify](https://netlify.com).
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Click **Deploy**.
