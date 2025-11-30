CREATE TABLE `aggregations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`branch_category_id` integer NOT NULL,
	`year` integer NOT NULL,
	`month` integer NOT NULL,
	`amount` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`branch_category_id`) REFERENCES `branch_categories`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "amount" CHECK("aggregations"."amount" >= 0),
	CONSTRAINT "year" CHECK("aggregations"."year" >= 2025),
	CONSTRAINT "month" CHECK("aggregations"."month" IN (3, 6, 9, 12))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `aggregation_unique` ON `aggregations` (`branch_category_id`,`year`,`month`);