const puppeteer = require('puppeteer')
const PATH = require('path')
const db = require(PATH.join(process.cwd(), 'db.js'))

const newsTypes = {
  'politics': 'https://news.ltn.com.tw/list/breakingnews/politics',
  'social': 'https://news.ltn.com.tw/list/breakingnews/society',
  'international': 'https://news.ltn.com.tw/list/breakingnews/world',
  'entertainment': 'https://news.ltn.com.tw/list/breakingnews/entertainment',
  'life': 'https://news.ltn.com.tw/list/breakingnews/life',
  'sports': 'https://news.ltn.com.tw/list/breakingnews/sports',
  '3C': 'https://news.ltn.com.tw/list/breakingnews/3c',
  'finance': 'https://news.ltn.com.tw/list/breakingnews/business'
};

(async () => {
  const pathToExtension = require('path').join(__dirname, 'ublock', '1.17.4_0')
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
    const last = await page.evaluate(
      () => document.querySelector('.p_last').href
    )
    for (let i = 1; i <= 50; i++) {
      const pLink = link + '/' + i
      await page.goto(pLink)
      const url = await page.evaluate(
        () => [...document.querySelectorAll('.tit')].map(elem => elem.href)
      )
      const title = await page.evaluate(
        () => [...document.querySelectorAll('.tit > p')].map(elem => elem.textContent)
      )
      for (let i = 0; i < title.length; i++) {
        const obj = [{
          'type': newstype,
          'url': url[i],
          'title': title[i],
          'content': ''
        }]
        db.create('news', obj, (result) => {
          console.log('insert success')
        })
      }
      if (pLink === last) break
      else continue
    }
  }
  await browser.close()
})()
