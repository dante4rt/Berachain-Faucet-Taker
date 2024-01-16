# Berachain-Faucet-Taker

This Node.js script automates interaction with the Berachain faucet website using Puppeteer. It navigates through the website, accepts terms and conditions, enters a wallet address, and checks for success or error messages. Based on the outcome, it schedules a Cron job to retry the process every 8 hours.

## Installation

Before running the script, ensure you have Node.js installed on your machine. Then, install the required packages:

```bash
git clone https://github.com/dante4rt/Berachain-Faucet-Taker.git && cd Berachain-Faucet-Taker && npm install
```

## Usage

To run the script, execute the following command in your terminal:

```bash
node index.js
```

You will be prompted to enter a wallet address. The script will then navigate the faucet website and perform the necessary actions.

## Features

- **Puppeteer Automation**: Automates browser interaction to navigate and interact with web pages.
- **Cron Scheduling**: Schedules tasks to be run repeatedly at specified intervals using the `cron` package.
- **Readline Sync**: Allows for dynamic input of wallet addresses from the command line.
- **Colored Console Logs**: Enhances readability and distinction of console outputs using the `colors` package.

## Script Workflow

1. **Modal Handling**: Automatically clicks the checkbox and agrees to the terms on the website's modal.
2. **Address Input**: Accepts a wallet address input from the CLI and enters it into the website form.
3. **Button Interaction**: Automatically clicks the necessary button to submit the request.
4. **Alert Detection**: Waits for and detects success or error alerts on the website.
5. **Status Logging**: Logs the status of the request (success or error) with colored console outputs.
6. **Cron Job**: If an error or success is detected, schedules a cron job to retry after 8 hours.

## Notes

- The script runs in a non-headless browser mode for debugging purposes. This can be changed to headless mode for production use.
- Ensure that the use of this script is compliant with the website's terms of service.