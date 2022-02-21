
// Libs
const crypto = require("crypto")
const puppeteer = require('puppeteer-extra')
const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha')
const { uniqueNamesGenerator,  NumberDictionary } = require('unique-names-generator')
const { PuppeteerBlocker } = require('@cliqz/adblocker-puppeteer')
const {fetch} = require('cross-fetch')
const fs = require('fs')
const { Console } = require('console')
const ps = require('prompt-sync')
const prompt = ps();
let tokensname = prompt('token ka kya naam rakhna bata:');
let HowTokens = prompt('kitna token banayega sade:');



// Settings
const captchakey = ''
const PROXY_ADDR = ''
const PROXY_USERNAME = ''
const PROXY_PASSWORD = ''
const BROWSER_CONFIG = {
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-infobars',
    '--window-position=0,0',
    "--proxy-server=" + PROXY_ADDR,
    '--window-size=1600,900',
  ],
  defaultViewport: null,
  ignoreHTTPSErrors: true,
  headless: false,
}

// Init plugins
puppeteer.use(StealthPlugin())

puppeteer.use(
  RecaptchaPlugin({
    provider: {
      id: '2captcha',
      token: captchakey,
    },
    visualFeedback: true,
    throwOnError: true
  })
)

// Console logs
const o = fs.createWriteStream('./stdout.log', {flags:'a'})
const errorOutput = fs.createWriteStream('./stderr.log', {flags:'a'})
const accounts = fs.createWriteStream('upgradedgen.txt', {flags:'a'})
const logger = new Console(o, errorOutput)

const t0 = process.hrtime();
function write_log(goodnews, text){
  const t1 = process.hrtime(t0);
  const time = (t1[0]* 1000000000 + t1[1]) / 1000000000;
  const color = goodnews ? "\x1b[32m" : "\x1b[31m";

  console.log(`${color} [LOG - ${time}s] \x1b[37m ${text}`);
  logger.log(`[LOG - ${time}s] ${text}`);
}

// Code start there
async function fill_input(page, infoname, info){
  const p = await page.$('input[name=' + infoname + ']');
  await p.focus();
  await page.keyboard.type(info);
}

async function click_date(page, name, min, max) {
  var i = await page.$('[class*=input' + name + "]");
  await i.click();
  var r = Math.floor(Math.random() * (max - min + 1)) + min;

  await page.waitForSelector('[class*=option]');
  await page.$eval("[class$=option]", function(e, r){e.parentNode.childNodes[r].click()}, r);

  return r
}

async function fill_discord(DiscordPage, username, password, email){
  await DiscordPage.bringToFront();
  await DiscordPage.goto('https://discord.com/register', {"waitUntil" : "networkidle0", timeout: 70000});

  write_log(true, "Create discord account");
  await click_date(DiscordPage, "Year", 17, 24);
  await click_date(DiscordPage, "Day", 0, 28);
  await click_date(DiscordPage, "Month", 0, 11);

  DiscordPage.waitForSelector('input[type*=checkbox]').then(() => {
    DiscordPage.$eval('input[type*=checkbox]', el => el.click());
  }).catch(e => {});

  await fill_input(DiscordPage, "username", username);
  await fill_input(DiscordPage, "password", password);
  await fill_input(DiscordPage, "email", email);
  await DiscordPage.$eval('button[type=submit]', (el) => el.click());
}

const sleep = milliseconds => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function break_captcha(DiscordPage){
  try {
    await DiscordPage.waitForSelector('[src*=sitekey]');
    write_log(false, "Captcha found");

    while(true){
      try{
        await DiscordPage.solveRecaptchas();
        var t;

        write_log(true, "Captcha passed");
        return true;
      } catch(err) {
        write_log(false, "Captcha - Error");
        sleep(3000);
      }
    }
  } catch(e){
    write_log(true, "Captcha not found");
  };
}

