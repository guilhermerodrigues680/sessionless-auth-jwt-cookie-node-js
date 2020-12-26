const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const router = express.Router()

const package = require('./package.json')
const jwtPrivateKey = 'ol@Mundo'
const jwtExpirationMs = 1000 * 60

// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
  if (req.path === '/login' || req.path === '/register') {
    next()
    return
  }

  const token = req.cookies.jwt;
  next()
});

router.get('/', (req, res) => {
  const { author, description, name, version } = package;

  res.send({
    author,
    description,
    name,
    version
  })
});

router.post('/register', async (req, res) => {
  const { username, password } = req.body

  const hashCost = 11
  //const password = '123456'

  try {
    const passwordHash = await bcrypt.hash(password, hashCost)

    res.send({
      passwordHash
    })
  } catch (error) {
    console.error(error)
   res.status(400).send('Erro')
  }
})

router.post('/login', async (req, res) => {
  const { username, password } = req.body
  const passwordHash = "$2b$11$JKrTRGaH9DmVRN2XOjjNDuoIYeRxJeGImkkYLiUsFqre8riF6IYG2" // senha: 123456

  try {
    const isUserPassword = await bcrypt.compare(password, passwordHash)

    if (!isUserPassword) {
    res.send('Senha invalida')
    }
  } catch (error) {
    res.send('Erro')
  }

  try {
    const jwtPayload = {
      username: username,
      expires: Date.now() + jwtExpirationMs,
    }

    const token = jwt.sign(jwtPayload, jwtPrivateKey)

    res.cookie('jwt', token, { httpOnly: true, secure: true,  });
    res.send(token)
  } catch (error) {
    console.error(error)
    res.send('Erro')
  }
})

router.get('/protected-route', (req, res) => {
  res.send('ok')
})

module.exports = router