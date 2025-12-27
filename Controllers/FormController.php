<?php
namespace Controllers;

use DTOs\FormDTO;
use Services\FormService;

class FormController {
    private int $idCustomField = 1072303;
    public function showForm() {
        readfile(__DIR__ . '/../views/form.html');
    }
    public function SendOrder() {
        header('Content-Type: application/json; charset=utf-8');
        
        $input = file_get_contents('php://input');
        $formData = new FormDTO(json_decode($input, true));
        $formService = new FormService();
        $contactId = $formService->CreateContact($formData);
        if ($contactId === null) {
            $this->Response(false, 500, 'Ошибка при создании контакта.');
            return;
        }
        $result = $formService->CreateLead($formData, $contactId, $this->idCustomField);
        if ($result === false) {
            $this->Response(false, 500, 'Ошибка при создании сделки.');
            return;
        }
        $this->Response(true, 200, 'Заказ успешно создан.');
    }
    private function Response($success, $status, $message) {
        http_response_code($status);
        echo json_encode([
            'success' => $success,
            'status' => $status,
            'message' => $message
        ]);
    }

}


?>