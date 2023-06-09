import express, { Request, Response } from "express";
import { getPuppeteerBrowser } from "../lib/puppeteer";
const router = express.Router();

const START_NEW_DONATION_URL = `https://mrmweb.hsit.co.kr/v2/Member/MemberJoin.aspx?action=join&server=1JzJUVYlCt9FlK1zaHHFbQ==&supportgroup=3`;

router.post("/create-new-page", async (req: Request, res: Response) => {
  try {
    // 새로운 페이지 시작
    const browser = getPuppeteerBrowser();
    const page = await browser.newPage();
    res.json({
      // @ts-expect-error
      id: page.mainFrame()._id,
    });
  } catch (error) {
    console.log(error);
    res.status(500).end();
  }
});

router.post("/start-new-donation", async (req: Request, res: Response) => {
  try {
    // 새로운 페이지 시작
    const browser = getPuppeteerBrowser();
    const { pageId } = req.body;
    let page;
    if (pageId !== undefined) {
      const pages = await browser.pages();
      // @ts-expect-error
      page = pages.find((p) => p.mainFrame()._id === pageId);
    } else {
      page = await browser.newPage();
    }

    const {
      name,
      birthday,
      phoneNumber,
      bank,
      account,
      payDay,
      eventName,
      amount,
    } = req.body;

    page.setViewport({ height: 2048, width: 1024 });
    await page.goto(START_NEW_DONATION_URL);

    page.on("dialog", async (dialog) => {
      console.log(dialog.message());
      await dialog.accept();
    });

    // 금액 선택
    await page.select(
      "#ctl00_ContentPlaceHolder1_ctl51_ctl00_ctl00_rdlamount",
      amount
    );
    await page.waitForTimeout(500);
    await page.$eval(
      ".nm_form_footer_btnbox > button",
      (el: HTMLInputElement) => el.click()
    );

    // 후원자 정보 입력
    await page.$eval(
      "#ctl00_ContentPlaceHolder1_txtName",
      (el: HTMLInputElement, name) => (el.value = name),
      name
    );
    await page.select(
      "#ctl00_ContentPlaceHolder1_yBirth",
      birthday.split(".")[0]
    );
    await page.select(
      "#ctl00_ContentPlaceHolder1_mBirth",
      birthday.split(".")[1]
    );
    await page.select(
      "#ctl00_ContentPlaceHolder1_dBirth",
      birthday.split(".")[2]
    );
    await page.type(
      "#ctl00_ContentPlaceHolder1_Mobile1",
      phoneNumber.split("-")[0],
      { delay: 100 }
    );
    await page.type(
      "#ctl00_ContentPlaceHolder1_Mobile2",
      phoneNumber.split("-")[1],
      { delay: 100 }
    );
    await page.type(
      "#ctl00_ContentPlaceHolder1_Mobile3",
      phoneNumber.split("-")[2],
      { delay: 100 }
    );
    await page.type(
      "#ctl00_ContentPlaceHolder1_Mobile1",
      phoneNumber.split("-")[0],
      { delay: 100 }
    );

    await page.$eval(
      "#ctl00_ContentPlaceHolder1_txtJoinComment",
      (el: HTMLInputElement, eventName) => (el.value = eventName),
      eventName
    );
    await page.$eval(
      "#ctl00_ContentPlaceHolder1_txtRecommender",
      (el: HTMLInputElement) => (el.value = "도너블")
    );
    await page.$eval(
      "#ctl00_ContentPlaceHolder1_step2NextBtn",
      (el: HTMLInputElement) => el.click()
    );

    // 후원금 납입방법
    await page.$eval(
      "#ctl00_ContentPlaceHolder1_ARSAuthYN_1",
      (el: HTMLInputElement) => el.click()
    );
    await page.$eval(
      "#ctl00_ContentPlaceHolder1_txtHolder",
      (el: HTMLInputElement, name) => (el.value = name),
      name
    );
    await page.$eval(
      "#ctl00_ContentPlaceHolder1_HolderRegNo1",
      (el: HTMLInputElement, birthday) =>
        (el.value = birthday.replace(/\./g, "").substring(2)),
      birthday
    );
    await page.$eval(
      "#ctl00_ContentPlaceHolder1_accountMobile1",
      (el: HTMLInputElement, phoneNumber) =>
        (el.value = phoneNumber.split("-")[0]),
      phoneNumber
    );
    await page.$eval(
      "#ctl00_ContentPlaceHolder1_accountMobile2",
      (el: HTMLInputElement, phoneNumber) =>
        (el.value = phoneNumber.split("-")[1]),
      phoneNumber
    );
    await page.$eval(
      "#ctl00_ContentPlaceHolder1_accountMobile3",
      (el: HTMLInputElement, phoneNumber) =>
        (el.value = phoneNumber.split("-")[2]),
      phoneNumber
    );
    await page.select("#ctl00_ContentPlaceHolder1_ddlBank", bank);
    await page.$eval(
      "#ctl00_ContentPlaceHolder1_txtAccount",
      (el: HTMLInputElement, account) => (el.value = account),
      account
    );
    await page.select("#ctl00_ContentPlaceHolder1_ddlPayDay", payDay);

    // 동의하고 시작하기
    await page.$eval(
      "#ctl00_ContentPlaceHolder1_chkCmsPolicy",
      (el: HTMLInputElement) => el.click()
    );
    await page.$eval(
      "#ctl00_ContentPlaceHolder1_chkJoinPolicy",
      (el: HTMLInputElement) => el.click()
    );
    await page.$eval(
      "#ctl00_ContentPlaceHolder1_chkPrivacyPolicyCollectAndUse",
      (el: HTMLInputElement) => el.click()
    );
    await page.$eval(
      "#ctl00_ContentPlaceHolder1_chkPrivacyOffer",
      (el: HTMLInputElement) => el.click()
    );
    await page.waitForTimeout(1500);
    await page.$eval("#chkStep3Btn", (el: HTMLButtonElement) => el.click());

    // 진행 확인 및 카카오 인증 요청
    await page.$eval(".jconfirm-buttons > button", (el: HTMLButtonElement) =>
      el.click()
    );

    await page.waitForSelector(".kakaocert-entry-container > iframe");
    const frameHandle = await page.$(".kakaocert-entry-container > iframe");
    const frame = await frameHandle.contentFrame();
    await frame.click("#btnRequest");

    res.json({
      id: page.mainFrame()._id,
    });
  } catch (error) {
    console.log(error);
    res.status(500).end();
  }
});

