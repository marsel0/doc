---
title: "API методы для PayOut"
---


1. Создание ордера +
2. Получение инфо об ордере +
3. Диспут

----------------------------------------


----------------------------------------
## Получить данные ордеру по его ID


### Описание

Метод используется для получения данных по PayOut ордеру, используя его ID. 

### Структура запроса

* Метод: `GET`
* Endpoint: `https://domain/public/api/v1/shop/payout-orders/order_id`
* Headers: `"Authorization": "{Bearer API_KEY}"`

### Пример запроса в формате cURL

````bash
curl --location 'https://domain/public/api/v1/shop/payout-orders/order_id' \
--header 'Authorization: Bearer API_KEY'
````

order_id - id ордера
domain - домен площадки
API_KEY - API ключ магазина

----------------------------------------
