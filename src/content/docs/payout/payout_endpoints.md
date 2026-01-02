---
title: "API методы для PayOut"
---


1. Создание ордера
2. Получение инфо об ордере
3. Диспут

----------------------------------------
#### Создание ордера

Тип метода: POST

**Описание:** Создает ордер

````bash
curl --location 'https://domain/public/api/v1/shop/payout-orders/order_id' \
--header 'Authorization: Bearer API_KEY'

```

order_id - id ордера
domain - домен площадки
API_KEY - API ключ магазина



----------------------------------------
#### Получить инфо об ордере по его ID

Тип метода: GET

**Описание:** Выводит информацию об ордере по его ID

````bash
curl --location 'https://domain/public/api/v1/shop/payout-orders/order_id' \
--header 'Authorization: Bearer API_KEY'

```

order_id - id ордера
domain - домен площадки
API_KEY - API ключ магазина
----------------------------------------
#### Получить доступные трейд методы

Тип метода: GET

**Описание:** Получить доступные трейд методы

````bash
curl --location 'https://domain/public/api/v1/shop/trade-methods/payout' \
--header 'Authorization: Bearer API_KEY'
```

order_id - id ордера
domain - домен площадки
API_KEY - API ключ магазина
----------------------------------------