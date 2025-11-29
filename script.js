// Initialize AOS
AOS.init({ duration: 800 });

// Filter buttons
const catButtons = document.querySelectorAll(".cat-btn");
const resultsGrid = document.getElementById("results");

// Search elements
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");

// Modal elements
const modal = document.getElementById("recipeModal");
const modalTitle = document.getElementById("modalTitle");
const modalContent = document.getElementById("modalContent");

// Categories mapping for TheMealDB API
const categoryMap = {
  "Special": "Miscellaneous",
  "Curries": "Beef",
  "BBQ": "Chicken",
  "Rice": "Seafood",
  "Breads": "Side",
  "Desserts": "Dessert",
  "Snacks": "Starter"
};

// Store fetched dishes
let allDishes = [];

// Fetch random 4 dishes for a category
async function fetchCategory(category) {
  let apiCategory = categoryMap[category] || category;
  const res = await fetch(`https://www.themealdb.com/api/json/v1/1/filter.php?c=${apiCategory}`);
  const data = await res.json();

  if (!data || !data.meals) {
    return [];
  }

  // Return 4 random dishes
  return data.meals.sort(() => 0.5 - Math.random()).slice(0, 4);
}

// Fetch full recipe by id
async function fetchRecipe(id) {
  const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`);
  const data = await res.json();
  return data.meals[0];
}

// Render dishes into grid
function renderDishes(dishes) {
  resultsGrid.innerHTML = "";

  if (dishes.length === 0) {
    resultsGrid.innerHTML = `<p class="no-results">No recipes found.</p>`;
    return;
  }

  dishes.forEach(dish => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.dataset.aos = "fade-up";

    card.innerHTML = `
      <img src="${dish.strMealThumb}" class="thumb" alt="${dish.strMeal}">
      <div class="card-body">
        <h3>${dish.strMeal}</h3>
        <div class="card-actions">
          <button class="btn view">View</button>
          <button class="btn favorite">❤</button>
        </div>
      </div>
    `;


// Favorite button click
const favBtn = card.querySelector(".favorite");
favBtn.addEventListener("click", () => {
  favBtn.classList.toggle("liked");

  if (favBtn.classList.contains("liked")) {
    favBtn.textContent = "💖"; // Liked state
  } else {
    favBtn.textContent = "❤"; // Default state
  }
});

    // View button click
    card.querySelector(".view").addEventListener("click", async () => {
      const fullRecipe = await fetchRecipe(dish.idMeal);
      openModal(fullRecipe.strMeal, `${fullRecipe.strInstructions}`);
    });

    resultsGrid.appendChild(card);
  });

  AOS.refresh();
}

// Initial load: fetch random dishes from all categories
async function loadAll() {
  let dishesArray = [];

  for (let key in categoryMap) {
    const dishes = await fetchCategory(key);
    dishesArray = dishesArray.concat(dishes);
  }

  allDishes = dishesArray;
  renderDishes(allDishes);
}

// Filter functionality
catButtons.forEach(btn => {
  btn.addEventListener("click", async () => {
    catButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    const category = btn.dataset.category;

    if (category === "all") {
      renderDishes(allDishes);
    } else {
      const dishes = await fetchCategory(category);
      renderDishes(dishes);
    }
  });
});

// Search functionality (API-based)
searchBtn.addEventListener("click", async () => {
  const term = searchInput.value.trim();

  if (term === "") {
    renderDishes(allDishes);
    return;
  }

  const res = await fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${term}`);
  const data = await res.json();

  if (!data.meals) {
    renderDishes([]);
  } else {
    renderDishes(data.meals);
  }
});

// Modal functions
function openModal(title, content) {
  modal.classList.remove("hidden");
  modalTitle.textContent = title;
  modalContent.textContent = content;
}

function closeModal() {
  modal.classList.add("hidden");
}

// Load everything on page load
loadAll();
