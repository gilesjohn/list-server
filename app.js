const express = require('express')
const app = express()
app.use(express.static('public'))

const domain = "localhost"
const port = 3000

app.get('/', (req, res) => {
    res.send('Hello, world!')
})

app.listen(port, () => {
    console.log(`App running at http://${domain}:${port}`)
})