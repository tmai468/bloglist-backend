const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
    const users = await User.find({}).populate('blogs', { url: 1, title: 1, author: 1})
    response.json(users)
})

usersRouter.post('/', async (request, response) => {
    const body = request.body

    const saltRounds = 10
    if (!body.password) {
        return response.status(400).json({ error: 'Both username and password must be specified' })
    }
    if (body.password.length < 3) {
        return response.status(400).json({ error: 'Password must be at least 3 characters long.' })
    }
    const passwordHash = await bcrypt.hash(body.password, saltRounds)

    const newUser = new User({
        username: body.username,
        name: body.name,
        passwordHash
    })

    const savedUser = await newUser.save()
    response.json(savedUser)
})

module.exports = usersRouter