const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

function create(req, res, next) {
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;

  // Validation
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
      message: "Order must include at least one dish",
    });
  }

  dishes.forEach((dish, index) => {
    if (!dish.quantity || dish.quantity <= 0 || !Number.isInteger(dish.quantity)) {
      return next({
        status: 400,
        message: `Dish ${index} must have a quantity that is an integer greater than 0`,
      });
    }
  });

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

function read(req, res, next) {
  const { orderId } = req.params;
  const orderIndex = orders.findIndex((o) => o.id === orderId);

  if (orderIndex !== -1) {
    const order = orders[orderIndex];
    res.status(200).json({ data: order });
  } else {
    next({
      status: 404,
      message: `Order not found: ${orderId}`,
    });
  }
}


function update(req, res, next) {
  const { orderId } = req.params;
  const { data: { id, deliverTo, mobileNumber, status, dishes } = {} } = req.body;
  let isIncorrectQuantity = false
  // Check if the order with the specified ID exists
  const existingOrder = orders.find((order) => order.id === orderId);
  if (!existingOrder) {
    return next({
      status: 404,
      message: `Order with ID ${orderId} not found`,
    });
  }

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
  create,
  read,
  update,
  remove,
  list,
};
