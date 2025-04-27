<?php
// Démarrer la session
session_start();

// Initialiser les variables
$email = $password = "";
$email_err = $password_err = $login_err = "";

// Vérifier si l'utilisateur est déjà connecté
if (isset($_SESSION["loggedin"]) && $_SESSION["loggedin"] === true) {
  header("location: /../Culinapp/index.html");
  exit;
}

// Traitement du formulaire lors de la soumission
if ($_SERVER["REQUEST_METHOD"] == "POST") {

  // Validation de l'email
  if (empty(trim($_POST["email"]))) {
    $email_err = "Veuillez entrer votre email.";
  } else {
    $email = trim($_POST["email"]);
    // Vérifier si l'email est valide
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
      $email_err = "Format d'email invalide.";
    }
  }

  // Validation du mot de passe
  if (empty(trim($_POST["password"]))) {
    $password_err = "Veuillez entrer votre mot de passe.";
  } else {
    $password = trim($_POST["password"]);
  }

  // Vérifier les erreurs avant de continuer
  if (empty($email_err) && empty($password_err)) {
    // Configuration de la connexion à la base de données
    $servername = "localhost";
    $username = "root";  // À remplacer par votre nom d'utilisateur MySQL
    $password_db = "";   // À remplacer par votre mot de passe MySQL
    $dbname = "culinapp"; // À remplacer par le nom de votre base de données

    // Créer la connexion
    $conn = new mysqli($servername, $username, $password_db, $dbname);

    // Vérifier la connexion
    if ($conn->connect_error) {
      die("La connexion a échoué: " . $conn->connect_error);
    }

    // Préparer la requête SQL
    $sql = "SELECT id, email, password FROM user WHERE email = ?";

    if ($stmt = $conn->prepare($sql)) {
      // Lier les paramètres
      $stmt->bind_param("s", $param_email);

      // Définir les paramètres
      $param_email = $email;

      // Exécuter la requête
      if ($stmt->execute()) {
        // Stocker le résultat
        $stmt->store_result();

        // Vérifier si l'email existe
        if ($stmt->num_rows == 1) {
          // Lier les résultats
          $stmt->bind_result($id, $email, $hashed_password);
          if ($stmt->fetch()) {
            // Vérifier le mot de passe
            if (password_verify($password, $hashed_password)) {
              // Le mot de passe est correct, démarrer une nouvelle session
              session_start();

              // Stocker les données dans les variables de session
              $_SESSION["loggedin"] = true;
              $_SESSION["id"] = $id;
              $_SESSION["email"] = $email;

              // Rediriger vers la page d'accueil
              header("location: profil.html");
            } else {
              // Le mot de passe n'est pas valide
              $login_err = "Email ou mot de passe incorrect.";
            }
          }
        } else {
          // L'email n'existe pas
          $login_err = "Email ou mot de passe incorrect.";
        }
      } else {
        echo "Oups! Quelque chose s'est mal passé. Veuillez réessayer plus tard.";
      }

      // Fermer le statement
      $stmt->close();
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
  <title>Connexion - CulinApp</title>

  <!-- GOOGLE FONTS -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">

  <!-- FONT AWESOME -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">

  <!-- CSS -->
  <link rel="stylesheet" href="/../CulinApp/css/auth.css">
  <link rel="stylesheet" href="/../CulinApp/css/style.css">

  <style>
    .error-message {
      color: #dc3545;
      font-size: 14px;
      margin-top: 5px;
    }

    .success-message {
      color: #28a745;
      font-size: 14px;
      margin-bottom: 15px;
      padding: 10px;
      background-color: rgba(40, 167, 69, 0.1);
      border-radius: 5px;
    }
  </style>
</head>

<body class="auth-body">
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h2>Connexion</h2>
        <div class="logo">CulinApp</div>
      </div>

      <?php
      if (!empty($login_err)) {
        echo '<div class="error-message">' . $login_err . '</div>';
      }
      if (isset($_GET["registered"]) && $_GET["registered"] == "success") {
        echo '<div class="success-message">Inscription réussie ! Vous pouvez maintenant vous connecter.</div>';
      }
      if (isset($_GET["reset"]) && $_GET["reset"] == "success") {
        echo '<div class="success-message">Votre mot de passe a été réinitialisé avec succès.</div>';
      }
      ?>

      <form id="login-form" class="auth-form" action="<?php echo htmlspecialchars($_SERVER["PHP_SELF"]); ?>" method="post">
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
          <a href="reset-password.php" class="forgot-password">Mot de passe oublié ?</a>
        </div>

        <button type="submit" class="btn btn-primary btn-block">Se connecter</button>

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
        <p>Pas encore de compte ? <a href="https://localhost/culinapp/pages/signup.php">S'inscrire</a></p>
      </div>
    </div>
  </div>
</body>

</html>