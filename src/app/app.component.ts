import { Component, inject, computed, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CdkDrag, CdkDropList, CdkDropListGroup, CdkDragDrop } from '@angular/cdk/drag-drop';

import { TaskService } from './services/task.service';
import { Task } from './models/task.model';
import { TaskCardComponent } from './components/task-card/task-card.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ReactiveFormsModule, CdkDrag, CdkDropList, CdkDropListGroup, TaskCardComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  private taskService = inject(TaskService);

  tasks = this.taskService.tasks;

  newTaskControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(3)],
  });

  descriptionControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.minLength(10)],
  });

  todoTasks = computed(() =>
    this.tasks()
      .filter((t) => t.status === 'todo')
      .sort((a, b) => b.createdAt - a.createdAt),
  );
  doingTasks = computed(() =>
    this.tasks()
      .filter((t) => t.status === 'doing')
      .sort((a, b) => b.createdAt - a.createdAt),
  );
  doneTasks = computed(() =>
    this.tasks()
      .filter((t) => t.status === 'done')
      .sort((a, b) => b.createdAt - a.createdAt),
  );

  taskToDelete = signal<string | null>(null);

  deleteTask(id: string) {
    this.taskToDelete.set(id);
  }

  confirmDelete() {
    const id = this.taskToDelete();
    if (id) {
      this.taskService.deleteTask(id);
      this.taskToDelete.set(null);
    }
  }

  cancelDelete() {
    this.taskToDelete.set(null);
  }

  updateTask(data: { id: string; title: string; description: string }) {
    this.taskService.updateTask(data.id, data.title, data.description);
  }

  addTask() {
    if (this.newTaskControl.valid && this.descriptionControl.valid) {
      this.taskService.addTask(this.newTaskControl.value, this.descriptionControl.value);
      this.newTaskControl.reset();
      this.descriptionControl.reset();
    }
  }

  drop(event: CdkDragDrop<Task[]>) {
    if (event.previousContainer === event.container) {
      return;
    } else {
      const task = event.item.data as Task;
      const newStatus = event.container.id as 'todo' | 'doing' | 'done';

      this.taskService.updateTaskStatus(task.id, newStatus);
    }
  }
}
