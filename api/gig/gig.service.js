const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const utilService = require('../../services/util.service')
const authService = require('../auth/auth.service')
const ObjectId = require('mongodb').ObjectId

async function query(filterBy) {
    const criteria = _buildCriteria(filterBy)
    try {
        const collection = await dbService.getCollection('gig')
        var gigs = await collection.find(criteria).toArray()
        return gigs
    } catch (err) {
        logger.error('cannot find gigs', err)
        throw err
    }
}

async function queryCategories(filterBy) {
    const criteria = _buildCriteria(filterBy)
    try {
        const collection = await dbService.getCollection('category')
        var categories = await collection.find(criteria).toArray()
        return categories
    } catch (err) {
        logger.error('cannot find categories', err)
        throw err
    }
}

async function getById(gigId) {
    try {
        const collection = await dbService.getCollection('gig')
        const gig = collection.findOne({ _id: ObjectId(gigId) })
        return gig
    } catch (err) {
        logger.error(`while finding gig ${gigId}`, err)
        throw err
    }
}

async function remove(gigId) {
    try {
        const collection = await dbService.getCollection('gig')
        await collection.deleteOne({ _id: ObjectId(gigId) })
        return gigId
    } catch (err) {
        logger.error(`cannot remove gig ${gigId}`, err)
        throw err
    }
}

async function add({ gig, loginToken }) {
    try {
        let newGig = _getEmptyGig()
        gig = { ...newGig, ...gig }
        gig.owner = await _getLoggedinMiniuser(loginToken)
        const collection = await dbService.getCollection('gig')
        const addedGig = await collection.insertOne(gig)
        return addedGig
    } catch (err) {
        logger.error('cannot insert gig', err)
        throw err
    }
}

async function update(gig) {
    try {
        var id = ObjectId(gig._id)
        delete gig._id
        const collection = await dbService.getCollection('gig')
        await collection.updateOne({ _id: id }, { $set: { ...gig } })
        return gig
    } catch (err) {
        logger.error(`cannot update gig ${id}`, err)
        throw err
    }
}

function _buildCriteria(filterBy) {
    const criteria = {}
    const { txt } = filterBy
    if (txt) {
        const regex = new RegExp(txt, 'i')
        criteria.title = { $regex: regex }
    }
    return criteria
}

function _getEmptyGig() {
    return {
        title: 'empty gig title' + (Date.now() % 1000),
        price: utilService.getRandomIntInclusive(10, 1000),
        category: "logo Design",
        daysToMake: 3,
        description: 'empty gig description',
        imgUrls: [{ imgUrl: "https://fiverr-res.cloudinary.com/t_profile_original,q_auto,f_auto/attachments/profile/photo/044fb5914a845a4eb59fc2b69f7f7b32-1634120039750/4dbc2acb-7322-4cd0-9afb-e5190e8e8a0d.jpg" },
        { imgUrl: "https://fiverr-res.cloudinary.com/t_gig_cards_web,q_auto,f_auto/gigs/3171448/original/a41a38f3733bb97279a49d1449f7337dece50693.jpg" }],
        owner: { _id: '', username: '', fullname: '', imgUrl: '', level: '', rate: 0 },
        tags: ['logo-design', 'artisitic', 'proffesional', 'accessible'],
        likedByUsers: []
    }
}

async function _getLoggedinMiniuser(loginToken) {
    try {
        const loggedinUser = await authService.validateToken(loginToken)
        return {
            _id: loggedinUser._id,
            username: loggedinUser.username,
            fullname: loggedinUser.fullname,
            imgUrl: loggedinUser.imgUrl,
            level: loggedinUser.level,
            rate: loggedinUser.rate
        }
    } catch {
        console.log('error from _getLoggedinMiniuser function in gigService')
    }
}

module.exports = {
    remove,
    query,
    getById,
    add,
    update,
    queryCategories,
}