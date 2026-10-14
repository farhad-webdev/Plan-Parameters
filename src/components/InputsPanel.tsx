import React, { useState } from 'react';
import { WealthInput, PRESET_GOALS, FamilyMember, CustomExpense } from '../utils/calculations';
import { formatBDT } from '../utils/formatters';
import { translations, tooltips } from '../utils/translations';
import { Plus, Trash2, Sun, Moon, HelpCircle } from 'lucide-react';

interface InputsPanelProps {
  input: WealthInput;
  onChange: (input: WealthInput) => void;
  onReset: () => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  language: 'en' | 'bn';
  setLanguage: (lang: 'en' | 'bn') => void;
}

export const InputsPanel: React.FC<InputsPanelProps> = ({
  input,
  onChange,
  onReset,
  darkMode,
  setDarkMode,
  language,
  setLanguage,
}) => {
  const t = translations[language];
  const tips = tooltips[language] || tooltips.en;

  const [activeTab, setActiveTab] = useState<'income' | 'expenses' | 'wealth' | 'goals'>('income');
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const updateField = (key: keyof WealthInput, val: any) => {
    onChange({ ...input, [key]: val });
  };

  const updateExpense = (key: string, val: any) => {
    onChange({
      ...input,
      expenses: {
        ...input.expenses,
        [key]: val,
      },
    });
  };

  // Family members handlers
  const addFamilyMember = () => {
    const newMember: FamilyMember = {
      id: Math.random().toString(36).substring(2, 9),
      name: `Member ${input.familyMembers.length + 1}`,
      relation: 'Child',
      age: 10,
      monthlyCost: 5000,
    };
    onChange({ ...input, familyMembers: [...input.familyMembers, newMember] });
  };

  const removeFamilyMember = (id: string) => {
    onChange({ ...input, familyMembers: input.familyMembers.filter(m => m.id !== id) });
  };

  const updateFamilyMember = (id: string, field: keyof FamilyMember, val: any) => {
    const updated = input.familyMembers.map(m => m.id === id ? { ...m, [field]: val } : m);
    onChange({ ...input, familyMembers: updated });
  };

  // Custom expense handlers
  const addCustomExpense = () => {
    const newCustom: CustomExpense = {
      id: Math.random().toString(36).substring(2, 9),
      name: 'New Expense',
      amount: 2000,
    };
    onChange({
      ...input,
      expenses: {
        ...input.expenses,
        customExpenses: [...(input.expenses.customExpenses || []), newCustom],
      },
    });
  };

  const removeCustomExpense = (id: string) => {
    onChange({
      ...input,
      expenses: {
        ...input.expenses,
        customExpenses: (input.expenses.customExpenses || []).filter(c => c.id !== id),
      },
    });
  };

  const updateCustomExpense = (id: string, field: 'name' | 'amount', val: any) => {
    const updated = (input.expenses.customExpenses || []).map(c => c.id === id ? { ...c, [field]: val } : c);
    onChange({
      ...input,
      expenses: {
        ...input.expenses,
        customExpenses: updated,
      },
    });
  };

  const autoSuggestFood = () => {
    const count = Math.max(1, input.familyMembers.length + 1);
    const suggested = count * 6000;
    updateExpense('foodAndGroceries', suggested);
  };

  return (
    <div className="bg-white dark:bg-black border border-black dark:border-white p-4 sm:p-6 shadow-2xl transition-colors duration-200">
      {/* Top Header & Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-6 border-b border-black dark:border-white">
        <div>
          <h2 className="text-lg font-bold tracking-tight uppercase">
            {t.planParameters}
          </h2>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
            {t.bdt}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
            className="px-3 py-1.5 text-xs font-mono font-bold border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
          >
            {language === 'en' ? 'বাংলা' : 'English'}
          </button>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-1.5 border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
            title="Toggle Theme"
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            onClick={onReset}
            className="px-3 py-1.5 text-xs font-mono font-bold border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
          >
            {t.resetPlan}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="grid grid-cols-4 gap-1 mb-6 border-b border-black dark:border-white pb-3">
        <button
          onClick={() => setActiveTab('income')}
          className={`py-2 text-xs font-mono font-bold uppercase border ${
            activeTab === 'income'
              ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
              : 'border-transparent hover:border-black dark:hover:border-white'
          }`}
        >
          Income & Family
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={`py-2 text-xs font-mono font-bold uppercase border ${
            activeTab === 'expenses'
              ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
              : 'border-transparent hover:border-black dark:hover:border-white'
          }`}
        >
          Expenses
        </button>
        <button
          onClick={() => setActiveTab('wealth')}
          className={`py-2 text-xs font-mono font-bold uppercase border ${
            activeTab === 'wealth'
              ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
              : 'border-transparent hover:border-black dark:hover:border-white'
          }`}
        >
          Wealth & Return
        </button>
        <button
          onClick={() => setActiveTab('goals')}
          className={`py-2 text-xs font-mono font-bold uppercase border ${
            activeTab === 'goals'
              ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
              : 'border-transparent hover:border-black dark:hover:border-white'
          }`}
        >
          Milestones
        </button>
      </div>

      {/* TAB 1: Income & Family */}
      {activeTab === 'income' && (
        <div className="space-y-6 animate-fadeIn">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-mono uppercase tracking-wider flex items-center gap-1">
                {t.monthlyIncome}
                <span
                  className="cursor-pointer text-[10px] underline"
                  onClick={() => setActiveTooltip(activeTooltip === 'monthlyIncome' ? null : 'monthlyIncome')}
                >
                  <HelpCircle size={12} className="inline" />
                </span>
              </label>
              <span className="text-sm font-bold font-mono">{formatBDT(input.monthlyIncome)}</span>
            </div>
            {activeTooltip === 'monthlyIncome' && (
              <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-2 p-2 border border-black dark:border-white font-mono">
                {tips.monthlyIncome}
              </p>
            )}
            <input
              type="text"
              value={input.monthlyIncome}
              onChange={(e) => {
                const val = e.target.value;
                if (val === '') {
                  updateField('monthlyIncome', 0);
                } else if (!isNaN(Number(val))) {
                  updateField('monthlyIncome', Number(val));
                }
              }}
              className="w-full px-3 py-2 text-sm font-mono border border-black dark:border-white bg-transparent focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-mono uppercase tracking-wider flex items-center gap-1">
                {t.salaryHike}
                <span
                  className="cursor-pointer text-[10px] underline"
                  onClick={() => setActiveTooltip(activeTooltip === 'salaryHike' ? null : 'salaryHike')}
                >
                  <HelpCircle size={12} className="inline" />
                </span>
              </label>
              <span className="text-sm font-bold font-mono">{input.salaryHikePercentage}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              step="0.5"
              value={input.salaryHikePercentage}
              onChange={(e) => updateField('salaryHikePercentage', Number(e.target.value))}
              className="w-full accent-black dark:accent-white cursor-pointer"
            />
          </div>

          <div className="pt-4 border-t border-black dark:border-white">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-mono uppercase font-bold tracking-wider">{t.familyDependents}</h3>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400 mt-0.5">
                  Total Members: <span className="font-bold">{input.familyMembers.length + 1}</span> | Dependents:{' '}
                  <span className="font-bold">
                    {input.familyMembers.filter(m => m.relation === 'Child' || m.relation === 'Parent' || m.relation === 'Other').length}
                  </span>
                </p>
              </div>
              <button
                onClick={addFamilyMember}
                className="px-2.5 py-1 text-xs font-mono font-bold border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all flex items-center gap-1"
              >
                <Plus size={14} /> Add Member
              </button>
            </div>

            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {input.familyMembers.map((m) => (
                <div key={m.id} className="p-3 border border-black dark:border-white space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <input
                      type="text"
                      value={m.name}
                      onChange={(e) => updateFamilyMember(m.id, 'name', e.target.value)}
                      placeholder="Name"
                      className="text-xs font-mono font-bold border-b border-black dark:border-white bg-transparent py-0.5 flex-1 focus:outline-none"
                    />
                    <select
                      value={m.relation}
                      onChange={(e) => updateFamilyMember(m.id, 'relation', e.target.value)}
                      className="text-xs font-mono border border-black dark:border-white bg-transparent px-1.5 py-0.5"
                    >
                      <option value="Spouse">Spouse</option>
                      <option value="Child">Child</option>
                      <option value="Parent">Parent</option>
                      <option value="Other">Other</option>
                    </select>
                    <button
                      onClick={() => removeFamilyMember(m.id)}
                      className="p-1 border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                      title="Remove Member"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div>
                      <label className="block text-[10px] text-neutral-600 dark:text-neutral-400">Age</label>
                      <input
                        type="text"
                        value={m.age}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateFamilyMember(m.id, 'age', val === '' ? 0 : Number(val));
                        }}
                        className="w-full border border-black dark:border-white bg-transparent px-2 py-1"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-neutral-600 dark:text-neutral-400">Monthly Cost (TK)</label>
                      <input
                        type="text"
                        value={m.monthlyCost}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateFamilyMember(m.id, 'monthlyCost', val === '' ? 0 : Number(val));
                        }}
                        className="w-full border border-black dark:border-white bg-transparent px-2 py-1"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Monthly Expenses */}
      {activeTab === 'expenses' && (
        <div className="space-y-4 animate-fadeIn max-h-[420px] overflow-y-auto pr-1">
          <div className="flex items-center justify-between pb-2 border-b border-black dark:border-white">
            <h3 className="text-xs font-mono uppercase font-bold tracking-wider">{t.monthlyExpenses}</h3>
            <button
              onClick={autoSuggestFood}
              className="text-[11px] font-mono underline hover:font-bold"
            >
              {t.autoSuggest} Food
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            <div>
              <label className="block text-[11px] font-bold mb-1">{t.houseRent}</label>
              <input
                type="text"
                value={input.expenses.houseRent}
                onChange={(e) => updateExpense('houseRent', e.target.value === '' ? 0 : Number(e.target.value))}
                className="w-full border border-black dark:border-white bg-transparent px-2 py-1.5"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold mb-1">{t.foodGroceries}</label>
              <input
                type="text"
                value={input.expenses.foodAndGroceries}
                onChange={(e) => updateExpense('foodAndGroceries', e.target.value === '' ? 0 : Number(e.target.value))}
                className="w-full border border-black dark:border-white bg-transparent px-2 py-1.5"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold mb-1">{t.utilityBills}</label>
              <input
                type="text"
                value={input.expenses.utilityBills}
                onChange={(e) => updateExpense('utilityBills', e.target.value === '' ? 0 : Number(e.target.value))}
                className="w-full border border-black dark:border-white bg-transparent px-2 py-1.5"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold mb-1">{t.transport}</label>
              <input
                type="text"
                value={input.expenses.transport}
                onChange={(e) => updateExpense('transport', e.target.value === '' ? 0 : Number(e.target.value))}
                className="w-full border border-black dark:border-white bg-transparent px-2 py-1.5"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold mb-1">{t.education}</label>
              <input
                type="text"
                value={input.expenses.education}
                onChange={(e) => updateExpense('education', e.target.value === '' ? 0 : Number(e.target.value))}
                className="w-full border border-black dark:border-white bg-transparent px-2 py-1.5"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold mb-1">{t.medical}</label>
              <input
                type="text"
                value={input.expenses.medical}
                onChange={(e) => updateExpense('medical', e.target.value === '' ? 0 : Number(e.target.value))}
                className="w-full border border-black dark:border-white bg-transparent px-2 py-1.5"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold mb-1">{t.loanEmi}</label>
              <input
                type="text"
                value={input.expenses.loanEmi}
                onChange={(e) => updateExpense('loanEmi', e.target.value === '' ? 0 : Number(e.target.value))}
                className="w-full border border-black dark:border-white bg-transparent px-2 py-1.5"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold mb-1">{t.miscFestival}</label>
              <input
                type="text"
                value={input.expenses.misc}
                onChange={(e) => updateExpense('misc', e.target.value === '' ? 0 : Number(e.target.value))}
                className="w-full border border-black dark:border-white bg-transparent px-2 py-1.5"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-black dark:border-white">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase font-bold">{t.customExpenses}</span>
              <button
                onClick={addCustomExpense}
                className="px-2 py-1 text-xs font-mono font-bold border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black flex items-center gap-1"
              >
                <Plus size={12} /> Add Custom
              </button>
            </div>
            <div className="space-y-2">
              {(input.expenses.customExpenses || []).map((c) => (
                <div key={c.id} className="flex items-center gap-2 font-mono text-xs">
                  <input
                    type="text"
                    value={c.name}
                    onChange={(e) => updateCustomExpense(c.id, 'name', e.target.value)}
                    placeholder="Expense Name"
                    className="border border-black dark:border-white bg-transparent px-2 py-1 flex-1"
                  />
                  <input
                    type="text"
                    value={c.amount}
                    onChange={(e) => updateCustomExpense(c.id, 'amount', e.target.value === '' ? 0 : Number(e.target.value))}
                    className="border border-black dark:border-white bg-transparent px-2 py-1 w-28"
                  />
                  <button
                    onClick={() => removeCustomExpense(c.id)}
                    className="p-1 border border-black dark:border-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Wealth & Return */}
      {activeTab === 'wealth' && (
        <div className="space-y-5 animate-fadeIn">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono uppercase mb-1">{t.currentAge}</label>
              <input
                type="text"
                value={input.currentAge}
                onChange={(e) => updateField('currentAge', e.target.value === '' ? 0 : Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono border border-black dark:border-white bg-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase mb-1">{t.retirementAge}</label>
              <input
                type="text"
                value={input.retirementAge}
                onChange={(e) => updateField('retirementAge', e.target.value === '' ? 0 : Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono border border-black dark:border-white bg-transparent"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-mono uppercase flex items-center gap-1">
                {t.currentSavings}
              </label>
              <span className="text-sm font-bold font-mono">{formatBDT(input.currentSavings)}</span>
            </div>
            <input
              type="text"
              value={input.currentSavings}
              onChange={(e) => updateField('currentSavings', e.target.value === '' ? 0 : Number(e.target.value))}
              className="w-full px-3 py-2 text-sm font-mono border border-black dark:border-white bg-transparent"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-mono uppercase flex items-center gap-1">
                {t.monthlyInvestment}
              </label>
              <span className="text-sm font-bold font-mono">{formatBDT(input.monthlyContribution)}</span>
            </div>
            <input
              type="text"
              value={input.monthlyContribution}
              onChange={(e) => updateField('monthlyContribution', e.target.value === '' ? 0 : Number(e.target.value))}
              className="w-full px-3 py-2 text-sm font-mono border border-black dark:border-white bg-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono uppercase mb-1">{t.expectedReturn} ({input.annualReturnRate}%)</label>
              <input
                type="range"
                min="4"
                max="18"
                step="0.5"
                value={input.annualReturnRate}
                onChange={(e) => updateField('annualReturnRate', Number(e.target.value))}
                className="w-full accent-black dark:accent-white"
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase mb-1">{t.inflationRate} ({input.inflationRate}%)</label>
              <input
                type="range"
                min="3"
                max="15"
                step="0.5"
                value={input.inflationRate}
                onChange={(e) => updateField('inflationRate', Number(e.target.value))}
                className="w-full accent-black dark:accent-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Milestones */}
      {activeTab === 'goals' && (
        <div className="space-y-3 animate-fadeIn">
          <h3 className="text-xs font-mono uppercase font-bold">{t.lifeMilestones}</h3>
          <div className="grid grid-cols-1 gap-2">
            {PRESET_GOALS.map((goal) => (
              <div
                key={goal.id}
                onClick={() => {
                  onChange({
                    ...input,
                    retirementAge: input.currentAge + goal.defaultYears,
                    annualReturnRate: goal.suggestedReturn,
                  });
                }}
                className="p-3 border border-black dark:border-white cursor-pointer hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all group"
              >
                <div className="flex items-center justify-between font-mono font-bold text-xs">
                  <span>{goal.name}</span>
                  <span>{goal.defaultYears} Years</span>
                </div>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-400 group-hover:text-neutral-300 dark:group-hover:text-neutral-700 mt-1">
                  {goal.description}
                </p>
                <p className="text-[10px] font-mono mt-1 underline">
                  Target: {formatBDT(goal.defaultTarget)} | Return: {goal.suggestedReturn}%
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
