---
title: "Upload receipt"
---
# PayIn. Добавление чека по заявке


## Описание

Метод используется для прикрепления чека к заявке


## Структура запроса

* Метод: `POST`
* Endpoint: `https://{domain}/public/api/v1/shop/orders/sync-requisites`


## Header Parameters (Заголовки запроса)

| Параметр      | Обязательное | Тип    | Значение              | Описание                      |
| ------------- | ------------ | ------ | --------------------- | ----------------------------- |
| Authorization | Обязательно  | string | Bearer **shopApiKey** | Токен авторизации магазина |


## Query Parameters (передаются в URL)

| Поле | Обязательное | Тип   | Описание                              |
| ---- | ------------ | ----- | ------------------------------------- |
| id   | Обязательно  | float | ID ордера |


## Path Parameters (передаются в URL)

| Поле | Обязательное | Тип    | Описание  |
| ---- | ------------ | ------ | --------- |
| id   | Обязательно  | string | ID ордера |


## Request Body schema: application/json



### Примеры запросов

<details>
<summary><strong>Перевод с карты на карту Сбербанк</strong></summary>

```json
ЗАПРОС_1
```
</details>

<details>
<summary><strong>Перевод СБП Тинькофф</strong></summary>

```json
ЗАПРОС_2
```
</details>

<details>
<summary><strong>Перевод СБП Любой банк</strong></summary>

```json
ЗАПРОС_3
```
</details>
