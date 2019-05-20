const puppeteer = require('puppeteer')

const webLink = 'https://tw.appledaily.com/new/realtime'
const newsType = {
  'politics': 'https://tw.news.appledaily.com/politics/realtime',
  'social': 'https://tw.news.appledaily.com/local/realtime',
  'international': 'https://tw.news.appledaily.com/international/realtime',
  'entertainment': 'https://tw.entertainment.appledaily.com/realtime',
  'life': 'https://tw.news.appledaily.com/life/realtime',
  '3C': 'https://tw.lifestyle.appledaily.com/gadget/realtime',
  'sports': 'https://tw.sports.appledaily.com/realtime'
};

(async () => {
  const browser = await puppeteer.launch({ headless: false })
  const page = await browser.newPage()
  await page.goto(webLink)
  await page.click('#login-button a')
  await page.waitForSelector('#email')
  await page.type('#email', 'aa123000@ymail.com')
  await page.type('#password', 'lkkd01!')
  await page.$eval('#email-form', form => form.submit())
  await page.waitForNavigation()
  for (const newstype of Object.values(newsType)) {
    await page.goto(newstype + '/20')
  }
  await browser.close()
})()
