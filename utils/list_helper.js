const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  let sum = 0
  blogs.forEach(blog => {
    sum = sum + blog.likes
  })
  return sum
}

const favoriteBlog = (blogs) => {
  let suurin = 0
  let suosituin = blogs[0]
  blogs.forEach(blog => {
    if (blog.likes > suurin) {
      suurin = blog.likes
      suosituin = blog
    }
  })
  return suosituin
}

const mostBlogs = (blogs) => {
  let authors = []
  blogs.forEach(blog => {
    if (authors.length === 0) {
      authors.push({ author: blog.author, blogs: 1})
    } else {
      const found = authors.find(person => person.author === blog.author)
      if (found) {
        authors.map(person => {
          if (person.author === blog.author) {
            person.blogs += 1
          }
        })
      } else {
        authors.push({ author: blog.author, blogs: 1} )
      }
    }
  })
  /*etsitään author jolla eniten blogeja*/
  let eniten = authors[0]
  let suurin = 0
  authors.forEach(person => {
    if (person.blogs > suurin) {
      suurin = person.blogs
      eniten = person
    }
  })
  return eniten
}

const mostLikes = (blogs) => {
  let authors = []
  blogs.forEach(blog => {
    if (authors.length === 0) {
      authors.push({ author: blog.author, likes: blog.likes })
    } else {
      const found = authors.find(person => person.author === blog.author)
      if (found) {
        authors.map(person => {
          if (person.author === blog.author) {
            person.likes += blog.likes
          }
        })
      } else {
        authors.push({ author: blog.author, likes: blog.likes } )
      }
    }
  })
  /*etsitään author jolla eniten blogeja*/
  let eniten = authors[0]
  let suurin = 0
  authors.forEach(person => {
    if (person.likes > suurin) {
      suurin = person.likes
      eniten = person
    }
  })
  return eniten
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}
