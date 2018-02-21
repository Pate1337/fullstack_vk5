const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', (request, response) => {
  Blog
    .find({})
    .then(blogs => {
      response.json(blogs)
    })
})

blogsRouter.post('/', (request, response) => {
  const body = request.body

  if (body.title === undefined || body.url === undefined) {
    return response.status(400).json({error: 'title or url missing'})
  }
  let blog = request.body
  if (body.likes === undefined) {
    blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: 0
    })
  } else {
    blog = new Blog({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes
    })
  }

  blog
    .save()
    .then(result => {
      response.status(201).json(result)
    })
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
