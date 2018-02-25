const supertest = require('supertest')
const { app, server } = require('../index')
const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
const { initialBlogs, initialUsers, blogsInDb, userIdUsedInTests, testUserToken } = require('./test_helper')


beforeAll(async () => {
  await Blog.remove({})
  await User.remove({})

  const blogObjects = initialBlogs.map(b => new Blog(b))
  const userObjects = initialUsers.map(u => new User(u))
  await Promise.all(userObjects.map(u => u.save()))
  await Promise.all(blogObjects.map(b => b.save()))

})

test('blogs are returned as json', async () => {
  await api
    .get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('a valid blog can be added by a valid user', async () => {
  /*Tähän pitää saada tietokannassa olevan userin id kenttäään userId*/
  const token = await testUserToken()
  const newBlog = {
    /*userId: userId,*/
    title: "First class tests",
    author: "Robert C. Martin",
    url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
    likes: 10
  }
  const blogsBefore = await blogsInDb()

  await api
    .post('/api/blogs')
    .send(newBlog)
    .set('Authorization', `Bearer ${token}`)
    .expect(201)
    .expect('Content-Type', /application\/json/)

  const blogsAfter = await blogsInDb()

  expect(blogsAfter.length).toBe(blogsBefore.length + 1)
  const titles = blogsAfter.map(b => b.title)
  expect(titles).toContain(newBlog.title)
})

describe('Added by a valid user. A blog without', () => {
  test('likes will be given value likes = 0', async () => {
    /*Tähän pitää saada tietokannassa olevan userin id kenttäään userId*/
    const token = await testUserToken()
    const newBlog = {
      /*userId: userId,*/
      title: "random",
      author: "Paavo",
      url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll"
    }
    console.log('newBlogin userId: ', newBlog.userId)
    const blogsBefore = await blogsInDb()
    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `Bearer ${token}`)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAfter = await blogsInDb()
    expect(blogsAfter.length).toBe(blogsBefore.length + 1)
    let verrattava = blogsAfter.find(blog => blog.title === "random")
    expect(verrattava.likes).toBe(0)
  })

  test('title will not be added', async () => {
    const token = await testUserToken()
    const newBlog = {
      author: "Paavo",
      url: "http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll",
      likes: 3
    }
    const blogsBefore = await blogsInDb()
    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `Bearer ${token}`)
      .expect(400)

    const blogsAfter = await blogsInDb()
    expect(blogsAfter.length).toBe(blogsBefore.length)
  })

  test('url will not be added', async () => {
    const token = await testUserToken()
    const newBlog = {
      title: 'random',
      author: "Paavo",
      likes: 3
    }
    const blogsBefore = await blogsInDb()
    await api
      .post('/api/blogs')
      .send(newBlog)
      .set('Authorization', `Bearer ${token}`)
      .expect(400)

    const blogsAfter = await blogsInDb()
    expect(blogsAfter.length).toBe(blogsBefore.length)
  })
})

describe('deletion of a blog by a valid user', () => {
  let addedBlog
  beforeAll(async () => {
    const userId = await userIdUsedInTests()
    addedBlog = new Blog({
      title: 'poistettava blogi',
      author: 'TuhonOma',
      url: 'www.yolo.fi',
      likes: 4,
      user: userId
    })
    /*Tässä lisätään tietokantaan ilman post-pyyntöä*/
    await addedBlog.save()
  })

  test('DELETE /api/blogs/:id succeeds with proper statuscode', async () => {
    const blogsBefore = await blogsInDb()
    const token = await testUserToken()
    console.log('lisätyn blogin id: ', addedBlog._id)
    await api
      .delete(`/api/blogs/${addedBlog._id}`)
      .set('Authorization', `Bearer ${token}`)
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
