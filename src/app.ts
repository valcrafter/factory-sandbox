import express from "express";
import { TodoStore } from "./store";

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
    const todo = store.create(String(req.body?.title ?? ""));
    res.status(201).json(todo);
  });

  app.patch("/todos/:id", (req, res) => {
    const todo = store.update(Number(req.params.id), req.body ?? {});
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
