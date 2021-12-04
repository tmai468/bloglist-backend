const blogsRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const Blog = require('../models/blog')
const User = require('../models/user')
const middleware = require('../utils/middleware')

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

blogsRouter.get('/:id/comments', async (request, response) => {
  const returnedBlog = await Blog.findById(request.params.id).populate('user', { username: 1, name: 1 })
  if (returnedBlog.comment) {
    return response.send(returnedBlog.comment)
  } return null
})
  
blogsRouter.post('/', async (request, response) => {
    const blogToAdd = request.body
    // console.log(blogToAdd)
    const user = blogToAdd.user
    if (!user) {
      response.status(401).json({ error: 'have to login to create a new blog' })
    }
    if (!blogToAdd.likes) {
      blogToAdd.likes = 0
    }
    if (!blogToAdd.comments) {
      blogToAdd.comments = []
    }
    const blog = new Blog({
      title: blogToAdd.title,
      author: user.name,
      url: blogToAdd.url,
      likes: blogToAdd.likes,
      user: user._id,
      comments: blogToAdd.comments
    })
    const result = await blog.save()
    user.blogs = user.blogs.concat(result)
    await user.save()
    response.status(201).json(result)
  })

blogsRouter.delete('/:id', async (request, response) => {
    const body = request.body

    const userInToken = body.user


    const blogToRemove = await Blog.findById(request.params.id)
    if (blogToRemove.user.toString() === userInToken._id.toString()) {
      await Blog.findByIdAndRemove(request.params.id)
      response.status(204).end()
    } else {
      response.status(401).json({ error: 'A blog can only be deleted by the user who added it.' })
    }
  })
blogsRouter.put('/:id', async (request, response) => {
    const body = request.body
    const newNote = {
      title: body.title,
      url: body.url,
      author: body.author,
      likes: body.likes,
      comments: body.comments
    }
    const updatedNote = await Blog.findByIdAndUpdate(request.params.id, newNote, { new: true }).populate('user', { username: 1, name: 1 })
    response.json(updatedNote)
  })

module.exports = blogsRouter