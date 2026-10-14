import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { WealthInput, FamilyMember, CustomExpense, MonthlyExpenses, PRESET_GOALS, WealthResult, calculateWealth } from '../utils/calculations';

interface WealthState {
  input: WealthInput;
  selectedGoalId: string;
  lang: 'en' | 'bn';
}

type WealthAction =
  | { type: 'SET_FIELD'; field: keyof WealthInput; value: any }
  | { type: 'SET_EXPENSE_FIELD'; field: keyof MonthlyExpenses; value: any }
  | { type: 'SET_GOAL'; goalId: string }
  | { type: 'ADD_FAMILY_MEMBER'; member: FamilyMember }
  | { type: 'REMOVE_FAMILY_MEMBER'; id: string }
  | { type: 'UPDATE_FAMILY_MEMBER'; id: string; field: keyof FamilyMember; value: any }
  | { type: 'ADD_CUSTOM_EXPENSE'; expense: CustomExpense }
  | { type: 'REMOVE_CUSTOM_EXPENSE'; id: string }
  | { type: 'UPDATE_CUSTOM_EXPENSE'; id: string; field: keyof CustomExpense; value: any }
  | { type: 'TOGGLE_LANG' }
  | { type: 'RESET_STATE' };

const STORAGE_KEY = 'future_wealth_planner_state_v1';

const defaultState: WealthState = {
  input: {
    currentAge: 30,
    retirementAge: 55,
    lifeExpectancy: 75,
    currentSavings: 500000,
    monthlyContribution: 25000,
    annualReturnRate: 11.5,
    inflationRate: 7.5,
    stepUpPercentage: 5,
    monthlyIncome: 45000,
    salaryHikePercentage: 8,
    familyMembers: [
      { id: '1', name: 'Rahim', relation: 'Spouse', age: 28, monthlyCost: 8000 },
      { id: '2', name: 'Tanha', relation: 'Child', age: 4, monthlyCost: 5000 },
    ],
    expenses: {
      houseRent: 12000,
      foodAndGroceries: 14000,
      utilityBills: 3500,
      transport: 3000,
      education: 5000,
      medical: 2500,
      loanEmi: 0,
      misc: 3000,
      customExpenses: [
        { id: 'c1', name: 'Streaming & Internet', amount: 1200 },
      ],
    },
  },
  selectedGoalId: 'retirement',
  lang: 'en',
};

function getInitialState(): WealthState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...defaultState, ...parsed };
    }
  } catch (e) {
    console.error('Failed to load state from localStorage', e);
  }
  return defaultState;
}

function wealthReducer(state: WealthState, action: WealthAction): WealthState {
  let nextState = state;

  switch (action.type) {
    case 'SET_FIELD':
      nextState = {
        ...state,
        input: {
          ...state.input,
          [action.field]: isNaN(action.value) ? 0 : Math.max(0, action.value),
        },
      };
      break;
    case 'SET_EXPENSE_FIELD':
      nextState = {
        ...state,
        input: {
          ...state.input,
          expenses: {
            ...state.input.expenses,
            [action.field]: isNaN(action.value) ? 0 : Math.max(0, action.value),
          },
        },
      };
      break;
    case 'SET_GOAL': {
      const goal = PRESET_GOALS.find((g) => g.id === action.goalId);
      const newRetirementAge = goal ? state.input.currentAge + goal.defaultYears : state.input.retirementAge;
      nextState = {
        ...state,
        selectedGoalId: action.goalId,
        input: {
          ...state.input,
          retirementAge: Math.min(80, Math.max(state.input.currentAge + 1, newRetirementAge)),
          annualReturnRate: goal ? goal.suggestedReturn : state.input.annualReturnRate,
        },
      };
      break;
    }
    case 'ADD_FAMILY_MEMBER':
      nextState = {
        ...state,
        input: {
          ...state.input,
          familyMembers: [...state.input.familyMembers, action.member],
        },
      };
      break;
    case 'REMOVE_FAMILY_MEMBER':
      nextState = {
        ...state,
        input: {
          ...state.input,
          familyMembers: state.input.familyMembers.filter((m) => m.id !== action.id),
        },
      };
      break;
    case 'UPDATE_FAMILY_MEMBER':
      nextState = {
        ...state,
        input: {
          ...state.input,
          familyMembers: state.input.familyMembers.map((m) =>
            m.id === action.id ? { ...m, [action.field]: action.field === 'age' || action.field === 'monthlyCost' ? Math.max(0, Number(action.value) || 0) : action.value } : m
          ),
        },
      };
      break;
    case 'ADD_CUSTOM_EXPENSE':
      nextState = {
        ...state,
        input: {
          ...state.input,
          expenses: {
            ...state.input.expenses,
            customExpenses: [...state.input.expenses.customExpenses, action.expense],
          },
        },
      };
      break;
    case 'REMOVE_CUSTOM_EXPENSE':
      nextState = {
        ...state,
        input: {
          ...state.input,
          expenses: {
            ...state.input.expenses,
            customExpenses: state.input.expenses.customExpenses.filter((c) => c.id !== action.id),
          },
        },
      };
      break;
    case 'UPDATE_CUSTOM_EXPENSE':
      nextState = {
        ...state,
        input: {
          ...state.input,
          expenses: {
            ...state.input.expenses,
            customExpenses: state.input.expenses.customExpenses.map((c) =>
              c.id === action.id ? { ...c, [action.field]: action.field === 'amount' ? Math.max(0, Number(action.value) || 0) : action.value } : c
            ),
          },
        },
      };
      break;
    case 'TOGGLE_LANG':
      nextState = {
        ...state,
        lang: state.lang === 'en' ? 'bn' : 'en',
      };
      break;
    case 'RESET_STATE':
      localStorage.removeItem(STORAGE_KEY);
      return defaultState;
    default:
      return state;
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
  } catch (e) {
    console.error('Failed to save state to localStorage', e);
  }

  return nextState;
}

interface WealthContextType {
  state: WealthState;
  dispatch: React.Dispatch<WealthAction>;
  result: WealthResult;
}

const WealthContext = createContext<WealthContextType | undefined>(undefined);

export const WealthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(wealthReducer, undefined, getInitialState);
  const result = calculateWealth(state.input);

  return (
    <WealthContext.Provider value={{ state, dispatch, result }}>
      {children}
    </WealthContext.Provider>
  );
};

export const useWealth = () => {
  const context = useContext(WealthContext);
  if (!context) {
    throw new Error('useWealth must be used within a WealthProvider');
  }
  return context;
};
