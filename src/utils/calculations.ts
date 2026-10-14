export interface FamilyMember {
  id: string;
  name: string;
  relation: 'Spouse' | 'Child' | 'Parent' | 'Other';
  age: number;
  monthlyCost: number;
}

export interface CustomExpense {
  id: string;
  name: string;
  amount: number;
}

export interface MonthlyExpenses {
  houseRent: number;
  foodAndGroceries: number;
  utilityBills: number;
  transport: number;
  education: number;
  medical: number;
  loanEmi: number;
  misc: number;
  customExpenses: CustomExpense[];
}

export interface WealthInput {
  currentAge: number;
  retirementAge: number;
  lifeExpectancy: number;
  currentSavings: number;
  monthlyContribution: number;
  annualReturnRate: number; // e.g. 11.5%
  inflationRate: number; // e.g. 7.5%
  stepUpPercentage?: number; // annual increase in monthly contribution
  monthlyIncome: number; // default 27000
  salaryHikePercentage: number; // default 8%
  familyMembers: FamilyMember[];
  expenses: MonthlyExpenses;
}

export interface YearProjection {
  year: number;
  age: number;
  beginningBalance: number;
  contribution: number;
  interestEarned: number;
  endingBalance: number;
  realPurchasingPower: number; // adjusted for inflation
}

export interface WealthResult {
  totalYears: number;
  totalInvested: number;
  totalInterestEarned: number;
  nominalFutureValue: number;
  realFutureValue: number; // in today's taka purchasing power
  yearlySchedule: YearProjection[];
  monthlyRetirementIncomeEstimate: number; // 4% safe withdrawal rule
  totalFamilyMembers: number;
  totalDependents: number;
  totalFamilyMonthlyCost: number;
  netDisposableIncome: number;
  totalMonthlyExpenses: number;
  monthlySaving: number;
  savingRate: number;
  isDeficit: boolean;
  deficitAmount: number;
  expenseBreakdown: { name: string; amount: number }[];
}

export function calculateWealth(input: WealthInput): WealthResult {
  const totalYears = Math.max(1, input.retirementAge - input.currentAge);
  const monthlyRate = input.annualReturnRate / 100 / 12;
  const annualInflation = input.inflationRate / 100;

  let currentBalance = input.currentSavings;
  let totalInvested = input.currentSavings;
  let totalInterest = 0;
  let currentMonthlyContrib = input.monthlyContribution;

  const totalFamilyMembers = input.familyMembers.length;
  const totalDependents = input.familyMembers.filter(
    (m) => m.relation === 'Child' || m.relation === 'Parent' || m.relation === 'Other'
  ).length;
  
  const totalFamilyMonthlyCost = input.familyMembers.reduce((sum, m) => sum + (isNaN(m.monthlyCost) ? 0 : m.monthlyCost), 0);
  
  const exp = input.expenses;
  const customExpTotal = (exp.customExpenses || []).reduce((sum, c) => sum + (isNaN(c.amount) ? 0 : c.amount), 0);
  const totalMonthlyExpenses = 
    (exp.houseRent || 0) +
    (exp.foodAndGroceries || 0) +
    (exp.utilityBills || 0) +
    (exp.transport || 0) +
    (exp.education || 0) +
    (exp.medical || 0) +
    (exp.loanEmi || 0) +
    (exp.misc || 0) +
    customExpTotal +
    totalFamilyMonthlyCost;

  const monthlySaving = input.monthlyIncome - totalMonthlyExpenses;
  const savingRate = input.monthlyIncome > 0 ? (monthlySaving / input.monthlyIncome) * 100 : 0;
  const isDeficit = monthlySaving < 0;
  const deficitAmount = isDeficit ? Math.abs(monthlySaving) : 0;
  const netDisposableIncome = Math.max(0, monthlySaving);

  const expenseBreakdown = [
    { name: 'House Rent', amount: exp.houseRent || 0 },
    { name: 'Food & Groceries', amount: exp.foodAndGroceries || 0 },
    { name: 'Utilities', amount: exp.utilityBills || 0 },
    { name: 'Transport', amount: exp.transport || 0 },
    { name: 'Education', amount: exp.education || 0 },
    { name: 'Medical', amount: exp.medical || 0 },
    { name: 'Loan / EMI', amount: exp.loanEmi || 0 },
    { name: 'Misc / Festival', amount: exp.misc || 0 },
    { name: 'Family Members', amount: totalFamilyMonthlyCost },
    ...(exp.customExpenses || []).map(c => ({ name: c.name || 'Custom', amount: c.amount || 0 })),
  ].filter(item => item.amount > 0);

  const schedule: YearProjection[] = [];

  let currentContrib = input.monthlyContribution;

  for (let i = 1; i <= totalYears; i++) {
    const beginningBalance = currentBalance;
    let yearContribution = 0;
    let yearInterest = 0;

    for (let m = 1; m <= 12; m++) {
      const interestOnCurrent = currentBalance * monthlyRate;
      const interestOnContrib = currentContrib * (monthlyRate / 2);
      const monthInterest = interestOnCurrent + interestOnContrib;

      yearInterest += monthInterest;
      yearContribution += currentContrib;
      currentBalance += currentContrib + monthInterest;
    }

    totalInvested += yearContribution;
    totalInterest += yearInterest;

    const discountFactor = Math.pow(1 + annualInflation, i);
    const realPurchasingPower = currentBalance / discountFactor;

    schedule.push({
      year: i,
      age: input.currentAge + i,
      beginningBalance: Math.round(beginningBalance),
      contribution: Math.round(yearContribution),
      interestEarned: Math.round(yearInterest),
      endingBalance: Math.round(currentBalance),
      realPurchasingPower: Math.round(realPurchasingPower),
    });

    if (input.stepUpPercentage && input.stepUpPercentage > 0) {
      currentContrib *= (1 + input.stepUpPercentage / 100);
    }
  }

  const nominalFutureValue = currentBalance;
  const discountTotal = Math.pow(1 + annualInflation, totalYears);
  const realFutureValue = nominalFutureValue / discountTotal;

  const annualWithdrawal = nominalFutureValue * 0.04;
  const monthlyRetirementIncomeEstimate = annualWithdrawal / 12;

  return {
    totalYears,
    totalInvested: Math.round(totalInvested),
    totalInterestEarned: Math.round(totalInterest),
    nominalFutureValue: Math.round(nominalFutureValue),
    realFutureValue: Math.round(realFutureValue),
    yearlySchedule: schedule,
    monthlyRetirementIncomeEstimate: Math.round(monthlyRetirementIncomeEstimate),
    totalFamilyMembers,
    totalDependents,
    totalFamilyMonthlyCost,
    netDisposableIncome,
    totalMonthlyExpenses,
    monthlySaving,
    savingRate: Number(savingRate.toFixed(1)),
    isDeficit,
    deficitAmount,
    expenseBreakdown,
  };
}

