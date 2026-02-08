
export enum GoalFormat {
  HIGHER_BETTER = 'Maior - Melhor',
  LOWER_BETTER = 'Menor - Melhor'
}

export enum IndicatorUnit {
  PERCENTAGE = 'PERCENTUAL',
  DAY = 'DIA',
  MINUTES = 'MINUTOS',
  HOURS = 'HORAS'
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface MonthlyData {
  id: string;
  month: number;
  year: number;
  numeratorValue: number;
  denominatorValue: number;
  result: number;
}

export interface ActionPlan {
  id: string;
  indicatorId: string;
  indicatorName: string;
  description: string;
  rootCause: string;
  responsible: string;
  deadline: string;
  status: 'Pendente' | 'Em Andamento' | 'Concluído' | 'Atrasado';
  createdAt: string;
}

export interface Indicator {
  id: string;
  index: string;
  name: string;
  numeratorLabel: string;
  denominatorLabel: string;
  period: string;
  unit: IndicatorUnit;
  goal: number;
  goalFormat: GoalFormat;
  data: MonthlyData[];
}

export type ViewType = 'dashboard' | 'list' | 'create' | 'details' | 'entry' | 'plans' | 'import' | 'users';
