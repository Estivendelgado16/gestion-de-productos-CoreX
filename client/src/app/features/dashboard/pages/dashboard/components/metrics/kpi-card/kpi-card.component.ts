import { Component, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';

import { KpiMetric } from '../../../../../../../models/kpi.model';

@Component({
  selector: 'tolla-kpi-card',
  imports: [DecimalPipe],
  templateUrl: './kpi-card.component.html',
  styleUrl: './kpi-card.component.scss',
})
export class KpiCardComponent {
  @Input({ required: true }) kpi!: KpiMetric;
}
