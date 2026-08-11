import { Component, Input } from '@angular/core';

import { KpiMetric } from '../../../../../../../models/kpi.model';
import { KpiCardComponent } from '../kpi-card/kpi-card.component';

@Component({
  selector: 'tolla-kpi-grid',
  imports: [KpiCardComponent],
  templateUrl: './kpi-grid.component.html',
  styleUrl: './kpi-grid.component.scss',
})
export class KpiGridComponent {
  @Input({ required: true }) kpis: KpiMetric[] = [];
}
