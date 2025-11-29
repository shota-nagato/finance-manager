CREATE TABLE `branches` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`aggregation_type` text NOT NULL,
	`aggregation_interval` integer NOT NULL,
	CONSTRAINT "aggregation_type" CHECK("branches"."aggregation_type" IN ("cumulative", "periodic")),
	CONSTRAINT "aggregation_interval" CHECK("branches"."aggregation_interval" IN (1, 2, 3, 4, 6))
);
