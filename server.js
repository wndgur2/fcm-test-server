const express = require('express')
const app = express()
var bodyParser = require('body-parser')

// parse application/json
app.use(bodyParser.json())

const PORT = 8080

// FCM

const registrationTokens = [
  'fzVVkxDs6n2OKhKoeapQVk:APA91bHb-uBQxRcjg2LmxnF6QBvUnx_V1Vq1_-G5JOQisgnKHcO84W6YTky5DomWSREqtBSfmx3GPQwE3JKnkvSdQLJfQPD4S_h2iSa-m427ckQbHNpoc94',
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
      time: '317',
      alertTitle: '장수말벌 출몰',
      alertBody: '2번 벌통에 3시 20분에 장수말벌이 출몰했어요!',
    },
    tokens: registrationTokens,
  }

  getMessaging()
    .sendEachForMulticast(message)
    .then((response) => {
      console.log('sent message:', response)
      if (response.failureCount > 0) {
        const failedTokens = []
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(registrationTokens[idx])
          }
          if (resp.error) {
            console.log('Error sending message to token:', registrationTokens[idx], resp.error)
          }
        })
        console.log('List of tokens that caused failures: ' + failedTokens)
      }
      return res.status(200).send('ok')
    })
    .catch((error) => {
      console.log('Error sending message:', error)
      return res.status(500).send('error')
    })
})

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
