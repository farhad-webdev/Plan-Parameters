import React, { useState } from 'react';
import { WealthResult, WealthInput, projectFinances } from '../utils/calculations';
import { formatBDT } from '../utils/formatters';
import { translations } from '../utils/translations';
import { ShieldAlert, Download, FileText, Printer, ChevronDown } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface ResultsPanelProps {
  result: WealthResult;
  input: WealthInput;
  language: 'en' | 'bn';
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({ result, input, language }) => {
  const t = translations[language];
  const [activeTab, setActiveTab] = useState<'overview' | 'expenses' | 'valueTaka' | 'scenarios' | 'goalCalc' | 'table'>('overview');

  const [customInflation, setCustomInflation] = useState<number>(input.inflationRate);
  const [goalTarget, setGoalTarget] = useState<number>(5000000);
  const [scenarioYears, setScenarioYears] = useState<number>(10);
  const [showExportMenu, setShowExportMenu] = useState<boolean>(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  const scenarioCurrent = projectFinances({
    monthlyIncome: input.monthlyIncome,
    salaryGrowthPct: input.salaryHikePercentage,
    monthlyExpenses: result.totalMonthlyExpenses,
    expenseInflationPct: customInflation,
    savingsReturnPct: input.annualReturnRate,
    years: scenarioYears,
    initialSavings: input.currentSavings,
  });

  const scenarioCutExpenses = projectFinances({
    monthlyIncome: input.monthlyIncome,
    salaryGrowthPct: input.salaryHikePercentage,
    monthlyExpenses: result.totalMonthlyExpenses * 0.9,
    expenseInflationPct: customInflation,
    savingsReturnPct: input.annualReturnRate,
    years: scenarioYears,
    initialSavings: input.currentSavings,
  });

  const scenarioHighReturn = projectFinances({
    monthlyIncome: input.monthlyIncome,
    salaryGrowthPct: input.salaryHikePercentage + 2,
    monthlyExpenses: result.totalMonthlyExpenses,
    expenseInflationPct: customInflation,
    savingsReturnPct: input.annualReturnRate + 2.5,
    years: scenarioYears,
    initialSavings: input.currentSavings,
  });

  const monthlySavingNeeded = Math.max(
    0,
    Math.round(
      (goalTarget - input.currentSavings * Math.pow(1 + input.annualReturnRate / 100 / 12, scenarioYears * 12)) /
        (scenarioYears * 12)
    )
  );

  const exportCSV = () => {
    setExportMessage('CSV downloaded successfully!');
    setTimeout(() => setExportMessage(null), 3000);
    setShowExportMenu(false);

    let csv = 'Year,Age,Monthly Income,Monthly Expense,Monthly Saving,Total Saved,Interest Earned,Ending Balance,Real Purchasing Power\n';
    result.yearlySchedule.forEach((row) => {
      csv += `${row.year},${row.age},${row.beginningBalance},${row.contribution},${row.interestEarned},${row.endingBalance},${row.realPurchasingPower}\n`;
    });
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Future_Wealth_Plan_Bangladesh.csv';
    a.click();
  };

  const exportPDF = () => {
    try {
      setExportMessage('PDF report downloaded successfully!');
      setTimeout(() => setExportMessage(null), 3000);
      setShowExportMenu(false);

      const doc = new jsPDF();
      doc.setFont('courier', 'bold');
      doc.setFontSize(16);
      doc.text('FUTURE WEALTH PLANNER - BANGLADESH', 14, 20);

      doc.setFont('courier', 'normal');
      doc.setFontSize(10);
      doc.text(`Simulation Horizon: ${result.totalYears} Years (Age ${input.currentAge} to ${input.retirementAge})`, 14, 28);

      doc.setFont('courier', 'bold');
      doc.text('1. INCOME & EXPENSES SUMMARY', 14, 40);
      doc.setFont('courier', 'normal');
      doc.text(`- Monthly Income: TK ${input.monthlyIncome.toLocaleString()}`, 18, 48);
      doc.text(`- Monthly Expenses: TK ${result.totalMonthlyExpenses.toLocaleString()}`, 18, 56);
      doc.text(`- Monthly Saving: TK ${result.monthlySaving.toLocaleString()} (${result.savingRate}%)`, 18, 64);

      doc.setFont('courier', 'bold');
      doc.text('2. WEALTH PROJECTION & CORPUS', 14, 78);
      doc.setFont('courier', 'normal');
      doc.text(`- Nominal Future Value (Corpus): TK ${result.nominalFutureValue.toLocaleString()}`, 18, 86);
      doc.text(`- Real Purchasing Power (Today's Value): TK ${result.realFutureValue.toLocaleString()}`, 18, 94);
      doc.text(`- Total Invested Capital: TK ${result.totalInvested.toLocaleString()}`, 18, 102);
      doc.text(`- Total Interest Earned: TK ${result.totalInterestEarned.toLocaleString()}`, 18, 110);

      doc.setFont('courier', 'bold');
      doc.text('3. YEARLY SCHEDULE (FIRST 10 YEARS)', 14, 124);
      doc.setFont('courier', 'normal');
      
      let y = 132;
      result.yearlySchedule.slice(0, 10).forEach((row) => {
        doc.text(`Year ${row.year} (Age ${row.age}): Balance = TK ${row.endingBalance.toLocaleString()}`, 18, y);
        y += 7;
      });

      doc.save('Future_Wealth_Plan_Bangladesh.pdf');
    } catch (e) {
      console.error('PDF export error:', e);
      window.print();
    }
  };

  const handlePrint = () => {
    setShowExportMenu(false);
    window.print();
  };

  return (
    <div className="bg-white dark:bg-black border border-black dark:border-white p-4 sm:p-6 shadow-2xl transition-colors duration-200 relative">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-6 border-b border-black dark:border-white">
        <div>
          <h2 className="text-lg font-bold tracking-tight uppercase">Results & Projections</h2>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
            {result.totalYears} Year Horizon (Age {input.currentAge} to {input.retirementAge})
          </p>
        </div>

        {/* User-Friendly Export Dropdown with Descriptions */}
        <div className="relative">
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="px-4 py-2 text-xs font-mono font-bold border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all flex items-center gap-2"
          >
            <Download size={14} /> Export Report <ChevronDown size={14} />
          </button>

          {exportMessage && (
            <div className="absolute right-0 top-12 bg-black text-white dark:bg-white dark:text-black text-[11px] font-mono px-3 py-1.5 shadow-lg whitespace-nowrap z-50">
              {exportMessage}
            </div>
          )}

          {showExportMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-black border border-black dark:border-white shadow-2xl z-50 font-mono">
              <button
                onClick={exportPDF}
                className="w-full text-left p-3 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black border-b border-black dark:border-white transition-all group"
              >
                <div className="flex items-center gap-2 font-bold text-xs">
                  <FileText size={14} /> Download PDF Report
                </div>
                <div className="text-[10px] text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-300 dark:group-hover:text-neutral-700 mt-0.5">
                  Save summary and 10-year projection as a professional PDF document.
                </div>
              </button>

              <button
                onClick={exportCSV}
                className="w-full text-left p-3 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black border-b border-black dark:border-white transition-all group"
              >
                <div className="flex items-center gap-2 font-bold text-xs">
                  <Download size={14} /> Download CSV Data
                </div>
                <div className="text-[10px] text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-300 dark:group-hover:text-neutral-700 mt-0.5">
                  Export full year-by-year schedule for Excel or Google Sheets.
                </div>
              </button>

              <button
                onClick={handlePrint}
                className="w-full text-left p-3 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all group"
              >
                <div className="flex items-center gap-2 font-bold text-xs">
                  <Printer size={14} /> Print / Save as PDF via Browser
                </div>
                <div className="text-[10px] text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-300 dark:group-hover:text-neutral-700 mt-0.5">
                  Open browser print dialog to print or save the dashboard.
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-6 border-b border-black dark:border-white pb-3">
        {[
          { id: 'overview', label: t.overview },
          { id: 'expenses', label: t.expenses },
          { id: 'valueTaka', label: t.valueTaka },
          { id: 'scenarios', label: t.scenarios },
          { id: 'goalCalc', label: t.goalCalc },
          { id: 'table', label: t.table },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 text-xs font-mono font-bold uppercase border ${
              activeTab === tab.id
                ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                : 'border-transparent hover:border-black dark:hover:border-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fadeIn">
          {result.isDeficit && (
            <div className="p-3 border border-black dark:border-white bg-neutral-100 dark:bg-neutral-900 flex items-center gap-3">
              <ShieldAlert size={20} className="shrink-0" />
              <div>
                <p className="text-xs font-mono font-bold uppercase tracking-wide">
                  {t.deficitWarning}: Deficit of {formatBDT(result.deficitAmount)}/month
                </p>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-0.5">
                  Monthly expenses ({formatBDT(result.totalMonthlyExpenses)}) exceed monthly income ({formatBDT(input.monthlyIncome)}).
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 border border-black dark:border-white">
              <span className="text-[11px] font-mono uppercase text-neutral-600 dark:text-neutral-400 block">Monthly Income</span>
              <span className="text-xl font-bold font-mono mt-1 block">{formatBDT(input.monthlyIncome)}</span>
            </div>
            <div className="p-4 border border-black dark:border-white">
              <span className="text-[11px] font-mono uppercase text-neutral-600 dark:text-neutral-400 block">Monthly Expenses</span>
              <span className="text-xl font-bold font-mono mt-1 block">{formatBDT(result.totalMonthlyExpenses)}</span>
            </div>
            <div className="p-4 border border-black dark:border-white">
              <span className="text-[11px] font-mono uppercase text-neutral-600 dark:text-neutral-400 block">Monthly Saving ({result.savingRate}%)</span>
              <span className="text-xl font-bold font-mono mt-1 block">{formatBDT(result.monthlySaving)}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 border border-black dark:border-white">
              <span className="text-xs font-mono uppercase text-neutral-600 dark:text-neutral-400">Nominal Corpus (Age {input.retirementAge})</span>
              <h3 className="text-2xl font-bold font-mono mt-1">{formatBDT(result.nominalFutureValue)}</h3>
              <p className="text-xs font-mono text-neutral-600 dark:text-neutral-400 mt-2">
                Total Invested: {formatBDT(result.totalInvested)} | Profit: {formatBDT(result.totalInterestEarned)}
              </p>
            </div>
            <div className="p-5 border border-black dark:border-white">
              <span className="text-xs font-mono uppercase text-neutral-600 dark:text-neutral-400">Real Purchasing Power (Today's Taka)</span>
              <h3 className="text-2xl font-bold font-mono mt-1">{formatBDT(result.realFutureValue)}</h3>
              <p className="text-xs font-mono text-neutral-600 dark:text-neutral-400 mt-2">
                Est. Monthly Retirement Income: {formatBDT(result.monthlyRetirementIncomeEstimate)}
              </p>
            </div>
          </div>

          <div className="p-4 border border-black dark:border-white">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase font-bold">Wealth Growth Trajectory</span>
              <span className="text-xs font-mono text-neutral-600 dark:text-neutral-400">Nominal vs Real</span>
            </div>
            <div className="h-48 w-full border border-dashed border-black dark:border-white relative flex items-end p-2">
              <svg className="absolute inset-0 w-full h-full p-2" viewBox="0 0 500 200" preserveAspectRatio="none">
                <polyline
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  points={result.yearlySchedule
                    .map((row, idx, arr) => {
                      const x = (idx / (arr.length - 1 || 1)) * 480 + 10;
                      const maxVal = result.nominalFutureValue || 1;
                      const y = 190 - (row.endingBalance / maxVal) * 180;
                      return `${x},${y}`;
                    })
                    .join(' ')}
                />
              </svg>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'expenses' && (
        <div className="space-y-6 animate-fadeIn">
          <h3 className="text-xs font-mono uppercase font-bold">Expense Breakdown & Analysis</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              {result.expenseBreakdown.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 border border-black dark:border-white font-mono text-xs">
                  <span>{item.name}</span>
                  <span className="font-bold">{formatBDT(item.amount)}</span>
                </div>
              ))}
            </div>
            <div className="p-4 border border-black dark:border-white flex flex-col justify-center items-center text-center">
              <span className="text-xs font-mono uppercase text-neutral-600 dark:text-neutral-400 mb-2">Total Monthly Expenses</span>
              <h3 className="text-2xl font-bold font-mono">{formatBDT(result.totalMonthlyExpenses)}</h3>
              <p className="text-xs font-mono text-neutral-600 dark:text-neutral-400 mt-2">
                Family Members: {result.totalFamilyMembers} | Dependents: {result.totalDependents}
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'valueTaka' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase font-bold">Value of Taka & Inflation Impact</h3>
            <span className="text-xs font-mono font-bold">Inflation: {customInflation}% / yr</span>
          </div>
          <div>
            <input
              type="range"
              min="3"
              max="15"
              step="0.5"
              value={customInflation}
              onChange={(e) => setCustomInflation(Number(e.target.value))}
              className="w-full accent-black dark:accent-white"
            />
          </div>

          <div className="p-4 border border-black dark:border-white font-mono text-xs space-y-2">
            <p className="font-bold uppercase">Purchasing Power Analysis ({result.totalYears} Years)</p>
            <p>• Future Nominal Balance: <span className="font-bold">{formatBDT(result.nominalFutureValue)}</span></p>
            <p>• Real Value in Today's Money: <span className="font-bold">{formatBDT(result.realFutureValue)}</span></p>
            <p>
              • Purchasing power of 1 TK: After {result.totalYears} years, today's 100 TK will buy only what{' '}
              <span className="font-bold">
                {Math.round(100 / Math.pow(1 + customInflation / 100, result.totalYears))} TK
              </span>{' '}
              buys.
            </p>
          </div>
          <div className="p-4 border border-black dark:border-white font-mono text-xs italic">
            "After {result.totalYears} years you will have ৳{result.nominalFutureValue.toLocaleString()}, but in today's value that is only ৳{result.realFutureValue.toLocaleString()}."
          </div>
        </div>
      )}

      {activeTab === 'scenarios' && (
        <div className="space-y-6 animate-fadeIn">
          <h3 className="text-xs font-mono uppercase font-bold">Scenario Comparison (Up to 3 Scenarios)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
            <div className="p-4 border border-black dark:border-white space-y-2">
              <h4 className="font-bold text-xs uppercase">1. Current Path</h4>
              <p className="text-xs">Final Balance:</p>
              <p className="text-lg font-bold">{formatBDT(scenarioCurrent.finalBalance)}</p>
            </div>
            <div className="p-4 border border-black dark:border-white space-y-2">
              <h4 className="font-bold text-xs uppercase">2. Cut Expenses 10%</h4>
              <p className="text-xs">Final Balance:</p>
              <p className="text-lg font-bold">{formatBDT(scenarioCutExpenses.finalBalance)}</p>
            </div>
            <div className="p-4 border border-black dark:border-white space-y-2">
              <h4 className="font-bold text-xs uppercase">3. Higher Return (+2.5%)</h4>
              <p className="text-xs">Final Balance:</p>
              <p className="text-lg font-bold">{formatBDT(scenarioHighReturn.finalBalance)}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'goalCalc' && (
        <div className="space-y-5 animate-fadeIn font-mono">
          <h3 className="text-xs uppercase font-bold">Goal Wealth Calculator</h3>
          <div>
            <label className="block text-xs uppercase mb-1">Target Amount (BDT)</label>
            <input
              type="text"
              value={goalTarget}
              onChange={(e) => setGoalTarget(e.target.value === '' ? 0 : Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-black dark:border-white bg-transparent"
            />
          </div>
          <div className="p-4 border border-black dark:border-white space-y-2">
            <p className="text-xs uppercase font-bold">Requirement to reach {formatBDT(goalTarget)} in {scenarioYears} years:</p>
            <p className="text-lg font-bold">Required Monthly Saving: {formatBDT(monthlySavingNeeded)} / month</p>
          </div>
        </div>
      )}

      {activeTab === 'table' && (
        <div className="space-y-4 animate-fadeIn">
          <h3 className="text-xs font-mono uppercase font-bold">Yearly Projection Schedule</h3>
          <div className="max-h-96 overflow-y-auto border border-black dark:border-white">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-black text-white dark:bg-white dark:text-black sticky top-0">
                <tr>
                  <th className="p-2.5">Yr / Age</th>
                  <th className="p-2.5">Beginning</th>
                  <th className="p-2.5">Deposit</th>
                  <th className="p-2.5">Interest</th>
                  <th className="p-2.5">Ending Balance</th>
                  <th className="p-2.5">Real Value</th>
                </tr>
              </thead>
              <tbody>
                {result.yearlySchedule.map((row) => (
                  <tr key={row.year} className="border-b border-black dark:border-white hover:bg-neutral-100 dark:hover:bg-neutral-900">
                    <td className="p-2.5 font-bold">Yr {row.year} (Age {row.age})</td>
                    <td className="p-2.5">{formatBDT(row.beginningBalance)}</td>
                    <td className="p-2.5">{formatBDT(row.contribution)}</td>
                    <td className="p-2.5">{formatBDT(row.interestEarned)}</td>
                    <td className="p-2.5 font-bold">{formatBDT(row.endingBalance)}</td>
                    <td className="p-2.5">{formatBDT(row.realPurchasingPower)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
