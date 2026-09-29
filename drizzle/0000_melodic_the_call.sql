CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"categoryname" text NOT NULL,
	"slug" text NOT NULL,
	"ccreatedat" timestamp DEFAULT now() NOT NULL,
	"parent_id" integer,
	CONSTRAINT "categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "doctor_details" (
	"detail_id" serial PRIMARY KEY NOT NULL,
	"list_id" integer NOT NULL,
	"specialization" text NOT NULL,
	"consultation_fee" integer NOT NULL,
	"clinic_timings" text NOT NULL,
	"about_self" text NOT NULL,
	CONSTRAINT "doctor_details_list_id_unique" UNIQUE("list_id")
);
--> statement-breakpoint
CREATE TABLE "hostel_details" (
	"detail_id" serial PRIMARY KEY NOT NULL,
	"list_id" integer NOT NULL,
	"monthly_rent" integer NOT NULL,
	"room_type" text NOT NULL,
	"mess_facility" boolean DEFAULT false NOT NULL,
	"wifi_available" boolean DEFAULT true NOT NULL,
	"has_fridge" boolean DEFAULT false NOT NULL,
	"has_washing_machine" boolean DEFAULT false NOT NULL,
	"parking_space" boolean DEFAULT false,
	"security_guard" boolean DEFAULT false,
	CONSTRAINT "hostel_details_list_id_unique" UNIQUE("list_id")
);
--> statement-breakpoint
CREATE TABLE "itemslists" (
	"list_id" serial PRIMARY KEY NOT NULL,
	"text" text NOT NULL,
	"phone_no" text NOT NULL,
	"address" text NOT NULL,
	"category_id" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "lawyer_details" (
	"detail_id" serial PRIMARY KEY NOT NULL,
	"list_id" integer NOT NULL,
	"expertise" text NOT NULL,
	"experience_years" integer NOT NULL,
	"about_self" text NOT NULL,
	CONSTRAINT "lawyer_details_list_id_unique" UNIQUE("list_id")
);
--> statement-breakpoint
CREATE TABLE "listing_images" (
	"image_id" serial PRIMARY KEY NOT NULL,
	"list_id" integer NOT NULL,
	"image_url" text NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_categories_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "doctor_details" ADD CONSTRAINT "doctor_details_list_id_itemslists_list_id_fk" FOREIGN KEY ("list_id") REFERENCES "public"."itemslists"("list_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hostel_details" ADD CONSTRAINT "hostel_details_list_id_itemslists_list_id_fk" FOREIGN KEY ("list_id") REFERENCES "public"."itemslists"("list_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "itemslists" ADD CONSTRAINT "itemslists_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "lawyer_details" ADD CONSTRAINT "lawyer_details_list_id_itemslists_list_id_fk" FOREIGN KEY ("list_id") REFERENCES "public"."itemslists"("list_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "listing_images" ADD CONSTRAINT "listing_images_list_id_itemslists_list_id_fk" FOREIGN KEY ("list_id") REFERENCES "public"."itemslists"("list_id") ON DELETE cascade ON UPDATE no action;