router.post(
  "/check-finish-new-donation",
  async (req: Request, res: Response) => {
    try {
      // 기존 페이지 찾기
      const { pageId } = req.body;
      const browser = getPuppeteerBrowser();
      const pages = await browser.pages();
      // @ts-expect-error
      const page = pages.find((p) => p.mainFrame()._id === pageId);
      if (page === undefined) return res.json({ success: false });

      // page에서 체크하기
      const checkPoint = await page.$(
        "#ctl00_ContentPlaceHolder1_joinResultInfo"
      );
      res.json({
        success: checkPoint !== null,
      });

      // page 닫기
      if (checkPoint !== null) {
        await page.close();
      }
    } catch (error) {
      console.log(error);
      res.status(500).end();
    }
  }
);

router.get("/page-count", async (req: Request, res: Response) => {
  const browser = getPuppeteerBrowser();
  const pages = await browser.pages();
  res.json({ count: pages.length });
});

router.get("/screenshot", async (req: Request, res: Response) => {
  try {
    const { pageId } = req.body;
    const browser = getPuppeteerBrowser();
    const pages = await browser.pages();
    // @ts-expect-error
    const page = pages.find((p) => p.mainFrame()._id === pageId);
    if (page === undefined) return res.json({ success: false });

    const b64string = await page.screenshot({ encoding: "base64" });
    const buffer = Buffer.from(b64string, "base64");
    res.writeHead(200, {
      "Content-Type": "image/png",
      "Content-Length": buffer.length,
    });
    res.end(buffer);
  } catch (error) {
    console.log(error);
    res.status(500).end();
  }
});

router.post("/close-page", async (req: Request, res: Response) => {
  try {
    const { pageId } = req.body;
    const browser = getPuppeteerBrowser();
    const pages = await browser.pages();
    // @ts-expect-error
    const page = pages.find((p) => p.mainFrame()._id === pageId);
    if (page === undefined) return res.json({ success: false });

    await page.close();
    res.json({ success: true });
  } catch (error) {
    console.log(error);
    res.status(500).end();
  }
});

router.get("/get-page-ids", async (req: Request, res: Response) => {
  try {
    const browser = getPuppeteerBrowser();
    const pages = await browser.pages();
    // @ts-expect-error
    const pageIds = pages.map((p) => p.mainFrame()._id);
    res.json({ pageIds });
  } catch (error) {
    console.log(error);
    res.status(500).end();
  }
});

export default router;
