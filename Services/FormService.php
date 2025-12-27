<?php
namespace Services;
use DTOs\FormDTO;
use Exception;

class FormService {
    private string $accessToken;
    private string $subdomain;
    public function __construct() {
        $this->loadEnv();
        $this->accessToken = getenv('AMOCRM_ACCESSTOKEN');
        $this->subdomain = getenv('AMOCRM_SUBDOMAIN');
    }
    private function loadEnv()
    {
        $envFile = __DIR__ . '/../.env';
        
        if (!file_exists($envFile)) {
            throw new Exception('Файл .env не существует!');
        }
        
        $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            if (strpos(trim($line), '#') === 0) {
                continue;
            }
            
            if (strpos($line, '=') !== false) {
                list($name, $value) = explode('=', $line, 2);
                $name = trim($name);
                $value = trim($value);
                
                if (!getenv($name)) {
                    putenv("$name=$value");
                }
            }
        }
    }
    public function CreateContact(FormDTO $formData): int|null {
        $data = [
            [
                'name' => $formData->UserName,
                'custom_fields_values' => [
                    [
                        'field_code' => 'EMAIL',
                        'values' => [
                            [
                                'value' => $formData->Email,
                                'enum_code' => 'WORK'
                            ]
                        ]
                    ],
                    [
                        'field_code' => 'PHONE',
                        'values' => [
                            [
                                'value' => $formData->Number,
                                'enum_code' => 'WORK'
                            ]
                        ]
                    ]
                ]
            ]
        ];
        $contactData = $this->SendData($data, 'contacts');
        return $this->GetIdContact($contactData) ?? null;
    }
    private function GetIdContact(array $data) {
        if (isset($data['_embedded']['contacts'][0]['id'])) {
            return $data['_embedded']['contacts'][0]['id'];
        } else {
            return null;
        }
    }

    public function CreateLead(FormDTO $formData, int $contactId, $idCustomField): bool {
        $leadData = [
            [
                'name' => $formData->DealName,
                'price' => $formData->Price,
                'created_by' => 0,
                'custom_fields_values' => [
                    [
                        'field_id' => $idCustomField,
                        'values' => [
                            [
                                'value' => $formData->IsBeingOnTheSite
                            ]
                        ]
                    ]
                ],
                '_embedded' => [
                    'contacts' => [
                        [
                            'id' => $contactId
                        ]
                    ]
                ]
            ]
        ];
        try {
            $this->SendData($leadData, 'leads');
        } catch (Exception $e) {
            return false;
        }
        return true;
    }

    private function SendData(array $data , string $endpoint) {
        $accessToken = getenv('AMOCRM_ACCESSTOKEN');
        $subdomain = getenv('AMOCRM_SUBDOMAIN');

        $url = "https://{$this->subdomain}.amocrm.ru/api/v4/{$endpoint}";

        $headers = [
            "Authorization: Bearer {$this->accessToken}",
            "Content-Type: application/json"
        ];

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

        if ($httpCode !== 200 && $httpCode !== 201) {
            die("Ошибка при отправке данных в AmoCRM: HTTP код {$httpCode}");
        }

        curl_close($ch);
        return json_decode($response, true);
    }
    
}


?>