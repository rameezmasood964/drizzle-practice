
import { Categories,CategoryOption } from "./types";


export function formatCategoryTree(
  categories: Categories[],
  parentId: number | null = null,
  level = 0,
  visited = new Set<number>()
): CategoryOption[] {
  let result: CategoryOption[] = [];

  if (level === 0 && parentId === null) {
    // Top-level: items with parentId === null OR items whose parent is not present in categories list
    const topLevel = categories.filter(
      (cat) =>
        cat.parentId === null ||
        !categories.some((c) => c.id === cat.parentId)
    );

    for (const item of topLevel) {
      if (visited.has(item.id)) continue;
      visited.add(item.id);
      result.push({
        id: item.id,
        name: item.name,
        level: 0,
      });

      const children = formatCategoryTree(categories, item.id, 1, visited);
      result = result.concat(children);
    }

    return result;
  }

  const children = categories.filter((cat) => cat.parentId === parentId);

  for (const child of children) {
    if (visited.has(child.id)) continue;
    visited.add(child.id);
    result.push({
      id: child.id,
      name: `${"— ".repeat(level)}${child.name}`,
      level,
    });

    const subChildren = formatCategoryTree(categories, child.id, level + 1, visited);
    result = result.concat(subChildren);
  }

  return result;
}
