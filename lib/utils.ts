export { cn } from "cn";

export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Special characters remove
    .replace(/[\s_-]+/g, "-") // Spaces & underscores ko hyphen banana
    .replace(/^-+|-+$/g, ""); // Leading aur trailing hyphens trim karna
}

