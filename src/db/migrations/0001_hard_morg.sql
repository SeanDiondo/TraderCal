CREATE TABLE "journal" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" varchar(255) NOT NULL,
	"pair" varchar(255) NOT NULL,
	"pnl_usd" numeric(10, 2) NOT NULL,
	"usd_to_php" numeric(10, 4) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
