const router = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')

router.post('/reset', async (request, response) => {
    // reset db (deletes all users and blogs in DB)
    await Blog.deleteMany({})
    await User.deleteMany({})

    response.status(204).end()
})

module.exports = router