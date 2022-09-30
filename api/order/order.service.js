const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const authService = require('../auth/auth.service')
const ObjectId = require('mongodb').ObjectId

async function query(filterBy) {
    const criteria = _buildCriteria(filterBy)
    try {
        const collection = await dbService.getCollection('order')
        var orders = await collection.find(criteria).toArray()
        orders = orders.map(order => {
            order.createdAt = order._id.getTimestamp()
            return order
        })
        return orders
    } catch (err) {
        logger.error('cannot find orders', err)
        throw err
    }
}

async function getById(orderId) {
    try {
        const collection = await dbService.getCollection('order')
        const order = collection.findOne({ _id: ObjectId(orderId) })
        return order
    } catch (err) {
        logger.error(`while finding order ${orderId}`, err)
        throw err
    }
}

async function remove(orderId) {
    try {
        const collection = await dbService.getCollection('order')
        await collection.deleteOne({ _id: ObjectId(orderId) })
        return orderId
    } catch (err) {
        logger.error(`cannot remove order ${orderId}`, err)
        throw err
    }
}

async function add({ order, gig, loginToken }) {
    try {
        let addedOrder = await _makeOrder(gig, loginToken)
        const collection = await dbService.getCollection('order')
        addedOrder = await collection.insertOne(addedOrder)
        return addedOrder
    } catch (err) {
        logger.error('cannot insert order', err)
        throw err
    }
}

async function update(order) {
    try {
        var id = ObjectId(order._id)
        delete order._id
        const collection = await dbService.getCollection('order')
        await collection.updateOne({ _id: id }, { $set: { ...order } })
        return order
    } catch (err) {
        logger.error(`cannot update order ${id}`, err)
        throw err
    }
}

function _buildCriteria({ userIdSeller, userIdBuyer, status }) {
    const criteria = {}
    if (userIdSeller) {
        criteria["seller._id"]= userIdSeller
    }
    if (userIdBuyer) {
        criteria["buyer._id"] = userIdBuyer
    }
    if (status) {
        criteria.status = status
    }
    console.log('criteria from orderService line76:',criteria );
    return criteria
}

async function _makeOrder(gig, loginToken) {
    try {
        const loggedinUser = await authService.validateToken(loginToken)
        const order = {
            buyer: {
                _id: loggedinUser._id,
                fullname: loggedinUser.fullname,
                imgUrl: loggedinUser.imgUrl,
                username: loggedinUser.username,
            },
            seller: gig.owner,
            gig: {
                _id: gig._id,
                title: gig.title,
                daysToMake: gig.daysToMake,
                price: gig.price,
                serviceFee: gig.price * 0.05,
                img: gig.imgUrls[0],
            },
            status: 'pending',
        }
        return order
    } catch {
        console.log(' error unable to get loggedinUser - line 105 orderService')
    }
}

module.exports = {
    remove,
    query,
    getById,
    add,
    update,
}