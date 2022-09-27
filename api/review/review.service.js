const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const ObjectId = require('mongodb').ObjectId
const asyncLocalStorage = require('../../services/als.service')

async function query(filterBy = {}) {
    try {
        const criteria = _buildCriteria(filterBy)
        const collection = await dbService.getCollection('review')
    
        let reviews = await collection.aggregate([
            {
                // Filter inside aggregation
                $match: criteria
            },
            {
                // Go fetch
                $lookup:

                {
                    // Specify the field name inside each local item (review)
                    // to search for in the foreign collection (user)
                    localField: 'gigId',
                    
                    // The "foreign" collection name to fetch from
                    from: 'gig',
                    
                    // Specify the field name in the foriegn (user) collection ->
                    // only the matching ones will be inserted to the review.
                    foreignField: '_id',
                    
                    // Specify the field name that will be inserted 
                    // and passing a value of the matching user obj.(AS AN ARRAY)
                    as: 'gig'
                }
            },
            {
                // Flatten array to an object -!!!
                // (done ONLY when WE KNOW there's only one item found to be found)
                $unwind: '$gig'
            },
            {
                $lookup:
                {
                    localField: 'byUserId',
                    from: 'users',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: '$user'
            }
        ]).toArray()
        reviews = reviews.map(review => {
            review.user = { _id: review.user._id, fullname: review.user.fullname }
            review.gig = { _id: review.gig._id, name: review.gig.name, price: review.gig.price }
            review.createdAt = ObjectId(review._id).getTimestamp()
            delete review.byUserId
            delete review.gigId
            return review
        })

        return reviews
    } catch (err) {
        logger.error('cannot find reviews', err)
        throw err
    }

}

async function remove(reviewId) {
    try {
        const store = asyncLocalStorage.getStore()
        const { loggedinUser } = store
        const collection = await dbService.getCollection('review')
        // remove only if user is owner/admin
        const criteria = { _id: ObjectId(reviewId) }
        if (!loggedinUser.isAdmin) criteria.byUserId = ObjectId(loggedinUser._id)
        const { deletedCount } = await collection.deleteOne(criteria)
        return deletedCount
    } catch (err) {
        logger.error(`cannot remove review ${reviewId}`, err)
        throw err
    }
}


async function add(review) {
    try {
        const reviewToAdd = {
            byUserId: ObjectId(review.byUserId),
            gigId: ObjectId(review.gigId),
            txt: review.txt
        }
        const collection = await dbService.getCollection('review')
        await collection.insertOne(reviewToAdd)
        return reviewToAdd
    } catch (err) {
        logger.error('cannot insert review', err)
        throw err
    }
}

function _buildCriteria(filterBy) {
    const criteria = {}
    if (filterBy.byUserId) criteria.byUserId = ObjectId(filterBy.byUserId)
    if (filterBy.gigId) criteria.gigId = ObjectId(filterBy.gigId)
    return criteria
}


module.exports = {
    query,
    remove,
    add
}


