CREATE TABLE "users" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "users_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"allocation" integer DEFAULT 0 NOT NULL,
	"address" varchar(255) NOT NULL,
	"proofs" varchar(255) NOT NULL,
	CONSTRAINT "users_address_unique" UNIQUE("address"),
	CONSTRAINT "users_proofs_unique" UNIQUE("proofs")
);
