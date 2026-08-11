import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DatePipe } from '@angular/common';

import { Category } from '../../../../models/category.model';

@Component({
  selector: 'tolla-category-card',
  imports: [DatePipe],
  templateUrl: './category-card.component.html',
  styleUrl: './category-card.component.scss',
})
export class CategoryCardComponent {
  @Input({ required: true }) category!: Category;
  @Input() index: number = 0;

  @Output() selected = new EventEmitter<Category>();
  @Output() edit = new EventEmitter<Category>();
  @Output() delete = new EventEmitter<Category>();

  select(): void {
    this.selected.emit(this.category);
  }

  onEdit(): void {
    this.edit.emit(this.category);
  }

  onDelete(): void {
    this.delete.emit(this.category);
  }
}
