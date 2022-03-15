import { DcaConfig } from './constants';

export const dcaconfig: DcaConfig[] = [
    {
        inputToken: "USDC",
        outputToken: "USDT",
        amount: 0.01,
        slippage: 1,
        cron: "* * * * *" // every minute
    },
    {
        inputToken: "USDT",
        outputToken: "USDC",
        amount: 0.01,
        slippage: 1,
        cron: "*/2 * * * *" // every 2 minutes
    },
    {
        inputToken: "USDC",
        outputToken: "SOL",
        amount: 0.01,
        slippage: 1,
        cron: "0 8 * * 0-6" // 8 AM everyday
    },
    {
        inputToken: "REKT", // invalid mint
        outputToken: "USDT",
        amount: 0.01,
        slippage: 1,
        cron: "* * * * *"
    },
];
