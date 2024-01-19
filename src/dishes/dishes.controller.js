const path = require("path");


// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

function create(req, res, next) {
  const { data: { name, description, price, image_url } = {} } = req.body;

  // Validation
  if (!name || name === "") {
    return next({
      status: 400,
      message: "Dish must include a name",
    });
  }

  if (!description || description === "") {
    return next({
      status: 400,
      message: "Dish must include a description",
    });
  }

  if (!price || price <= 0 || !Number.isInteger(price)) {
    return next({
      status: 400,
      message: "Dish must have a price that is an integer greater than 0",
    });
  }

  if (!image_url || image_url === "") {
    return next({
      status: 400,
      message: "Dish must include an image_url",
    });
  }

  const newDish = {
    id: nextId(),
    name,
    description,
    price,
    image_url,
  };

  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

function read(req, res, next) {
  const { dishId } = req.params;
  const dishIndex = dishes.findIndex((o) => o.id === dishId);

  if (dishIndex !== -1) {
    const dish = dishes[dishIndex];
    res.status(200).json({ data: dish });
  } else {
    next({
      status: 404,
      message: `Dish not found: ${dishId}`,
    });
  }
}

function update(req, res, next) {
  const { data: { id, name, description, price, image_url } = {} } = req.body;
  // Validation
  const { dishId } = req.params;
  const dishIndex = dishes.findIndex((d) => d.id === dishId);
  if(dishIndex == -1) {
    next({
      status: 404,
      message: `Dish not found: ${dishId}`,
    });
  }

  if (id && id !== dishId) {
    return next({
      status: 400,
      message: `Dish id does not match route id. Dish: ${id}, Route: ${req.params.dishId}`,
    });
  }

  if (!name || name === "") {
    return next({
      status: 400,
      message: "Dish must include a name",
    });
  }
  

  if (!description || description === "") {
    return next({
      status: 400,
      message: "Dish must include a description",
    });
  }

  if (!price || price <= 0 || !Number.isInteger(price)) {
    return next({
      status: 400,
      message: "Dish must have a price that is an integer greater than 0",
    });
  }

  if (!image_url || image_url === "") {
    return next({
      status: 400,
      message: "Dish must include an image_url",
    });
  }
  
  if (dishIndex !== -1) {
    let dish = dishes[dishIndex];
    dish.name = name;
    dish.description = description;
    dish.price = price;
    dish.image_url = image_url;

    res.json({ data: dish });
  } 
  


}

function list(req, res, next) {
  res.json({ data: dishes });
}

module.exports = {
  create: [create],
  read: [read],
  update: [update],
  list,
};


      
      
      
      
      
      