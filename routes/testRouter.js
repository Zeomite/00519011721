const express = require("express");
const passport = require("passport");
require("../passportConfig.js")(passport);
const axios = require("axios")
const User = require("../models/userModel.js")
const { v4: uuidv4 } = require('uuid');
const jwt = require("jsonwebtoken")
const Product = require("../models/productModel")

function generateClientSecret() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

const companies = ['AMZ', 'FLP', 'SNP', 'MYN', 'AZO'];
const categories = ["Phone","Computer","TV","Earphone","Tablet","Charger","Mouse","Keypad","Bluetooth","Pendrive","Remote","Speaker","Headset","Laptop","PC"];
const productCache = {};

const testRouter = express.Router();

testRouter.post("/register", async(req,res)=>{
    const { companyName, ownerName, rollNo, ownerEmail, accessCode } = req.body;
    const existingClient = User.find({companyName:companyName});
    if (existingClient) {
        return res.status(400).json({ error: 'You can register only once and cannot get the credentials again.' });
      }
    const clientID = uuidv4();
    const clientSecret = generateClientSecret();
    await User.create({
        companyName,
        clientID,
        clientSecret,
        ownerName,
        ownerEmail,
        rollNo
      });
      return res.status(200).json({ 
        companyName,
        clientID,
        clientSecret,
        ownerName,
        ownerEmail,
        rollNo
      });

});
testRouter.post("/auth",async(req,res)=>{
    const { companyName, ownerName, rollNo, ownerEmail, clientSecret, clientID } = req.body;
    if(!clientID || !clientSecret){
        return res.status(400).json({ error: 'Please provide clientID and clientSecret.'})
    } 

  try {
    const accessToken= jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
    res.json({ token_type: 'Bearer', access_token: accessToken, expires_in: '1h' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});
    

testRouter.get('/:companyName/categories/:categoryName', async (req, res) => {
    const { companyName, categoryName } = req.params;
    const { top, minPrice, maxPrice, sort } = req.query;
    const { categoryname } = req.params;
    try {
        let query = { company: companyName, category: categoryName };
        if (minPrice && maxPrice) {
          query.price = { $gte: parseInt(minPrice), $lte: parseInt(maxPrice) };
        }
    
        let sortOption = {};
        if (sort) {
          const [field, order] = sort.split(':');
          sortOption[field] = order === 'asc' ? 1 : -1;
        }
    
    let productsQuery = Product.find(query);
    if (sortOption) {
      productsQuery = productsQuery.sort(sortOption);
    }

    let products;
    if (top) {
      const limit = parseInt(top);
      const page = req.query.page || 1;
      const skip = (page - 1) * limit;
      products = await productsQuery.limit(limit).skip(skip);
    } else {
      products = await productsQuery;
    }
      res.json(paginatedProducts);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  });

testRouter.get('/categories/:categoryname/products/:productid', (req, res) => {
    const { productid } = req.params;
    const product = productCache[productid];
  
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: 'Product not found' });
    }
  });
  
  const cleanCache = () => {
    Object.keys(productCache).forEach(key => {
      const { timestamp } = productCache[key];
      if (Date.now() - timestamp > CACHE_EXPIRATION_TIME) {
        delete productCache[key];
      }
    });
  };

  setInterval(cleanCache, process.env.CACHE_EXPIRATION_TIME);
  
  

module.exports = testRouter;
