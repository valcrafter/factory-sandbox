import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "../src/app";

describe("todos api", () => {
  it("starts empty", async () => {
    const res = await request(createApp()).get("/todos");
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("creates a todo", async () => {
    const app = createApp();
    const res = await request(app).post("/todos").send({ title: "Write tests" });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id: 1, title: "Write tests", completed: false });

    const list = await request(app).get("/todos");
    expect(list.body).toHaveLength(1);
  });

  it("updates a todo", async () => {
    const app = createApp();
    await request(app).post("/todos").send({ title: "Ship it" });
    const res = await request(app).patch("/todos/1").send({ title: "Ship it today", completed: true });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ title: "Ship it today", completed: true });
  });

  it("returns 404 when updating a missing todo", async () => {
    const res = await request(createApp()).patch("/todos/42").send({ completed: true });
    expect(res.status).toBe(404);
  });

  it("deletes a todo", async () => {
    const app = createApp();
    await request(app).post("/todos").send({ title: "Temporary" });
    expect((await request(app).delete("/todos/1")).status).toBe(204);
    expect((await request(app).get("/todos")).body).toEqual([]);
  });
});
