const puppeteer = require('puppeteer')
const PATH = require('path')
const db = require(PATH.join(process.cwd(), 'db.js'))

const newsTypes = {
  'politics': 'https://www.chinatimes.com/politic/total',
  'social': 'https://www.chinatimes.com/society/total',
  'international': 'https://www.chinatimes.com/world/total',
  'entertainment': 'https://www.chinatimes.com/star/total',
  'life': 'https://www.chinatimes.com/life/total',
  'sports': 'https://www.chinatimes.com/sports/total',
  '3C': 'https://www.chinatimes.com/technologynews/total',
  'finance': 'https://www.chinatimes.com/money/total'
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
    for (let i = 1; i <= 20; i++) {
      await page.goto(link + '?page=' + i)
      const url = await page.evaluate(
        () => [...document.querySelectorAll('.title > a')].map(elem => elem.href)
      )
      const title = await page.evaluate(
        () => [...document.querySelectorAll('.title > a')].map(elem => elem.textContent)
      )
      for (let i = 0; i < title.length; i++) {
        const obj = { $set: {
          'type': newstype,
          'url': url[i],
          'title': title[i],
          'content': ''
        } }
        const regTitle = new RegExp('^' + title[i])
        db.updateUpserted('news', { 'title': { $regex: regTitle } }, obj, (result) => {
          console.log('insert success')
        })
      }
    }
  }
  await browser.close()
})()
