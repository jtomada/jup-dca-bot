import fetch from "isomorphic-fetch";
import { Jupiter, RouteInfo, TOKEN_LIST_URL } from "@jup-ag/core";
import { PublicKey, Connection } from "@solana/web3.js";
import * as cron from "node-cron";
import {
  ENV,
  MINT_ADDRESSES,
  SOLANA_RPC_ENDPOINT,
  Token,
  USER_KEYPAIR,
} from "./constants";
import { dcaconfig } from './dcaconfig'

const jupiterSwap = async ({
  jupiter,
  inputToken,
  outputToken,
  inputAmount,
  slippage,
}: {
  jupiter: Jupiter;
  inputToken?: Token;
  outputToken?: Token;
  inputAmount: number;
  slippage: number;
}) => {
  try {
      if (!inputToken || !outputToken) {
          return null;
      }

      const inputAmountInSmallestUnits = inputToken 
        ? Math.round(inputAmount * 10 ** inputToken.decimals)
        : 0;
      const routes = inputToken && outputToken
        ? await jupiter.computeRoutes({
            inputMint: new PublicKey(inputToken.address),
            outputMint: new PublicKey(outputToken.address),
            inputAmount: inputAmountInSmallestUnits, // raw input amount of tokens
            slippage,
            forceFetch: true,
        })
        : null;

      if (routes && routes.routesInfos) {
        // Prepare execute exchange
        const { execute } = await jupiter.exchange({
          routeInfo: routes!.routesInfos[0],
        });
        // Execute swap
        // Force any to ignore TS misidentifying SwapResult type
        const swapResult: any = await execute();
        if (swapResult.error) {
          console.log(swapResult.error);
        } else {
          console.log(
            `${
              swapResult.inputAmount / (10 ** inputToken.decimals)} ${inputToken.symbol} -> ${swapResult.outputAmount / (10 ** inputToken.decimals)} ${outputToken.symbol}: https://solscan.io/tx/${swapResult.txid}`
            );
        }
      } else {
        console.log("Error: Jupiter couldn't route.");
      }
  } catch (error) {
    throw error;
  }
};

const main = async () => {
  try {
    const connection = new Connection(SOLANA_RPC_ENDPOINT); // Setup Solana
    const jupiter = await Jupiter.load({
        connection,
        cluster: ENV,
        user: USER_KEYPAIR, // or public key
    });

    // Fetch token list from Jupiter API
    const tokens: Token[] = await (await fetch(TOKEN_LIST_URL[ENV])).json();

    console.log("Validating dcaconfig. Jobs may not be included if the cron expression is invalid or chosen token strings do not exist in the MINT_ADDRESSES object.");
    const filteredJobs = dcaconfig.filter(job => {
      return (cron.validate(job.cron) 
        && job.inputToken in MINT_ADDRESSES 
        && job.outputToken in MINT_ADDRESSES
      );
    });
    
    console.log("Scheduling the following jobs: ");
    filteredJobs.map(job => {
      console.log(`${job.amount} ${job.inputToken} -> ${job.outputToken}. cron: ${job.cron}`);
    });
    
    const scheduledJobs = filteredJobs.map(job => {
      const inputToken = tokens.find((t) => 
        t.address == MINT_ADDRESSES[job.inputToken]
      );
      const outputToken = tokens.find((t) => 
        t.address == MINT_ADDRESSES[job.outputToken]
      );

      return cron.schedule(job.cron, async () => {
        await jupiterSwap({
          jupiter,
          inputToken,
          outputToken,
          inputAmount: job.amount,
          slippage: job.slippage, // % slippage
        });
      });
    });
  } catch (error) {
    console.log({ error });
  }
};

main();
