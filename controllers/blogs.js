const blogsRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const Blog = require('../models/blog')
const User = require('../models/user')

// const getUserToken = request => {
//   const authHeader = request.get('authorization')
//   if (authHeader && authHeader.toLowerCase().startsWith('bearer')) {
//     return authHeader.substring(7)
//   }
//   return null
// }

blogsRouter.get('/', async (request, response) => {
    const allBlogs = await Blog.find({}).populate('user', { username: 1, name: 1 })
    response.json(allBlogs)
  })
  
blogsRouter.get('/:id', async (request, response) => {
    const returnedBlog = await Blog.findById(request.params.id).populate('user', { username: 1, name: 1 })
    response.json(returnedBlog)
  })
  
blogsRouter.post('/', async (request, response) => {
    const blogToAdd = request.body
    
    const decodedToken = jwt.verify(blogToAdd.token, process.env.SECRET)
    console.log(decodedToken)
    if (!blogToAdd.token || !decodedToken.id) {
      response.status(401).json({ error: 'token missing or invalid' })
    }
    const user = await User.findById(decodedToken.id)

    if (!blogToAdd.likes) {
      blogToAdd.likes = 0
    }
    const blog = new Blog({
      title: blogToAdd.title,
      author: user.name,
      url: blogToAdd.url,
      likes: blogToAdd.likes,
      user: user._id
    })
    const result = await blog.save()
    user.blogs = user.blogs.concat(result)
    await user.save()
    response.status(201).json(result)
  })

blogsRouter.delete('/:id', async (request, response) => {
    await Blog.findByIdAndRemove(request.params.id)
    response.status(204).end()
  })
blogsRouter.put('/:id', async (request, response) => {
    const body = request.body
    const newNote = {
      title: body.title,
      url: body.url,
      author: body.author,
      likes: body.likes
    }
    const updatedNote = await Blog.findByIdAndUpdate(request.params.id, newNote, { new: true })
    response.json(updatedNote)
  })

module.exports = blogsRouter