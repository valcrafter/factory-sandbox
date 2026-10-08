import { TodoStore, type Todo } from "../src/store";
import { validateTitle } from "../src/validation";

declare const __BUILD__: { sha: string; time: string; repo: string };

const STORAGE_KEY = "factory-todos";
type Saved = Pick<Todo, "title" | "completed">;

const DEFAULT_TODOS: Saved[] = [
  { title: "Move a ticket to In Progress", completed: false },
  { title: "Watch the agents open and review a PR", completed: false },
  { title: "Merge it and see it go live here", completed: false },
];

function loadStore(): TodoStore {
  let saved: Saved[] = DEFAULT_TODOS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) saved = JSON.parse(raw) as Saved[];
  } catch {
    // Storage can be unavailable (private mode); start from the defaults.
  }
  const store = new TodoStore();
  for (const item of saved) {
    const todo = store.create(item.title);
    if (item.completed) store.update(todo.id, { title: item.title, completed: true });
  }
  return store;
}

function save(store: TodoStore) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store.list().map(({ title, completed }) => ({ title, completed }))));
  } catch {
    // Not persisting is fine for a demo.
  }
}

const store = loadStore();
const form = document.querySelector<HTMLFormElement>("#new-todo")!;
const input = document.querySelector<HTMLInputElement>("#title")!;
const errorEl = document.querySelector<HTMLParagraphElement>("#error")!;
const list = document.querySelector<HTMLUListElement>("#list")!;
const empty = document.querySelector<HTMLParagraphElement>("#empty")!;

function showError(message: string | null) {
  errorEl.hidden = !message;
  errorEl.textContent = message ?? "";
}

function render() {
  list.replaceChildren(
    ...store.list().map((todo) => {
      const item = document.createElement("li");
      item.className = todo.completed ? "item done" : "item";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = todo.completed;
      checkbox.setAttribute("aria-label", `Mark "${todo.title}" as ${todo.completed ? "open" : "done"}`);
      checkbox.addEventListener("change", () => {
        store.update(todo.id, { completed: checkbox.checked });
        save(store);
        render();
      });

      const title = document.createElement("span");
      title.className = "title";
      title.textContent = todo.title;

      const remove = document.createElement("button");
      remove.className = "remove";
      remove.type = "button";
      remove.textContent = "Delete";
      remove.setAttribute("aria-label", `Delete "${todo.title}"`);
      remove.addEventListener("click", () => {
        store.delete(todo.id);
        save(store);
        render();
      });

      item.append(checkbox, title, remove);
      return item;
    }),
  );
  empty.hidden = store.list().length > 0;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const result = validateTitle(input.value);
  if (!result.ok) {
    showError(result.error);
    return;
  }
  showError(null);
  store.create(result.title);
  input.value = "";
  save(store);
  render();
});

const build = document.querySelector<HTMLElement>("#build")!;
const shortSha = __BUILD__.sha.slice(0, 7);
const commitLink = __BUILD__.repo ? `https://github.com/${__BUILD__.repo}/commit/${__BUILD__.sha}` : null;
build.innerHTML = "";
build.append(
  "Build ",
  commitLink ? Object.assign(document.createElement("a"), { href: commitLink, textContent: shortSha }) : shortSha,
  ` · ${new Date(__BUILD__.time).toLocaleString()}`,
);

render();
