import { Component, input, output, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgClass, DatePipe } from '@angular/common';

import { Task } from '../../models/task.model';

@Component({
  selector: 'app-task-card',
  imports: [ReactiveFormsModule, NgClass, DatePipe],
  templateUrl: './task-card.component.html',
  styleUrl: './task-card.component.scss',
})
export class TaskCardComponent {
  task = input.required<Task>();

  onDelete = output<string>();
  onSave = output<{ id: string, title: string, description: string }>();

  isExpanded = signal(false);
  onEdit = false;

  editTitleControl = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3)] });
  editDescriptionControl = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(10)] });

  toggleExpanded() {
    this.isExpanded.update(value => !value);
  }

  remove() {
    this.onDelete.emit(this.task().id);
  }

  toggleEditMode() {
    this.onEdit = !this.onEdit;

    if (this.onEdit) {
      this.isExpanded.set(false);
      this.editTitleControl.setValue(this.task().title);
      this.editDescriptionControl.setValue(this.task().description);
    }
  }

  save() {
    this.onSave.emit({ id: this.task().id, title: this.editTitleControl.value, description: this.editDescriptionControl.value });
    this.toggleEditMode();
  }
}
