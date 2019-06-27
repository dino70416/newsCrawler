const puppeteer = require('puppeteer')
const PATH = require('path')
const db = require(PATH.join(process.cwd(), '../', 'db.js'))
const scrollPageToBottom = require('puppeteer-autoscroll-down')

const newsTypes = {
  'politics': 'https://www.ettoday.net/news/focus/%E6%94%BF%E6%B2%BB/',
  'social': 'https://www.ettoday.net/news/focus/%E7%A4%BE%E6%9C%83/',
  'international': 'https://www.ettoday.net/news/focus/%E5%9C%8B%E9%9A%9B/',
  // 'entertainment': '',
  'life': 'https://www.ettoday.net/news/focus/%E7%94%9F%E6%B4%BB/',
  '3C': 'https://www.ettoday.net/news/focus/3C%E5%AE%B6%E9%9B%BB/%E7%A7%91%E6%8A%80%E7%94%9F%E6%B4%BB/',
  'finance': 'https://www.ettoday.net/news/focus/%E8%B2%A1%E7%B6%93/'
  // 'sports': ''
};

(async () => {
  const pathToExtension = PATH.join(__dirname, '../', 'ublock', '1.17.4_0')
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      `--disable-extensions-except=${pathToExtension}`,
      `--load-extension=${pathToExtension}`
    ]
  })
  const page = await browser.newPage()
  for (const newstype of Object.keys(newsTypes)) {
    const link = newsTypes[newstype]
    await page.goto(link)
    await scrollPageToBottom(page)
    const url = await page.evaluate(
      () => [...document.querySelectorAll('div[class="piece clearfix"] > h3:not(.title) > a:not(.pic)')].map(elem => elem.href)
    )
    const title = await page.evaluate(
      () => [...document.querySelectorAll('div[class="piece clearfix"] > h3:not(.title) > a:not(.pic)')].map(elem => elem.textContent)
    )
    for (let i = 0; i < title.length; i++) {
      const obj = { $set: {
        'type': newstype,
        'url': url[i],
        'title': title[i],
        'content': ''
      } }
      db.updateUpserted('news', { 'url': url }, obj, (result) => {
        console.log('insert success')
      })
    }
  }
  await browser.close()
})()
