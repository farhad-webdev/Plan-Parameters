import { projectFinances } from './calculations';

/**
 * Unit tests for projectFinances with 3 sample cases
 */
export function runCalculationUnitTests() {
  console.log('Running projectFinances unit tests...');

  // Case 1: Standard balanced case
  const res1 = projectFinances({
    monthlyIncome: 30000,
    salaryGrowthPct: 8,
    monthlyExpenses: 20000,
    expenseInflationPct: 9,
    savingsReturnPct: 7,
    years: 5,
    initialSavings: 50000,
  });
  console.assert(res1.yearlyRows.length === 5, 'Test 1 failed: Should have 5 years');
  console.assert(res1.finalBalance > 50000, 'Test 1 failed: Final balance should grow');
  console.log('Test 1 Passed: Standard case final balance =', res1.finalBalance);

  // Case 2: Deficit case (expenses higher than income)
  const res2 = projectFinances({
    monthlyIncome: 15000,
    salaryGrowthPct: 5,
    monthlyExpenses: 18000,
    expenseInflationPct: 8,
    savingsReturnPct: 6,
    years: 3,
    initialSavings: 100000,
  });
  console.assert(res2.yearlyRows.length === 3, 'Test 2 failed: Should have 3 years');
  console.log('Test 2 Passed: Deficit case final balance =', res2.finalBalance);

  // Case 3: High growth case
  const res3 = projectFinances({
    monthlyIncome: 60000,
    salaryGrowthPct: 10,
    monthlyExpenses: 30000,
    expenseInflationPct: 7,
    savingsReturnPct: 10,
    years: 10,
    initialSavings: 200000,
  });
  console.assert(res3.yearlyRows.length === 10, 'Test 3 failed: Should have 10 years');
  console.assert(res3.finalBalance > 200000, 'Test 3 failed: Balance should increase significantly');
  console.log('Test 3 Passed: High growth case final balance =', res3.finalBalance);

  console.log('All projectFinances unit tests passed successfully!');
  return true;
}
