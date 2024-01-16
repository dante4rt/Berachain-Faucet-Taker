const puppeteer = require('puppeteer');
const { CronJob } = require('cron');
const readlineSync = require('readline-sync');
require('colors'); 

async function checkWebsite(address) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto('https://artio.faucet.berachain.com/');

  const termsCheckboxSelector = '#terms';
  await page.waitForSelector(termsCheckboxSelector);
  await page.click(termsCheckboxSelector);

  const agreeButtonSelector = '//button[contains(text(), "I AGREE")]';
  await page.waitForXPath(agreeButtonSelector);
  const [agreeButton] = await page.$x(agreeButtonSelector);
  if (agreeButton) {
    await agreeButton.click();
  }

  const addressInputSelector =
    'body > div:nth-child(12) > div.relative.flex.min-h-screen.w-full.flex-col.overflow-hidden.bg-background > main > div > div.flex.w-full.flex-col-reverse.items-center.justify-between.py-12.xl\\:flex-row > div > div.flex.flex-col.gap-1 > div.relative > div > input';
  await page.waitForSelector(addressInputSelector);
  await page.type(addressInputSelector, address);

  const buttonSelector =
    'body > div:nth-child(12) > div.relative.flex.min-h-screen.w-full.flex-col.overflow-hidden.bg-background > main > div > div.flex.w-full.flex-col-reverse.items-center.justify-between.py-12.xl\\:flex-row > div > button';
  await page.waitForSelector(buttonSelector);
  await page.click(buttonSelector);

  await page.waitForTimeout(3000);

  await page.click(buttonSelector);

  await page.waitForSelector('div[role="alert"]', { timeout: 5000 });

  const errorSelector = 'div[role="alert"].border-destructive-foreground';
  const successSelector = 'div[role="alert"].border-success-foreground';

  let errorElement = await page.$(errorSelector);
  let successElement = await page.$(successSelector);

  if (errorElement) {
    let errorMessage = await page.evaluate(
      (el) => el.textContent,
      errorElement
    );
    console.log('Error: '.red + errorMessage.red);
    await browser.close();
    return 'error';
  } else if (successElement) {
    let successMessage = await page.evaluate((el) => {
      el.textContent, successElement;
    });

    console.log('Success: '.green + successMessage.green);
    await browser.close();
    return 'success';
  } else {
    await browser.close();
    return 'none';
  }
}

function scheduleCronJob(address) {
  const job = new CronJob('0 */8 * * *', () => {
    console.log('Running cron job'.yellow);
    checkWebsite(address).then((status) => {
      console.log('Status:'.yellow, status.yellow);
    });
  });

  job.start();
  console.log('Cron job scheduled'.blue);
}

const address = readlineSync.question('Enter the wallet address: '.cyan);

checkWebsite(address).then((status) => {
  console.log('Initial status:'.cyan, status.cyan);
  if (status !== 'none') {
    scheduleCronJob(address);
  }
});
