const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', (request, response) => {
    Blog
      .find({})
      .then(blogs => {
        response.json(blogs)
      })
  })
  
blogsRouter.get('/:id', (request, response, next) => {
      Blog.findById(request.params.id)
      .then(returnedBlog => response.json(returnedBlog))
      .catch(error => next(error))
  })
  
blogsRouter.post('/', (request, response) => {
    const blog = new Blog(request.body)
    blog
      .save()
      .then(result => {
        response.status(201).json(result)
      })
  })
blogsRouter.delete('/:id', (request, response, next) => {
      Blog.findByIdAndRemove(request.params.id)
      .then(removedObj => response.status(204).end())
      .catch(error => next(error))
  })
blogsRouter.put('/:id', (request, response, next) => {
      Blog.findByIdAndUpdate(request.params.id)
      .then(updatedNote => response.json(updatedNote))
      .catch(error => next(error))
  })

module.exports = blogsRouter