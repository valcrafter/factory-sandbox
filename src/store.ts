export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  createdAt: string;
}

export type TodoPatch = Partial<Pick<Todo, "title" | "completed">>;

/** In-memory store. Insertion order is preserved, which is the order GET /todos returns. */
export class TodoStore {
  private todos = new Map<number, Todo>();
  private nextId = 1;

  list(): Todo[] {
    return [...this.todos.values()];
  }

  get(id: number): Todo | undefined {
    return this.todos.get(id);
  }

  create(title: string): Todo {
    const todo: Todo = { id: this.nextId++, title, completed: false, createdAt: new Date().toISOString() };
    this.todos.set(todo.id, todo);
    return todo;
  }

  update(id: number, patch: TodoPatch): Todo | undefined {
    const existing = this.todos.get(id);
    if (!existing) return undefined;
    const updated: Todo = {
      ...existing,
      title: patch.title ?? existing.title,
      completed: patch.completed ?? false,
    };
    this.todos.set(id, updated);
    return updated;
  }

  delete(id: number): boolean {
    return this.todos.delete(id);
  }
}
