const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const Blog = require('../models/blog')
const { initialBlogs, format, blogsInDb } = require('./test_helper')


beforeAll(async () => {
  await Blog.remove({})

  const blogObjects = initialBlogs.map(b => new Blog(b))
  await Promise.all(blogObjects.map(b => b.save()))
})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('a valid blog can be added', async () => {
  const newBlog = {
    title: "First class tests",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
    likes: 10
  }
  const blogsBefore = await blogsInDb()

  await api
    .post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAfter = await blogsInDb()

  expect(blogsAfter.length).toBe(blogsBefore.length + 1)
  expect(blogsAfter).toContainEqual(newBlog)
})

describe('a blog without', () => {
  test('likes will be given value likes = 0', async () => {
    const newBlog = {
      title: "random",
      author: "Paavo",
      url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll"
    }
    const blogsBefore = await blogsInDb()
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAfter = await blogsInDb()
    expect(blogsAfter.length).toBe(blogsBefore.length + 1)
    let verrattava = blogsAfter.find(blog => blog.title === "random")
    expect(verrattava.likes).toBe(0)
  })

  test('title will not be added', async () => {
    const newBlog = {
      author: "Paavo",
      url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
      likes: 3
    }
    const blogsBefore = await blogsInDb()
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)

    const blogsAfter = await blogsInDb()
    expect(blogsAfter.length).toBe(blogsBefore.length)
  })

  test('url will not be added', async () => {
    const newBlog = {
      title: 'random',
      author: "Paavo",
      likes: 3
    }
    const blogsBefore = await blogsInDb()
    await api
      .post('/api/blogs')
      .send(newBlog)
      .expect(400)

    const blogsAfter = await blogsInDb()
    expect(blogsAfter.length).toBe(blogsBefore.length)
  })
})

describe('deletion of a blog', () => {
  let addedBlog
  beforeAll(async () => {
    addedBlog = new Blog({
      title: 'poistettava blogi',
      author: 'TuhonOma',
      url: 'www.yolo.fi',
      likes: 4
    })
    /*Tässä lisätään tietokantaan ilman post-pyyntöä*/
    await addedBlog.save()
  })

  test('DELETE /api/blogs/:id succeeds with proper statuscode', async () => {
    const blogsBefore = await blogsInDb()

    await api
      .delete(`/api/blogs/${addedBlog._id}`)
      .expect(204)

    const blogsAfter = await blogsInDb()
    const titles = blogsAfter.map(b => b.title)

    expect(titles).not.toContain(addedBlog.title)
    expect(blogsAfter.length).toBe(blogsBefore.length - 1)
  })
})

describe('modification of a blog', () => {
  let addedBlog
  beforeAll(async () => {
    addedBlog = new Blog({
      title: 'muokattava blogi',
      author: 'asdasd',
      url: 'lisätään likejä',
      likes: 4
    })
    /*Tässä lisätään tietokantaan ilman post-pyyntöä*/
    await addedBlog.save()
    console.log('beforeAll:ssa lisättävä blogi ', addedBlog)
  })
  test('likes of a blog can be updated', async () => {
    const blogsBefore = await blogsInDb()
    console.log('blogit ennen muokkausta: ', blogsBefore)
    const modifiedBlog = {
      title: 'muokattava blogi',
      author: 'asdasd',
      url: 'lisätään likejä',
      likes: 5
    }
    console.log('muokattava blogi: ', modifiedBlog)
    await api
      .put(`/api/blogs/${addedBlog._id}`)
      .send(modifiedBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/)
    console.log('put operaatio onnistui!')
    const blogsAfter = await blogsInDb()
    expect(blogsAfter.length).toBe(blogsBefore.length)
    const verrattava = blogsAfter.find(b => b.title === 'muokattava blogi')
    expect(verrattava.likes).toBe(modifiedBlog.likes)
  })
})
afterAll(() => {
  server.close()
})
