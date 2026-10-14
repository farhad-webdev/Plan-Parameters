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
    <div className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur-xl border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-2xl transition-all duration-300">
      {/* Top Header & Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 mb-6 border-b border-neutral-200 dark:border-neutral-800">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight uppercase">
            {t.planParameters}
          </h2>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5 font-medium">
            {t.bdt}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setLanguage(language === 'en' ? 'bn' : 'en')}
            className="px-3.5 py-1.5 text-xs font-mono font-bold rounded-full border border-neutral-300 dark:border-neutral-700 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all shadow-sm"
          >
            {language === 'en' ? 'বাংলা' : 'English'}
          </button>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full border border-neutral-300 dark:border-neutral-700 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all shadow-sm"
            title="Toggle Theme"
          >
            {darkMode ? <Sun size={15} /> : <Moon size={15} />}
          </button>
          <button
            onClick={onReset}
            className="px-3.5 py-1.5 text-xs font-mono font-bold rounded-full border border-neutral-300 dark:border-neutral-700 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all shadow-sm"
          >
            {t.resetPlan}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="grid grid-cols-4 gap-1.5 mb-6 p-1 bg-neutral-100 dark:bg-neutral-950 rounded-2xl border border-neutral-200 dark:border-neutral-800">
        {[
          { id: 'income', label: 'Income' },
          { id: 'expenses', label: 'Expenses' },
          { id: 'wealth', label: 'Wealth' },
          { id: 'goals', label: 'Milestones' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-2 text-[11px] font-mono font-bold uppercase rounded-xl transition-all ${
              activeTab === tab.id
                ? 'bg-black text-white dark:bg-white dark:text-black shadow-md'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: Income & Family */}
      {activeTab === 'income' && (
        <div className="space-y-6 animate-fadeIn">
          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950/50 border border-neutral-200 dark:border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase tracking-wider font-semibold flex items-center gap-1.5">
                {t.monthlyIncome}
                <span
                  className="cursor-pointer text-[10px] underline text-neutral-400 hover:text-black dark:hover:text-white"
                  onClick={() => setActiveTooltip(activeTooltip === 'monthlyIncome' ? null : 'monthlyIncome')}
                >
                  <HelpCircle size={13} className="inline" />
                </span>
              </label>
              <span className="text-sm font-bold font-mono px-2.5 py-0.5 rounded-md bg-neutral-200 dark:bg-neutral-800">
                {formatBDT(input.monthlyIncome)}
              </span>
            </div>
            {activeTooltip === 'monthlyIncome' && (
              <p className="text-xs text-neutral-600 dark:text-neutral-400 p-2.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 font-mono">
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
              className="w-full px-4 py-2.5 text-sm font-mono rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all shadow-inner"
            />
          </div>

          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950/50 border border-neutral-200 dark:border-neutral-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase tracking-wider font-semibold">
                {t.salaryHike}
              </label>
              <span className="text-sm font-bold font-mono px-2.5 py-0.5 rounded-md bg-neutral-200 dark:bg-neutral-800">
                {input.salaryHikePercentage}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="25"
              step="0.5"
              value={input.salaryHikePercentage}
              onChange={(e) => updateField('salaryHikePercentage', Number(e.target.value))}
              className="w-full accent-black dark:accent-white cursor-pointer py-2"
            />
          </div>

          <div className="pt-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xs font-mono uppercase font-extrabold tracking-wider">{t.familyDependents}</h3>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-0.5">
                  Total Members: <span className="font-bold">{input.familyMembers.length + 1}</span> | Dependents:{' '}
                  <span className="font-bold">
                    {input.familyMembers.filter(m => m.relation === 'Child' || m.relation === 'Parent' || m.relation === 'Other').length}
                  </span>
                </p>
              </div>
              <button
                onClick={addFamilyMember}
                className="px-3.5 py-2 text-xs font-mono font-bold rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all flex items-center gap-1.5 shadow-sm"
              >
                <Plus size={14} /> Add Member
              </button>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {input.familyMembers.map((m) => (
                <div key={m.id} className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/40 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <input
                      type="text"
                      value={m.name}
                      onChange={(e) => updateFamilyMember(m.id, 'name', e.target.value)}
                      placeholder="Name"
                      className="text-xs font-mono font-bold border-b border-neutral-300 dark:border-neutral-700 bg-transparent py-1 flex-1 focus:outline-none"
                    />
                    <select
                      value={m.relation}
                      onChange={(e) => updateFamilyMember(m.id, 'relation', e.target.value)}
                      className="text-xs font-mono rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-2 py-1"
                    >
                      <option value="Spouse">Spouse</option>
                      <option value="Child">Child</option>
                      <option value="Parent">Parent</option>
                      <option value="Other">Other</option>
                    </select>
                    <button
                      onClick={() => removeFamilyMember(m.id)}
                      className="p-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                      title="Remove Member"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div>
                      <label className="block text-[10px] text-neutral-500 dark:text-neutral-400 mb-1">Age</label>
                      <input
                        type="text"
                        value={m.age}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateFamilyMember(m.id, 'age', val === '' ? 0 : Number(val));
                        }}
                        className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-1.5"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-neutral-500 dark:text-neutral-400 mb-1">Monthly Cost (TK)</label>
                      <input
                        type="text"
                        value={m.monthlyCost}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateFamilyMember(m.id, 'monthlyCost', val === '' ? 0 : Number(val));
                        }}
                        className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-1.5"
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
          <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
            <h3 className="text-xs font-mono uppercase font-extrabold tracking-wider">{t.monthlyExpenses}</h3>
            <button
              onClick={autoSuggestFood}
              className="text-[11px] font-mono underline hover:font-bold text-neutral-600 dark:text-neutral-400"
            >
              {t.autoSuggest} Food
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            {[
              { label: t.houseRent, key: 'houseRent' },
              { label: t.foodGroceries, key: 'foodAndGroceries' },
              { label: t.utilityBills, key: 'utilityBills' },
              { label: t.transport, key: 'transport' },
              { label: t.education, key: 'education' },
              { label: t.medical, key: 'medical' },
              { label: t.loanEmi, key: 'loanEmi' },
              { label: t.miscFestival, key: 'misc' },
            ].map((item) => (
              <div key={item.key} className="p-3 rounded-2xl bg-neutral-50 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800">
                <label className="block text-[11px] font-bold mb-1.5 text-neutral-700 dark:text-neutral-300">{item.label}</label>
                <input
                  type="text"
                  value={(input.expenses as any)[item.key]}
                  onChange={(e) => updateExpense(item.key, e.target.value === '' ? 0 : Number(e.target.value))}
                  className="w-full rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-2 text-xs font-mono"
                />
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase font-extrabold">{t.customExpenses}</span>
              <button
                onClick={addCustomExpense}
                className="px-3 py-1.5 text-xs font-mono font-bold rounded-xl border border-neutral-300 dark:border-neutral-700 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all flex items-center gap-1 shadow-sm"
              >
                <Plus size={13} /> Add Custom
              </button>
            </div>
            <div className="space-y-2.5">
              {(input.expenses.customExpenses || []).map((c) => (
                <div key={c.id} className="flex items-center gap-2.5 font-mono text-xs p-2 rounded-xl bg-neutral-50 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800">
                  <input
                    type="text"
                    value={c.name}
                    onChange={(e) => updateCustomExpense(c.id, 'name', e.target.value)}
                    placeholder="Expense Name"
                    className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-1.5 flex-1"
                  />
                  <input
                    type="text"
                    value={c.amount}
                    onChange={(e) => updateCustomExpense(c.id, 'amount', e.target.value === '' ? 0 : Number(e.target.value))}
                    className="rounded-lg border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 px-3 py-1.5 w-28"
                  />
                  <button
                    onClick={() => removeCustomExpense(c.id)}
                    className="p-1.5 rounded-lg border border-neutral-300 dark:border-neutral-700 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all"
                  >
                    <Trash2 size={13} />
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
            <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800">
              <label className="block text-xs font-mono uppercase mb-1 font-bold">{t.currentAge}</label>
              <input
                type="text"
                value={input.currentAge}
                onChange={(e) => updateField('currentAge', e.target.value === '' ? 0 : Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
              />
            </div>
            <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800">
              <label className="block text-xs font-mono uppercase mb-1 font-bold">{t.retirementAge}</label>
              <input
                type="text"
                value={input.retirementAge}
                onChange={(e) => updateField('retirementAge', e.target.value === '' ? 0 : Number(e.target.value))}
                className="w-full px-3 py-2 text-sm font-mono rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
              />
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase font-bold">{t.currentSavings}</label>
              <span className="text-sm font-bold font-mono px-2 py-0.5 rounded-md bg-neutral-200 dark:bg-neutral-800">{formatBDT(input.currentSavings)}</span>
            </div>
            <input
              type="text"
              value={input.currentSavings}
              onChange={(e) => updateField('currentSavings', e.target.value === '' ? 0 : Number(e.target.value))}
              className="w-full px-3 py-2 text-sm font-mono rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
            />
          </div>

          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase font-bold">{t.monthlyInvestment}</label>
              <span className="text-sm font-bold font-mono px-2 py-0.5 rounded-md bg-neutral-200 dark:bg-neutral-800">{formatBDT(input.monthlyContribution)}</span>
            </div>
            <input
              type="text"
              value={input.monthlyContribution}
              onChange={(e) => updateField('monthlyContribution', e.target.value === '' ? 0 : Number(e.target.value))}
              className="w-full px-3 py-2 text-sm font-mono rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800 space-y-2">
              <label className="block text-xs font-mono uppercase font-bold">{t.expectedReturn} ({input.annualReturnRate}%)</label>
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
            <div className="p-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-950/40 border border-neutral-200 dark:border-neutral-800 space-y-2">
              <label className="block text-xs font-mono uppercase font-bold">{t.inflationRate} ({input.inflationRate}%)</label>
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
          <h3 className="text-xs font-mono uppercase font-extrabold mb-3">{t.lifeMilestones}</h3>
          <div className="grid grid-cols-1 gap-3">
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
                className="p-4 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-neutral-950/40 cursor-pointer hover:border-black dark:hover:border-white transition-all group shadow-sm hover:shadow-md"
              >
                <div className="flex items-center justify-between font-mono font-bold text-xs">
                  <span>{goal.name}</span>
                  <span className="px-2 py-0.5 rounded-md bg-neutral-200 dark:bg-neutral-800">{goal.defaultYears} Years</span>
                </div>
                <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1.5">
                  {goal.description}
                </p>
                <p className="text-[10px] font-mono mt-2 underline font-semibold">
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
