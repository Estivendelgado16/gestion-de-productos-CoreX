import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'tolla-create-node-card',
  templateUrl: './create-node-card.component.html',
  styleUrl: './create-node-card.component.scss',
})
export class CreateNodeCardComponent {
  @Output() createNode = new EventEmitter<void>();

  onCreate(): void {
    this.createNode.emit();
  }
}
