const puppeteer = require('puppeteer')
// const request = require('request')
// const cheerio = require('cheerio')
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

/* const a = (link) => {
  request(link, function (error, response, body) {
    if (error) throw error
    const $ = cheerio.load(body, { decodeEntities: false })
    const content = $('#Content1 > p').text()
    const title = $('h1').text()
    console.log(title)
    return Promise.resolve([title, content])
  })
}

const b = async (linkArray) => {
  for (const linkarray of linkArray) {
    const c = await a(linkarray)
    console.log(c)
  }
}; */

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
    // let linkArray = []
    const link = newsTypes[newstype]
    await page.goto(link)
    for (let i = 1; i <= 20; i++) {
      await page.goto(link + '&p=' + i)
      const url = await page.evaluate(
        () => [...document.querySelectorAll('.view-li-title > a')].map(elem => elem.href)
      )
      // linkArray = linkArray.concat(temp)
      const title = await page.evaluate(
        () => [...document.querySelectorAll('.view-li-title > a')].map(elem => elem.textContent)
      )
      // let test = {}
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
    // b(linkArray)
    /* for (const linkarray of linkArray) {
      const obj = [{
        'type': newstype,
        'url': linkarray,
        'title': '',
        'content': ''
      }]
      db.create('news', obj, (result) => {
        console.log('insert success')
      })
      request(linkarray, function (error, response, body) {
        if (error) throw error
        setTimeout(function () {
          const $ = cheerio.load(body, { decodeEntities: false })
          const content = $('#Content1 p').text()
          const title = $('h1').text()
          if (content !== '') {
            db.create('news', [{ 'type': newstype, 'url': linkarray, 'title': title, 'content': content }], (result) => {
              console.log('insert success')
            })
          }
        }, 1000)
        $('#Content1 p').each(function (i, elem) {
          const content = $(this).text
          console.log(elem)
          db.create('news', [{ 'type': newstype, 'url': linkarray, 'content': content }], (result) => {
            console.log('insert success')
          })
        })
      })
    } */
  }
  await browser.close()
})()
