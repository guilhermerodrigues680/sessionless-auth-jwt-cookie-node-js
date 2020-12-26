const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const cors = require('cors')

const apiRouter = require('./apiRouter')

const app = express()

app.disable('x-powered-by')
app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser("ol@Mundo"));

app.use('/', express.static(__dirname + '/static'))
app.use('/api', apiRouter)


app.listen(3000, () => {
  console.log(`Servidor rodando em http://localhost:${3000}/`)
})