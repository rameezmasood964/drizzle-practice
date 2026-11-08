
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

/**
 * Checks whether a given field is visible based on the current form values.
 */
export function isFieldVisible(
  field: {
    dependsOnFieldKey?: string | null;
    conditionOperator?: string | null;
    conditionValue?: string | null;
  },
  formData: Record<string, any> = {},
): boolean {
  if (!field.dependsOnFieldKey || field.dependsOnFieldKey.trim() === "") {
    return true; // Not a conditional field -> always visible
  }

  const controllingValue = formData[field.dependsOnFieldKey];
  const targetValue = (field.conditionValue ?? "").trim();
  const operator = (field.conditionOperator ?? "equals").toLowerCase();

  // "is_not_empty" operator: checks if controlling field has any valid value / selection
  if (operator === "is_not_empty") {
    if (controllingValue === undefined || controllingValue === null) {
      return false;
    }
    if (typeof controllingValue === "string") {
      return controllingValue.trim() !== "";
    }
    if (Array.isArray(controllingValue)) {
      return controllingValue.some(
        (item) => item !== undefined && item !== null && String(item).trim() !== "",
      );
    }
    if (typeof controllingValue === "boolean") {
      return true;
    }
    if (typeof controllingValue === "number") {
      return !isNaN(controllingValue);
    }
    return Boolean(controllingValue);
  }

  // "contains" operator: checks if controlling field (e.g. multi-select array) contains targetValue
  if (operator === "contains") {
    if (controllingValue === undefined || controllingValue === null || controllingValue === "" || targetValue === "") {
      return false;
    }
    if (Array.isArray(controllingValue)) {
      return controllingValue.some(
        (item) => item !== undefined && item !== null && String(item).trim().toLowerCase() === targetValue.toLowerCase(),
      );
    }
    if (typeof controllingValue === "string") {
      return controllingValue.trim().toLowerCase() === targetValue.toLowerCase();
    }
    return false;
  }

  let matches = false;

  if (controllingValue === undefined || controllingValue === null || controllingValue === "") {
    matches = false;
  } else if (typeof controllingValue === "boolean") {
    const targetLower = targetValue.toLowerCase();
    const isTargetTrue = targetLower === "true" || targetLower === "yes" || targetLower === "1";
    matches = controllingValue === isTargetTrue;
  } else if (Array.isArray(controllingValue)) {
    matches = controllingValue.some(
      (item) => String(item).trim().toLowerCase() === targetValue.toLowerCase(),
    );
  } else {
    matches = String(controllingValue).trim().toLowerCase() === targetValue.toLowerCase();
  }

  return operator === "not_equals" ? !matches : matches;
}

/**
 * Checks whether a field is required under current form values and visibility state.
 */
export function isFieldRequired(
  field: {
    key: string;
    isRequired: boolean;
    dependsOnFieldKey?: string | null;
    conditionOperator?: string | null;
    conditionValue?: string | null;
    requiredIfVisible?: boolean | null;
  },
  formData: Record<string, any> = {},
  isEditMode: boolean = false,
  initialDetails?: Record<string, any>,
): boolean {
  // 1. If not visible, it can NEVER be required
  const visible = isFieldVisible(field, formData);
  if (!visible) {
    return false;
  }

  // 2. Compute base requirement
  let baseRequired = false;
  if (field.dependsOnFieldKey && field.dependsOnFieldKey.trim() !== "") {
    baseRequired = Boolean(field.requiredIfVisible || field.isRequired);
  } else {
    baseRequired = Boolean(field.isRequired);
  }

  if (!baseRequired) {
    return false;
  }

  // 3. Backward compatibility for legacy listings in edit mode
  if (isEditMode && initialDetails) {
    const wasPresentInOriginal =
      field.key in initialDetails &&
      initialDetails[field.key] !== undefined &&
      initialDetails[field.key] !== null &&
      (typeof initialDetails[field.key] === "string"
        ? initialDetails[field.key].trim() !== ""
        : true) &&
      (Array.isArray(initialDetails[field.key])
        ? initialDetails[field.key].length > 0
        : true);

    if (!wasPresentInOriginal) {
      return false; // Legacy listing without this field
    }
  }

  return true;
}

/**
 * Prevents self-dependency and circular dependencies when configuring conditional fields.
 */
export function canFieldDependOn(
  currentKey: string,
  candidateKey: string,
  allFields: Array<{ key: string; dependsOnFieldKey?: string | null }>,
): boolean {
  const normCurrent = (currentKey || "").trim().toLowerCase();
  const normCandidate = (candidateKey || "").trim().toLowerCase();

  // 1. Cannot depend on empty or self
  if (!normCandidate || normCandidate === normCurrent) {
    return false;
  }

  // 2. Prevent circular dependency: Trace candidate's dependency chain
  const visited = new Set<string>([normCurrent]);
  let checkKey: string | null = normCandidate;

  while (checkKey) {
    if (visited.has(checkKey)) {
      return false; // Cycle detected!
    }
    visited.add(checkKey);

    const parentField = allFields.find(
      (f) => f.key.trim().toLowerCase() === checkKey,
    );
    checkKey = parentField?.dependsOnFieldKey
      ? parentField.dependsOnFieldKey.trim().toLowerCase()
      : null;
  }

  return true;
}

/**
 * Prunes values of any hidden conditional fields so they are never saved as stale values.
 */
export function purgeHiddenFieldValues(
  fields: Array<{
    key: string;
    dependsOnFieldKey?: string | null;
    conditionOperator?: string | null;
    conditionValue?: string | null;
  }>,
  formData: Record<string, any> = {},
): Record<string, any> {
  const sanitized = { ...formData };

  for (const field of fields) {
    if (!isFieldVisible(field, formData)) {
      delete sanitized[field.key];
    }
  }

  return sanitized;
}

