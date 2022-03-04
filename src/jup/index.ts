import fetch from "isomorphic-fetch";
import { Jupiter, RouteInfo, TOKEN_LIST_URL } from "@jup-ag/core";
import { PublicKey, Connection } from "@solana/web3.js";
import {
    ENV,
    INPUT_MINT_ADDRESS,
    OUTPUT_MINT_ADDRESS,
    SOLANA_RPC_ENDPOINT,
    Token,
    USER_KEYPAIR,
} from "../constants";

// Fetch token list from Jupiter API
export const tokens: Token[] = await (await fetch(TOKEN_LIST_URL[ENV])).json(); 

//  Load Jupiter
const jupiterLoaded = async () => {
    const connection = new Connection(SOLANA_RPC_ENDPOINT); // Setup Solana
    const jupiter = await Jupiter.load({
        connection,
        cluster: ENV,
        user: USER_KEYPAIR, // or public key
    });
    return jupiter;
};

const getRoutes = async ({
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
        return routes;
        } else {
        return null;
        }
    } catch (error) {
        throw error;
    }
};

const executeSwap = async ({
    jupiter,
    route,
}: {
    jupiter: Jupiter;
    route: RouteInfo;
}) => {
    try {
        // Prepare execute exchange
        const { execute } = await jupiter.exchange({
        routeInfo: route,
        });

        // Execute swap
        const swapResult: any = await execute(); // Force any to ignore TS misidentifying SwapResult type

        if (swapResult.error) {
        console.log(swapResult.error);
        } else {
        console.log(`https://explorer.solana.com/tx/${swapResult.txid}`);
        // console.log(
        //   `inputAddress=${swapResult.inputAddress.toString()} outputAddress=${swapResult.outputAddress.toString()}`
        // );
        console.log(
            `inputAmount=${swapResult.inputAmount} outputAmount=${swapResult.outputAmount}`
        );
        }
    } catch (error) {
        throw error;
    }
};

export const swap = async ({
    inputToken,
    outputToken,
    inputAmount,
    slippage,
}: {
    inputToken?: Token;
    outputToken?: Token;
    inputAmount: number; // 1 unit in UI
    slippage: number; // % slippage
}) => {
    try {
        console.log('Starting Jupiter swap!');
        const routes = await getRoutes({
            jupiter: await jupiterLoaded(),
            inputToken,
            outputToken,
            inputAmount,
            slippage,
        });
        // Routes are sorted based on outputAmount, so ideally the first route is the best.
        await executeSwap({ jupiter: await jupiterLoaded(), route: routes!.routesInfos[0] });
    } catch (error) {
      console.log({ error });
    }
};