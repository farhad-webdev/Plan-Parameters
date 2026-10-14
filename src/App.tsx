import React, { useState, useEffect, useMemo } from 'react';
import { InputsPanel } from './components/InputsPanel';
import { ResultsPanel } from './components/ResultsPanel';
import { WealthInput, calculateWealth } from './utils/calculations';
import { runCalculationUnitTests } from './utils/calculations.test';

const DEFAULT_INPUT: WealthInput = {
  currentAge: 30,
  retirementAge: 60,
  lifeExpectancy: 80,
  currentSavings: 200000,
  monthlyContribution: 10000,
  annualReturnRate: 11.5,
  inflationRate: 7.5,
  stepUpPercentage: 8,
  monthlyIncome: 27000,
  salaryHikePercentage: 8,
  familyMembers: [
    { id: '1', name: 'Spouse', relation: 'Spouse', age: 28, monthlyCost: 8000 },
    { id: '2', name: 'Child 1', relation: 'Child', age: 5, monthlyCost: 5000 },
  ],
  expenses: {
    houseRent: 12000,
    foodAndGroceries: 10000,
    utilityBills: 3000,
    transport: 3000,
    education: 4000,
    medical: 2000,
    loanEmi: 0,
    misc: 3000,
    customExpenses: [],
  },
};

export function App() {
  // Run unit tests on mount for validation
  useEffect(() => {
    try {
      runCalculationUnitTests();
    } catch (e) {
      console.error('Unit tests error:', e);
    }
  }, []);

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('future_wealth_dark') === 'true' || false;
  });

  const [language, setLanguage] = useState<'en' | 'bn'>(() => {
    return (localStorage.getItem('future_wealth_lang') as 'en' | 'bn') || 'en';
  });

  const [input, setInput] = useState<WealthInput>(() => {
    const saved = localStorage.getItem('future_wealth_input');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved input', e);
      }
    }
    return DEFAULT_INPUT;
  });

  // Sync dark mode class on html/root
  useEffect(() => {
    localStorage.setItem('future_wealth_dark', darkMode ? 'true' : 'false');
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Sync language to localStorage
  useEffect(() => {
    localStorage.setItem('future_wealth_lang', language);
  }, [language]);

  // Save input to localStorage on change
  useEffect(() => {
    localStorage.setItem('future_wealth_input', JSON.stringify(input));
  }, [input]);

  const handleReset = () => {
    setInput(DEFAULT_INPUT);
    localStorage.removeItem('future_wealth_input');
  };

  const result = useMemo(() => calculateWealth(input), [input]);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 text-black dark:text-white p-4 sm:p-8 transition-colors duration-200">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Main Grid: Inputs & Results */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5">
            <InputsPanel
              input={input}
              onChange={setInput}
              onReset={handleReset}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
              language={language}
              setLanguage={setLanguage}
            />
          </div>
          <div className="lg:col-span-7">
            <ResultsPanel result={result} input={input} language={language} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
