const router = require('express').Router();
const modelGenerator = require('../utils/model-generator');

const Cart = require('../models/cart');
const Course = require('../models/course');
const Discount = require('../models/discount');
const User = require('../models/user');

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
    let cart = await Cart.findOne({ _idUser: idUser });
    if (cart) {
      let courses = [];
      for (let item of cart.items) {
        let course = await Course.findById(item["_idCourse"]);
        let lecturer = await User.findById(course._idLecturer);
        let discount = await Discount.findById(item["_idDiscount"]);
        let discountList = await Discount.find({
          _idCourse: item["_idCourse"],
        });

        // Get available discount
        let availableDiscount = null;
        discountList.forEach((element) => {
          if (element.status === "available" && !element.isDelete) {
            availableDiscount = element;
          }
        });

        if (!discount || discount.status === "expired" || discount.isDelete) {
          discount = availableDiscount;
        }

        course = {
          course: { ...course._doc, discountList: discountList, lecturer },
          discount,
        };

        if (course) {
          courses.push(course);
        } else {
          res.json({ error: "Course not found" });
        }
      }

      let result = {
        _id: cart._id,
        _idUser: cart._idUser,
        items: courses,
      };

      res.json(result);
    } else {
      let cart = await modelGenerator.createCart(idUser, []);
      res.json(cart);
    }
  } catch (e) {
    res.status(400).json({ error: e.message });
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

router.post('/add-coupon', async (req, res) => {
  const { idUser, code } = req.body;
  try {
    let cart = await Cart.findOne({_idUser: idUser});
    let isUpdated = false;
    console.log(cart.items);
    if (cart) {
      let courses = [];
      const { items } = cart;
      for (let index in items) {
        const item = items[index];

        let course = await Course.findById(item._idCourse);
        let discount = await Discount.findById(item._idDiscount);
        let discountList = await Discount.find({ _idCourse: item._idCourse });

        // Get available discount
        let availableDiscount = null;
        let newDiscount = null;

        discountList.forEach(element => {
          if (!element.isDelete) {
            if (element.status === "available") {
              availableDiscount = element;
            }
            if (element.code.toLowerCase() === code.toLowerCase() && element.status !== 'expired') {
              newDiscount = element;
            }
          }
        });

        if ((!discount || discount.status === 'expired' || discount.isDelete) && availableDiscount) {
          discount = availableDiscount;
          items[index]._idDiscount = availableDiscount._id;
          isUpdated = true;
        };

        if (newDiscount) {
          discount = newDiscount;
          items[index]._idDiscount = newDiscount._id.toString();
          isUpdated = true;
        }

        course = {
          course: { ...course._doc, discountList: discountList },
          discount,
        }

        if (course) {
          courses.push(course);
        } else {
          res.json({ error: "Course not found" });
        }
      }

      let result = {
        _id: cart._id,
        _idUser: cart._idUser,
        items: courses,
        isUpdated,
      }

      const cartUser = await Cart.findOne({ _idUser: idUser });
      cartUser['items'] = [ ...items ];
      await cartUser.save();

      res.json(result);
    } else {
      let cart = await modelGenerator.createCart(idUser, []);
      res.json(cart);
    }
  } catch (e) {
    console.log(e);
    res.status(400).json({ error: e.message });
  }
});

router.post('/remove-course', async (req, res) => {
  const { idUser, _idCourse } = req.body;
  try {
    let cart = await Cart.findOne({ _idUser: idUser });
    const index = cart.items.findIndex(value => value._idCourse === _idCourse);

    cart.items.splice(index, 1);
    const result = await cart.save();
    res.json(result);
    
  } catch (e) {
    console.log(e);
    res.status(400).json({ error: e.message });
  }
});

router.post('/add-course', async (req, res) => {
  const { idUser, _idCourse } = req.body;
  try {
    let cart = await Cart.findOne({ _idUser: idUser });
    let discounts = await Discount.find({ _idCourse });
    let availableDiscount;
    if (!cart) {
      await modelGenerator.createCart(idUser, []);
      cart = await Cart.findOne({ _idUser: idUser });
    }

    discounts.forEach(element => {
      if (element.status === "available" && !element.isDelete) {
        availableDiscount = element;
      }
    })

    const course = cart.items.find(value => value._idCourse === _idCourse);
    if (course) {
      res.json({ error: 'Your course have been already added '});
    } else {
      cart.items.push({
        _idCourse,
        _idDiscount: availableDiscount && availableDiscount._id
      });
      const result = await cart.save();
      res.json(result);
    }

    
  } catch (e) {
    console.log(e);
    res.status(400).json({ error: e.message });
  }
});


module.exports = router;
