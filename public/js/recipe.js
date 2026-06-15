async function saveMeal(recipeId, recipeName, recipeImage, button) {
  const card = button.closest(".recipe-card");

  const dayOfWeek = card.querySelector(".daySelect").value;
  const mealType = card.querySelector(".mealType").value;

  const userId = localStorage.getItem("userId");

  const response = await fetch("/api/user/meal-planner", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
    recipeId,
    recipeName,
    recipeImage,
    dayOfWeek,
    mealType
    })
  });

  const data = await response.json();

    if (response.ok) {
    alert("Saved to Meal Planner!");
    window.location.href = "/planner";
    } else {
    alert("Error saving meal");
    }
}