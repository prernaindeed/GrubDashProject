const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass


function validateOrderInput(req, res, next){
  const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;
  
  if (!deliverTo || deliverTo === "") {
    return next({
      status: 400,
      message: "Order must include a deliverTo",
    });
  }

  if (!mobileNumber || mobileNumber === "") {
    return next({
      status: 400,
      message: "Order must include a mobileNumber",
    });
  }
  
  if (!Array.isArray(dishes) || dishes.length === 0) {
    return next({
      status: 400,
      message: "Order must have greater than 0 dishes",
    });
  }
  else {
    dishes.forEach( (dish, index) => {
      if (!dish.quantity || dish.quantity <= 0 || !Number.isInteger(dish.quantity)) {
        isIncorrectQuantity = true
        next({
          status: 400,
          message: `Dish at ${index} must have a quantity that is an integer greater than 0 ${dish.quantity}`
        });
      }
    });
  }
  next()
}


function create(req, res, next) {
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;

  const newOrder = {
    id: nextId(),
    deliverTo,
    mobileNumber,
    status,
    dishes,
  };

  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

function orderExists(req, res, next){
  const { orderId } = req.params;
  const orderIndex = orders.findIndex((o) => o.id === orderId);

  if (orderIndex === -1) {
    next({
      status: 404,
      message: `Order not found: ${orderId}`,
    });
  }
  
  const order = orders[orderIndex];
  res.locals.data = order
  next()
}

function read(req, res, next) {
  res.send(res.locals)
}

function update(req, res, next) {
  const { orderId } = req.params;
  const { data: { id, deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  let isIncorrectQuantity = false
  const existingOrder = res.locals.data
  
  if (id && id !== orderId) {
    return next({
      status: 400,
      message: `Order id does not match route id. Order: ${id}, Route: ${req.params.orderId}`,
    });
  }
  // Validation logic...
  if (!status || status !== existingOrder.status) {
    return next({
      status: 400,
      message: "Order status cannot be changed",
    });
  }
  
  if (existingOrder && !isIncorrectQuantity) {
    // Update the existing order
    existingOrder.deliverTo = deliverTo;
    existingOrder.mobileNumber = mobileNumber;
    existingOrder.status = status;
    existingOrder.dishes = dishes;

    // Send the updated order in the response
    res.json({ data: existingOrder });
  }
  
}

function remove(req, res, next) {
  const { orderId } = req.params;
  const orderIndex = orders.findIndex((o) => o.id === orderId);

  if (orderIndex !== -1) {
    const order = orders[orderIndex];

    // Validation: Check if the order status is 'pending' before allowing deletion
    if (order.status !== "pending") {
      return next({
        status: 400,
        message: "An order cannot be deleted unless it is pending.",
      });
    }

    orders.splice(orderIndex, 1);
    res.sendStatus(204);
  } else {
    next({
      status: 404,
      message: `Order not found: ${orderId}`,
    });
  }
}

function list(req, res, next) {
  res.json({ data: orders });
}

module.exports = {
  create: [validateOrderInput, create],
  read: [orderExists, read],
  update: [orderExists, validateOrderInput, update],
  remove,
  list,
};
