"use server";

import { eq } from "drizzle-orm";
import { num } from "starknet";

import { db } from "@/db";
import { usersTable } from "@/db/schema";
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

  let allocation: bigint = BigInt(0);
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
        proofs: "",
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
    await db.insert(usersTable).values({
      address: standarizedAddress,
      allocation: allocation,
      proofs: JSON.stringify(proofObj.proof),
    });
    return { message: "Proof stored in DB" };
  } catch (e) {
    return {
      message: "Proof generation/store failed: " + (e as Error).message,
    };
  }
}
