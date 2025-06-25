import { useAccount, useSendTransaction } from "@starknet-react/core";
import React from "react";
import { Contract } from "starknet";

import merkleAbi from "@/abi/merkle.abi.json";
import { getUserClaimData } from "@/actions";
import { getProvider, MERKLE_CONTRACT_ADDRESS } from "@/constants";
import { standariseAddress } from "@/lib/utils";

import { Button } from "./ui/button";

const Claim: React.FC = () => {
  const { address } = useAccount();

  const { sendAsync } = useSendTransaction({});

  const handleClaim = async () => {
    if (!address) return;

    const provider = getProvider();

    const merkleContract = new Contract(
      merkleAbi,
      MERKLE_CONTRACT_ADDRESS,
      provider
    );

    // get allocation and proof for the connected user
    const claimData = await getUserClaimData(standariseAddress(address));

    if (!claimData) {
      alert("No claim data found for this address.");
      return;
    }

    const { allocation, proofs } = claimData;

    if (!allocation || !proofs || proofs.length === 0) {
      alert("No allocation or proof found.");
      return;
    }

    // call claim with allocation and any proof (use first proof)
    const claimCall = merkleContract.populate("claim", [
      allocation.toString(),
      proofs,
    ]);

    const claimRes = await sendAsync([claimCall]);

    console.log("claim response:", claimRes);
  };

  return (
    <div className="mt-5">
      <Button className="bg-green-400 cursor-pointer" onClick={handleClaim}>
        Claim
      </Button>
    </div>
  );
};

export default Claim;
