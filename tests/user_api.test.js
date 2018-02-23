const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const User = require('../models/user')
const Blog = require('../models/blog')
const { initialUsers, usersInDb } = require('./test_helper')

describe('When there are 2 users in database', async () => {
  beforeAll(async () => {
    await User.remove({})
    await Blog.remove({})
    const userObjects = initialUsers.map(u => new User(u))
    await Promise.all(userObjects.map(u => u.save()))
  })

  test('POST /api/users succeeds with valid fields', async () => {
    const usersBefore = await usersInDb()

    const newUser = {
      username: 'uusi',
      name: 'uusiNimi',
      password: 'salasana3',
      adult: true
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAfter = await usersInDb()
    expect(usersAfter.length).toBe(usersBefore.length + 1)
    const usernames = usersAfter.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })
  test('POST /api/users with password less than 3 characters fails', async () => {
    const newUser = {
      username: 'uusi2',
      name: 'uusi2Nimi',
      password: '12',
      adult: false
    }
    const usersBefore = await usersInDb()
    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
    expect(result.body).toEqual({error: 'password has to be atleast 3 characters long'})
    const usersAfter = await usersInDb()
    expect(usersAfter.length).toBe(usersBefore.length)
  })
  test('POST /api/users fails with already taken username', async () => {
    const newUser = {
      username: initialUsers[0].username,
      name: 'varattu username',
      password: 'asdasd',
      adult: true
    }
    const usersBefore = await usersInDb()
    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
    expect(result.body).toEqual({error: 'username already taken'})
    const usersAfter = await usersInDb()
    expect(usersBefore.length).toBe(usersAfter.length)
  })
})

afterAll(() => {
  server.close()
})
