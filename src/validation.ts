export const MAX_TITLE_LENGTH = 200;

export type TitleResult = { ok: true; title: string } | { ok: false; error: string };

/** Validates a todo title and returns it trimmed. Length is counted in characters (code points) after trimming. */
export function validateTitle(value: unknown): TitleResult {
  if (value === undefined) return { ok: false, error: "title is required" };
  if (typeof value !== "string") return { ok: false, error: "title must be a string" };
  const title = value.trim();
  if (title.length === 0) return { ok: false, error: "title must not be blank" };
  if ([...title].length > MAX_TITLE_LENGTH) {
    return { ok: false, error: `title must be at most ${MAX_TITLE_LENGTH} characters` };
  }
  return { ok: true, title };
}
