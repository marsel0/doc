---
title: "Способы торговли"
---

## Получить доступные способы торговли для магазина PayIn

### Описание

Метод используется для получения доступных способов торговли по магазину. Отображает способы торговли для ордеров с типом PayIn.

### Структура запроса

* Метод: `GET`
* Endpoint: `https://domain/public/api/v1/shop/trade-methods`
* Headers: `"Authorization": "{Bearer API_KEY}"`


### Пример запроса в формате cURL

````bash
curl --location 'https://domain/public/api/v1/shop/trade-methods' \
--header 'Authorization: Bearer API_KEY'
````

order_id - id ордера
domain - домен площадки
API_KEY - API ключ магазина
----------------------------------------

## Получить доступные способы торговли для магазина PayOut

### Описание

Метод используется для получения доступных способов торговли по магазину. Отображает способы торговли для ордеров с типом PayOut.

### Структура запроса

* Метод: `GET`
* Endpoint: `https://domain/public/api/v1/shop/trade-methods/payout`
* Headers: `"Authorization": "{Bearer API_KEY}"`

### Пример запроса в формате cURL

````bash
curl --location 'https://domain/public/api/v1/shop/trade-methods/payout' \
--header 'Authorization: Bearer API_KEY'
````

order_id - id ордера
domain - домен площадки
API_KEY - API ключ магазина