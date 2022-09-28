const MongoClient = require('mongodb').MongoClient

const config = require('../config')

module.exports = {
    getCollection
}

// Database Name 
const dbName = 'frayerr_db'
// username:frayer pass:frayer1234
const uri = "mongodb+srv://frayer:frayer1234@cluster0.wqcojpa.mongodb.net/?retryWrites=true&w=majority"

var dbConn = null

async function getCollection(collectionName) {
    try {
        const db = await connect()
        const collection = await db.collection(collectionName)
        return collection
    } catch (err) {
        logger.error('Failed to get Mongo collection', err)
        throw err
    }
}

async function connect() {
    if (dbConn) return dbConn
    try {
        // const client = await MongoClient.connect(config.dbURL, { useNewUrlParser: true, useUnifiedTopology: true })
        const client = await MongoClient.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })

        // Make the appropriate DB calls
        // await  listDatabases(client);

        const db = client.db(dbName)
        dbConn = db
        return db
    } catch (err) {
        logger.error('Cannot Connect to DB', err)
        throw err
    }
}

async function listDatabases(client){
    databasesList = await client.db().admin().listDatabases();
 
    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));
}




