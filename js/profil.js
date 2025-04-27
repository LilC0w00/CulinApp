// Fonction utilitaire pour afficher des notifications
function showNotification(message, type = "success") {
  // Créer l'élément de notification
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  // Ajouter des styles pour la notification si pas déjà dans le CSS
  const style = document.createElement("style");
  style.textContent = `
    .notification {
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 12px 20px;
      border-radius: 5px;
      color: white;
      font-weight: 500;
      z-index: 1000;
      opacity: 0;
      transform: translateY(20px);
      animation: fadeInUp 0.3s forwards, fadeOut 0.5s 2.5s forwards;
    }
    .notification.success {
      background-color: #4CAF50;
    }
    .notification.error {
      background-color: #f44336;
    }
    @keyframes fadeInUp {
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    @keyframes fadeOut {
      to {
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);

  // Supprimer après animation
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

document.addEventListener("DOMContentLoaded", function () {
  // Références aux éléments
  const sidebarLinks = document.querySelectorAll(".sidebar-link");
  const profileSections = document.querySelectorAll(".profile-section");
  const sectionTitle = document.getElementById("section-title");
  const editProfilePicBtn = document.querySelector(".edit-profile-pic");
  const favoriteButtons = document.querySelectorAll(".favorite-btn");
  const editButtons = document.querySelectorAll(".edit-btn");
  const deleteButtons = document.querySelectorAll(".delete-btn");
  const settingsForm = document.querySelector(".settings-form form");
  const searchInputs = document.querySelectorAll(".search-bar input");
  const sortSelects = document.querySelectorAll(".sort-options select");
  const paginationButtons = document.querySelectorAll(".pagination button");

  // Pour responsive: toggle sidebar
  const toggleSidebarButton = document.createElement("button");
  toggleSidebarButton.className = "toggle-sidebar";
  toggleSidebarButton.innerHTML = '<i class="fas fa-bars"></i>';
  document.querySelector(".profile-header").prepend(toggleSidebarButton);

  toggleSidebarButton.addEventListener("click", function () {
    document.querySelector(".sidebar").classList.toggle("active");
  });

  // 1. Navigation entre les sections
  sidebarLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();

      // Si c'est le lien de retour (dans le footer), rediriger sans autre action
      if (this.closest(".sidebar-footer")) {
        window.location.href = this.getAttribute("href");
        return;
      }

      // Activer le lien de navigation
      sidebarLinks.forEach((l) => l.classList.remove("active"));
      this.classList.add("active");

      // Récupérer la section à afficher
      const sectionId = this.getAttribute("data-section");

      // Changer le titre de la section
      sectionTitle.textContent = this.querySelector("span").textContent;

      // Masquer toutes les sections et afficher celle sélectionnée
      profileSections.forEach((section) => section.classList.remove("active"));
      document.getElementById(`${sectionId}-section`).classList.add("active");

      // Fermer le sidebar sur mobile après un clic
      const sidebar = document.querySelector(".sidebar");
      if (sidebar && window.innerWidth <= 576) {
        sidebar.classList.remove("active");
      }
    });
  });

  // 2. Simuler le changement de photo de profil
  if (editProfilePicBtn) {
    editProfilePicBtn.addEventListener("click", function () {
      // Simuler l'ouverture d'un dialogue de fichier
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";

      input.addEventListener("change", function (e) {
        if (this.files && this.files[0]) {
          const reader = new FileReader();

          reader.onload = function (e) {
            // Mettre à jour l'image de profil
            document.querySelector(".profile-image img").src = e.target.result;

            // Feedback pour l'utilisateur
            showNotification("Photo de profil mise à jour avec succès !");
          };

          reader.readAsDataURL(this.files[0]);
        }
      });

      input.click();
    });
  }

  // 3. Gestion des favoris
  favoriteButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      this.classList.toggle("active");

      if (this.classList.contains("active")) {
        this.title = "Retirer des favoris";
        this.querySelector("i").className = "fas fa-heart";
        showNotification("Recette ajoutée aux favoris");
      } else {
        this.title = "Ajouter aux favoris";
        this.querySelector("i").className = "far fa-heart";
        showNotification("Recette retirée des favoris");
      }
    });
  });

  // 4. Gestion des boutons d'édition et de suppression
  editButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const recipeCard = this.closest(".recipe-card");
      const recipeName = recipeCard.querySelector("h3").textContent;

      // Simuler une redirection vers la page d'édition
      showNotification(`Modification de la recette "${recipeName}"`);
      // window.location.href = `/pages/crea-recettes.html?edit=${recipeName}`;
    });
  });

  deleteButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const recipeCard = this.closest(".recipe-card");
      const recipeName = recipeCard.querySelector("h3").textContent;

      // Demander confirmation
      if (
        confirm(
          `Êtes-vous sûr de vouloir supprimer la recette "${recipeName}" ?`
        )
      ) {
        // Effet de suppression
        recipeCard.style.opacity = "0";
        setTimeout(() => {
          recipeCard.style.display = "none";
          showNotification(`La recette "${recipeName}" a été supprimée`);
        }, 300);
      }
    });
  });

  // 5. Soumission du formulaire de paramètres
  if (settingsForm) {
    settingsForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Récupérer les valeurs du formulaire
      const username = document.getElementById("username").value;
      const email = document.getElementById("email").value;
      const bio = document.getElementById("bio").value;

      // Validation simple
      if (!username || !email) {
        showNotification(
          "Veuillez remplir tous les champs obligatoires",
          "error"
        );
        return;
      }

      // Mettre à jour les informations du profil
      document.querySelector(".user-name").textContent = username;
      document.querySelector(".user-bio").textContent = bio;

      showNotification("Vos paramètres ont été mis à jour avec succès !");
    });
  }

  // 6. Fonctionnalité de recherche
  searchInputs.forEach((input) => {
    input.addEventListener("keyup", function (e) {
      const searchTerm = this.value.toLowerCase();
      const section = this.closest(".profile-section");
      const recipeCards = section.querySelectorAll(".recipe-card");

      recipeCards.forEach((card) => {
        const title = card.querySelector("h3").textContent.toLowerCase();
        const description = card.querySelector("p").textContent.toLowerCase();

        if (title.includes(searchTerm) || description.includes(searchTerm)) {
          card.style.display = "block";
        } else {
          card.style.display = "none";
        }
      });
    });
  });

  // 7. Fonctionnalité de tri
  sortSelects.forEach((select) => {
    select.addEventListener("change", function () {
      const sortValue = this.value;
      const section = this.closest(".profile-section");
      const recipesGrid = section.querySelector(".recipes-grid");
      const recipeCards = Array.from(
        recipesGrid.querySelectorAll(".recipe-card")
      );

      // Trier les cartes selon différents critères
      recipeCards.sort((a, b) => {
        const titleA = a.querySelector("h3").textContent;
        const titleB = b.querySelector("h3").textContent;

        switch (sortValue) {
          case "name-asc":
            return titleA.localeCompare(titleB);
          case "name-desc":
            return titleB.localeCompare(titleA);
          case "popular":
            const likesA = parseInt(
              a
                .querySelector(".fa-heart")
                .parentElement.textContent.match(/\d+/)[0]
            );
            const likesB = parseInt(
              b
                .querySelector(".fa-heart")
                .parentElement.textContent.match(/\d+/)[0]
            );
            return likesB - likesA;
          case "recent":
          default:
            // Par défaut, on ne change pas l'ordre (simulation)
            return 0;
        }
      });

      // Réinsérer les cartes dans l'ordre trié
      recipeCards.forEach((card) => {
        recipesGrid.appendChild(card);
      });
    });
  });

  // 8. Simulation de la pagination
  if (paginationButtons.length) {
    paginationButtons.forEach((btn) => {
      btn.addEventListener("click", function () {
        const isNext = this.classList.contains("next-btn");
        const pageInfo = document.querySelector(".page-info");
        const currentPage = parseInt(pageInfo.textContent.match(/\d+/)[0]);
        const totalPages = parseInt(pageInfo.textContent.match(/\d+/g)[1]);

        let newPage = currentPage;

        if (isNext && currentPage < totalPages) {
          newPage = currentPage + 1;
        } else if (!isNext && currentPage > 1) {
          newPage = currentPage - 1;
        }

        if (newPage !== currentPage) {
          pageInfo.textContent = `Page ${newPage} sur ${totalPages}`;
          showNotification(`Page ${newPage} chargée`);
        }
      });
    });
  }

  // 9. Simulation de données dynamiques
  function simulateActivityFeed() {
    const activities = [
      {
        icon: "fas fa-plus-circle",
        text: "Vous avez créé une nouvelle recette",
        recipe: "Pâtes à la carbonara",
        time: "Il y a 5 minutes",
      },
      {
        icon: "fas fa-heart",
        text: "Vous avez aimé la recette",
        recipe: "Poulet curry coco",
        time: "Il y a 15 minutes",
      },
      {
        icon: "fas fa-comment",
        text: "Vous avez commenté la recette",
        recipe: "Tarte au citron meringuée",
        time: "Il y a 30 minutes",
      },
    ];

    // Après 30 secondes, ajouter une nouvelle activité
    setTimeout(() => {
      const activityList = document.querySelector(".activity-list");

      if (activityList) {
        const randomActivity =
          activities[Math.floor(Math.random() * activities.length)];

        const newActivity = document.createElement("div");
        newActivity.className = "activity-item";
        newActivity.innerHTML = `
          <div class="activity-icon">
            <i class="${randomActivity.icon}"></i>
          </div>
          <div class="activity-details">
            <p>${randomActivity.text} <a href="#">"${randomActivity.recipe}"</a></p>
            <span class="activity-time">${randomActivity.time}</span>
          </div>
        `;

        // Insérer au début
        activityList.insertBefore(newActivity, activityList.firstChild);

        // Effet d'apparition
        newActivity.style.opacity = "0";
        setTimeout(() => {
          newActivity.style.opacity = "1";
        }, 10);
      }
    }, 30000);
  }

  // Exécuter la simulation
  simulateActivityFeed();

  // Gestion de la déconnexion
  const logoutLink = document.querySelector(".logout-link");

  logoutLink.addEventListener("click", function (e) {
    e.preventDefault(); // Empêcher la navigation immédiate

    if (confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
      showNotification("Déconnexion en cours...");

      // Appeler un script de déconnexion côté serveur
      fetch("https://localhost/CulinApp/backend/logout.php")
        .then((response) => {
          // Une fois la déconnexion effectuée, rediriger vers la page d'authentification
          setTimeout(() => {
            window.location.href =
              "https://localhost/CulinApp/pages/authentification.php";
          }, 1000);
        })
        .catch((error) => {
          showNotification("Erreur lors de la déconnexion", "error");
        });
    }
  });
});
