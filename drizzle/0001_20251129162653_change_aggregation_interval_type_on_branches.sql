PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_branches` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`aggregation_type` text NOT NULL,
	`aggregation_interval` text NOT NULL,
	CONSTRAINT "aggregation_type" CHECK("__new_branches"."aggregation_type" IN ("cumulative", "periodic")),
	CONSTRAINT "aggregation_interval" CHECK("__new_branches"."aggregation_interval" IN ("quarterly", "half-yearly"))
);
--> statement-breakpoint
INSERT INTO `__new_branches`("id", "name", "aggregation_type", "aggregation_interval") SELECT "id", "name", "aggregation_type", "aggregation_interval" FROM `branches`;--> statement-breakpoint
DROP TABLE `branches`;--> statement-breakpoint
ALTER TABLE `__new_branches` RENAME TO `branches`;--> statement-breakpoint
PRAGMA foreign_keys=ON;