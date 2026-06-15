require('dotenv').config();

const express = require('express');
const axios = require('axios');
const ejs = require('ejs');
const mongoose = require('mongoose');

const app = express();

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error(err);
  }
}

connectDB();

const key_api = "381eeccb156f4925987305da3e595162"

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: false }))

app.get('/', (req, res) => {
    res.render('index')
})

app.post('/search', async(req, res) => {
    const { query } = req.body;
    const response = await axios.get(`https://api.spoonacular.com/recipes/complexSearch?query=${query}&apiKey=${key_api}`)
    const recipes = response.data.results;
    res.render('results', { recipes })
})
app.get('/recipe/:id', async (req, res) => {
    const { id } = req.params;
    const response = await axios.get(`https://api.spoonacular.com/recipes/${id}/information?apiKey=${key_api}`)
    const recipe = response.data;
    res.render('recipe', { recipe })
})

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  // The "Shopping Cart" for meals
  mealPlanner: [{
    recipeId: { type: String, required: true },
    recipeName: String,
    recipeImage: String,
    dayOfWeek: { 
      type: String, 
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true 
    },
    mealType: { type: String, enum: ['breakfast', 'lunch', 'dinner', 'snack'] }
  }]
});