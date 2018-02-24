const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const initialBlogs = [
  {
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5
  },
  {
    title: "React patterns",
    author: "Michael Chan",
    url: "https://reactpatterns.com/",
    likes: 7
  }
]

const initialUsers = [
  {
    username: 'testi1',
    name: 'testi1',
    password: 'salasana1',
    adult: true
  },
  {
    username: 'testi2',
    name: 'testi2',
    password: 'salasana2',
    adult: false
  }
]

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(Blog.format)
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(User.format)
}

const userIdUsedInTests = async () => {
  const user = await User.find({username: 'testi1'})
  console.log('testi1 käyttäjä: ', user[0])
  return user[0]._id
}

const testUserToken = async () => {
  const user = await User.find({username: 'testi1'})
  const userForToken = {
    username: user[0].username,
    id: user[0]._id
  }
  const token = jwt.sign(userForToken, process.env.SECRET)
  return token
}

module.exports = { initialBlogs, initialUsers, blogsInDb, usersInDb, userIdUsedInTests, testUserToken }
