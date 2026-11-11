/**
 * ApnaBWP — CLI CSV Listing Importer
 *
 * Usage:
 *   Dry run (default, no DB writes):
 *     npx tsx --env-file=.env scripts/import-listings.ts data/hostels-template.csv
 *
 *   Commit (actual inserts in DB transaction):
 *     npx tsx --env-file=.env scripts/import-listings.ts data/hostels-template.csv --commit
 *
 * Requirements:
 *   - csv-parse (installed in devDependencies)
 *   - Run from project root: d:\Bahawapurhub\drizzle-practice
 */

import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { parse } from "csv-parse/sync";
import { db } from "../db/index";
import {
  listings,
  listingImages,
  areas,
  categories,
  categoryFields,
  categoryFieldAssignments,
  type CategoryField,
} from "../db/schema/index";
import { eq, like, and, inArray, asc } from "drizzle-orm";
import {
  isFieldVisible,
  isFieldRequired,
  purgeHiddenFieldValues,
} from "../modules/categories/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

interface RawRow {
  title?: string;
  description?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  address?: string;
  landmark?: string;
  maps_url?: string;
  area_name?: string;
  state?: string;
  postal_code?: string;
  category_name?: string;
  sub_category_name?: string;
  status?: string;
  is_featured?: string;
  image_urls?: string;
  [key: string]: string | undefined;
}

interface RowResult {
  rowNum: number;
  status: "valid" | "error" | "duplicate";
  title: string;
  errors: string[];
}

