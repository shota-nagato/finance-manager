PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_aggregations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`branch_category_id` integer NOT NULL,
	`year` integer NOT NULL,
	`month` integer NOT NULL,
	`amount` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`branch_category_id`) REFERENCES `branch_categories`(`id`) ON UPDATE no action ON DELETE cascade,
	CONSTRAINT "amount" CHECK("__new_aggregations"."amount" >= 0),
	CONSTRAINT "year" CHECK("__new_aggregations"."year" >= 2020),
	CONSTRAINT "month" CHECK("__new_aggregations"."month" IN (3, 6, 9, 12))
);
--> statement-breakpoint
INSERT INTO `__new_aggregations`("id", "branch_category_id", "year", "month", "amount", "created_at", "updated_at") SELECT "id", "branch_category_id", "year", "month", "amount", "created_at", "updated_at" FROM `aggregations`;--> statement-breakpoint
DROP TABLE `aggregations`;--> statement-breakpoint
ALTER TABLE `__new_aggregations` RENAME TO `aggregations`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `aggregation_unique` ON `aggregations` (`branch_category_id`,`year`,`month`);