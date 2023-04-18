import puppeteer, { Browser } from "puppeteer";

let _browser: Browser;

export async function startScrapingServer(callback) {
  _browser = await puppeteer.launch({
    args: ["--no-sandbox"],
    executablePath: process.env.CHROME_PATH,
    headless: true,
  });
  callback();
}

export function getPuppeteerBrowser() {
  return _browser;
}
