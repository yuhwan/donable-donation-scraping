import puppeteer, { Browser } from "puppeteer";

let _browser: Browser;

export async function startScrapingServer(callback) {
  _browser = await puppeteer.launch({
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-web-security",
      "--disable-features=IsolateOrigins",
      "--disable-site-isolation-trials",
      "--disable-features=site-per-process",
    ],
    executablePath: process.env.CHROME_PATH,
    headless: true,
  });
  callback();
}

export function getPuppeteerBrowser() {
  return _browser;
}
