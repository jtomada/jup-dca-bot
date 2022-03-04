import { parentPort } from 'node:worker_threads';
import process from 'node:process';

import { swap, tokens } from '../jup';
import {
    INPUT_MINT_ADDRESS,
    OUTPUT_MINT_ADDRESS,
} from '../constants';


// If you know which input/output pair you want
const inputToken = tokens.find((t) => t.address == INPUT_MINT_ADDRESS); // USDC Mint Info
const outputToken = tokens.find((t) => t.address == OUTPUT_MINT_ADDRESS); // USDT Mint Info

(async () => {
    try {
        await swap({
            inputToken,
            outputToken,
            inputAmount: .01,
            slippage: 1,
        });
        // exit properly for the worker
        process.exit(0);
    } catch (error) {
      console.log({ error });
      // exit properly for the worker
      process.exit(1);
    }
})();
