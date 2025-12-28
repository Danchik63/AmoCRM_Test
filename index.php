<?php
require_once __DIR__ . '/vendor/autoload.php';
use Controllers\FormController;

$method = $_SERVER['REQUEST_METHOD'];

$controller = new FormController();

switch ($method) {
    case 'GET':
        $controller->showForm();
        break;
    case 'POST':
        $controller->SendOrder();
        break;
    default:
        http_response_code(405);
        echo "Метод не найден";
        break;
}


?>