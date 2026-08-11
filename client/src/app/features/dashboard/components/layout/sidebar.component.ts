import { Component, EventEmitter, Output } from '@angular/core';

export interface SidebarItem {
  id: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'tolla-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  @Output() itemSelected = new EventEmitter<string>();

  readonly items: SidebarItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'grid' },
    { id: 'catalog', label: 'Catalog', icon: 'box' },
    { id: 'ontology', label: 'Ontology', icon: 'network' },
    { id: 'favorites', label: 'Favorites', icon: 'star' },
    { id: 'analytics', label: 'Analytics', icon: 'chart' },
    { id: 'settings', label: 'Settings', icon: 'gear' },
  ];

  activeId: string = 'dashboard';

  select(id: string): void {
    this.activeId = id;
    this.itemSelected.emit(id);
  }
}
