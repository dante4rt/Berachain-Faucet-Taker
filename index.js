const puppeteer = require('puppeteer');
const { CronJob } = require('cron');
const readlineSync = require('readline-sync');
require('colors');

function checkWebsite(address, callback) {
  puppeteer
    .launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    })
    .then((browser) => {
      browser.newPage().then((page) => {
        page.goto('https://artio.faucet.berachain.com/').then(() => {
          const termsCheckboxSelector = '#terms';
          page.waitForSelector(termsCheckboxSelector).then(() => {
            page.click(termsCheckboxSelector).then(() => {
              const agreeButtonSelector =
                '//button[contains(text(), "I AGREE")]';
              page.waitForXPath(agreeButtonSelector).then(() => {
                page.$x(agreeButtonSelector).then((agreeButtons) => {
                  if (agreeButtons.length > 0) {
                    agreeButtons[0].click().then(() => {
                      const addressInputSelector =
                        'body > div:nth-child(12) > div.relative.flex.min-h-screen.w-full.flex-col.overflow-hidden.bg-background > main > div > div.flex.w-full.flex-col-reverse.items-center.justify-between.py-12.xl\\:flex-row > div > div.flex.flex-col.gap-1 > div.relative > div > input';
                      page.waitForSelector(addressInputSelector).then(() => {
                        page.type(addressInputSelector, address).then(() => {
                          const buttonSelector =
                            'body > div:nth-child(12) > div.relative.flex.min-h-screen.w-full.flex-col.overflow-hidden.bg-background > main > div > div.flex.w-full.flex-col-reverse.items-center.justify-between.py-12.xl\\:flex-row > div > button';
                          page.waitForSelector(buttonSelector).then(() => {
                            page.click(buttonSelector).then(() => {
                              page.waitForTimeout(3000).then(() => {
                                page.click(buttonSelector).then(() => {
                                  page
                                    .waitForSelector('div[role="alert"]', {
                                      timeout: 5000,
                                    })
                                    .then(() => {
                                      page
                                        .$(
                                          'div[role="alert"].border-destructive-foreground'
                                        )
                                        .then((errorElement) => {
                                          if (errorElement) {
                                            page
                                              .evaluate(
                                                (el) => el.textContent,
                                                errorElement
                                              )
                                              .then((errorMessage) => {
                                                console.log(
                                                  'Error: '.red +
                                                    errorMessage.red
                                                );
                                                browser.close();
                                                callback('error');
                                              });
                                          } else {
                                            page
                                              .$(
                                                'div[role="alert"].border-success-foreground'
                                              )
                                              .then((successElement) => {
                                                if (successElement) {
                                                  page
                                                    .evaluate(
                                                      (el) => el.textContent,
                                                      successElement
                                                    )
                                                    .then((successMessage) => {
                                                      console.log(
                                                        'Success: '.green +
                                                          successMessage.green
                                                      );
                                                      browser.close();
                                                      callback('success');
                                                    });
                                                } else {
                                                  browser.close();
                                                  callback('none');
                                                }
                                              });
                                          }
                                        })
                                        .catch(() => {
                                          browser.close();
                                          callback('none');
                                        });
                                    });
                                });
                              });
                            });
                          });
                        });
                      });
                    });
                  }
                });
              });
            });
          });
        });
      });
    });
}

function scheduleCronJob(address) {
  const job = new CronJob('0 */8 * * *', () => {
    console.log('Running cron job'.yellow);
    checkWebsite(address, (status) => {
      console.log('Status:'.yellow, status.yellow);
    });
  });

  job.start();
  console.log('Cron job scheduled'.blue);
}

const address = readlineSync.question('Enter the wallet address: '.cyan);

checkWebsite(address, (status) => {
  console.log('Initial status:'.cyan, status.cyan);
  if (status !== 'none') {
    scheduleCronJob(address);
  }
});
