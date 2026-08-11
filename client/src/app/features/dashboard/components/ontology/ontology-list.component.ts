import { Component, EventEmitter, Input, Output } from '@angular/core';

import { Category } from '../../../../models/category.model';
import { CategoryCardComponent } from './category-card.component';
import { CreateNodeCardComponent } from './create-node-card.component';

@Component({
  selector: 'tolla-ontology-list',
  imports: [CategoryCardComponent, CreateNodeCardComponent],
  templateUrl: './ontology-list.component.html',
  styleUrl: './ontology-list.component.scss',
})
export class OntologyListComponent {
  @Input({ required: true }) categories: Category[] = [];
  @Input() loading: boolean = false;

  @Output() categorySelected = new EventEmitter<Category>();
  @Output() categoryEdit = new EventEmitter<Category>();
  @Output() createNode = new EventEmitter<void>();

  onSelect(category: Category): void {
    this.categorySelected.emit(category);
  }

  onEdit(category: Category): void {
    this.categoryEdit.emit(category);
  }

  onCreate(): void {
    this.createNode.emit();
  }
}
