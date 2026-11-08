import { db } from "../db/index";
import { categoryFields, categories } from "../db/schema/index";
import { inArray, and, eq } from "drizzle-orm";

(async () => {
  const fields = await db
    .select()
    .from(categoryFields)
    .where(and(eq(categoryFields.isActive, true), inArray(categoryFields.categoryId, [1, 6, 7])));

  console.log(`Total active fields for 1, 6, 7: ${fields.length}`);
  for (const f of fields) {
    console.log(
      `cat:${f.categoryId} | key:${f.key} | type:${f.type} | req:${f.isRequired} | reqIfVis:${f.requiredIfVisible} | dep:${f.dependsOnFieldKey} | op:${f.conditionOperator} | val:${f.conditionValue} | opts:${JSON.stringify(f.options)}`
    );
  }
  process.exit(0);
})();

