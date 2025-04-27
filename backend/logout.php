<?php
session_start();
// Détruire toutes les variables de session
$_SESSION = array();

// Détruire la session
session_destroy();

// Répondre avec un statut de succès
echo json_encode(["status" => "success"]);
