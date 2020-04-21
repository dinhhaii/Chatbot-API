const router = require('express').Router();
const modelGenerator = require('../utils/model-generator');

const Cart = require('../models/cart');
const Course = require('../models/course');
const Discount = require('../models/discount');

// Get All Cart
router.get('/', async (req, res) => {
  try {
    let list = await Cart.find();
    if (list) {
      res.json(list);
    }
    else {
      res.json(null);
    }
  } catch(e) {
    res.status(400).json('Error: ' + e);
  }
})

// Get Cart
router.get('/:idUser', async (req, res) => {

  const { idUser } = req.params;

  try {
    let cart = await Cart.findOne({_idUser: idUser});

    if (cart) {

      let courses = [];
      for (let item of cart.items) {
        let course = await Course.findById(item['_idCourse']);
        let discount = await Discount.findById(item['_idDiscount']);
        let discountList = await Discount.find({ _idCourse: item['_idCourse']});

        course = {
          course: { ...course._doc, discountList: discountList},
          discount,
        }

        if (course) {
          courses.push(course);
        }
      }

      let result = {
        _id: cart._id,
        _idUser: cart._idUser,
        items: courses
      }

      res.json(result);
    } else {
        let cart = await modelGenerator.createCart(idUser, []);
        res.json(cart);
    }
  } catch (e) {
    res.status(400).json('Error: ' + e);
  }
});

// Create a Cart
router.post("/create", async (req, res) => {
  let { _idUser, items } = req.body;

  try {
    let cart = await modelGenerator.createCart(
      _idUser,
      items
    );
    res.json(cart);
  } catch (e) {
    res.status(400).json('Error: ' + e);
  };
});

// Update Cart
router.post('/update', async (req, res) => {
  const cart = await Cart.findOne({ _id: req.body._idCart });

  if (cart)
  {
    for (let key in req.body)
    {
      cart[key] = req.body[key];
    }
    cart
      .save()
      .then(result => res.json(result))
      .catch (err => console.log(err));
  } else {
    res.json(null);
  }
});


module.exports = router;
