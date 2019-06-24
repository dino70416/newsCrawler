const puppeteer = require('puppeteer')
// const request = require('request')
// const cheerio = require('cheerio')
const PATH = require('path')
const db = require(PATH.join(process.cwd(), 'db.js'))
// const fs = require('fs')

const newsTypes = {
  // 'politics': 'https://tw.news.appledaily.com/politics/realtime',
  'social': 'https://tw.news.appledaily.com/local/realtime',
  'international': 'https://tw.news.appledaily.com/international/realtime',
  'entertainment': 'https://tw.entertainment.appledaily.com/realtime',
  'life': 'https://tw.news.appledaily.com/life/realtime',
  '3C': 'https://tw.lifestyle.appledaily.com/gadget/realtime',
  'finance': 'https://tw.finance.appledaily.com/realtime/',
  'sports': 'https://tw.sports.appledaily.com/realtime'
}

const login = async (browser) => {
  const page = await browser.newPage()
  await page.goto('https://tw.appledaily.com/new/realtime')
  await page.click('#login-button a')
  try {
    await page.waitFor('#login-form')
    await page.type('#email', 'aa123000@ymail.com')
    await page.type('#password', '5pB-kyJt!6bZZwN')
    await page.$eval('#login-form', form => form.submit())
    await page.waitForNavigation()
  } catch (err) {
    throw err
  } finally {
    await page.close()
  }
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
  // await login(browser)
  const page = await browser.newPage()
  for (const newstype of Object.keys(newsTypes)) {
    let linkArray = []
    const link = newsTypes[newstype]
    await page.goto(link)
    await page.waitFor('.page_switch a')
    const pageLink = await page.evaluate(
      () => [...document.querySelectorAll('.page_switch a')].map(elem => elem.href)
    )
    let last = pageLink.pop()
    if (last === link + '/11') {
      await page.goto(last)
      let temp = await page.evaluate(
        () => [...document.querySelectorAll('.page_switch a')].map(elem => elem.href)
      )
      pageLink.pop()
      pageLink.push(...temp)
    } else {
      pageLink.push(last)
    }
    for (const pagelink of pageLink) {
      await page.goto(pagelink)
      await page.waitFor('.rtddt a')
      const pLink = await page.evaluate(
        () => [...document.querySelectorAll('.rtddt a')].map(elem => elem.href)
      )
      linkArray = linkArray.concat(pLink)
    }
    // fs.writeFile('link.txt', linkArray)
    for (const linkarray of linkArray) {
      await page.goto(linkarray)
      let title = await page.evaluate(
        () => document.querySelector('h1').textContent
      )
      let isLogin = await page.evaluate(
        () => document.getCookie('isLoggedIn')
      )
      if (isLogin === 'false') {
        await login(browser)
        await page.reload()
        await page.waitFor(5000)
      }
      // page.waitFor('.ndArticle_margin')
      let content = await page.evaluate(
        () => [...document.querySelectorAll('.ndArticle_margin > p')].map(elem => elem.textContent).join()
      )
      const obj = [{
        'type': newstype,
        'url': linkarray,
        'title': title,
        'content': content
      }]
      await db.create('news', obj, (result) => {
        console.log('insert success')
      })
    }
  }
  await browser.close()
})()
