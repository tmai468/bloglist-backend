const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
    const allBlogs = await Blog.find({})
    response.json(allBlogs)
  })
  
blogsRouter.get('/:id', async (request, response) => {
    const returnedBlog = await Blog.findById(request.params.id)
    response.json(returnedBlog)
  })
  
blogsRouter.post('/', async (request, response) => {
    const blogToAdd = request.body
    if (!blogToAdd.likes) {
      blogToAdd.likes = 0
    }
    const blog = new Blog(blogToAdd)
    const result = await blog.save()
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