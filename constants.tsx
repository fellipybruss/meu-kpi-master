
import { Indicator, IndicatorUnit, GoalFormat } from './types';

export const INITIAL_INDICATORS: Indicator[] = [
  {
    id: '23',
    index: '23',
    name: 'Taxa de reoperação em 30 dias',
    numeratorLabel: 'Nº de Reinternações em até 30 dias após cirurgia bariátrica',
    denominatorLabel: 'Nº total de pacientes submetidos a cirurgia bariátrica no HSJR',
    period: 'MENSAL',
    unit: IndicatorUnit.PERCENTAGE,
    goal: 0.71,
    goalFormat: GoalFormat.LOWER_BETTER,
    data: [
      { id: 'd1', month: 1, year: 2026, numeratorValue: 0, denominatorValue: 5, result: 0 },
      { id: 'd2', month: 2, year: 2026, numeratorValue: 0, denominatorValue: 4, result: 0 },
      { id: 'd3', month: 3, year: 2026, numeratorValue: 0, denominatorValue: 6, result: 0 },
      { id: 'd4', month: 4, year: 2026, numeratorValue: 0, denominatorValue: 6, result: 0 },
    ]
  },
  {
    id: '1',
    index: '01',
    name: 'Taxa de adesão à Ficha Médica Inicial',
    numeratorLabel: 'Total de fichas médicas preenchidas',
    denominatorLabel: 'Total de pacientes primários',
    period: 'BASELINE',
    unit: IndicatorUnit.PERCENTAGE,
    goal: 85,
    goalFormat: GoalFormat.HIGHER_BETTER,
    data: [
      { id: 'm1', month: 1, year: 2026, numeratorValue: 80, denominatorValue: 100, result: 80 },
      { id: 'm2', month: 2, year: 2026, numeratorValue: 90, denominatorValue: 100, result: 90 },
      { id: 'm3', month: 3, year: 2026, numeratorValue: 85, denominatorValue: 100, result: 85 },
    ]
  }
];

export const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];
