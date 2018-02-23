const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.post('/', async (request, response) => {
  try {
    const body = request.body

    /*Salasana vähintään 3 merkkiä*/
    if (body.password.length < 3) {
      return response.status(400).json({error: 'password has to be atleast 3 characters long'})
    }
    /*Käyttäjätunnus oltava uniikki*/
    const existingUser = await User.find({username: body.username})
    if (existingUser.length > 0) {
      return response.status(400).json({error: 'username already taken'})
    }
    /*Jos adult === undefined, niin adult: true*/
    let valueOfAdult = body.adult
    if (valueOfAdult === undefined) {
      valueOfAdult = true
    }
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.password, saltRounds)

    const user = new User({
      username: body.username,
      name: body.name,
      passwordHash,
      adult: valueOfAdult
    })

    const savedUser = await user.save()

    response.status(200).json(savedUser)
  } catch (exception) {
    console.log(exception)
    response.status(500).json({ error: 'something went wrong...' })
  }
})

usersRouter.get('/', async (request, response) => {
  const users = await User
    .find({})
    .populate('blogs', { likes: 1, author: 1, title: 1, url: 1 })
  /*Täällä käytetään User:in stattista metodia format*/
  response.json(users.map(User.format))
})

module.exports = usersRouter
