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

// GET /api/user/meal-planner/:userId
app.get('/api/user/meal-planner/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Structure the data for the main page layout
    const mainPageLayout = {
      Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [], Saturday: [], Sunday: []
    };

    // Sort each item from the "cart" into its respective day bucket
    user.mealPlanner.forEach(item => {
      if (mainPageLayout[item.dayOfWeek]) {
        mainPageLayout[item.dayOfWeek].push(item);
      }
    });

    res.status(200).json(mainPageLayout);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


app.delete('/api/user/meal-planner/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findOneAndUpdate(
      { "mealPlanner._id": id },
      { $pull: { mealPlanner: { _id: id } } },
      { new: true }
    );

    res.json({ message: "Meal removed", planner: user.mealPlanner });

  } catch (error) {
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
}

app.get('/meal-planner/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).send("User not found");
    }

    const mainPageLayout = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: []
    };

    user.mealPlanner.forEach(item => {
      if (mainPageLayout[item.dayOfWeek]) {
        mainPageLayout[item.dayOfWeek].push(item);
      }
    });

    return res.render("planner", { planner: mainPageLayout });

  } catch (err) {
    console.error(err);
    return res.status(500).send(err.message);
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
