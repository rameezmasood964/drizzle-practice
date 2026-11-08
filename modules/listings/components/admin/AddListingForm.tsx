"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";
import { ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import BasicInfoSection from "./listingFormComponents/BasicInfoSection";
import ContactSection from "./listingFormComponents/ContactSection";
import LocationSection from "./listingFormComponents/LocationSection";
import CustomFieldsSection from "./listingFormComponents/CustomFieldsSection";
import MediaSection from "./listingFormComponents/MediaSection";
import CategorySection from "./listingFormComponents/CategorySection";
import StatusSection from "./listingFormComponents/StatusSection";
import BusinessHoursSection from "./listingFormComponents/BusinessHoursSection";

import { listingFormSchema, type ListingFormValues } from "../../schema";
import { createListingAction } from "../../actions/addlistingaction";
import { updateListingAction } from "../../actions/updateistingaction";
import { uploadListingImagesAction } from "../../actions/uploadListingImages";
import { isFieldRequired, purgeHiddenFieldValues } from "@/modules/categories/utils";

interface AddListingFormProps {
  areas?: any[];
  categories?: any[];
  categoryFieldsMap?: Record<string, any[]>;
  initialData?: any;
  isEditing?: boolean;
}

export default function AddListingForm({
  areas = [],
  categories = [],
  categoryFieldsMap = {},
  initialData,
  isEditing = false,
}: AddListingFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // Helper: Initial category aur sub-category calculate karna
  const computeInitialCategories = () => {
    if (!initialData) return { catId: "", subCatId: "" };

    const rawTargetId = String(initialData.categoryId || "");

    // 1. Check karein kya yeh target direct main category hai?
    const directMain = categories.find((c) => String(c.id) === rawTargetId);
    if (directMain) {
      return { catId: rawTargetId, subCatId: "" };
    }

    // 2. Check karein kya yeh kisi category ki sub-category hai?
    for (const cat of categories) {
      const subList = cat.subCategories || cat.subcategories || [];
      const matchingSub = subList.find(
        (sub: any) => String(sub.id) === rawTargetId,
      );

      if (matchingSub) {
        return { catId: String(cat.id), subCatId: rawTargetId };
      }
    }

    // 3. Fallback jo backend query se attach hua ho
    return {
      catId: initialData.resolvedMainCategoryId
        ? String(initialData.resolvedMainCategoryId)
        : rawTargetId,
      subCatId: initialData.resolvedSubCategoryId
        ? String(initialData.resolvedSubCategoryId)
        : "",
    };
  };

  const initialCatState = computeInitialCategories();

  // 1. Initial Values Setup
  const defaultValues = initialData
    ? {
        title: initialData.title || "",
        slug: initialData.slug || "",
        description: initialData.description || "",
        phone: initialData.phone || "",
        whatsapp: initialData.whatsapp || "",
        email: initialData.email || "",
        website: initialData.website || "",
        areaId: initialData.areaId,
        address: initialData.address || "",
        landmark: initialData.landmark || "",
        mapsUrl: initialData.mapsUrl || "",
        categoryId: initialCatState.catId,
        subCategoryId: initialCatState.subCatId,
        status: initialData.status || "approved",
        isFeatured: Boolean(initialData.isFeatured),
        images:
          initialData.images && initialData.images.length > 0
            ? initialData.images
            : [],
        customFields: initialData.details || {},
        businessHours: initialData.businessHours || {
          monday: { isOpen: true, openTime: "09:00 AM", closeTime: "10:00 PM" },
          tuesday: {
            isOpen: true,
            openTime: "09:00 AM",
            closeTime: "10:00 PM",
          },
          wednesday: {
            isOpen: true,
            openTime: "09:00 AM",
            closeTime: "10:00 PM",
          },
          thursday: {
            isOpen: true,
            openTime: "09:00 AM",
            closeTime: "10:00 PM",
          },
          friday: { isOpen: true, openTime: "09:00 AM", closeTime: "10:00 PM" },
          saturday: {
            isOpen: true,
            openTime: "09:00 AM",
            closeTime: "10:00 PM",
          },
          sunday: { isOpen: true, openTime: "09:00 AM", closeTime: "10:00 PM" },
        },
      }
    : {
        title: "",
        slug: "",
        description: "",
        phone: "",
        whatsapp: "",
        email: "",
        website: "",
        areaId: undefined,
        address: "",
        landmark: "",
        mapsUrl: "",
        categoryId: "",
        subCategoryId: "",
        status: "approved" as const,
        isFeatured: false,
        images: [],
        customFields: {},
        businessHours: {
          monday: { isOpen: true, openTime: "09:00 AM", closeTime: "10:00 PM" },
          tuesday: {
            isOpen: true,
            openTime: "09:00 AM",
            closeTime: "10:00 PM",
          },
          wednesday: {
            isOpen: true,
            openTime: "09:00 AM",
            closeTime: "10:00 PM",
          },
          thursday: {
            isOpen: true,
            openTime: "09:00 AM",
            closeTime: "10:00 PM",
          },
          friday: { isOpen: true, openTime: "09:00 AM", closeTime: "10:00 PM" },
          saturday: {
            isOpen: true,
            openTime: "09:00 AM",
            closeTime: "10:00 PM",
          },
          sunday: { isOpen: true, openTime: "09:00 AM", closeTime: "10:00 PM" },
        },
      };

  const methods = useForm({
    resolver: zodResolver(listingFormSchema),
    defaultValues: defaultValues as any, // 👈 Ya type assertion dein taake initialData mismatch na kare
  });

  const {
    handleSubmit,
    setError,
    clearErrors,
    reset,
    formState: { isSubmitting, dirtyFields },
  } = methods;

  // React Hook Form ko fresh initialData ke sath re-sync karein jab categories load ho jayein
  useEffect(() => {
    if (initialData && isEditing && categories.length > 0) {
      const cats = computeInitialCategories();

      const existingImgs =
        initialData.images && initialData.images.length > 0
          ? initialData.images
          : [];

      // Form fields reset
      reset({
        title: initialData.title || "",
        slug: initialData.slug || "",
        description: initialData.description || "",
        phone: initialData.phone || "",
        whatsapp: initialData.whatsapp || "",
        email: initialData.email || "",
        website: initialData.website || "",
        areaId: initialData.areaId,
        address: initialData.address || "",
        landmark: initialData.landmark || "",
        mapsUrl: initialData.mapsUrl || "",
        categoryId: cats.catId,
        subCategoryId: cats.subCatId,
        status: initialData.status || "approved",
        isFeatured: Boolean(initialData.isFeatured),
        // 👇 Reset mein images pass karein
        images: existingImgs,
        customFields: initialData.details || {},
        businessHours: initialData.businessHours || defaultValues.businessHours,
      });

      // Reactive setValue execution
      if (cats.catId) {
        methods.setValue("categoryId", cats.catId, {
          shouldDirty: false,
          shouldValidate: false,
        });
      }
      if (cats.subCatId) {
        methods.setValue("subCategoryId", cats.subCatId, {
          shouldDirty: false,
          shouldValidate: false,
        });
      }

      // 👇 Force images set karein taake MediaSection ko foran mil jayein
      if (existingImgs.length > 0) {
        methods.setValue("images", existingImgs, { shouldValidate: true });
      }
    }
  }, [initialData, isEditing, categories]);

  // Helper function: Smooth scroll + focus to target DOM element
  const scrollToTarget = (elementId: string) => {
    setTimeout(() => {
      const el =
        document.getElementById(elementId) ||
        document.querySelector(`[name="${elementId}"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        if ("focus" in el && typeof (el as HTMLElement).focus === "function") {
          (el as HTMLElement).focus();
        }
      }
    }, 50);
  };

  const onSubmit = async (data: any) => {
    // 1. 🛡️ Main Category Check & Scroll
    if (!data.categoryId || String(data.categoryId).trim() === "") {
      setError("categoryId", {
        type: "manual",
        message: "Category select karna zaroori hai.",
      });
      toast.error("Category select karein!");
      scrollToTarget("categoryId");
      return;
    }

    // 2. 🛡️ Sub-Category Check & Scroll
    const selectedCategory = categories.find(
      (c) => String(c.id) === String(data.categoryId),
    );
    const hasSubCategories = (selectedCategory?.subCategories?.length ?? 0) > 0;

    if (
      hasSubCategories &&
      (!data.subCategoryId || data.subCategoryId.trim() === "")
    ) {
      setError("subCategoryId", {
        type: "manual",
        message: "Is category ke liye sub-category select karna zaroori hai.",
      });
      toast.error("Sub-category select karein!");
      scrollToTarget("subCategoryId");
      return;
    }

    // 3. 🛡️ Dynamic Custom Fields Check & Scroll
    clearErrors("customFields");

    const parentFields = data.categoryId
      ? categoryFieldsMap[String(data.categoryId)] || []
      : [];
    const childFields = data.subCategoryId
      ? categoryFieldsMap[String(data.subCategoryId)] || []
      : [];

    const childKeys = new Set(childFields.map((f: any) => f.key));
    const activeFields = [
      ...childFields,
      ...parentFields.filter((pf: any) => !childKeys.has(pf.key)),
    ].filter((f: any) => f.isActive !== false);

    // Purge hidden conditional field values so they are not kept, validated, or submitted
    data.customFields = purgeHiddenFieldValues(activeFields, data.customFields || {});

    const isEditMode = Boolean(isEditing || initialData?.id);
    const initialDetails = (initialData?.details || {}) as Record<string, any>;

    let firstMissingKey: string | null = null;

    for (const field of activeFields) {
      if (field.type === "boolean") continue;

      const fieldKey = field.key;
      const isRequired = isFieldRequired(
        field,
        data.customFields,
        isEditMode,
        initialDetails,
      );

      if (isRequired) {
        const val = data.customFields?.[fieldKey];
        const isEmpty =
          val === undefined ||
          val === null ||
          (Array.isArray(val) && val.length === 0) ||
          (typeof val === "string" && val.trim() === "") ||
          (field.type === "number" && (val === "" || isNaN(Number(val))));

        if (isEmpty) {
          setError(`customFields.${fieldKey}` as any, {
            type: "manual",
            message: `${field.label || fieldKey} bharna lazmi hai.`,
          });

          if (!firstMissingKey) {
            firstMissingKey = fieldKey;
          }
        }
      }
    }

    if (firstMissingKey) {
      toast.error("Category specific zaroori fields bharein!");
      scrollToTarget(`customField-${firstMissingKey}`);
      return;
    }

    // 4. Server Action Call (Conditional: Update vs Create)
    startTransition(async () => {
      try {
        // (A) Check karein kya nayi images upload karni hain Supabase par
        if (data.images && data.images.length > 0) {
          const newFilesToUpload: { index: number; file: File }[] = [];

          data.images.forEach((img: any, idx: number) => {
            if (img.file && img.file instanceof File) {
              newFilesToUpload.push({ index: idx, file: img.file });
            }
          });

          if (newFilesToUpload.length > 0) {
            const uploadFormData = new FormData();
            newFilesToUpload.forEach(({ file }) => {
              uploadFormData.append("files", file);
            });

            const uploadRes = await uploadListingImagesAction(uploadFormData);
            if (!uploadRes.success || !uploadRes.urls || uploadRes.urls.length === 0) {
              toast.error(uploadRes.message || "Images upload nahi ho sakeen.");
              return;
            }

            // Uploaded permanent Supabase URLs ko replace karein
            uploadRes.urls.forEach((uploadedUrl, i) => {
              const targetIdx = newFilesToUpload[i].index;
              data.images[targetIdx].url = uploadedUrl;
              delete data.images[targetIdx].file;
            });
          }
        }

        // Clean image payload (bina raw File object ke taake clean serialize ho)
        const cleanImages = (data.images || []).map((img: any) => ({
          id: String(img.id),
          url: String(img.url),
          isCover: Boolean(img.isCover),
        }));

        const payload = {
          ...data,
          images: cleanImages,
        };

        let res;
        if (isEditing && initialData?.id) {
          res = await updateListingAction(
            initialData.id,
            payload as ListingFormValues,
          );
        } else {
          res = await createListingAction(payload as ListingFormValues);
        }

        if (res.success) {
          toast.success(
            res.message ||
              (isEditing
                ? "Listing kamyabi se update ho gayi!"
                : "Listing kamyabi se create ho gayi!"),
          );
          router.push("/admin/listings");
        } else {
          toast.error(
            res.message ||
              (isEditing
                ? "Listing update nahi ho saki."
                : "Listing create nahi ho saki."),
          );
          if (res.errors) {
            console.error("Server validation errors:", res.errors);
          }
        }
      } catch (error) {
        console.error("Action execution error:", error);
        toast.error("Network issue ya server error aya hai.");
      }
    });
  };

  const onError = (errors: any) => {
    console.warn("Client validation errors:", errors);
    toast.error("Form mein kuch fields adhoori hain ya ghalat hain.");

    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
      const firstKey = errorKeys[0];
      scrollToTarget(firstKey);
    }
  };

  const isWorking = isSubmitting || isPending;

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={handleSubmit(onSubmit, onError)}
        className="mx-auto max-w-7xl space-y-6 pb-12"
      >
        {/* Top Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <nav className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <Link href="/admin/listings" className="hover:text-foreground">
                Listings
              </Link>
              <ChevronRight className="h-3.5 w-3.5" />
              <span className="font-medium text-foreground">
                {isEditing ? "Edit Listing" : "Add Listing"}
              </span>
            </nav>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {isEditing
                ? `Edit: ${initialData?.title || "Listing"}`
                : "Add New Listing"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isEditing
                ? "Update the details for this business listing."
                : "Fill in the details to create a new business listing."}
            </p>
          </div>

          <div>
            <Button
              type="button"
              variant="outline"
              className="px-5"
              disabled={isWorking}
              asChild
            >
              <Link href="/admin/listings">Cancel</Link>
            </Button>
          </div>
        </div>

        {/* Form Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column */}
          <div className="space-y-6 lg:col-span-7 xl:col-span-8">
            <BasicInfoSection />
            <ContactSection />
            <LocationSection areas={areas} />
            <CustomFieldsSection
              categoryFieldsMap={categoryFieldsMap}
              initialData={initialData}
              isEditing={isEditing}
            />
            <MediaSection />
          </div>

          {/* Right Column */}
          <div className="space-y-6 lg:col-span-5 xl:col-span-4">
            <CategorySection
              categories={categories}
              isEditing={isEditing}
              initialSubCategoryId={
                initialCatState.subCatId ||
                initialData?.resolvedSubCategoryId ||
                ""
              }
            />
            <StatusSection />
            <BusinessHoursSection />
          </div>
        </div>

        {/* Bottom Save Action */}
        <div className="mt-8 flex items-center justify-end gap-3 border-t border-border pt-4">
          <Button
            type="button"
            variant="outline"
            className="px-5"
            disabled={isWorking}
            asChild
          >
            <Link href="/admin/listings">Cancel</Link>
          </Button>
          <Button
            type="submit"
            disabled={isWorking}
            className="bg-primary px-7 text-primary-foreground hover:bg-primary/90"
          >
            {isWorking ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                {isEditing ? "Updating Listing..." : "Saving Listing..."}
              </span>
            ) : isEditing ? (
              "Update Listing"
            ) : (
              "Save Listing"
            )}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
