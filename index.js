const express = require('express')
const axios = require ('axios')
const ejs = require('ejs')


const app = express()
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



// app.post('/search', async (req, res) => {
//     const { query } = req.body;

//     try {
//         // Spoonacular request
//         const spoonacularPromise = axios.get(
//             `https://api.spoonacular.com/recipes/complexSearch`,
//             {
//                 params: {
//                     query,
//                     apiKey: key_api
//                 }
//             }
//         );

//         // Edamam request
//         const edamamPromise = axios.get(
//             `https://api.edamam.com/api/recipes/v2`,
//             {
//                 params: {
//                     type: "public",
//                     q: query,
//                     app_id: process.env.EDAMAM_APP_ID,
//                     app_key: process.env.EDAMAM_APP_KEY
//                 }
//             }
//         );

//         // run both at the same time
//         const [spoonRes, edamamRes] = await Promise.all([
//             spoonacularPromise,
//             edamamPromise
//         ]);

//         // normalize Spoonacular
//         const spoonRecipes = spoonRes.data.results.map(r => ({
//             id: r.id,
//             title: r.title,
//             image: r.image,
//             source: "spoonacular"
//         }));

//         // normalize Edamam
//         const edamamRecipes = edamamRes.data.hits.map(h => ({
//             id: h.recipe.uri, // unique string
//             title: h.recipe.label,
//             image: h.recipe.image,
//             source: "edamam",
//             url: h.recipe.url
//         }));

//         // combine results
//         const recipes = [...spoonRecipes, ...edamamRecipes];

//         res.render('results', { recipes });

//     } catch (err) {
//         console.error(err.response?.data || err.message);
//         res.send("Error fetching recipes");
//     }

    
// });