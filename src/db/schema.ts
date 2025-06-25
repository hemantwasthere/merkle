import { bigint, integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  allocation: bigint({ mode: "bigint" }).notNull(),
  address: varchar({ length: 255 }).notNull().unique(),
});

export const proofsTable = pgTable("proofs", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer()
    .notNull()
    .references(() => usersTable.id),
  proof: varchar({ length: 2048 }).notNull(),
});
