// Package imports
const express = require('express')
const cors = require('cors');

// Local imports

// Constants
const domain = "localhost"
const port = 3000

// Main
let listCounter = 0
let lists = []

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.static('public'))

app.get('/', (req, res) => {
    res.send('Hello, world!')
})

app.get('/lists', (req, res) => {
    res.send(lists)
})

app.get('/lists/:id', (req, res) => {
    const list = lists.filter(l => l.id == req.params.id)
    if (list.length === 0) {
        res.sendStatus(404)
    } else {
        res.send(list[0])
    }
})

app.post('/lists', (req, res) => {
    req.body.id = listCounter++
    lists.push(req.body)
    res.status(201)
    res.location(`/lists/${req.body.id}`)
    res.send(req.body)
})

app.put('/lists/:id', (req, res) => {
    const list = lists.filter(l => l.id == req.params.id)
    if (list.length === 0) {
        res.sendStatus(404)
    } else {
        for (const key in req.body) {
            if (Object.hasOwn(req.body, key)) {
                list[0][key] = req.body[key]
            }
        }
        res.send(list[0])
    }
})

app.delete('/lists/:id', (req, res) => {
    const listInd = lists.findIndex(l => l.id === req.params.id)
    if (listInd !== -1) {
        lists.splice(listInd)
    }
    res.sendStatus(204)
})

app.delete('/lists', (req, res) => {
    lists = []
    listCounter = 0
    res.sendStatus(204)
})

app.listen(port, () => {
    console.log(`App running at http://${domain}:${port}`)
})