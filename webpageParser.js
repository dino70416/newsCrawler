const fs = require('fs')
const cheerio = require('cheerio')
const nodejieba = require('nodejieba')
const PATH = require('path')
const db = require(PATH.join(process.cwd(), 'db.js'))
const excludeWords = fs.readFileSync('./jieba_data/exclude_words.txt', 'utf8').split('\r\n')
const fileNum = 535

nodejieba.load({
  dict: './jieba_data/dict.txt',
  userDict: './jieba_data/dict1.txt',
  stopWordDict: './jieba_data/stopwords.txt'
})

for (let i = 1; i <= fileNum; i++) {
  const data = fs.readFileSync('./webpage/ettoday/ettoday' + i + '.html', 'utf8')
  const $ = cheerio.load(data)
  // const link = $('meta[property="og:url"]').attr('content')
  const link = $('link[rel=canonical]').attr('href')
  const title = $('h1').text().trim()
  // $('.story > p:has(strong)').addClass('test')
  $('.story > p > strong').remove()
  $('.story > p > a').remove()
  const content = $('.story > p').text()
  const cut = nodejieba.cut(content)
  const cutExcluded = cut.filter((x) => { return excludeWords.indexOf(x) === -1 }).join(' ')
  db.update('news', { 'url': link, 'content': '' }, { $set: { 'title': title, 'content': content, 'cut': cutExcluded } }, (result) => {
    if (result.result.nModified === 1) {
      console.log('file ' + i + ' : ' + link + ' / update success')
    }
  })
}
