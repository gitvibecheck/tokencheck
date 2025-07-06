# ICPSwap Liquidity Monitor Bot

This repo contains a sample Google Apps Script that sends Telegram notifications whenever new liquidity is added to a pair on ICPSwap.

## Setup
1. Create a Telegram bot and obtain the bot token and a target chat ID.
2. Open [Google Apps Script](https://script.google.com/) and create a new script project.
3. Copy the contents of `Code.gs` into the editor.
4. Replace `YOUR_TELEGRAM_BOT_TOKEN` and `YOUR_CHAT_ID` with your values.
5. Run the `setUpTrigger` function once to create a trigger that executes `checkNewLiquidity` every minute.

The script uses the public ICPSwap HTTP API documented in [ICPSwap-Labs/docs](https://github.com/ICPSwap-Labs/docs). It polls the `/latest-block` and `/events` endpoints to detect `join` events (liquidity additions). When a pair receives liquidity for the first time, the bot sends a message to Telegram with basic token information.
