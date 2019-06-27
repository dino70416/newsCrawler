const PATH = require('path')
const db = require(PATH.join(process.cwd(), './', 'db.js'))
const fs = require('fs')
const nodejieba = require('nodejieba')
const excludeWords = fs.readFileSync('./jieba_data/exclude_words.txt', 'utf8').split('\r\n')

nodejieba.load({
  dict: './jieba_data/dict.txt',
  userDict: './jieba_data/dict1.txt',
  stopWordDict: './jieba_data/stopwords.txt'
})

db.find('news', {}, { '_id': false, 'content': true, 'title': true, 'url': true }, (result) => {
  for (const i of result) {
    let cont = i.content.trim()
    cont = cont.replace(/\n/g, '')
    const cut = nodejieba.cut(cont)
    const cutExcluded = cut.filter((x) => { return excludeWords.indexOf(x) === -1 }).join(' ')
    db.update('news', { 'url': i.url }, { $set: { 'content': cont, 'cut': cutExcluded } }, (result) => {
      if (result.result.nModified === 1) {
        console.log(i.title + ' : update success')
      } else {
        console.log(i.title + ' : update failure')
      }
    })
  }
})
