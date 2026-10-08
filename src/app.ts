import express from "express";
import { TodoStore, type TodoPatch } from "./store";
import { validateTitle } from "./validation";

export function createApp(store = new TodoStore()) {
  const app = express();
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.get("/todos", (_req, res) => {
    res.json(store.list());
  });

  app.post("/todos", (req, res) => {
    const result = validateTitle(req.body?.title);
    if (!result.ok) {
      res.status(400).json({ error: result.error });
      return;
    }
    res.status(201).json(store.create(result.title));
  });

  app.patch("/todos/:id", (req, res) => {
    const patch: TodoPatch = { ...req.body };
    if (patch.title !== undefined) {
      const result = validateTitle(patch.title);
      if (!result.ok) {
        res.status(400).json({ error: result.error });
        return;
      }
      patch.title = result.title;
    }
    const todo = store.update(Number(req.params.id), patch);
    if (!todo) {
      res.status(404).json({ error: "not found" });
      return;
    }
    res.json(todo);
  });

  app.delete("/todos/:id", (req, res) => {
    if (!store.delete(Number(req.params.id))) {
      res.status(404).json({ error: "not found" });
      return;
    }
    res.status(204).end();
  });

  return app;
}
