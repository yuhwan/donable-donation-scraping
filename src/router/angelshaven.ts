import express, { Request, Response } from "express";
import { getPuppeteerBrowser } from "../lib/puppeteer";
const router = express.Router();

const START_NEW_DONATION_URL = `https://mrmweb.hsit.co.kr/v2/Member/MemberJoin.aspx?action=join&server=1JzJUVYlCt9FlK1zaHHFbQ==&supportgroup=3`;

router.post("/start-new-donation", async (req: Request, res: Response) => {
  // 새로운 페이지 시작
  const browser = getPuppeteerBrowser();
  const page = await browser.newPage();
  page.setViewport({ height: 860, width: 1024 });
  await page.goto(START_NEW_DONATION_URL);

  // 금액 선택
  await page.select(".nm_table_tr > td > ul > li > select", "20000");
  await page.click(".nm_form_footer_btnbox > button");

  // 후원자 정보 입력
  const { name, birthday, phoneNumber, bank, account, payDay, event } =
    req.body;
  await page.type("#ctl00_ContentPlaceHolder1_txtName", name);
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
    phoneNumber.split("-")[0]
  );
  await page.type(
    "#ctl00_ContentPlaceHolder1_Mobile2",
    phoneNumber.split("-")[1]
  );
  await page.type(
    "#ctl00_ContentPlaceHolder1_Mobile3",
    phoneNumber.split("-")[2]
  );
  await page.type("#ctl00_ContentPlaceHolder1_txtJoinComment", event);
  await page.type("#ctl00_ContentPlaceHolder1_txtRecommender", "도너블");

  await page.click("#ctl00_ContentPlaceHolder1_step2NextBtn");

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
  await page.$eval("#chkStep3Btn", (el: HTMLButtonElement) => el.click());

  // 진행 확인 및 카카오 인증 요청
  await page.$eval(".jconfirm-buttons > button", (el: HTMLButtonElement) =>
    el.click()
  );
  const frameHandle = await page.$(".kakaocert-entry-container > iframe");
  const frame = await frameHandle.contentFrame();
  await frame.click("#btnRequest");

  res.json({
    // @ts-expect-error
    id: page.mainFrame()._id,
  });
});

export default router;
