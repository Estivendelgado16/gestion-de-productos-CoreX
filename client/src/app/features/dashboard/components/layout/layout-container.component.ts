import { Component, EventEmitter, Input, Output } from '@angular/core';

import { HeaderComponent } from './header.component';
import { SidebarComponent } from './sidebar.component';

@Component({
  selector: 'tolla-layout-container',
  imports: [HeaderComponent, SidebarComponent],
  templateUrl: './layout-container.component.html',
  styleUrl: './layout-container.component.scss',
})
export class LayoutContainerComponent {
  @Input() userName: string = '';
  @Input() resultCount: number | null = null;
  @Output() searchChanged = new EventEmitter<string>();
  @Output() navSelected = new EventEmitter<string>();

  onSearch(value: string): void {
    this.searchChanged.emit(value);
  }

  onNav(id: string): void {
    this.navSelected.emit(id);
  }
}
