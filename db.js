/* Usage:
    const db = require(path.join(process.cwd(), 'utils', 'db.js'))
    db.create(targetCollection, dataArray, (result) => {...})
    db.ifExist(targetCollection, query, (bool:ifExist) => {...})
    db.find(targetCollection, query, field, (array:result) => {...})
    db.findOrdered(targetCollection, query, field, (array:result) => {...})
    db.update(targetCollection, query, data, (result) => {...})
    db.updateUpserted(targetCollection, query, data, (result) => {...})
    db.delete(targetCollection, query, (result) => {...})
    db.drop(targetCollection, (result) => {...})
*/
const PATH = require('path')
const MongoClient = require('mongodb').MongoClient

const CONFIG = require(PATH.join(process.cwd(), 'config', 'config.js'))
const DATABASE = CONFIG.mongodbConfig

const ifExistDocuments = (targetDb, targetCollection, query, callback) => {
  const collection = targetDb.collection(targetCollection)
  collection.find(query).toArray((err, result) => {
    if (err) throw err
    // eslint-disable-next-line standard/no-callback-literal
    callback(result.length !== 0)
  })
}

const insertDocuments = (targetDb, targetCollection, dataArray, callback) => {
  const collection = targetDb.collection(targetCollection)
  collection.insertMany(dataArray, (err, result) => {
    if (err) throw err
    callback(result)
  })
}

const findDocuments = (targetDb, targetCollection, query, field, callback) => {
  const collection = targetDb.collection(targetCollection)
  collection.find(query).project(field).toArray((err, result) => {
    if (err) throw err
    callback(result)
  })
}

const findDocumentsOrdered = (targetDb, targetCollection, query, field, callback) => {
  const collection = targetDb.collection(targetCollection)
  collection.find(query).project(field).sort({ _id: 1 }).toArray((err, result) => {
    if (err) throw err
    callback(result)
  })
}

const updateDocument = (targetDb, targetCollection, query, data, callback) => {
  const collection = targetDb.collection(targetCollection)
  collection.updateOne(query, data, (err, result) => {
    if (err) throw err
    callback(result)
  })
}

const updateDocumentUpserted = (targetDb, targetCollection, query, data, callback) => {
  const collection = targetDb.collection(targetCollection)
  collection.updateOne(query, data, { upsert: true }, (err, result) => {
    if (err) throw err
    callback(result)
  })
}

const removeDocument = (targetDb, targetCollection, query, callback) => {
  const collection = targetDb.collection(targetCollection)
  collection.deleteOne(query, (err, result) => {
    if (err) throw err
    callback(result)
  })
}

const dropDocument = (targetDb, targetCollection, callback) => {
  const collection = targetDb.collection(targetCollection)
  collection.drop((err, result) => {
    if (err) throw err
    callback(result)
  })
}

module.exports = {
  create: (targetCollection, dataArray, callback) => {
    MongoClient.connect(DATABASE.url, DATABASE.options, (err, client) => {
      if (err) throw err
      const db = client.db(DATABASE.name)
      insertDocuments(db, targetCollection, dataArray, result => {
        client.close()
        callback(result)
      })
    })
  },
  ifExist: (targetCollection, query, callback) => {
    MongoClient.connect(DATABASE.url, DATABASE.options, (err, client) => {
      if (err) throw err
      const db = client.db(DATABASE.name)
      ifExistDocuments(db, targetCollection, query, ifExist => {
        client.close()
        callback(ifExist)
      })
    })
  },
  find: (targetCollection, query, field, callback) => {
    MongoClient.connect(DATABASE.url, DATABASE.options, (err, client) => {
      if (err) throw err
      const db = client.db(DATABASE.name)
      findDocuments(db, targetCollection, query, field, result => {
        client.close()
        callback(result)
      })
    })
  },
  findOrdered: (targetCollection, query, field, callback) => {
    MongoClient.connect(DATABASE.url, DATABASE.options, (err, client) => {
      if (err) throw err
      const db = client.db(DATABASE.name)
      findDocumentsOrdered(db, targetCollection, query, field, result => {
        client.close()
        callback(result)
      })
    })
  },
  update: (targetCollection, query, data, callback) => {
    MongoClient.connect(DATABASE.url, DATABASE.options, (err, client) => {
      if (err) throw err
      const db = client.db(DATABASE.name)
      updateDocument(db, targetCollection, query, data, result => {
        client.close()
        callback(result)
      })
    })
  },
  updateUpserted: (targetCollection, query, data, callback) => {
    MongoClient.connect(DATABASE.url, DATABASE.options, (err, client) => {
      if (err) throw err
      const db = client.db(DATABASE.name)
      updateDocumentUpserted(db, targetCollection, query, data, result => {
        client.close()
        callback(result)
      })
    })
  },
  delete: (targetCollection, query, callback) => {
    MongoClient.connect(DATABASE.url, DATABASE.options, (err, client) => {
      if (err) throw err
      const db = client.db(DATABASE.name)
      removeDocument(db, targetCollection, query, result => {
        client.close()
        callback(result)
      })
    })
  },
  drop: (targetCollection, callback) => {
    MongoClient.connect(DATABASE.url, DATABASE.options, (err, client) => {
      if (err) throw err
      const db = client.db(DATABASE.name)
      dropDocument(db, targetCollection, result => {
        client.close()
        callback(result)
      })
    })
  }
}
