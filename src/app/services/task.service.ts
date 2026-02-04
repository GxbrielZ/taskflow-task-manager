import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  private readonly STORAGE_KEY = 'kanban-tasks';
  private platformId = inject(PLATFORM_ID);

  tasks = signal<Task[]>([]);

  constructor() {
    this.loadTasks();
  }

  private loadTasks() {
    if (!isPlatformBrowser(this.platformId)) return;

    const tasksJson = localStorage.getItem(this.STORAGE_KEY);

    if (tasksJson) {
      try {
        this.tasks.set(JSON.parse(tasksJson));
      } catch (e) {
        console.error('Error parsing tasks from local storage', e);
        this.seedInitialData();
      }
    } else {
      this.seedInitialData();
    }
  }

  private saveTasks(tasks: Task[]) {
    if (!isPlatformBrowser(this.platformId)) return;
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tasks));
  }

  addTask(title: string, description: string) {
    const newTask: Task = {
      id: crypto.randomUUID(),
      title,
      description,
      status: 'todo',
      createdAt: Date.now(),
    };

    this.tasks.update((tasks) => {
      const updated = [newTask, ...tasks];
      this.saveTasks(updated);
      return updated;
    });
  }

  deleteTask(taskId: string) {
    this.tasks.update((tasks) => {
      const updated = tasks.filter((t) => t.id !== taskId);
      this.saveTasks(updated);
      return updated;
    });
  }

  updateTaskStatus(taskId: string, newStatus: 'todo' | 'doing' | 'done') {
    this.tasks.update((tasks) => {
      const updated = tasks.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t));
      this.saveTasks(updated);
      return updated;
    });
  }

  updateTask(taskId: string, newTitle: string, newDescription: string) {
    this.tasks.update((tasks) => {
      const updated = tasks.map((t) =>
        t.id === taskId ? { ...t, title: newTitle, description: newDescription } : t,
      );
      this.saveTasks(updated);
      return updated;
    });
  }

  private seedInitialData() {
    const demoTasks: Task[] = [
      {
        id: '1',
        title: 'Research Angular Signals',
        description:
          'Read the official documentation and check some practical examples to understand the reactivity changes.',
        status: 'todo',
        createdAt: Date.now(),
      },
      {
        id: '2',
        title: 'Setup GitHub Repository',
        description:
          'Initialize the repository, create a README file, and push the initial commit.',
        status: 'todo',
        createdAt: Date.now() - 100000,
      },
      {
        id: '3',
        title: 'Design UI Mockups',
        description:
          'Create a modern dark mode design in Figma or Sketch using the Slate color palette.',
        status: 'doing',
        createdAt: Date.now() - 200000,
      },
      {
        id: '4',
        title: 'Implement Drag & Drop',
        description:
          'Use Angular CDK to enable drag and drop functionality for the Kanban board columns.',
        status: 'doing',
        createdAt: Date.now() - 300000,
      },
      {
        id: '5',
        title: 'Fix Styling Bugs',
        description:
          'Resolve the overflow issue on mobile devices and fix the white border around the body.',
        status: 'done',
        createdAt: Date.now() - 400000,
      },
      {
        id: '6',
        title: 'Deploy to Vercel',
        description:
          'Connect the GitHub repository to Vercel and setup automatic deployments for the main branch.',
        status: 'done',
        createdAt: Date.now() - 500000,
      },
    ];
    this.tasks.set(demoTasks);
    this.saveTasks(demoTasks);
  }
}
