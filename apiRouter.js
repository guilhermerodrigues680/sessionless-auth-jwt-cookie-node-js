const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const router = express.Router()

const package = require('./package.json')
const jwtPrivateKey = 'ol@Mundo'
const jwtExpirationSecs = 60

const users = [
  {
    username: 'gabrielf',
    fullName: 'Gabriel Fernandes Oliveira',
    password: '$2b$11$4IpAKqUDaWBJ0M4ZCeE9zOwYAEQUE937IWXbNf9oVUUYv3pxO7vY2' // senha: 1234
  },
  {
    username: 'marianar',
    fullName: 'Mariana Ribeiro Almeida',
    password: '$2b$11$JKrTRGaH9DmVRN2XOjjNDuoIYeRxJeGImkkYLiUsFqre8riF6IYG2' // senha: 123456
  },
]

// middleware that is specific to this router
router.use(async function timeLog(req, res, next) {
  if (req.path === '/login' || req.path === '/register' || req.path === '/logout') {
    next()
    return
  }

  const token = req.signedCookies["__Host-jwt"]

  if (token === false) {
    res.cookie('__Host-jwt', '', { httpOnly: true, secure: true, sameSite: 'strict', signed: true, expires: new Date(null) })
    res.status(400).send({ message: 'User authentication failed. Please log in again' })
    return
  }

  if (!token) {
    res.status(400).send({ message: 'User not logged in' })
    return
  }

  try {
    const payload = await jwt.verify(token, jwtPrivateKey)
    console.log(payload)
    req.jwtUsername = payload.username
  } catch (error) {
    console.error(error)

    res.cookie('__Host-jwt', '', { httpOnly: true, secure: true, sameSite: 'strict', signed: true, expires: new Date(null) })
    if (error.name === 'TokenExpiredError') {
      res.status(400).send({ message: 'User session expired. Please log in again' })
      return
    }

    res.status(400).send({ message: 'User authentication failed. Please log in again' })
    return
  }

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
  const { fullName, username, password } = req.body
  const hashCost = 11

  if (!password || !username || !fullName) {
    res.status(400).send({ message: 'Invalid form' })
    return
  }

  try {
    const passwordHash = await bcrypt.hash(password, hashCost)
    users.push({ username, fullName, password: passwordHash })
    res.status(204).send('')
  } catch (error) {
    console.error(error)
   res.status(400).send({ message: 'Error' })
  }
})

router.post('/login', async (req, res) => {
  const { username, password } = req.body

  try {
    const user = users.find(user => user.username === username)

    if (!user) {
      res.status(400).send({ message: 'Invalid username' })
      return
    }

    const isUserPassword = await bcrypt.compare(password, user.password)

    if (!isUserPassword) {
      res.status(400).send({ message: 'Invalid password' })
      return
    }
  } catch (error) {
    res.status(400).send({ message: 'Error' })
    return
  }

  try {
    const jwtPayload = { username: username }

    const token = jwt.sign(jwtPayload, jwtPrivateKey, { expiresIn: jwtExpirationSecs })

    res.cookie('__Host-jwt', token, { httpOnly: true, secure: true, sameSite: 'strict', signed: true })
    res.status(200).send('')
    return
  } catch (error) {
    console.error(error)
    res.status(400).send({ message: 'Error' })
  }
})

router.get('/logout', (req, res) => {
  res.cookie('__Host-jwt', '', { httpOnly: true, secure: true, sameSite: 'strict', signed: true, expires: new Date(null) })
  res.status(200).send({ message: 'signed out' });
})

router.get('/protected-route', (req, res) => {
  const { username, fullName } = users.find(user => user.username === req.jwtUsername)

  res.send({
    message: 'Logged User: ' + JSON.stringify({ username, fullName })
  })
})

module.exports = router