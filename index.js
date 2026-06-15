require('dotenv').config();



const express = require('express');
const axios = require('axios');
const ejs = require('ejs');
const mongoose = require('mongoose');


const app = express();

app.use(express.json());


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

// app.get('/', (req, res) => {
//     res.render('index')
// })

app.get('/', async (req, res) => {
  try {
    const response = await axios.get(
      `https://api.spoonacular.com/recipes/random?number=6&apiKey=${key_api}`
    );

    const randomRecipes = response.data.recipes;

    res.render('index', { randomRecipes });

  } catch (error) {
    console.error(error);
    res.render('index', { randomRecipes: [] });
  }
});

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



const mealPlannerSchema = new mongoose.Schema({
  recipeId: String,
  recipeName: String,
  recipeImage: String,
  dayOfWeek: {
    type: String,
    enum: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday']
  },
  mealType: String
});

const MealPlanner = mongoose.model('MealPlanner', mealPlannerSchema);


app.post('/api/user/meal-planner', async (req, res) => {
    try {
    const { recipeId, recipeName, recipeImage, dayOfWeek, mealType } = req.body;

    const meal = await MealPlanner.create({
      recipeId,
      recipeName,
      recipeImage,
      dayOfWeek,
      mealType
    });

    res.status(200).json({
      message: "Meal added",
      meal
    });
      
    res.render("planner", { planner: mainPageLayout });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/user/meal-planner/:id', async (req, res) => {
  try {
    const { id } = req.params;

    await MealPlanner.findByIdAndDelete(id);

    res.json({ message: "Meal removed" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

async function removeMeal(mealId) {
  const res = await fetch(`/api/user/meal-planner/${mealId}`, {
    method: "DELETE"
  });

  if (res.ok) {
    alert("Removed!");
    location.reload(); // simple refresh
  } else {
    alert("Error removing meal");
  }
};

app.get('/planner', async (req, res) => {
  try {
    const meals = await MealPlanner.find();

    const planner = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: []
    };

    meals.forEach(meal => {
      if (planner[meal.dayOfWeek]) {
        planner[meal.dayOfWeek].push(meal);
      }
    });

    res.render('planner', { planner });

  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});
 

// app.get('/planner', (req, res) => {
//   console.log('Planner route reached');
//   res.send('Planner route works!');
// });

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