export interface ProjectFinancesInput {
  monthlyIncome: number;
  salaryGrowthPct: number; // default 8%
  monthlyExpenses: number;
  expenseInflationPct: number; // default 9% for Bangladesh
  savingsReturnPct: number; // default 7% annual return on savings
  years: number; // 1 to 30, default 10
  initialSavings?: number;
}

export interface YearlyProjectionRow {
  year: number;
  monthlyIncome: number;
  monthlyExpense: number;
  monthlySaving: number;
  totalSavedDeposits: number;
  interestEarned: number;
  balance: number;
}

export interface ProjectFinancesResult {
  yearlyRows: YearlyProjectionRow[];
  finalBalance: number;
  totalDeposited: number;
  totalInterestEarned: number;
}

/**
 * Pure, well-commented function that simulates month by month for N years.
 */
export function projectFinances(inputs: ProjectFinancesInput): ProjectFinancesResult {
  const years = Math.max(1, Math.min(30, inputs.years ?? 10));
  const salaryGrowth = (inputs.salaryGrowthPct ?? 8) / 100;
  const expenseInflation = (inputs.expenseInflationPct ?? 9) / 100;
  const annualReturn = (inputs.savingsReturnPct ?? 7) / 100;
  const monthlyReturn = annualReturn / 12;

  let currentIncome = inputs.monthlyIncome;
  let currentExpense = inputs.monthlyExpenses;
  let balance = inputs.initialSavings ?? 0;
  let totalInterestEarned = 0;

  const yearlyRows: YearlyProjectionRow[] = [];
  let cumulativeDeposits = inputs.initialSavings ?? 0;

  for (let y = 1; y <= years; y++) {
    let yearDeposits = 0;

    for (let m = 1; m <= 12; m++) {
      const monthlySaving = currentIncome - currentExpense;
      const interestOnBalance = balance * monthlyReturn;
      totalInterestEarned += interestOnBalance;

      balance += interestOnBalance + monthlySaving;
      cumulativeDeposits += monthlySaving;
      yearDeposits += monthlySaving;
    }

    yearlyRows.push({
      year: y,
      monthlyIncome: Math.round(currentIncome),
      monthlyExpense: Math.round(currentExpense),
      monthlySaving: Math.round(currentIncome - currentExpense),
      totalSavedDeposits: Math.round(cumulativeDeposits),
      interestEarned: Math.round(totalInterestEarned),
      balance: Math.round(balance),
    });

    // Grow income and expenses annually
    currentIncome *= (1 + salaryGrowth);
    currentExpense *= (1 + expenseInflation);
  }

  return {
    yearlyRows,
    finalBalance: Math.round(balance),
    totalDeposited: Math.round(cumulativeDeposits),
    totalInterestEarned: Math.round(totalInterestEarned),
  };
}

export interface PresetGoal {
  id: string;
  name: string;
  defaultTarget: number;
  defaultYears: number;
  description: string;
  suggestedReturn: number;
}

export const PRESET_GOALS: PresetGoal[] = [
  {
    id: 'retirement',
    name: 'Comfortable Retirement',
    defaultTarget: 25000000,
    defaultYears: 25,
    description: 'Build a secure retirement corpus for expenses, healthcare, and leisure in Bangladesh.',
    suggestedReturn: 11.5,
  },
  {
    id: 'dhaka_apartment',
    name: 'Dhaka Apartment / Land',
    defaultTarget: 15000000,
    defaultYears: 10,
    description: 'Down payment and phased installments for a modern apartment in Dhaka or Chattogram.',
    suggestedReturn: 10.0,
  },
  {
    id: 'child_education',
    name: 'Child Higher Education Fund',
    defaultTarget: 6000000,
    defaultYears: 15,
    description: 'Fund top private university tuition or study abroad expenses for your children.',
    suggestedReturn: 11.0,
  },
  {
    id: 'emergency_wealth',
    name: 'Emergency & Safety Corpus',
    defaultTarget: 2000000,
    defaultYears: 5,
    description: 'Liquid reserves in DPS, FDR, and short-term secure instruments for 12 months of living costs.',
    suggestedReturn: 9.5,
  },
];
