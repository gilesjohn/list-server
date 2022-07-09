// Package imports
require('dotenv').config()
const express = require('express')
const cors = require('cors');
const mongodb = require('mongodb')
const bson = require('bson')

// Local imports

// Constants
const domain = 'localhost'
const port = process.env.PORT || 3000

// Configure app
const app = express()
app.use(cors())
app.use(express.json())
app.use(express.static('public'))

const MongoClient = mongodb.MongoClient

// TODO database can provide validation

let dbClient = null
let db = null
/**
 * @returns {mongodb.Db}
 */
async function connectToDatabase() {
    if (dbClient == null) {
        dbClient = await MongoClient.connect(process.env.DATABASE_URL, {
            // Options
        })
    }

    if (db == null) {
        db = dbClient.db('lists')
    }

    return db
}

function stringIdToObjectId(stringId) {
    try {
        return mongodb.ObjectId(stringId)
    } catch (e) {
        if (e instanceof bson.BSONTypeError) {
            return null
        } else {
            throw e
        }
    }
}

// Create routes
app.get('/hello-world', (req, res) => {
    res.send('Hello, world!')
})

app.get('/lists', async (req, res) => {
    const db = await connectToDatabase()
    const lists = await db.collection("lists").find({}).toArray() // TODO only users lists
    res.send(lists)
})

app.get('/lists/:id', async (req, res) => {
    const db = await connectToDatabase()
    const objectId = stringIdToObjectId(req.params.id)
    if (objectId == null) {
        res.sendStatus(400)
    } else {
        const list = await db.collection("lists").findOne({_id: objectId}) // TODO only users list
        if (list == null) {
            res.sendStatus(404)
        } else {
            res.send(list)
        }
    }
})

app.post('/lists', async (req, res) => {
    const db = await connectToDatabase()
    const list = req.body
    const result = await db.collection('lists').insertOne(list) // TODO add user id
    list._id = result.insertedId
    res.status(201)
    res.location(`/lists/${list._id}`)
    res.send(list)
})

app.put('/lists/:id', async (req, res) => {
    const db = await connectToDatabase()
    const objectId = stringIdToObjectId(req.params.id)
    if (objectId == null) {
        res.sendStatus(400)
    } else {
        const list = await db.collection('lists').findOneAndUpdate({_id: objectId}, {$set: req.body}, {returnDocument: "after"}) // TODO only update this users list
        if (list == null) {
            res.sendStatus(404)
        } else {
            res.send(list)
        }
    }
})

app.delete('/lists/:id', async (req, res) => {
    const db = await connectToDatabase()
    const objectId = stringIdToObjectId(req.params.id)
    if (objectId == null) {
        res.sendStatus(400)
    } else {
        // TODO how is this going to fail, e.g. if it doesn't exist
        const result = await db.collection('lists').deleteOne({_id: objectId}) // TODO only delete this users list
        res.sendStatus(204)
        if (result.deletedCount != 1) {
            // TODO Would this happen? maybe multiple delete calls? keep track of?
        }
    }
})

app.delete('/lists', async (req, res) => {
    const db = await connectToDatabase()
    const result = await db.collection('lists').deleteMany({})
    res.sendStatus(204)
})

// Start server
app.listen(port, () => {
    console.log(`App running at http://${domain}:${port}`)
})