interface ParsedListing {
  rowNum: number;
  title: string;
  slug: string;
  description: string | null;
  phone: string;
  whatsapp: string;
  email: string | null;
  website: string | null;
  address: string;
  landmark: string | null;
  mapsUrl: string;
  areaId: number;
  categoryId: number; // resolved child subcategory ID (or parent if root-only)
  details: Record<string, unknown>;
  status: "approved" | "pending" | "draft" | "rejected";
  isFeatured: boolean;
  imageUrls: string[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const VALID_STATUSES = ["approved", "pending", "draft", "rejected"] as const;

// Standard non-dynamic CSV columns
const STATIC_COLUMNS = new Set([
  "title",
  "description",
  "phone",
  "whatsapp",
  "email",
  "website",
  "address",
  "landmark",
  "maps_url",
  "area_name",
  "state",
  "postal_code",
  "category_name",
  "sub_category_name",
  "status",
  "is_featured",
  "image_urls",
]);

// ─── Slug Generator (mirrors addlistingaction.ts) ─────────────────────────────

function createSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function generateUniqueSlug(
  rawInput: string,
  reservedSlugs: Set<string>,
): Promise<string> {
  const baseSlug = createSlug(rawInput);

  const existingMatches = await db
    .select({ slug: listings.slug })
    .from(listings)
    .where(like(listings.slug, `${baseSlug}%`));

  const slugSet = new Set([
    ...existingMatches.map((item) => item.slug),
    ...reservedSlugs,
  ]);

  if (!slugSet.has(baseSlug)) {
    reservedSlugs.add(baseSlug);
    return baseSlug;
  }

  let counter = 1;
  let candidateSlug = `${baseSlug}-${counter}`;
  while (slugSet.has(candidateSlug)) {
    counter++;
    candidateSlug = `${baseSlug}-${counter}`;
  }

  reservedSlugs.add(candidateSlug);
  return candidateSlug;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function parseMultiselect(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  const str = String(value).trim();
  if (!str) return [];
  // Split on either semicolon or comma, trim whitespace, remove empty entries
  return str
    .split(/[;,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

const parseMultiSelect = parseMultiselect;

function sanitizePhoneNumber(value: unknown): string {
  if (!value) return "";
  let cleaned = String(value).trim().replace(/[\s\-()]/g, "");
  // If it's a 10-digit number like "3025933362", convert to "03025933362"
  if (/^3\d{9}$/.test(cleaned)) {
    cleaned = `0${cleaned}`;
  }
  return cleaned;
}

function parseBoolean(value: unknown): boolean {
  if (typeof value === "boolean") return value;
  if (!value) return false;
  const str = String(value).trim().toLowerCase();
  return str === "yes" || str === "true" || str === "1";
}

function parseOptionalString(raw: string | undefined): string | null {
  if (!raw || raw.trim() === "") return null;
  return raw.trim();
}

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    console.log(`
ApnaBWP Listing CSV Importer
=============================
Usage:
  Dry run (default):
    npx tsx --env-file=.env scripts/import-listings.ts <csv-path>

  Commit mode:
    npx tsx --env-file=.env scripts/import-listings.ts <csv-path> --commit

Flags:
  --commit    Insert valid listings into PostgreSQL. Without this flag, dry-run mode runs.
  --help      Show this help message.
`);
    process.exit(0);
  }

  const csvPath = args.find((a) => !a.startsWith("--"));
  const commitMode = args.includes("--commit");

  if (!csvPath) {
    console.error("❌ Error: Missing CSV file path.");
    console.error("Usage: npx tsx --env-file=.env scripts/import-listings.ts <csv-path> [--commit]");
    process.exit(1);
  }

  const resolvedPath = resolve(process.cwd(), csvPath);
  if (!existsSync(resolvedPath)) {
    console.error(`❌ Error: File not found at ${resolvedPath}`);
    process.exit(1);
  }

  let rawContent: string;
  try {
    rawContent = readFileSync(resolvedPath, "utf-8");
  } catch (err: any) {
    console.error(`❌ Error reading file: ${err.message}`);
    process.exit(1);
  }

  // Strip comment lines (lines starting with #)
  const cleanedContent = rawContent
    .split("\n")
    .filter((line) => !line.trim().startsWith("#"))
    .join("\n");

  let rows: RawRow[];
  try {
    rows = parse(cleanedContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
      relax_column_count: true,
    }) as RawRow[];
  } catch (err: any) {
    console.error(`❌ CSV parsing failed: ${err.message}`);
    process.exit(1);
  }

  console.log(`\n${"=".repeat(64)}`);
  console.log(`  ApnaBWP CSV Listing Importer`);
  console.log(`  Mode : ${commitMode ? "🔴 COMMIT (writing to PostgreSQL)" : "🟡 DRY RUN (validation only, no DB writes)"}`);
  console.log(`  File : ${resolvedPath}`);
  console.log(`  Rows : ${rows.length}`);
  console.log(`${"=".repeat(64)}\n`);

  // ── 1. Fetch DB reference data
  console.log("Fetching reference categories, areas, and dynamic fields from DB...");

  const dbAreas = await db
    .select({ id: areas.id, name: areas.name, isActive: areas.isActive })
    .from(areas);

  const activeAreasMap = new Map<string, number>();
  for (const a of dbAreas) {
    if (a.isActive) {
      activeAreasMap.set(a.name.toLowerCase().trim(), a.id);
    }
  }

  const dbCategories = await db
    .select({
      id: categories.id,
      name: categories.name,
      parentId: categories.parentId,
      isActive: categories.isActive,
    })
    .from(categories);

  const activeCats = dbCategories.filter((c) => c.isActive);
  const catByNameLower = new Map<string, (typeof activeCats)[0]>();
  for (const c of activeCats) {
    catByNameLower.set(c.name.toLowerCase().trim(), c);
  }

  const activeCatIds = activeCats.map((c) => c.id);
  // Fetch dynamic fields mapped through categoryFieldAssignments bridge table
  const assignmentRows =
    activeCatIds.length > 0
      ? await db
          .select({
            categoryId: categoryFieldAssignments.categoryId,
            field: categoryFields,
          })
          .from(categoryFieldAssignments)
          .innerJoin(
            categoryFields,
            and(
              eq(categoryFieldAssignments.fieldId, categoryFields.id),
              eq(categoryFields.isActive, true),
            ),
          )
          .where(inArray(categoryFieldAssignments.categoryId, activeCatIds))
          .orderBy(asc(categoryFields.sortOrder))
      : [];

  const fieldsByCatId = new Map<number, CategoryField[]>();
  for (const row of assignmentRows) {
    if (!fieldsByCatId.has(row.categoryId)) {
      fieldsByCatId.set(row.categoryId, []);
    }
    fieldsByCatId.get(row.categoryId)!.push(row.field);
  }

  // Legacy fallback: also check if any active fields have direct categoryId not yet in junction table
  const legacyFields =
    activeCatIds.length > 0
      ? await db
          .select()
          .from(categoryFields)
          .where(
            and(
              eq(categoryFields.isActive, true),
              inArray(categoryFields.categoryId, activeCatIds),
            ),
          )
          .orderBy(asc(categoryFields.sortOrder))
      : [];

  for (const f of legacyFields) {
    if (f.categoryId !== null && f.categoryId !== undefined) {
      if (!fieldsByCatId.has(f.categoryId)) {
        fieldsByCatId.set(f.categoryId, []);
      }
      const existing = fieldsByCatId.get(f.categoryId)!;
      if (!existing.some((existingField) => existingField.id === f.id)) {
        existing.push(f);
      }
    }
  }

  const allLoadedFields = Array.from(
    new Map(
      Array.from(fieldsByCatId.values())
        .flat()
        .map((f) => [f.id, f]),
    ).values(),
  );

  console.log(`  • Active Areas      : ${activeAreasMap.size}`);
  console.log(`  • Active Categories : ${activeCats.length}`);
  console.log(`  • Active Fields     : ${allLoadedFields.length}\n`);

  // ── 2. Duplicate Detection Prep (Database slug & title + within-batch)
  const existingListings = await db
    .select({ slug: listings.slug, title: listings.title })
    .from(listings);

  const existingTitleSet = new Set(
    existingListings.map((l) => l.title.toLowerCase().trim()),
  );
  const existingSlugSet = new Set(
    existingListings.map((l) => l.slug.toLowerCase().trim()),
  );
  const slugReservations = new Set(existingListings.map((l) => l.slug));

  const batchTitlesSeen = new Map<string, number>(); // title -> first seen rowNum
  const batchSlugsSeen = new Map<string, number>();  // slug -> first seen rowNum

  // ── 3. Validate & Parse Rows
  const results: RowResult[] = [];
  const parsedListings: ParsedListing[] = [];

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2;
    const errors: string[] = [];

    // Basic info
    const title = row.title?.trim();
    if (!title) {
      errors.push("title is required");
    } else if (title.length < 3) {
      errors.push("title must be at least 3 characters");
    } else if (title.length > 120) {
      errors.push("title cannot exceed 120 characters");
    }

    const phone = sanitizePhoneNumber(row.phone);
    if (!phone) {
      errors.push("phone is required");
    } else if (!/^[+0-9]+$/.test(phone) || phone.length < 10) {
      errors.push("phone must be a valid number (min 10 digits)");
    }

    const whatsapp = sanitizePhoneNumber(row.whatsapp);
    if (!whatsapp) {
      errors.push("whatsapp is required");
    } else if (!/^[+0-9]+$/.test(whatsapp) || whatsapp.length < 10) {
      errors.push("whatsapp must be a valid number (min 10 digits)");
    }

    const email = parseOptionalString(row.email);
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push(`email format invalid: "${email}"`);
    }

    const website = parseOptionalString(row.website);
    if (website && !isValidUrl(website)) {
      errors.push(`website URL invalid: "${website}"`);
    }

    const address = row.address?.trim();
    if (!address || address.length < 5) {
      errors.push("address is required (min 5 characters)");
    }

    const mapsUrl = row.maps_url?.trim();
    if (!mapsUrl) {
      errors.push("maps_url is required");
    } else if (!isValidUrl(mapsUrl)) {
      errors.push(`maps_url must be a valid URL: "${mapsUrl}"`);
    }

    // Area resolution
    const areaNameRaw = row.area_name?.trim();
    let areaId: number | undefined;
    if (!areaNameRaw) {
      errors.push("area_name is required");
    } else {
      areaId = activeAreasMap.get(areaNameRaw.toLowerCase());
      if (areaId === undefined) {
        errors.push(
          `area_name "${areaNameRaw}" not found. Valid areas: ${[
            ...activeAreasMap.keys(),
          ].join(", ")}`,
        );
      }
    }

    // Category resolution
    const catNameRaw = row.category_name?.trim();
    const subCatNameRaw = row.sub_category_name?.trim();
    let targetCategoryId: number | undefined;
    let resolvedParentCatId: number | undefined;

    if (!catNameRaw) {
      errors.push("category_name is required");
    } else {
      const parentCat = catByNameLower.get(catNameRaw.toLowerCase());
      if (!parentCat) {
        errors.push(`category_name "${catNameRaw}" not found`);
      } else if (parentCat.parentId !== null) {
        errors.push(`category_name "${catNameRaw}" must be a root parent category`);
      } else {
        resolvedParentCatId = parentCat.id;

        if (subCatNameRaw) {
          const subCat = catByNameLower.get(subCatNameRaw.toLowerCase());
          if (!subCat) {
            errors.push(`sub_category_name "${subCatNameRaw}" not found`);
          } else if (subCat.parentId !== parentCat.id) {
            errors.push(
              `sub_category_name "${subCatNameRaw}" does not belong to "${catNameRaw}"`,
            );
          } else {
            targetCategoryId = subCat.id;
          }
        } else {
          const children = activeCats.filter((c) => c.parentId === parentCat.id);
          if (children.length > 0) {
            errors.push(
              `Category "${catNameRaw}" requires sub_category_name (${children
                .map((c) => c.name)
                .join(", ")})`,
            );
          } else {
            targetCategoryId = parentCat.id;
          }
        }
      }
    }

    // Status
    const statusRaw = (row.status?.trim() || "approved").toLowerCase();
    if (!VALID_STATUSES.includes(statusRaw as any)) {
      errors.push(`status "${statusRaw}" is invalid. Valid: ${VALID_STATUSES.join(", ")}`);
    }
    const status = VALID_STATUSES.includes(statusRaw as any)
      ? (statusRaw as "approved" | "pending" | "draft" | "rejected")
      : "approved";

    const isFeatured = parseBoolean(row.is_featured);

    // Images
    const imageUrlsRaw = row.image_urls?.trim();
    const imageUrls: string[] = imageUrlsRaw
      ? imageUrlsRaw.split(",").map((u) => u.trim()).filter(Boolean)
      : [];

    if (imageUrls.length === 0) {
      errors.push("image_urls: at least 1 image URL is required");
    } else if (imageUrls.length > 8) {
      errors.push(`image_urls: maximum 8 images allowed, got ${imageUrls.length}`);
    } else {
      for (const url of imageUrls) {
        if (!isValidUrl(url)) {
          errors.push(`image URL invalid: "${url}"`);
        }
      }
    }

    // ── Duplicate Detection (Schema unique constraint rule on slug/title)
    if (title) {
      const normTitle = title.toLowerCase();
      const baseSlug = createSlug(title);

      // Check DB existing records
      if (existingTitleSet.has(normTitle) || existingSlugSet.has(baseSlug)) {
        results.push({
          rowNum,
          status: "duplicate",
          title,
          errors: [
            `Listing with title "${title}" or slug "${baseSlug}" already exists in DB`,
          ],
        });
        continue;
      }

      // Check within current CSV batch
      if (batchTitlesSeen.has(normTitle) || batchSlugsSeen.has(baseSlug)) {
        const prevRow = batchTitlesSeen.get(normTitle) ?? batchSlugsSeen.get(baseSlug);
        results.push({
          rowNum,
          status: "duplicate",
          title,
          errors: [
            `Duplicate listing "${title}" in CSV (first occurrence at Row ${prevRow})`,
          ],
        });
        continue;
      }

      batchTitlesSeen.set(normTitle, rowNum);
      batchSlugsSeen.set(baseSlug, rowNum);
    }

    // ── Dynamic Custom Fields
    const details: Record<string, unknown> = {};

    if (targetCategoryId !== undefined && resolvedParentCatId !== undefined) {
      const parentFields = fieldsByCatId.get(resolvedParentCatId) ?? [];
      const childFields =
        targetCategoryId !== resolvedParentCatId
          ? fieldsByCatId.get(targetCategoryId) ?? []
          : [];

      // Child category field overrides parent field if key matches
      const fieldMap = new Map<string, CategoryField>();
      for (const f of parentFields) fieldMap.set(f.key, f);
      for (const f of childFields) fieldMap.set(f.key, f);

      const deduplicatedFields = Array.from(fieldMap.values());

      // Parse raw values from CSV
      const rawDetails: Record<string, any> = {};
      for (const [col, val] of Object.entries(row)) {
        if (STATIC_COLUMNS.has(col)) continue;
        if (val === undefined || val === "") continue;

        const fieldDef = fieldMap.get(col);
        if (!fieldDef) continue; // Ignore undefined columns safely

        if (fieldDef.type === "multiselect") {
          rawDetails[col] = parseMultiselect(val);
        } else if (fieldDef.type === "number") {
          const num = Number(val);
          if (!isNaN(num)) {
            rawDetails[col] = num;
          } else {
            // Keep as string so the number validation below can report the exact value
            rawDetails[col] = val;
          }
        } else if (fieldDef.type === "boolean") {
          rawDetails[col] = parseBoolean(val);
        } else {
          rawDetails[col] = (val as string).trim();
        }
      }

      // Friendly fallback: support security_deposit_amount if security_deposit_fee not provided
      if (
        rawDetails["security_deposit_fee"] === undefined &&
        row["security_deposit_amount"] !== undefined &&
        row["security_deposit_amount"] !== ""
      ) {
        const num = Number(row["security_deposit_amount"]);
        rawDetails["security_deposit_fee"] = isNaN(num)
          ? row["security_deposit_amount"]
          : num;
      }

      // Purge hidden conditional field values
      const purgedDetails = purgeHiddenFieldValues(
        deduplicatedFields,
        rawDetails,
      );

      // Validate required and field options
      for (const field of deduplicatedFields) {
        if (field.type === "boolean") continue;

        // Check required
        const required = isFieldRequired(field, purgedDetails, false);
        if (required) {
          const val = purgedDetails[field.key];
          const isEmpty =
            val === undefined ||
            val === null ||
            (Array.isArray(val) && val.length === 0) ||
            (typeof val === "string" && val.trim() === "") ||
            (field.type === "number" && isNaN(Number(val)));

          if (isEmpty) {
            const isVisible = isFieldVisible(field, purgedDetails);
            const reason = isVisible
              ? `Required field "${field.label}" (${field.key}) is missing`
              : `Conditionally required field "${field.label}" is visible but empty`;
            errors.push(reason);
          }
        }

        // Validate number type
        if (field.type === "number") {
          const rawVal = row[field.key];
          if (rawVal !== undefined && rawVal.trim() !== "") {
            const num = Number(rawVal);
            if (isNaN(num)) {
              errors.push(
                `Field "${field.label}" (${field.key}) must be a valid number, got: "${rawVal}"`,
              );
            }
          }
        }

        // Validate options for select and multiselect if options list is configured
        if (field.options && field.options.length > 0) {
          const validOptionsMap = new Map<string, string>();
          for (const opt of field.options) {
            validOptionsMap.set(opt.toLowerCase(), opt);
          }

          if (field.type === "select") {
            const val = purgedDetails[field.key];
            if (val && typeof val === "string" && val.trim() !== "") {
              const matched = validOptionsMap.get(val.trim().toLowerCase());
              if (!matched) {
                errors.push(
                  `Field "${field.label}" option "${val}" is invalid. Allowed: ${field.options.join(
                    ", ",
                  )}`,
                );
              } else {
                // Normalize to exact option casing
                purgedDetails[field.key] = matched;
              }
            }
          } else if (field.type === "multiselect") {
            const valList = purgedDetails[field.key];
            if (Array.isArray(valList) && valList.length > 0) {
              const normalizedList: string[] = [];
              for (const item of valList) {
                const matched = validOptionsMap.get(String(item).toLowerCase());
                if (!matched) {
                  errors.push(
                    `Field "${field.label}" option "${item}" is invalid. Allowed: ${field.options.join(
                      ", ",
                    )}`,
                  );
                } else {
                  normalizedList.push(matched);
                }
              }
              purgedDetails[field.key] = normalizedList;
            }
          }
        }
      }

      Object.assign(details, purgedDetails);
    }

    // ── Row outcome
    if (errors.length > 0) {
      results.push({
        rowNum,
        status: "error",
        title: title || "(no title)",
        errors,
      });
    } else {
      results.push({ rowNum, status: "valid", title: title!, errors: [] });

      const slug = await generateUniqueSlug(title!, slugReservations);

      parsedListings.push({
        rowNum,
        title: title!,
        slug,
        description: parseOptionalString(row.description),
        phone: phone!,
        whatsapp: whatsapp!,
        email,
        website,
        address: address!,
        landmark: parseOptionalString(row.landmark),
        mapsUrl: mapsUrl!,
        areaId: areaId!,
        categoryId: targetCategoryId!,
        details,
        status,
        isFeatured,
        imageUrls,
      });
    }
  }

  // ── 4. Print Summary Report
  const validRows = results.filter((r) => r.status === "valid");
  const errorRows = results.filter((r) => r.status === "error");
  const duplicateRows = results.filter((r) => r.status === "duplicate");

  console.log("─".repeat(64));
  console.log("VALIDATION SUMMARY REPORT");
  console.log("─".repeat(64));
  console.log(`  Total Rows Processed : ${rows.length}`);
  console.log(`  ✅ Valid Rows        : ${validRows.length}`);
  console.log(`  ❌ Invalid Rows      : ${errorRows.length}`);
  console.log(`  ⚠️  Duplicate Rows    : ${duplicateRows.length}`);
  console.log("");

  if (errorRows.length > 0) {
    console.log("INVALID ROWS (Errors detected):");
    for (const r of errorRows) {
      console.log(`  • Row ${r.rowNum}: "${r.title}"`);
      for (const e of r.errors) {
        console.log(`      - ${e}`);
      }
    }
    console.log("");
  }

  if (duplicateRows.length > 0) {
    console.log("DUPLICATE ROWS (Skipped):");
    for (const r of duplicateRows) {
      console.log(`  • Row ${r.rowNum}: "${r.title}" — ${r.errors[0]}`);
    }
    console.log("");
  }

  if (validRows.length > 0) {
    console.log("VALID ROWS READY FOR IMPORT:");
    for (const p of parsedListings) {
      console.log(
        `  • Row ${p.rowNum}: "${p.title}" → slug: "${p.slug}" (area_id: ${p.areaId}, category_id: ${p.categoryId})`,
      );
    }
    console.log("");
  }

  // ── 5. Mode Execution
  if (!commitMode) {
    console.log("─".repeat(64));
    console.log("🟡 DRY RUN COMPLETE — Zero records inserted into database.");
    console.log("   To perform actual database insertion, execute with --commit:");
    console.log(`   npx tsx --env-file=.env scripts/import-listings.ts ${csvPath} --commit`);
    console.log("─".repeat(64));
    process.exit(errorRows.length > 0 ? 1 : 0);
  }

  if (parsedListings.length === 0) {
    console.log("❌ No valid rows available to import. Database unaffected.");
    process.exit(1);
  }

  console.log("─".repeat(64));
  console.log(`🔴 COMMITTING ${parsedListings.length} LISTINGS IN DATABASE TRANSACTIONS...`);
  console.log("─".repeat(64));

  let insertedCount = 0;
  let failedCount = 0;

  for (const listing of parsedListings) {
    try {
      await db.transaction(async (tx) => {
        const [insertedListing] = await tx
          .insert(listings)
          .values({
            title: listing.title,
            slug: listing.slug,
            description: listing.description,
            phone: listing.phone,
            whatsapp: listing.whatsapp,
            email: listing.email,
            website: listing.website,
            address: listing.address,
            landmark: listing.landmark,
            mapsUrl: listing.mapsUrl,
            areaId: listing.areaId,
            categoryId: listing.categoryId,
            details: listing.details,
            status: listing.status,
            isFeatured: listing.isFeatured,
          })
          .returning();

        if (listing.imageUrls.length > 0) {
          await tx.insert(listingImages).values(
            listing.imageUrls.map((url, idx) => ({
              listingId: insertedListing.id,
              imageUrl: url,
              isPrimary: idx === 0,
              sortOrder: idx,
            })),
          );
        }

        console.log(
          `  ✅ Inserted Row ${listing.rowNum}: "${listing.title}" (ID: ${insertedListing.id}, slug: "${insertedListing.slug}")`,
        );
        insertedCount++;
      });
    } catch (dbErr: any) {
      console.error(
        `  ❌ Failed Row ${listing.rowNum}: "${listing.title}" — DB error: ${dbErr.message}`,
      );
      failedCount++;
    }
  }

  console.log("");
  console.log("─".repeat(64));
  console.log("COMMIT EXECUTION RESULTS");
  console.log("─".repeat(64));
  console.log(`  ✅ Successfully Inserted : ${insertedCount}`);
  console.log(`  ❌ Failed                : ${failedCount}`);
  console.log("─".repeat(64));

  process.exit(failedCount > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error("Fatal uncaught error in import process:", err);
  process.exit(1);
});
