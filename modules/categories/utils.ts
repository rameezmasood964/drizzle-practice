
import { Categories,CategoryOption } from "./types";


export function formatCategoryTree(
  categories: Categories[],
  parentId: number | null = null,
  level = 0
): CategoryOption[] {

    let result: CategoryOption[] = [];
  const children = categories.filter((cat) => cat.parentId === parentId);

  for (const child of children) {
    result.push({
      id: child.id,
      name: `${"— ".repeat(level)}${child.name}`,
      level,
    });

    const subChildren = formatCategoryTree(categories, child.id, level + 1);
    result = result.concat(subChildren);
  }

  return result;
}
