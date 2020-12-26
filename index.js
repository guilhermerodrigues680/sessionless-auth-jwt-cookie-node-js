const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

const apiRouter = require('./apiRouter')

const app = express()

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', express.static(__dirname + '/static'))
app.use('/api', apiRouter)


app.listen(3000, () => {
  console.log(`Servidor rodando em http://localhost:${3000}/`)
})