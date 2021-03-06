/**
 * @Author: Brogan Miner <Brogan>
 * @Date:   2019-03-11T13:57:19-07:00
 * @Email:  brogan.miner@oregonstate.edu
 * @Last modified by:   Brogan
 * @Last modified time: 2019-03-29T12:39:42-07:00
 */

require('dotenv').config()
const APIToken = require('./api.js')
const axios = require('axios')
const express = require('express')
const router = express.Router()
const db = require('../ddb.js')
db.initialize()
router.use(require('sanitize').middleware)

router.get('/buildings', async (req, res) => {
  try {
    const token = await APIToken()
    const responseData = await axios('https://api.oregonstate.edu/v1/locations?type=building&page[size]=10000', { method: 'get', headers: { Authorization: 'Bearer ' + token } })
    res.send(responseData.data)
  } catch (e) {
    res.send(e.message)
  }
})

router.get('/buildingImage', async (req, res) => {
  try {
    const token = await APIToken()
    const responseData = await axios('https://api.oregonstate.edu/v1/locations/' + req.queryString('id'), { method: 'get', headers: { Authorization: 'Bearer ' + token } })
    res.send(responseData.data.data.attributes.images[0])
  } catch (e) {
    res.send(e.message)
  }
})

router.get('/features', async (req, res) => {
  try {
    let features = await db.query('sus_map').scan({
      'Select': 'ALL_ATTRIBUTES'
    })
    res.send(features.Items)
  } catch (err) {
    res.satus(400).send(err.message)
  }
})

router.get('/services', async (req, res) => {
  const token = await APIToken()
  const responseData = await axios('https://api.oregonstate.edu/v1/locations?page[size]=10000', { method: 'get', headers: { Authorization: 'Bearer ' + token } })
  res.send(responseData.data)
})

module.exports = router
