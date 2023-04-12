import puppeteer, { Browser } from "puppeteer";

let _browser: Browser;

export async function startScrapingServer(callback) {
  _browser = await puppeteer.launch({
    executablePath: `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`,
    headless: false,
  });
  callback();
}

export function getPuppeteerBrowser() {
  return _browser;
}
