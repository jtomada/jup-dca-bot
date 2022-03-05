import { DcaConfig } from './constants';

export const dcaconfig: DcaConfig[] = [
    {
        name: "USDC to USDT",
        inputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
        outputMint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", // USDT
        amount: 0.01,
        slippage: 1,
        cron: "*/1 * * * *"
    },
    {
        name: "0.01 USDT -> USDC",
        inputMint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", // USDT
        outputMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
        amount: 0.01,
        slippage: 1,
        cron: "*/1 * * * *"
    },
];