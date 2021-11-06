const mongoose = require('mongoose')
const helper = require('./test_helper')
const app = require('../app')
const Blog = require('../models/blog')
const supertest = require('supertest')


const api = supertest(app)


beforeEach(async () => {
    await Blog.deleteMany({})
    console.log('cleared')

    for (let eachBlog of helper.initialBlogs) {
        let blogToAdd = new Blog(eachBlog)
        await blogToAdd.save()
    }
}, 700000)

test('blogs returned are in json format', () => {
    api.get('/api/blogs')
    .expect(200)
    .expect('Content-Type', /application\/json/)
})

test('return correct number of blogs', async () => {
    const allBlogsInDb = await helper.blogsInDb()
    const response = await api.get('/api/blogs')
    expect(response.body).toHaveLength(allBlogsInDb.length)
})

test('unique identifier of blog posts is named id, not _id', async () => {
    const blogsInDB = await helper.blogsInDb()
    expect(blogsInDB[0].id).toBeDefined()
    expect(blogsInDB[0]._id).not.toBeDefined()
})

test('able to create a new valid blog', async() => {
    const allBlogsBefore = await helper.blogsInDb()
    // console.log('before')
    // console.log(allBlogsBefore)
    const newBlog = {
        title: 'testing adding blog',
        author: 'Tracey Mai',
        url: 'www.facebook.com',
        likes: 0
    }
    await api.post('/api/blogs')
    .send(newBlog)
    .expect(201)
    .expect('Content-Type', /application\/json/)

    const allBlogsInDb = await helper.blogsInDb()
    // console.log(allBlogsInDb)
    const allTitlesInDb = allBlogsInDb.map(eachBlog => eachBlog.title)
    expect(allBlogsInDb).toHaveLength(allBlogsBefore.length + 1)
    expect(allTitlesInDb).toContain('testing adding blog')
})

test('if likes property is missing in the request, it will default to 0', async () => {
    const newNoteMissing = {
        title: 'testing adding blog',
        author: 'Tracey Mai',
        url: 'www.facebook.com',
    }
    const response = await api.post('/api/blogs')
    .send(newNoteMissing)
    .expect(201)
    .expect('Content-Type', /application\/json/)

    expect(response.body.likes).toBe(0)
}) 

test('if title or url is missing, response status code is 400', async () => {
    const newNoteMissTitleUrl = {
        author: 'Tracey Mai',
        likes: 3
    }

    await api.post('/api/blogs')
    .send(newNoteMissTitleUrl)
    .expect(400)
})

test('removing a valid blog from database', async () => {
    const allBlogsInDb = await helper.blogsInDb()
    const blogToDelete = allBlogsInDb[0]

    await api
    .delete(`/api/blogs/${blogToDelete.id}`)
    .expect(204)

    const allBlogsInDbAfterDel = await helper.blogsInDb()
    expect(allBlogsInDbAfterDel).toHaveLength(allBlogsInDb.length - 1)

    const titles = allBlogsInDbAfterDel.map(blog => blog.title)
    expect(titles).not.toContain(blogToDelete.title)
})

test('updating a valid blog post', async () => {
    const allBlogsInDbStart = await helper.blogsInDb()
    const blogToUpdate = allBlogsInDbStart[0]
    const validIdToUpdate = blogToUpdate.id

    console.log(validIdToUpdate)
    const newBlog = {
        title: 'React patterns',
        author: 'Michael Chan',
        url: "http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Consider...",
        likes: 10
    }
    const updatedBlog = await api.put(`/api/blogs/${validIdToUpdate}`).send(newBlog).expect(200).expect('Content-Type', /application\/json/)
    const allBlogsInDbAfterUpdate = await helper.blogsInDb()
    expect(allBlogsInDbAfterUpdate).toHaveLength(allBlogsInDbStart.length)
    expect(updatedBlog.body.id).toBe(validIdToUpdate)
    expect(updatedBlog.body.likes).not.toBe(blogToUpdate.likes)

    const allTitles = allBlogsInDbAfterUpdate.map(b => b.title)
    expect(allTitles).toContain(blogToUpdate.title)

})

describe('user creation', () => {
    test('username must be given', async () => {
        const allUsersInDbStart = await helper.usersInDb()
        const invalidUser = {
            name: "Whatever",
            password: "cho"
        }
        try {
            await api
            .post('/api/users')
            .send(invalidUser)
            .expect(400)
        } catch (error) {
            expect(error).toEqual({
                error: "User validation failed: username: Path `username` is required."
            })
        }
        const allUsersInDbEnd = await helper.usersInDb()
        expect(allUsersInDbEnd).toHaveLength(allUsersInDbStart.length)
    }
    )
    test('password must be given', async () => {
        const allUsersInDbStart = await helper.usersInDb()
        const invalidUser = {
            username: "thiscanbe",
            name: "Whatever"
        }
        try {
            await api
            .post('/api/users')
            .send(invalidUser)
            .expect(400)
        } catch (error) {
            expect(error).toEqual({
                error: 'Both username and password must be specified'
            })
        }
        const allUsersInDbEnd = await helper.usersInDb()
        expect(allUsersInDbEnd).toHaveLength(allUsersInDbStart.length)  
    }
    )

    test('username must be at least 3 characters long', async () => {
        const allUsersInDbStart = await helper.usersInDb()
        const invalidUser = {
            username: "th",
            name: "Whatever",
            password: "aoshioahsdo"
        }
        await api
            .post('/api/users')
            .send(invalidUser)
            .expect(400)
        const allUsersInDbEnd = await helper.usersInDb()
        expect(allUsersInDbEnd).toHaveLength(allUsersInDbStart.length)  
    })
    test('password must be at least 3 characters long', async () => {
        const allUsersInDbStart = await helper.usersInDb()
        const invalidUser = {
            username: "thea",
            name: "Whatever",
            password: "ao"
        }
        await api
            .post('/api/users')
            .send(invalidUser)
            .expect(400)
        const allUsersInDbEnd = await helper.usersInDb()
        expect(allUsersInDbEnd).toHaveLength(allUsersInDbStart.length)  
    })

    test('username must be unique', async () => {
        const allUsersInDbStart = await helper.usersInDb()
        const invalidUserLast = {
            username: "klee864",
            name: "Whatever",
            password: "aoas"
        }
        await api
            .post('/api/users')
            .send(invalidUserLast)
            .expect(400)
        const allUsersInDbEnd = await helper.usersInDb()
        expect(allUsersInDbEnd).toHaveLength(allUsersInDbStart.length)  
    })
})


afterAll(() => {
    mongoose.connection.close()
})