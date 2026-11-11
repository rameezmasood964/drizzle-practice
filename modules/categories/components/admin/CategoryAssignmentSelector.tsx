"use client";

import { useMemo, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FolderTree, Search, CheckCheck, X } from "lucide-react";
import type { CategoryTreeItem } from "../../types";

interface CategoryAssignmentSelectorProps {
  categories: CategoryTreeItem[];
  selectedCategoryIds: number[];
  onChange: (ids: number[]) => void;
  error?: string;
  disabled?: boolean;
}

export default function CategoryAssignmentSelector({
  categories,
  selectedCategoryIds,
  onChange,
  error,
  disabled = false,
}: CategoryAssignmentSelectorProps) {
  const [search, setSearch] = useState("");

  // All category IDs in the tree (for global Select All / Deselect All)
  const allCategoryIds = useMemo(() => {
    const ids: number[] = [];
    for (const parent of categories) {
      ids.push(parent.id);
      if (parent.subCategories) {
        for (const sub of parent.subCategories) {
          ids.push(sub.id);
        }
      }
    }
    return Array.from(new Set(ids));
  }, [categories]);

  // Filtered categories based on search
  const filteredCategories = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return categories;

    return categories
      .map((parent) => {
        const parentMatches = parent.name.toLowerCase().includes(query);
        const matchingSubs = (parent.subCategories || []).filter((sub) =>
          sub.name.toLowerCase().includes(query),
        );

        if (parentMatches || matchingSubs.length > 0) {
          return {
            ...parent,
            subCategories: parentMatches
              ? parent.subCategories || []
              : matchingSubs,
          };
        }
        return null;
      })
      .filter(Boolean) as CategoryTreeItem[];
  }, [categories, search]);

  // Global Toggle: Select All
  const handleSelectAllGlobal = () => {
    onChange(allCategoryIds);
  };

  // Global Toggle: Deselect All
  const handleDeselectAllGlobal = () => {
    onChange([]);
  };

  // Toggle single category
  const handleToggleSingle = (id: number) => {
    if (selectedCategoryIds.includes(id)) {
      onChange(selectedCategoryIds.filter((item) => item !== id));
    } else {
      onChange([...selectedCategoryIds, id]);
    }
  };

  // Parent Group convenience toggle: "Select All under [Parent]" / "Deselect All under [Parent]"
  const handleToggleParentGroup = (parent: CategoryTreeItem) => {
    const groupIds = [
      parent.id,
      ...(parent.subCategories?.map((s) => s.id) || []),
    ];
    const areAllSelected = groupIds.every((id) =>
      selectedCategoryIds.includes(id),
    );

    if (areAllSelected) {
      // Deselect all under this parent
      onChange(selectedCategoryIds.filter((id) => !groupIds.includes(id)));
    } else {
      // Select all under this parent
      const newSelection = Array.from(
        new Set([...selectedCategoryIds, ...groupIds]),
      );
      onChange(newSelection);
    }
  };

  const selectedCount = selectedCategoryIds.length;
  const isAllGlobalSelected =
    allCategoryIds.length > 0 && selectedCount === allCategoryIds.length;

  return (
    <div className="space-y-3 pt-3 border-t">
      {/* 1. Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <FolderTree className="h-4 w-4 text-primary" />
          <Label className="text-sm font-semibold">
            Category Assignments <span className="text-destructive">*</span>
          </Label>
          <Badge
            variant={selectedCount > 0 ? "secondary" : "destructive"}
            className="text-[11px] font-medium ml-1"
          >
            {selectedCount} Selected
          </Badge>
        </div>

        {/* Global Convenience Actions */}
        <div className="flex items-center gap-1.5 self-end sm:self-auto">
          {!isAllGlobalSelected && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled || allCategoryIds.length === 0}
              onClick={handleSelectAllGlobal}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <CheckCheck className="h-3.5 w-3.5 mr-1 text-emerald-600" />
              Select All
            </Button>
          )}

          {selectedCount > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={disabled}
              onClick={handleDeselectAllGlobal}
              className="h-7 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 cursor-pointer"
            >
              <X className="h-3.5 w-3.5 mr-1" />
              Deselect All
            </Button>
          )}
        </div>
      </div>

      <p className="text-[11px] text-muted-foreground">
        Choose which categories this dynamic field applies to. Listings in any
        checked category will show this field.
      </p>

      {/* 2. Optional Quick Search */}
      {categories.length > 3 && (
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8 text-xs h-8 bg-background"
            disabled={disabled}
          />
        </div>
      )}

      {/* 3. Category Tree List */}
      <div className="rounded-lg border border-border bg-card divide-y divide-border/60 max-h-64 overflow-y-auto">
        {filteredCategories.length === 0 ? (
          <div className="p-4 text-center text-xs text-muted-foreground">
            No categories found matching &quot;{search}&quot;.
          </div>
        ) : (
          filteredCategories.map((parent) => {
            const isParentChecked = selectedCategoryIds.includes(parent.id);
            const subCategories = parent.subCategories || [];
            const groupIds = [parent.id, ...subCategories.map((s) => s.id)];
            const selectedUnderParent = groupIds.filter((id) =>
              selectedCategoryIds.includes(id),
            ).length;
            const areAllGroupSelected =
              groupIds.length > 0 && selectedUnderParent === groupIds.length;

            return (
              <div key={parent.id} className="p-3 space-y-2 bg-muted/10">
                {/* Parent Row */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={`cat-${parent.id}`}
                      checked={isParentChecked}
                      disabled={disabled}
                      onCheckedChange={() => handleToggleSingle(parent.id)}
                    />
                    <label
                      htmlFor={`cat-${parent.id}`}
                      className="text-xs font-semibold cursor-pointer select-none text-foreground flex items-center gap-1.5"
                    >
                      {parent.name}
                      <span className="text-[10px] text-muted-foreground font-normal">
                        (Parent)
                      </span>
                    </label>
                  </div>

                  {/* Convenience Button for Parent Group */}
                  {subCategories.length > 0 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={disabled}
                      onClick={() => handleToggleParentGroup(parent)}
                      className="h-6 px-2 text-[10px] font-normal text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      {areAllGroupSelected
                        ? `Deselect all under ${parent.name}`
                        : `Select all under ${parent.name}`}
                    </Button>
                  )}
                </div>

                {/* Nested Subcategories */}
                {subCategories.length > 0 && (
                  <div className="ml-5 pl-3 border-l-2 border-border/70 space-y-2 pt-1">
                    {subCategories.map((sub) => {
                      const isSubChecked = selectedCategoryIds.includes(sub.id);
                      return (
                        <div
                          key={sub.id}
                          className="flex items-center justify-between gap-2 py-0.5"
                        >
                          <div className="flex items-center gap-2">
                            <Checkbox
                              id={`cat-${sub.id}`}
                              checked={isSubChecked}
                              disabled={disabled}
                              onCheckedChange={() => handleToggleSingle(sub.id)}
                            />
                            <label
                              htmlFor={`cat-${sub.id}`}
                              className="text-xs cursor-pointer select-none text-foreground"
                            >
                              {sub.name}
                            </label>
                          </div>
                          {isSubChecked && (
                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                              Active
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Validation Error Message */}
      {error ? (
        <p className="text-[12px] font-medium text-destructive">{error}</p>
      ) : selectedCount === 0 ? (
        <p className="text-[11px] text-amber-600 dark:text-amber-400">
          Kam az kam aik category select karna lazmi hai.
        </p>
      ) : null}
    </div>
  );
}

