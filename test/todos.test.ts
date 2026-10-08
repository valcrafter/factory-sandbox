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

  it("keeps the existing title when PATCH omits it", async () => {
    const app = createApp();
    await request(app).post("/todos").send({ title: "Keep me" });
    const res = await request(app).patch("/todos/1").send({ completed: true });
    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({ title: "Keep me", completed: true });
  });

  it("deletes a todo", async () => {
    const app = createApp();
    await request(app).post("/todos").send({ title: "Temporary" });
    expect((await request(app).delete("/todos/1")).status).toBe(204);
    expect((await request(app).get("/todos")).body).toEqual([]);
  });
});

describe("todo title validation", () => {
  const invalidTitles: [string, unknown, string][] = [
    ["not a string (number)", 42, "title must be a string"],
    ["not a string (null)", null, "title must be a string"],
    ["not a string (array)", ["a"], "title must be a string"],
    ["empty", "", "title must not be blank"],
    ["blank after trimming", "   \t\n ", "title must not be blank"],
    ["longer than 200 characters", "a".repeat(201), "title must be at most 200 characters"],
  ];

  describe("POST /todos", () => {
    it("returns 400 when title is missing", async () => {
      const app = createApp();
      const res = await request(app).post("/todos").send({});
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "title is required" });
      expect((await request(app).get("/todos")).body).toEqual([]);
    });

    it("returns 400 when there is no body", async () => {
      const res = await request(createApp()).post("/todos");
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: "title is required" });
    });

    it.each(invalidTitles)("returns 400 when title is %s", async (_label, title, error) => {
      const app = createApp();
      const res = await request(app).post("/todos").send({ title });
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error });
      expect((await request(app).get("/todos")).body).toEqual([]);
    });

    it("stores the trimmed title", async () => {
      const app = createApp();
      const res = await request(app).post("/todos").send({ title: "  Buy milk \n" });
      expect(res.status).toBe(201);
      expect(res.body.title).toBe("Buy milk");
      expect((await request(app).get("/todos")).body[0].title).toBe("Buy milk");
    });

    it("accepts a title of exactly 200 characters", async () => {
      const title = "a".repeat(200);
      const res = await request(createApp()).post("/todos").send({ title });
      expect(res.status).toBe(201);
      expect(res.body.title).toBe(title);
    });

    it("applies the length limit after trimming", async () => {
      const title = "a".repeat(200);
      const res = await request(createApp()).post("/todos").send({ title: `  ${title}  ` });
      expect(res.status).toBe(201);
      expect(res.body.title).toBe(title);
    });

    it("counts characters, not UTF-16 code units", async () => {
      const title = "😀".repeat(200);
      const ok = await request(createApp()).post("/todos").send({ title });
      expect(ok.status).toBe(201);
      const tooLong = await request(createApp()).post("/todos").send({ title: title + "😀" });
      expect(tooLong.status).toBe(400);
    });
  });

  describe("PATCH /todos/:id", () => {
    async function appWithTodo() {
      const app = createApp();
      await request(app).post("/todos").send({ title: "Original" });
      return app;
    }

    it.each(invalidTitles)("returns 400 when title is %s", async (_label, title, error) => {
      const app = await appWithTodo();
      const res = await request(app).patch("/todos/1").send({ title, completed: true });
      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error });
      expect((await request(app).get("/todos")).body[0]).toMatchObject({ title: "Original", completed: false });
    });

    it("stores the trimmed title", async () => {
      const app = await appWithTodo();
      const res = await request(app).patch("/todos/1").send({ title: "  Renamed  " });
      expect(res.status).toBe(200);
      expect(res.body.title).toBe("Renamed");
      expect((await request(app).get("/todos")).body[0].title).toBe("Renamed");
    });

    it("accepts a title of exactly 200 characters", async () => {
      const app = await appWithTodo();
      const title = "b".repeat(200);
      const res = await request(app).patch("/todos/1").send({ title });
      expect(res.status).toBe(200);
      expect(res.body.title).toBe(title);
    });
  });
});
