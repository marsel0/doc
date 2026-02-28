---
title: "PayIn. Получить ордер по ID"
---

## Описание

Метод используется для получения информации по **PayIn ордеру**.
Идентификатор ордера передаётся в URL, тело запроса отсутствует.



## Структура запроса

* **Метод:** `GET`
* **Endpoint:**

  ```
  https://domain/public/api/v1/shop/orders/{id}
  ```
* **Headers:**

  ```http
  Authorization: Bearer API_KEY
  ```

---

## Параметры запроса

Параметры передаются **в URL**.

* `id` — идентификатор ордера, который необходимо получить

---

## Пример запроса

```bash
curl --location 'https://domain/public/api/v1/shop/orders/e6181726-e044-43b4-a358-e8044a3614c0' \
--header 'Authorization: Bearer API_KEY'
```

---

## Структура ответа

Ответ возвращается в формате JSON. Ниже приведена **универсальная структура ответа** с комментариями к каждому полю.

```jsonc
{
  "id": "uuid",                     // ID ордера
  "initialAmount": 1800,             // Изначальная сумма ордера
  "amount": 1800,                    // Финальная сумма ордера
  "currency": "RUB",                // Валюта ордера
  "status": "completed",            // Статус ордера (new, pending, completed, failed)
  "statusDetails": "string",        // Детализация статуса
  "statusTimeoutAt": "2025-01-01T12:00:00Z", // Время истечения текущего статуса
  "requisites": {
    "countryCode": "RU",            // Код страны
    "countryNameRu": "Россия",      // Название страны (RU)
    "countryNameEn": "Russia",      // Название страны (EN)
    "phone": "+79120000000",         // Телефон получателя
    "cardInfo": "411111******1111", // Маскированный номер карты
    "bank": "sberbank",             // Код банка
    "bankName": "СберБанк",         // Название банка
    "sameBank": false,                // Перевод внутри одного банка
    "cardholder": "IVAN IVANOV",    // Держатель карты
    "swiftBic": "044525225",        // SWIFT / BIC
    "bic": "044525225",             // БИК банка
    "email": "test@mail.com",       // Email получателя
    "idCard": "string",             // Идентификатор карты
    "beneficiaryName": "string",    // Имя получателя
    "accountNumber": "40817...",    // Номер банковского счёта
    "taxId": "string",              // ИНН / Tax ID
    "expirationDate": "12/26",      // Срок действия карты
    "sberPayUrl": "https://sberpay",// Ссылка SberPay
    "paymentLink": "https://pay",   // Платёжная ссылка
    "qrImageUrl": "https://qr"      // Ссылка на QR-код
  },
  "shop": {
    "name": "demo_shop",            // Название магазина
    "customerDataCollectionOrder": "after_payment", // Когда собираются данные клиента
    "collectCustomerReceipts": false  // Сбор чеков
  },
  "payment": {
    "type": "sbp",                  // Метод оплаты
    "bank": "sberbank",             // Банк оплаты
    "customerCardFirstDigits": "4111", // Первые цифры карты клиента
    "customerCardLastDigits": "1111",  // Последние цифры карты клиента
    "customerBank": "sberbank",        // Банк клиента
    "customerName": "IVAN IVANOV",     // Имя клиента
    "customerPhoneLastDigits": "1234", // Последние цифры телефона
    "customerUtr": "string",           // UTR / Reference
    "customerIBAN": "string",          // IBAN клиента
    "customerAccountNumber": "string"  // Счёт клиента
  },
  "customer": {
    "id": "09387",                  // ID клиента
    "name": "string",               // Имя клиента
    "email": "string",              // Email клиента
    "phone": "string",              // Телефон клиента
    "ip": "string",                 // IP клиента
    "fingerprint": "string"         // Fingerprint клиента
  },
  "assetCurrencyAmount": 15.48,       // Сумма в ассет-валюте (например, USDT)
  "shopAmount": 10.83,                // Сумма к зачислению магазину
  "shopFee": 4.64,                    // Комиссия магазина
  "initialShopCommission": 30,        // Изначальная комиссия магазина
  "currencyRate": 116.25,             // Курс валюты
  "integration": {
    "callbackUrlStatus": "error",   // Статус отправки callback
    "link": "https://pay.link",     // Платёжная ссылка
    "token": "uuid",                // Токен ордера
    "callbackUrl": "https://callback", // URL callback
    "callbackMethod": "post",       // Метод callback (get | post)
    "externalOrderId": "ORD-123"    // ID ордера в системе мерчанта
  }
}
```