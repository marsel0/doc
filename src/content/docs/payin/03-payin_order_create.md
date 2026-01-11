---
title: "PayIn. Создание ордера"
---

# PayIn. Создание ордера

## Описание

Метод используется для создания **PayIn ордера** мерчантом. Ордер создаётся для магазина, API‑ключ которого был использован при авторизации.



## Структура запроса

* **Метод:** `POST`
* **Endpoint:** `https://domain/public/api/v1/shop/orders/sync-requisites`
* **Headers:**

  ```http
  Authorization: Bearer API_KEY
  ```

---

## Тело запроса

Ниже приведён полный JSON запроса. Для каждого поля указано пояснение в комментариях.

```jsonc
{
  "amount": 1000,                // ОБЯЗАТЕЛЬНОЕ Сумма операции
  "currency": "RUB",             // ОБЯЗАТЕЛЬНОЕ Валюта операции (RUB, KZT, UZS и др.)

  "customer": {
    "id": "#12345",              // ОБЯЗАТЕЛЬНОЕ Идентификатор клиента в системе мерчанта
    "phone": "+79120000000",     // Телефон клиента
    "name": "Иванов Иван",       // ФИО клиента
    "email": "ivan@test.com",    // Email клиента
    "ip": "192.168.0.1",         // IP-адрес клиента
    "fingerprint": "string"      // Fingerprint браузера клиента
  },

  "integration": {
    "externalOrderId": "ORD-1",  // ID ордера в системе мерчанта
    "callbackUrl": "https://your-site.com/callback", // URL для callback-уведомлений
    "callbackMethod": "post",    // Метод отправки callback (get | post)
    "returnUrl": "https://your-site.com/return",     // URL возврата пользователя
    "successUrl": "https://your-site.com/success",   // URL успешной оплаты
    "failUrl": "https://your-site.com/fail"           // URL ошибки оплаты
  },

  "payment": {
    "type": "sbp",               // ОБЯЗАТЕЛЬНОЕ Метод оплаты (sbp, card2card, sberpay и др.)
    "bank": "tinkoff",           // Предпочтительный банк (или null для выбор случайного банка)
    "customerBank": "tinkoff"    // Банк клиента (если применимо)
  }
}
```
>ОБЯЗАТЕЛЬНОЕ - так обозначены поля, которые всегда должны быть при создании запроса 

## Поддерживаемые значения

### `payment.type`

* `sbp` — Система быстрых платежей
* `card2card` — Перевод с карты на карту
* `sberpay` — SberPay
* `phone_number` — Перевод по номеру телефона
* `account_number` — Банковский счёт
* `tsbp` — Трансграничный СБП
* `tcard2card` — Трансграничный перевод по карте
* `imps` — Банковский счёт (монобанк)
* `nspk` — Оплата по QR NSPK


## Примеры запросов

### Перевод SBP (Тинькофф)

```json
{
  "amount": 1500,
  "currency": "RUB",
  "customer": {
    "id": "#1234345",
    "phone": "+791270271111",
    "name": "Иванов Иван",
    "email": "ivan@test-client.com"
  },
  "integration": {
    "callbackUrl": "https://webhook.site/example",
    "callbackMethod": "post",
    "returnUrl": "https://your-shop.com"
  },
  "payment": {
    "type": "sbp",
    "bank": "tinkoff"
  }
}
```

---

## Структура ответа

Ответ возвращается в формате JSON. Ниже приведён пример с комментариями к полям.

```jsonc
{
  "id": "uuid",                    // ID ордера
  "amount": 1000,                   // Сумма в фиатной валюте
  "currency": "RUB",               // Валюта ордера
  "status": "pending",             // Текущий статус ордера
  "statusDetails": "string",       // Текстовое описание статуса
  "statusTimeoutAt": "2025-01-01T12:00:00Z", // Время истечения статуса

  "assetCurrencyAmount": "10",     // Сумма в ассет-валюте (например, USDT)
  "shopAmount": "980",             // Сумма за вычетом комиссии
  "shopFee": "20",                 // Комиссия магазина
  "currencyRate": "100",           // Курс валюты

  "requisites": {
    "cardInfo": "411111******1111", // Номер карты
    "cardholder": "IVAN IVANOV",    // Держатель карты
    "expirationDate": "12/26",      // Срок действия карты
    "swiftBic": "044525225",        // BIC / SWIFT банка
    "accountNumber": "40817810...", // Номер счёта
    "phone": "+79120000000",         // Телефон получателя
    "bank": "tinkoff",              // Код банка
    "bankName": "Tinkoff",          // Название банка
    "countryCode": "RU",            // Код страны
    "countryNameEn": "Russia",      // Название страны
    "sberPayUrl": "https://sberpay" // Ссылка SberPay (если применимо)
  },

  "shop": {
    "name": "Demo Shop",            // Название магазина
    "customerDataCollectionOrder": "auto",
    "collectCustomerReceipts": true
  },

  "payment": {
    "type": "sbp"                   // Метод оплаты
  },

  "customer": {
    "id": "#12345",
    "name": "Иванов Иван",
    "email": "ivan@test.com",
    "phone": "+79120000000"
  },

  "integration": {
    "link": "https://pay.link",
    "token": "token",
    "callbackUrl": "https://your-site.com/callback",
    "callbackMethod": "post",
    "callbackUrlStatus": "success",
    "returnUrl": "https://your-site.com/return",
    "externalOrderId": "ORD-1"
  }
}
```

---

### Обозначения

* `order_id` — идентификатор ордера
* `domain` — домен платёжной площадки
* `API_KEY` — API‑ключ магазина
