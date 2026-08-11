export type KpiTone = 'cyan' | 'magenta' | 'purple' | 'amber';

export interface KpiMetric {
  id: string;
  label: string;
  value: string;
  unit?: string;
  delta?: number;
  deltaLabel?: string;
  tone: KpiTone;
  icon?: string;
  tooltip?: string;
}
