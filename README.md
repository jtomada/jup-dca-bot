# Jup DCA Bot
This bot runs a simple dollar cost averaging strategy to buy assets over a period of time. It utilizes [Jupiter Aggregator](https://jup.ag), a swap aggregator on Solana.

This code was made to experiment and learn. It has not been thoroughly tested and is unaudited. Please use at your own risk!

Based on the [Jupiter Core Example](https://github.com/jup-ag/jupiter-core-example)

## Install
```
yarn install
```
## Configure
1. Create an `.env` file at the project root. See `.env-example`. 
Can be obtained from Phantom via Settings -> Export Private Key.
2. Create your own `dcaconfig.ts`. See `dcaconfig-example.ts` for a template. 

To see example cron expressions, check out [crontab.guru](https://crontab.guru/).
## Run
```
yarn start
```
