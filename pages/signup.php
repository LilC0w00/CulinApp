<?php
// Activer l'affichage des erreurs pour le débogage
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Démarrer la session
session_start();

// Vérifier si l'utilisateur est déjà connecté
if (isset($_SESSION["loggedin"]) && $_SESSION["loggedin"] === true) {
  header("location: index.html");
  exit;
}

// Initialiser les variables
$username = $email = $password = $confirm_password = "";
$username_err = $email_err = $password_err = $confirm_password_err = "";

// Traitement du formulaire lors de la soumission
if ($_SERVER["REQUEST_METHOD"] == "POST") {

  // Validation du nom d'utilisateur
  if (empty(trim($_POST["username"]))) {
    $username_err = "Veuillez entrer un nom d'utilisateur.";
  } else {
    $username = trim($_POST["username"]);
  }

  // Validation de l'email
  if (empty(trim($_POST["email"]))) {
    $email_err = "Veuillez entrer un email.";
  } else {
    $email = trim($_POST["email"]);

    // Vérifier si l'email est valide
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
      $email_err = "Format d'email invalide.";
    } else {
      // Configuration de la connexion à la base de données
      $servername = "localhost";
      $username_db = "root";  // À remplacer par votre nom d'utilisateur MySQL
      $password_db = "";      // À remplacer par votre mot de passe MySQL
      $dbname = "culinapp";   // À remplacer par le nom de votre base de données

      // Créer la connexion
      $conn = new mysqli($servername, $username_db, $password_db, $dbname);

      // Vérifier la connexion
      if ($conn->connect_error) {
        die("La connexion a échoué: " . $conn->connect_error);
      }

      // Préparer la requête SQL pour vérifier si l'email existe déjà
      $sql = "SELECT id FROM user WHERE email = ?";

      if ($stmt = $conn->prepare($sql)) {
        // Lier les paramètres
        $stmt->bind_param("s", $param_email);

        // Définir les paramètres
        $param_email = $email;

        // Exécuter la requête
        if ($stmt->execute()) {
          // Stocker le résultat
          $stmt->store_result();

          if ($stmt->num_rows > 0) {
            $email_err = "Cet email est déjà utilisé.";
          }
        } else {
          echo "Oups! Quelque chose s'est mal passé. Veuillez réessayer plus tard.";
        }

        // Fermer le statement
        $stmt->close();
      }
    }
  }

  // Validation du mot de passe
  if (empty(trim($_POST["password"]))) {
    $password_err = "Veuillez entrer un mot de passe.";
  } elseif (strlen(trim($_POST["password"])) < 6) {
    $password_err = "Le mot de passe doit comporter au moins 6 caractères.";
  } else {
    $password = trim($_POST["password"]);
  }

  // Validation de la confirmation du mot de passe
  if (empty(trim($_POST["confirm_password"]))) {
    $confirm_password_err = "Veuillez confirmer votre mot de passe.";
  } else {
    $confirm_password = trim($_POST["confirm_password"]);
    if (empty($password_err) && ($password != $confirm_password)) {
      $confirm_password_err = "Les mots de passe ne correspondent pas.";
    }
  }

  // Vérifier les erreurs avant d'insérer dans la base de données
  if (empty($username_err) && empty($email_err) && empty($password_err) && empty($confirm_password_err)) {

    // Configuration de la connexion à la base de données si elle n'existe pas déjà
    if (!isset($conn)) {
      $servername = "localhost";
      $username_db = "root";  // CORRECTION : Ajout du nom d'utilisateur manquant
      $password_db = "";      // À remplacer par votre mot de passe MySQL
      $dbname = "culinapp";   // À remplacer par le nom de votre base de données

      // Créer la connexion
      $conn = new mysqli($servername, $username_db, $password_db, $dbname);

      // Vérifier la connexion
      if ($conn->connect_error) {
        die("La connexion a échoué: " . $conn->connect_error);
      }
    }

    // CORRECTION : Adapter la requête à la structure de votre table
    // Vérifier si la colonne created_at existe dans la table
    $check_column = $conn->query("SHOW COLUMNS FROM user LIKE 'created_at'");

    if ($check_column->num_rows > 0) {
      // La colonne created_at existe, utiliser la requête originale
      $sql = "INSERT INTO user (email, password, created_at) VALUES (?, ?, NOW())";

      if ($stmt = $conn->prepare($sql)) {
        // CORRECTION : Utiliser le bon nombre de paramètres
        $stmt->bind_param("ss", $param_email, $param_password);

        // Définir les paramètres
        $param_email = $email;
        $param_password = password_hash($password, PASSWORD_DEFAULT); // Créer un hash du mot de passe

        // Exécuter la requête
        if ($stmt->execute()) {
          // Rediriger vers la page de connexion avec un message de succès
          header("location: login.php?registered=success");
          exit();
        } else {
          echo "Erreur d'insertion: " . $stmt->error;
        }

        // Fermer le statement
        $stmt->close();
      }
    } else {
      // La colonne created_at n'existe pas, utiliser une requête simplifiée
      $sql = "INSERT INTO user (email, password) VALUES (?, ?)";

      if ($stmt = $conn->prepare($sql)) {
        $stmt->bind_param("ss", $param_email, $param_password);

        $param_email = $email;
        $param_password = password_hash($password, PASSWORD_DEFAULT);

        if ($stmt->execute()) {
          header("location: login.php?registered=success");
          exit();
        } else {
          echo "Erreur d'insertion: " . $stmt->error;
        }

        $stmt->close();
      }
    }

    // Fermer la connexion
    $conn->close();
  }
}
?>

