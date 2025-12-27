<?php
namespace DTOs;
class FormDTO {
    public string $DealName;
    public string $UserName;
    public string $Email;
    public string $Number;
    public float $Price;
    public bool $IsBeingOnTheSite;

    public function __construct(array $PostData) {
        $this->DealName = 'Сделка № ' . random_int(0, 1000);
        $this->UserName = $PostData['name'];
        $this->Email = $PostData['email'];
        $this->Number = $PostData['number'];
        $this->Price = $PostData['price'];
        $this->IsBeingOnTheSite = $PostData['isBeingOnTheSite'];
    }
}

?>