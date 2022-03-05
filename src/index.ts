import fetch from "isomorphic-fetch";
import { Jupiter, RouteInfo, TOKEN_LIST_URL } from "@jup-ag/core";
import { PublicKey, Connection } from "@solana/web3.js";
import * as cron from "node-cron";
import {
  ENV,
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

      console.log(
      `Getting routes for ${inputAmount} ${inputToken.symbol} -> ${outputToken.symbol}...`
      );
      const inputAmountInSmallestUnits = inputToken
      ? Math.round(inputAmount * 10 ** inputToken.decimals)
      : 0;
      const routes =
      inputToken && outputToken
          ? await jupiter.computeRoutes({
              inputMint: new PublicKey(inputToken.address),
              outputMint: new PublicKey(outputToken.address),
              inputAmount: inputAmountInSmallestUnits, // raw input amount of tokens
              slippage,
              forceFetch: true,
          })
          : null;

      if (routes && routes.routesInfos) {
      console.log("Possible number of routes:", routes.routesInfos.length);
      console.log(
          "Best quote: ",
          routes.routesInfos[0].outAmount / 10 ** outputToken.decimals,
          `(${outputToken.symbol})`
      );
        // Prepare execute exchange
        const { execute } = await jupiter.exchange({
          routeInfo: routes!.routesInfos[0],
        });
        // Execute swap
        // Force any to ignore TS misidentifying SwapResult type
        const swapResult: any = await execute();
        if (swapResult.error) {
          console.log(swapResult.error);
          return null;
        } else {
          console.log(`https://explorer.solana.com/tx/${swapResult.txid}`);
          console.log(
              `inputAmount=${swapResult.inputAmount} outputAmount=${swapResult.outputAmount}`
          );
        }
      } else {
        return null;
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

    const filteredJobs = dcaconfig.filter(dcajob => {
      return cron.validate(dcajob.cron);
    });

    console.log("Valid jobs to be scheduled: ", filteredJobs.map(job => {
      return job.name;
    }));

    const scheduledJobs = filteredJobs.map(dcajob => {
      const inputToken = tokens.find((t) => t.address == dcajob.inputMint);
      const outputToken = tokens.find((t) => t.address == dcajob.outputMint);

      return cron.schedule(dcajob.cron, async () => {
        console.log('SWAPPING @!!!!!');
        const routes = await jupiterSwap({
          jupiter,
          inputToken,
          outputToken,
          inputAmount: dcajob.amount,
          slippage: dcajob.slippage, // % slippage
        });
      });
    });

    console.log('started!!!');
  } catch (error) {
    console.log({ error });
  }
};

main();
