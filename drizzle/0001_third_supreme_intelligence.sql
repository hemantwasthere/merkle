ALTER TABLE "users" DROP CONSTRAINT "users_proofs_unique";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "allocation" SET DATA TYPE bigint;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "allocation" DROP DEFAULT;