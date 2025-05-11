CREATE TABLE `files` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`path` text,
	`slug` text,
	`frontmatter` text,
	`content` text,
	`created` integer,
	`updated` integer
);