<!DOCTYPE html>
<html lang="fr">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Inscription - CulinApp</title>

  <!-- GOOGLE FONTS -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">

  <!-- FONT AWESOME -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">

  <!-- CSS - CORRECTION : Chemins CSS corrigés -->
  <link rel="stylesheet" href="../css/style.css">
  <link rel="stylesheet" href="../css/auth.css">

  <style>
    .error-message {
      color: #dc3545;
      font-size: 14px;
      margin-top: 5px;
    }

    .password-requirements {
      font-size: 12px;
      color: #6c757d;
      margin-top: 5px;
    }
  </style>
</head>

<body class="auth-body">
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h2>Inscription</h2>
        <div class="logo">CulinApp</div>
      </div>

      <form id="signup-form" class="auth-form" action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>" method="post">
        <div class="form-group">
          <label for="username">Nom d'utilisateur</label>
          <input type="text" id="username" name="username" value="<?php echo $username; ?>" required>
          <?php if (!empty($username_err)) {
            echo '<span class="error-message">' . $username_err . '</span>';
          } ?>
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" name="email" value="<?php echo $email; ?>" required>
          <?php if (!empty($email_err)) {
            echo '<span class="error-message">' . $email_err . '</span>';
          } ?>
        </div>

        <div class="form-group">
          <label for="password">Mot de passe</label>
          <input type="password" id="password" name="password" required>
          <?php if (!empty($password_err)) {
            echo '<span class="error-message">' . $password_err . '</span>';
          } ?>
          <div class="password-requirements">Le mot de passe doit comporter au moins 6 caractères.</div>
        </div>

        <div class="form-group">
          <label for="confirm_password">Confirmer le mot de passe</label>
          <input type="password" id="confirm_password" name="confirm_password" required>
          <?php if (!empty($confirm_password_err)) {
            echo '<span class="error-message">' . $confirm_password_err . '</span>';
          } ?>
        </div>

        <button type="submit" class="btn btn-primary btn-block">S'inscrire</button>

        <div class="auth-divider">
          <span>ou</span>
        </div>

        <div class="social-login">
          <button type="button" class="btn btn-google" onclick="window.location.href='google-auth.php'">
            <i class="fab fa-google"></i> Continuer avec Google
          </button>
        </div>
      </form>

      <div class="auth-footer">
        <p>Déjà inscrit ? <a href="https://localhost/culinapp/pages/authentification.php">Se connecter</a></p>
      </div>
    </div>
  </div>

  <script>
    // Script pour la validation côté client
    document.getElementById('signup-form').addEventListener('submit', function(event) {
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirm_password').value;

      if (password.length < 6) {
        alert('Le mot de passe doit comporter au moins 6 caractères.');
        event.preventDefault();
      } else if (password !== confirmPassword) {
        alert('Les mots de passe ne correspondent pas.');
        event.preventDefault();
      }
    });
  </script>
</body>

</html>