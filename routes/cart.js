const router = require('express').Router();
const modelGenerator = require('../utils/model-generator');

let Cart = require('../models/cart');

// Get Cart
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    let cart = await Cart.findOne({_idUser: id});
    if (cart) {
      res.json(cart);
    } else {
      //Create Cart
      res.json();
    }
    res.json(cart);
  } catch (e) {
    res.status(400).json('Error: ' + e);
  }
});

// Create a Cart
router.post("/create", async (req, res) => {

  try {
   
  } catch(e) {
    res.status(400).json("Error: " + e);
  };
});

// Update Cart
router.post('/update', async (req, res) => {
 
  
});


module.exports = router;
