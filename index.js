const http = require('http')
require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const { notEqual } = require('assert')

const blogSchema = new mongoose.Schema({
  title: String,
  author: String,
  url: String,
  likes: Number
})
blogSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
    }
})
const Blog = mongoose.model('Blog', blogSchema)

const mongoUrl = process.env.MONGODB_URI
console.log(mongoUrl)
mongoose.connect(mongoUrl)


app.use(cors())
app.use(express.json())

app.get('/api/blogs', (request, response) => {
  Blog
    .find({})
    .then(blogs => {
      response.json(blogs)
    })
})

app.get('/api/blogs/:id', (request, response, next) => {
    Blog.findById(request.params.id)
    .then(returnedBlog => response.json(returnedBlog))
    .catch(error => next(error))
})

app.post('/api/blogs', (request, response) => {
  const blog = new Blog(request.body)
  blog
    .save()
    .then(result => {
      response.status(201).json(result)
    })
})
app.delete('/api/blogs/:id', (request, response, next) => {
    Blog.findByIdAndRemove(request.params.id)
    .then(removedObj => response.status(204).end())
    .catch(error => next(error))
})
app.put('/api/blogs/:id', (request, response, next) => {
    Blog.findByIdAndUpdate(request.params.id)
    .then(updatedNote => response.json(updatedNote))
    .catch(error => next(error))
})

const PORT = 3003
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})