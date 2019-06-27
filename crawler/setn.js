const puppeteer = require('puppeteer')
const PATH = require('path')
const db = require(PATH.join(process.cwd(), 'db.js'))

const newsTypes = {
  'politics': 'https://www.setn.com/ViewAll.aspx?PageGroupID=6',
  'social': 'https://www.setn.com/ViewAll.aspx?PageGroupID=41',
  'international': 'https://www.setn.com/ViewAll.aspx?PageGroupID=5',
  'entertainment': 'https://www.setn.com/ViewAll.aspx?PageGroupID=8',
  'life': 'https://www.setn.com/ViewAll.aspx?PageGroupID=4',
  'sports': 'https://www.setn.com/ViewAll.aspx?PageGroupID=34',
  '3C': 'https://www.setn.com/ViewAll.aspx?PageGroupID=7',
  'finance': 'https://www.setn.com/ViewAll.aspx?PageGroupID=2'
};

(async () => {
  const pathToExtension = PATH.join(__dirname, 'ublock', '1.17.4_0')
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
      await page.goto(link + '&p=' + i)
      const url = await page.evaluate(
        () => [...document.querySelectorAll('.view-li-title > a')].map(elem => elem.href)
      )
      const title = await page.evaluate(
        () => [...document.querySelectorAll('.view-li-title > a')].map(elem => elem.textContent)
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
    }
  }
  await browser.close()
})()
