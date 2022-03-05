# Jup DCA Bot
This bot runs a simple dollar cost averaging strategy to buy assets over a period of time. It utilizes [Jupiter Aggregator](https://jup.ag), a swap aggregator on Solana.

Based on the [Jupiter Core Example](https://github.com/jup-ag/jupiter-core-example)

## Install
```
yarn install
```
## Configure
Create an `.env` file to store private info. Add the variables below.
```
CLUSTER=mainnet-beta
WALLET_PRIVATE_KEY=abc123def456
```
## Run
```
yarn start
```
## Development
```
yarn add --dev node-cron
yarn add --dev @types/node-cron
```