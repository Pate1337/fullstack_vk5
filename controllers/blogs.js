const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({})
    .populate('user', { username: 1, name: 1 })
  response.json(blogs.map(Blog.format))
})

blogsRouter.post('/', async (request, response) => {
  try {
    const body = request.body

    if (body.title === undefined || body.url === undefined) {
      return response.status(400).json({error: 'title or url missing'})
    }
    let blog = request.body
    /*Jotta saadaan blogiin lisääjän tiedot*/
    const user = await User.findById(body.userId)
    /*Kaksi testiä kusee nyt, koska niissä ei määritellä kenttää userId*/
    if (body.likes === undefined) {
      blog = new Blog({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: 0,
        user: user._id
      })
    } else {
      blog = new Blog({
        title: body.title,
        author: body.author,
        url: body.url,
        likes: body.likes,
        user: user._id
      })
    }
    const savedBlog = await blog.save()
    /*Lisätään myös käyttäjälle kyseinen blogi*/
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()

    response.status(201).json(Blog.format(blog))
  } catch(exception) {
    console.log(exception)
    response.status(500).json({ error: 'something went wrong...' })
  }
})

blogsRouter.delete('/:id', async (request, response) => {
  try {
    await Blog.findByIdAndRemove(request.params.id)
    response.status(204).end()
  } catch (exception) {
    console.log(exception)
    response.status(400).send({error: 'malformatted id'})
  }
})

blogsRouter.put('/:id', async (request, response) => {
  console.log('päästiin puttiin asti')
  try {
    const body = request.body
    const blog = {
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes
    }
    console.log('requestin mukana tuotu blogi ', blog)
    await Blog
      .findByIdAndUpdate(request.params.id, blog, {new: true})
    response.status(201).json(blog)
  } catch (exception) {
    console.log(exception)
    response.status(400).send({error: 'malformatted id'})
  }
})

module.exports = blogsRouter
