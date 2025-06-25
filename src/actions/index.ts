"use server";

import { eq } from "drizzle-orm";
import { num } from "starknet";

import { db } from "@/db";
import { proofsTable, usersTable } from "@/db/schema";
import { MerkleTree } from "@/generate-tree/lib";

export async function handleProofAndDB(standarizedAddress: string) {
  // check if user already exists in DB
  let userRow;
  try {
    const rows = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.address, standarizedAddress));
    userRow = rows[0];
  } catch (e) {
    return { message: "DB error (read): " + (e as Error).message };
  }
  if (userRow) return { message: "User already exists" };

  let allocation: bigint = BigInt(5000000000000000000);
  try {
    const rows = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.address, standarizedAddress));
    if (rows.length > 0) {
      allocation = BigInt(rows[0].allocation);
    }
  } catch (e) {
    return { message: "DB error (allocation lookup): " + (e as Error).message };
  }

  if (allocation === BigInt(0)) {
    try {
      await db.insert(usersTable).values({
        address: standarizedAddress,
        allocation: BigInt(0),
      });
      return { message: "User info stored (no allocation)" };
    } catch (e) {
      return {
        message: "DB error (write zero allocation): " + (e as Error).message,
      };
    }
  }

  try {
    const allocationsForTree = [
      {
        address: BigInt(num.getDecimalString(standarizedAddress)),
        cumulative_amount: allocation,
      },
    ];
    const tree = new MerkleTree(allocationsForTree);
    const proofObj = tree.address_calldata(
      BigInt(num.getDecimalString(standarizedAddress))
    );

    // insert user
    const inserted = await db
      .insert(usersTable)
      .values({
        address: standarizedAddress,
        allocation: allocation,
      })
      .returning({ id: usersTable.id });

    const userId = inserted[0]?.id;

    if (!userId) {
      return { message: "User insert failed" };
    }

    // insert proof(s)
    const proofs = Array.isArray(proofObj.proof)
      ? proofObj.proof
      : [proofObj.proof];
    const proofRows = proofs.map((proof) => ({
      userId,
      proof,
    }));
    await db.insert(proofsTable).values(proofRows);
    return { message: "Proof stored in DB" };
  } catch (e) {
    return {
      message: "Proof generation/store failed: " + (e as Error).message,
    };
  }
}
