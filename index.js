const http = require('http')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const Blog = require('./models/blog')
const blogsRouter = require('./controllers/blogs')

app.use(cors())
app.use(bodyParser.json())
app.use('/api/blogs', blogsRouter)
/*mongoose.Promise = global.Promise*/


const PORT = process.env.PORT || 3003
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
