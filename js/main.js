// Variables globales
let currentPage = 1;
let totalPages = 5;
let currentFilter = "nouveautes";
let recipeData = [];
let isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

// Fonction exécutée quand le DOM est chargé
document.addEventListener("DOMContentLoaded", function () {
  // Initialiser l'application
  initApp();

  // Charger les recettes initiales
  loadRecipes();

  // Mettre à jour l'interface en fonction de l'état de connexion
  updateUIBasedOnLoginState();
});

// Initialisation de l'application
function initApp() {
  // Navigation des recettes (tabs)
  const tabButtons = document.querySelectorAll(".tab-btn");
  if (tabButtons.length > 0) {
    tabButtons.forEach((button) => {
      button.addEventListener("click", function () {
        // Changer l'onglet actif
        tabButtons.forEach((btn) => btn.classList.remove("active"));
        this.classList.add("active");

        // Mettre à jour le filtre actuel
        currentFilter = this.getAttribute("data-filter");

        // Recharger les recettes avec le nouveau filtre
        currentPage = 1;
        loadRecipes();
      });
    });
  }

  // Pagination
  const prevButton = document.querySelector(".prev-btn");
  const nextButton = document.querySelector(".next-btn");

  if (prevButton && nextButton) {
    prevButton.addEventListener("click", function () {
      if (currentPage > 1) {
        currentPage--;
        loadRecipes();
        updatePagination();
      }
    });

    nextButton.addEventListener("click", function () {
      if (currentPage < totalPages) {
        currentPage++;
        loadRecipes();
        updatePagination();
      }
    });
  }

  // Boutons de favoris
  document.addEventListener("click", function (e) {
    if (e.target.closest(".favorite-btn")) {
      toggleFavorite(e.target.closest(".favorite-btn"));
    }
  });
}

// Mettre à jour l'UI en fonction de l'état de connexion
function updateUIBasedOnLoginState() {
  const createRecipeBtn = document.getElementById("create-recipe-btn");
  const navProfile = document.getElementById("nav-profile");
  const joinBtn = document.querySelector(".hero-content .btn");

  if (isLoggedIn) {
    if (createRecipeBtn) createRecipeBtn.style.display = "block";
    if (joinBtn) joinBtn.textContent = "Explorer les recettes";
  } else {
    if (createRecipeBtn) createRecipeBtn.style.display = "none";
    if (joinBtn) joinBtn.textContent = "Rejoindre maintenant";
  }
  // Toujours afficher la photo de profil
  if (navProfile) navProfile.style.display = "block";
}

// Charger les recettes depuis une API (simulation)
function loadRecipes() {
  // Simuler un appel API pour obtenir les données
  fetchRecipes(currentFilter, currentPage)
    .then((data) => {
      recipeData = data.recipes;
      totalPages = data.totalPages;

      // Mettre à jour l'affichage
      renderRecipes(recipeData);
      updatePagination();
    })
    .catch((error) => {
      console.error("Erreur lors du chargement des recettes:", error);
    });
}

// Simuler une requête API
function fetchRecipes(filter, page) {
  return new Promise((resolve) => {
    // Simuler un délai de réseau
    setTimeout(() => {
      // Données factices pour la simulation
      const mockData = {
        totalPages: 5,
        recipes: generateMockRecipes(filter, page),
      };
      resolve(mockData);
    }, 300);
  });
}

// Générer des recettes factices pour la démonstration
function generateMockRecipes(filter, page) {
  const mockRecipes = [];
  const recipesPerPage = 6;
  const startIdx = (page - 1) * recipesPerPage;

  // Différents types de recettes selon le filtre
  const categories = {
    nouveautes: [
      "Tarte aux pommes",
      "Risotto aux champignons",
      "Poulet rôti",
      "Salade niçoise",
      "Tiramisu",
      "Crêpes",
    ],
    "mes-recettes": [
      "Couscous",
      "Lasagnes",
      "Ratatouille",
      "Gratin dauphinois",
      "Mousse au chocolat",
      "Quiche lorraine",
    ],
    populaires: [
      "Bœuf bourguignon",
      "Tarte tatin",
      "Croissants",
      "Soupe à l'oignon",
      "Cassoulet",
      "Crème brûlée",
    ],
  };

  const currentCategory = categories[filter] || categories["nouveautes"];

  for (let i = 0; i < recipesPerPage; i++) {
    const idx = (startIdx + i) % currentCategory.length;
    mockRecipes.push({
      id: startIdx + i + 1,
      title: currentCategory[idx],
      description: `Une délicieuse recette de ${currentCategory[
        idx
      ].toLowerCase()} à découvrir absolument.`,
      imageUrl: `https://images.pexels.com/photos/6148189/pexels-photo-6148189.jpeg?auto=compress&cs=tinysrgb&w=600`,
      cookTime: `${Math.floor(Math.random() * 60) + 15} min`,
      difficulty: ["Facile", "Moyen", "Difficile"][
        Math.floor(Math.random() * 3)
      ],
      isFavorite: Math.random() > 0.7,
    });
  }

  return mockRecipes;
}

