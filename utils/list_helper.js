const _ = require('lodash')
const dummy = (blogs) => {
    return 1
}
const totalLikes = (blogs) => {
    const reducer = (sum, eachBlog) => {
        return sum + eachBlog.likes
    }
    return blogs.reduce(reducer, 0)
}

const favoriteBlog = (blogs) => {
    const blogWithMaxLikes = blogs.reduce((acc, blog) => {
        return (acc.likes > blog.likes) ? acc : blog
    })
    const {title, author, likes, ...rest} = blogWithMaxLikes
    const subset = {title, author, likes}
    return subset
}

const mostBlogs = (blogs) => {
    // extract list of all authors:
    const listAuthors = blogs.map(blog => blog.author)
    const lodashRes = _.countBy(listAuthors)
    const mostBlogAuthorStr = Object.keys(lodashRes).reduce((a,b) => lodashRes[a] > lodashRes[b] ? a : b)
    const returnedObj = {
        author: mostBlogAuthorStr,
        blogs: lodashRes[mostBlogAuthorStr]
    }
    return returnedObj
}

const mostLikes = (blogs) => {
    const lodashRes = _(blogs).groupBy('author').map((author, id) => ({
        author: id,
        totalLikes: _.sumBy(author, 'likes')
    })).value()
    const maxLikedAuthor = _.maxBy(lodashRes, 'totalLikes')
    return {
        author: maxLikedAuthor.author,
        likes: maxLikedAuthor.totalLikes
    }
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}