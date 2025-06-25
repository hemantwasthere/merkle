"use client";

import { useAccount, useDisconnect } from "@starknet-react/core";
import { X } from "lucide-react";
import React from "react";
import { toast } from "sonner";
import { disconnect } from "starknetkit";

import { handleProofAndDB } from "@/actions";
import { useIsMobile } from "@/hooks/use-mobile";
import { useWalletConnection } from "@/hooks/use-wallet-connection";
import { cn, shortAddress, standariseAddress } from "@/lib/utils";

export default function Home() {
  const { address } = useAccount();
  const { connectWallet, config } = useWalletConnection();
  const { disconnectAsync } = useDisconnect();
  const isMobile = useIsMobile();

  React.useEffect(() => {
    connectWallet({
      ...config,
      modalMode: "neverAsk",
    });
  }, []);

  React.useEffect(() => {
    if (!address) return;
    const run = async () => {
      try {
        const result = await handleProofAndDB(standariseAddress(address));
        if (result && result.message) toast(result.message);
      } catch (e) {
        toast("Server error: " + (e as Error).message);
      }
    };
    run();
  }, [address]);

  return (
    <div className=" text-4xl bg-black text-white flex items-center justify-center h-screen">
      <button
        className={cn(
          "flex h-8 items-center justify-center gap-2 rounded-lg border border-[#ECECED80] bg-[#AACBC433] text-xs font-bold text-[#03624C] focus-visible:outline-[#03624C] md:h-10 md:text-sm",
          {
            "h-[34px]": isMobile,
          }
        )}
        onClick={() => !address && connectWallet()}
      >
        {!address && (
          <p
            className={cn(
              "relative flex w-[8rem] select-none items-center justify-center gap-1 bg-transparent text-xs md:w-[9.5rem] md:text-sm"
            )}
          >
            Connect Wallet
          </p>
        )}

        {address && (
          <>
            {!isMobile ? (
              <div className="flex w-[8rem] items-center justify-center gap-2 md:w-[9.5rem]">
                <div
                  onClick={() => {
                    navigator.clipboard.writeText(address);
                    toast("Address copied to clipboard");
                  }}
                  className="flex h-8 items-center justify-center gap-2 rounded-md md:h-9"
                >
                  {/* <Icons.gradient /> */}
                  <p className="flex items-center gap-1 text-xs md:text-sm">
                    {address && shortAddress(address, 4, 4)}
                  </p>
                </div>

                <X
                  onClick={() => {
                    disconnect();
                    disconnectAsync();
                  }}
                  className="size-4 text-[#3F6870]"
                />
              </div>
            ) : (
              <div className="flex w-[8rem] items-center justify-center gap-2 md:w-[9.5rem]">
                <div
                  onClick={() => {
                    navigator.clipboard.writeText(address);
                    toast("Address copied to clipboard");
                  }}
                  className="flex w-fit items-center justify-center gap-2 rounded-md"
                >
                  {/* <Icons.wallet className="size-5 text-[#3F6870]" /> */}
                  {shortAddress(address, 4, 4)}
                </div>

                <X
                  onClick={() => {
                    disconnect();
                    disconnectAsync();
                  }}
                  className="size-3 text-[#3F6870] md:size-4"
                />
              </div>
            )}
          </>
        )}
      </button>
    </div>
  );
}
