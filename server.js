const express = require('express')
const app = express()
var bodyParser = require('body-parser')

// parse application/json
app.use(bodyParser.json())

const PORT = 8080

// FCM

const registrationTokens = [
  'fxe6SCaqjfUqXq1EOjkcLA:APA91bHqpdZXF_LuOs7uKJSXvDzh2ZULOrs9486urUFG85PPQAmllsayB6ypwTDhM9nu61HnG6h2-TcKMyn2jCXoMDVBDeUnTqE9afVmVgfjc1FkbNSLqI4',
]

const { initializeApp } = require('firebase-admin/app')
const { getMessaging } = require('firebase-admin/messaging')

var admin = initializeApp()

// var serviceAccount = require('./heycheese-6b35b-firebase-adminsdk-dgawo-e6a96899bb.json')

// Middleware
app.use(express.json())

// allow * cors
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  next()
})

// fcm test
app.post('/fcm/regist', (req, res) => {
  console.log('registing token on server:', req.body.token)

  const { token } = req.body
  if (!token) {
    return res.status(400).send('no token')
  }

  if (registrationTokens.includes(token)) {
    console.log('already registered token')
    return res.status(200).send('already registered token')
  }

  registrationTokens.push(token)
  console.log('registered token:', registrationTokens)
  return res.status(200).send('ok')
})

app.post('/fcm/broadcast', (req, res) => {
  console.log('broadcasting ...')

  console.log('registrationTokens:', registrationTokens)
  if (registrationTokens.length === 0) return res.status(400).send('no token')

  const message = {
    data: {
      title: 'test message',
      score: '850',
      time: '2:45',
    },
    tokens: registrationTokens,
  }

  getMessaging()
    .sendEachForMulticast(message)
    .then((response) => {
      console.log('Successfully sent message:', response)
      return res.status(200).send('ok')
    })
})

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
