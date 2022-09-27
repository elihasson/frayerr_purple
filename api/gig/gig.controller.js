const gigService = require('./gig.service.js');
const logger = require('../../services/logger.service')

// GET LIST
async function getGigs(req, res) {
  try {
    logger.debug('Getting Gigs')
    var queryParams = req.query
    const gigs = await gigService.query(queryParams)
    res.json(gigs)
  } catch (err) {
    logger.error('Failed to get Gigs', err)
    res.status(500).send({ err: 'Failed to get gigs' })
  }
}

// GET CATEGORIES
async function getCategories(req, res) {
  try {
    logger.debug('Getting categories')
    var queryParams = req.query
    const categories = await gigService.queryCategories(queryParams)
    res.json(categories)
  } catch (err) {
    logger.error('Failed to get categories', err)
    res.status(500).send({ err: 'Failed to get categories' })
  }
}
// async function getCategories(req, res) {
//   try {
//     logger.debug('Getting categories')
//     const categories = await gigService.queryCategories()
//     res.send(categories)
//   } catch (err) {
//     logger.error('Failed to get categories', err)
//     res.status(500).send({ err: 'Failed to get categories' })
//   }
// }

// GET BY ID 
async function getGigById(req, res) {
  try {
    const gigId = req.params.id
    const gig = await gigService.getById(gigId)
    res.json(gig)
  } catch (err) {
    logger.error('Failed to get gig', err)
    res.status(500).send({ err: 'Failed to get gig' })
  }
}

// POST (add gig)
async function addGig(req, res) {
  try {
    const gig = req.body
    const loginToken = req.cookies.loginToken
    const addedGig = await gigService.add({gig ,loginToken })
    res.json(addedGig)
  } catch (err) {
    logger.error('Failed to add gig', err)
    res.status(500).send({ err: 'Failed to add gig' })
  }
}

// PUT (Update gig)
async function updateGig(req, res) {
  try {
    const gig = req.body;
    const updatedGig = await gigService.update(gig)
    res.json(updatedGig)
  } catch (err) {
    logger.error('Failed to update gig', err)
    res.status(500).send({ err: 'Failed to update gig' })

  }
}

// DELETE (Remove gig)
async function removeGig(req, res) {
  try {
    const gigId = req.params.id;
    const removedId = await gigService.remove(gigId)
    res.send(removedId)
  } catch (err) {
    logger.error('Failed to remove gig', err)
    res.status(500).send({ err: 'Failed to remove gig' })
  }
}

module.exports = {
  getGigs,
  getGigById,
  addGig,
  updateGig,
  removeGig,
  getCategories
}
