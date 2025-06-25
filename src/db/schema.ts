import { bigint, integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  allocation: bigint({ mode: "bigint" }).notNull(),
  address: varchar({ length: 255 }).notNull().unique(),
  proofs: varchar({ length: 255 }).notNull(),
});
