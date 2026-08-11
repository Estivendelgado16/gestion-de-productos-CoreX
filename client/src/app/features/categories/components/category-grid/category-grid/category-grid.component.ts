import { Component, EventEmitter, Input, Output } from '@angular/core';

import { Category } from '../../../../../models/category.model';
import { CategoryCardComponent } from '../category-card/category-card.component';
import { CreateNodeCardComponent } from '../create-node-card/create-node-card.component';

@Component({
  selector: 'tolla-category-grid',
  imports: [CategoryCardComponent, CreateNodeCardComponent],
  templateUrl: './category-grid.component.html',
  styleUrl: './category-grid.component.scss',
})
export class CategoryGridComponent {
  @Input({ required: true }) categories: Category[] = [];
  @Input() loading: boolean = false;

  @Output() categorySelected = new EventEmitter<Category>();
  @Output() categoryEdit = new EventEmitter<Category>();
  @Output() createNode = new EventEmitter<void>();
  @Output() categoryDelete = new EventEmitter<Category>();

  onSelect(category: Category): void {
    this.categorySelected.emit(category);
  }

  onEdit(category: Category): void {
    this.categoryEdit.emit(category);
  }

  onCreate(): void {
    this.createNode.emit();
  }

  onDelete(category: Category): void {
    this.categoryDelete.emit(category);
  }
}