// Afficher les recettes dans le conteneur
function renderRecipes(recipes) {
  const container = document.getElementById("recipes-container");
  if (!container) return;

  // Vider le conteneur
  container.innerHTML = "";

  if (recipes.length === 0) {
    container.innerHTML = '<p class="no-recipes">Aucune recette trouvée.</p>';
    return;
  }

  // Ajouter chaque recette au conteneur
  recipes.forEach((recipe) => {
    const recipeCard = createRecipeCard(recipe);
    container.appendChild(recipeCard);
  });
}

// Créer un élément de carte de recette
function createRecipeCard(recipe) {
  const card = document.createElement("div");
  card.className = "recipe-card";
  card.dataset.id = recipe.id;

  const heartIcon = recipe.isFavorite ? "fas fa-heart" : "far fa-heart";

  card.innerHTML = `
    <div class="recipe-image">
      <img src="${recipe.imageUrl}" alt="${recipe.title}">
    </div>
    <div class="recipe-content">
      <h3>${recipe.title}</h3>
      <p>${recipe.description}</p>
      <div class="recipe-meta">
        <span><i class="fas fa-clock"></i> ${recipe.cookTime}</span>
        <span><i class="fas fa-signal"></i> ${recipe.difficulty}</span>
      </div>
      <button class="favorite-btn" title="Ajouter aux favoris">
        <i class="${heartIcon}"></i>
      </button>
    </div>
  `;

  // Ajouter un événement de clic sur la carte pour afficher la recette
  card.addEventListener("click", function (e) {
    // Ne pas déclencher si le clic était sur le bouton favoris
    if (!e.target.closest(".favorite-btn")) {
      viewRecipe(recipe.id);
    }
  });

  return card;
}

// Mettre à jour l'affichage de la pagination
function updatePagination() {
  const pageInfo = document.querySelector(".page-info");
  if (pageInfo) {
    pageInfo.textContent = `Page ${currentPage} sur ${totalPages}`;
  }

  const prevBtn = document.querySelector(".prev-btn");
  const nextBtn = document.querySelector(".next-btn");

  if (prevBtn) {
    prevBtn.disabled = currentPage === 1;
    prevBtn.style.opacity = currentPage === 1 ? 0.5 : 1;
  }

  if (nextBtn) {
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.style.opacity = currentPage === totalPages ? 0.5 : 1;
  }
}

// Basculer l'état favori d'une recette
function toggleFavorite(button) {
  // Vérifier si l'utilisateur est connecté
  if (!isLoggedIn) {
    alert("Veuillez vous connecter pour ajouter des recettes à vos favoris.");
    return;
  }

  const icon = button.querySelector("i");
  const isFavorite = icon.classList.contains("fas");

  // Basculer l'icône
  if (isFavorite) {
    icon.classList.replace("fas", "far");
  } else {
    icon.classList.replace("far", "fas");
  }

  // Dans une application réelle, vous enverriez cette modification au serveur
  const recipeCard = button.closest(".recipe-card");
  const recipeId = recipeCard.dataset.id;

  console.log(
    `Recette ${recipeId} ${isFavorite ? "retirée des" : "ajoutée aux"} favoris`
  );
}

// Afficher une recette (redirection vers la page de détail)
function viewRecipe(recipeId) {
  console.log(`Affichage de la recette ${recipeId}`);
}

// Fonction de connexion (simulée)
function login(email, password) {
  console.log(`Tentative de connexion avec ${email}`);

  // Simuler une connexion réussie
  localStorage.setItem("isLoggedIn", "true");
  localStorage.setItem("userEmail", email);
  isLoggedIn = true;

  // Mettre à jour l'interface
  updateUIBasedOnLoginState();

  // Rediriger vers la page d'accueil
  window.location.href = "/index.html";
}

// Fonction de déconnexion
function logout() {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("userEmail");
  isLoggedIn = false;

  // Mettre à jour l'interface
  updateUIBasedOnLoginState();

  // Rediriger vers la page d'accueil
  window.location.href = "/index.html";
}
