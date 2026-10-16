CREATE TABLE `judgments` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`answer` text NOT NULL,
	`category_id` text NOT NULL,
	`version` text DEFAULT '1' NOT NULL,
	`matches` integer NOT NULL,
	`explanation` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `judgment_pair` ON `judgments` (`answer`,`category_id`,`version`);--> statement-breakpoint
CREATE TABLE `reports` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`puzzle_id` text NOT NULL,
	`answer` text NOT NULL,
	`category_id` text NOT NULL,
	`note` text,
	`created_at` text NOT NULL
);
