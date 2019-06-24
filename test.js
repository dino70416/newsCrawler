const PATH = require('path')
const db = require(PATH.join(process.cwd(), 'db.js'))

db.find('news', { 'url': /.*\/e\/.*/ }, { '_id': false, 'url': true }, (result) => {
  // console.log(result)
  for (const i of result) {
    const a = i.url.slice(-6)
    db.update('news', i, { $set: { 'url': 'https://www.setn.com/News.aspx?NewsID=' + a } }, (result) => {
      console.log('https://www.setn.com/News.aspx?NewsID=' + a)
    })
  }
})
