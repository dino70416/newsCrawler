const fs = require('fs')
const cheerio = require('cheerio')
const nodejieba = require('nodejieba')
const PATH = require('path')
const db = require(PATH.join(process.cwd(), 'db.js'))
const excludeWords = fs.readFileSync('./jieba_data/exclude_words.txt', 'utf8').split('\r\n')
const fileNum = 5695

nodejieba.load({
  dict: './jieba_data/dict.txt',
  userDict: './jieba_data/dict1.txt',
  stopWordDict: './jieba_data/stopwords.txt'
})

for (let i = 1; i <= fileNum; i++) {
  const data = fs.readFileSync('./webpage/setn/setn' + i + '.html', 'utf8')
  const $ = cheerio.load(data)
  const link = $('meta[property="og:url"]').attr('content')
  const title = $('#newsTitle').text().trim()
  const content = $('.Content2 > p:not(p[style="text-align: center;"])').text()
  const cut = nodejieba.cut(content)
  const cutExcluded = cut.filter((x) => { return excludeWords.indexOf(x) === -1 }).join(' ')
  db.update('news', { 'url': 'https://www.setn.com/e/News.aspx?NewsID=' + link.slice(-6), 'content': '' }, { $set: { 'title': title, 'content': content, 'cut': cutExcluded } }, (result) => {
    console.log('file ' + i + ' update success')
  })
}