async function generate_email(MailPage){
  write_log(true, "Creating mail");
  PuppeteerBlocker.fromPrebuiltAdsAndTracking(fetch).then((blocker) => {
    blocker.enableBlockingInPage(MailPage);
  });

  await MailPage.bringToFront();
  await MailPage.goto("https://temp-mail.org/", { waitUntil: 'networkidle2', timeout: 0});
  var info_id = "#mail";

  try {
    await MailPage.waitForSelector(info_id);
    await MailPage.waitForFunction((info_id) => document.querySelector(info_id).value.indexOf("@") != -1, {}, info_id);
    
    var email = await MailPage.$eval('#mail', el => el.value);
    return email;
  } catch(e){
    console.log("Found error - Mail generation");
    return false;
  };
}

async function validate_email(MailPage){
  write_log(true, "Verifying mail");
  await MailPage.bringToFront();

  while(true){
    await MailPage.mouse.wheel({ deltaY: (Math.random()-0.5)*200 });

    try {
      await MailPage.waitForSelector('[title*=Discord]', {timeout: 500});
      sleep(1000);
      await MailPage.$eval('[title*=Discord]', e => e.parentNode.click());
    
      await MailPage.waitForSelector("td > a[href*='discord'][style*=background]");
      const elem = await MailPage.$eval("td > a[href*='discord'][style*=background]", el => el.href);
    
      return elem;
    } catch(e){};
  }
}

    const nickname = [
        `| ${tokensname}`
    ];

async function main(){
console.clear()

'use-scrict'; 
}

async function verif_compte(browser, link){
  const page = await browser.newPage();
  await page.goto(link, {"waitUntil" : "networkidle0", "timeout": 60000});
  break_captcha(page);
}

const numberDictionary = NumberDictionary.generate({ min: 1, max: 99999, length: 6, });

async function create_accinfos(browser, d) {
  // Variables importantes
  const username = uniqueNamesGenerator({dictionaries: [numberDictionary, nickname],  separator: ' ', style: "capital",length: 2,});
  const password = crypto.randomBytes(8).toString('hex');
  const MailPage = (await browser.pages())[0];
  var email;

  while(!email){
    try {
      email = await generate_email(MailPage);
    } catch(e){};
  }

  write_log(true, `Username: ${username}`);
  write_log(true, `Password: ${password}`);
  write_log(true, `E-mail: ${email}`);

  // Create acc, pass captcha
  const DiscordPage = d;
  await fill_discord(DiscordPage, username, password, email);

  const client = d._client;
  var token;

  client.on('Network.webSocketFrameSent', ({requestId, timestamp, response}) => {
    try {
      const json = JSON.parse(response.payloadData);
      if(!token && json["d"]["token"]){
        token = json["d"]["token"];
        write_log(true, `Token: ${token}`);
      };
    } catch(e){};
  })
  await break_captcha(DiscordPage);

  // Verify email
  let page_a_valider = await validate_email(MailPage);
  await verif_compte(browser, page_a_valider);
  write_log(true, "Account verified");

  if(!token){
    write_log(false, "Token not found, trying to get it")
    await DiscordPage.reload({ waitUntil: ["networkidle0", "domcontentloaded"] });
  };

  return `${token}`;
}
   



    (async () => {
      for (let i = 0; i < HowTokens; i++) {
        const browser = await puppeteer.launch(BROWSER_CONFIG);
        try {
          const page = await browser.newPage();
          const infos = await create_accinfos(browser, page);
          accounts.write(infos + "\n");
        } catch(e) {
          console.log(e);
        } finally {
          try{
            await sleep(90000);
            browser.close();
          } catch(e){};
        }
      }
      await sleep(1000);
      main()
    })();
  



async function check_proxy(file){
  var proxy = ['84.243.108.186:3629','89.203.129.202:4153','163.53.210.13:5678','93.175.194.155:3629','217.115.213.187:4145','186.103.143.210:4153','170.84.48.230:4145','103.110.11.206:5678','103.137.124.19:55492','202.159.19.213:443','170.246.85.38:37163','176.236.222.15:1080','182.52.70.117:4145','189.2.86.163:4153'];
  const rl = readline.createInterface({
    input: fs.createReadStream(file),
    output: process.stdout,
    console: true
  });
  for await (const line of rl) {
    var s = line.split(":");
    if(s.length == 0){
      continue;
    }
  };
  return proxy;
}
