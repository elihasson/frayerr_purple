const orderService = require('./order.service.js');
const logger = require('../../services/logger.service')
const { emitToUser } = require('../../services/socket.service')

// GET LIST
async function getOrders(req, res) {
  try {
    logger.debug('Getting Orders')
    var queryParams = req.query
    const orders = await orderService.query(queryParams)
    res.json(orders)
  } catch (err) {
    logger.error('Failed to get Orders', err)
    res.status(500).send({ err: 'Failed to get orders' })
  }
}

// GET BY ID 
async function getOrderById(req, res) {
  try {
    const orderId = req.params.id
    const order = await orderService.getById(orderId)
    res.json(order)
  } catch (err) {
    logger.error('Failed to get order', err)
    res.status(500).send({ err: 'Failed to get order' })
  }
}

// POST (add order)
async function addOrder(req, res) {
  try {
    const order = req.body.order
    const gig = req.body.gig
    const loginToken = req.cookies.loginToken
    const addedOrder = await orderService.add({order, gig, loginToken})
    emitToUser({
      type: 'update-user',
      data:  'incoming-order',
      userId: gig.owner._id
    })
    console.log('gig:', gig);
    res.json(addedOrder)
  } catch (err) {
    logger.error('Failed to add order', err)
    res.status(500).send({ err: 'Failed to add order' })
  }
}

// PUT (Update order)
async function updateOrder(req, res) {
  try {
    const order = req.body;
    const updatedOrder = await orderService.update(order)
    emitToUser({
      type: 'order-updated',
      data:  'update-order',
      userId: updatedOrder.buyer._id
    })
    res.json(updatedOrder)
  } catch (err) {
    logger.error('Failed to update order', err)
    res.status(500).send({ err: 'Failed to update order' })

  }
}

// DELETE (Remove order)
async function removeOrder(req, res) {
  try {
    const orderId = req.params.id;
    const removedOrder = await orderService.getById(orderId)
    const removedId = await orderService.remove(orderId)
    emitToUser({
      type: 'order-updated',
      data:  'update-order',
      userId: removedOrder.buyer._id
    })
    res.send(removedId)
  } catch (err) {
    logger.error('Failed to remove order', err)
    res.status(500).send({ err: 'Failed to remove order' })
  }
}

module.exports = {
  getOrders,
  getOrderById,
  addOrder,
  updateOrder,
  removeOrder
}
