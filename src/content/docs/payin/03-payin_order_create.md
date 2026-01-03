---
title: "PayIn. Создание ордера."
---

# PayIn. Создание ордера.





# доделать примеры ответов, описание полей ответов. скопировать актуальные данные в метод payout


### Описание

Метод используется для создания PayOut ордера мерчантом. Ордер будет создан для магазина, API ключ которого был использован при авторизации.

-------------------
### Структура запроса

* Метод: `POST`
* Endpoint: `https://domain/public/api/v1/shop/orders/sync-requisites`
* Headers: `"Authorization": "{Bearer API_KEY}"`

-------------------

### Параметры запроса (добавляются в тело запроса)

Важна вложенность параметров в объекты, такие параметры указаны через точку. Например: payment.bank указывает на то, что параметр bank будет вложен в объект payment.

| Поле              | Обязательное поле| Object| Тип            | Описание                                       | Значение по умолчанию |
| ----------------- | ---| -------------------| ---------------| ------------------------------------------------ | --------------------- |
| `amount`          | Обязательно| Блок               | `float`        | Сумма операции                                   |                       |
| `currency`        | Обязательно| Блок               | `string`       | Валюта    | `RUB`                 |
| `payment.bank`            | Тип| payment            | `string`       | Предпочтительный банк. Если неважно — `any-bank` | `any-bank`            |
| `payment.type`            | Обязательно| payment            | `string`       | Способ оплаты | `any-bank`            |
| `customer.id`              | Обязательно| customer           | `string`       | ID получателя                                    |                       |
| `customer.name`            | Тип| customer           | `string`       | ФИО получателя                                   |                       |
| `customer.email`           | Тип| customer           | `list[string]` | Email получателя                                    | `RU`                  |
| `telegram`        | Тип| customer           | `list[string]` | Telegram получателя                | `["sbp"]`             |
| `cardInfo`        | Обязательно| customer.requisites| `string`       | Номер карты получателя                | `None`                |
| `cardholder`      | Тип| customer.requisites| `string`       | Держатель карты                | `None`                |
| `expirationDate`  | Тип| customer.requisites| `string`       | Варианты реквизитов для получения                | `None`                |
| `externalOrderId` | Тип| integration        | `string`       | ID ордера в системе мерчанта                | `None`                |
| `callbackUrl`     | Тип| integration        | `string`       | URL адрес на который будут направлены коллбэки по ордеру                | `None`                |
| `callbackMethod`  | Тип| integration        | `string`       | Способ отправки коллбэков GET или POST               | `None`                |

-------------------

### Поддерживаемые значения в полях

<details>

<summary><strong>Поддерживаемые значения <code>type</code></strong></summary>

| Значение           | Описание                                                                 |
| ------------------ | ------------------------------------------------------------------------ |
| `sbp`              | Система быстрых платежей - перевод по номеру телефона                    |
| `card2card`        | Перевод с карты на карту                                                 |
| `sberpay`          | Система sberpay                                                          |
| `phone_number`     | Перевод по номеру телефона                                               |
| `account_number`   | Банковский счёт (включает расчётный, с указанием БИК и счёта)            |
| `tsbp`             | Трансграничный перевод через СБП                                         |
| `tcard2card`       | Трансграничный перевод по номеру карты                                   |
| `imps`             | Банковский счёт (монобанк) (включает расчётный, с указанием БИК и счёта) |
| `nspk`             | Оплата через NSPK по QR-коду                                             |
| "" или `null`      | Получить все возможные реквизиты по доступным методам                    |

</details>
<details>

<summary><strong>Поддерживаемые значения <code>currency</code></strong></summary>

| Значение | Описание                |
| -------- | ----------------------- |
| `RUB` | Рубли                      |
| `KGS` | Кыргызский сом             |
| `AZN` | Азербайджанский манат      |
| `INR` | Индийская рупия            |
| `GEL` | Грузинский лари            |
| `UZS` | Узбекский сум              |
| `AMD` | Армянский драм             |
| `BOB` | Боливийский боливиано      |
| `TJS` | Таджикский сомони          |
| `BYN` | Белорусский рубль          |
| `UAH` | Украинская гривна          |
| `TRY` | Турецкая лира              |
| `KZT` | Казахстанский тенге        |
| `KES` | Кенийский шиллинг          |

</details>

-------------------

### Примеры запросов

<details>
<summary><strong>Перевод с карты на карту Сбербанк</strong></summary>

```json
{
  "amount": 600,
  "currency": "RUB",
  "customer": {
    "id": "#1234345410",
    "phone": "+791270271111",
    "name": "Иванов Иван",
    "email": "ivan@test-client.com"
  },
  "integration": {
    "callbackUrl": "",
    "callbackMethod": "post",
    "returnUrl": "https://your-shop.com"
  },
  "payment": {
    "type": "card2card",
    "bank": "sberbank"
  }
}
```
</details>

<details>
<summary><strong>Перевод СБП Тинькофф</strong></summary>

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
    "callbackUrl": "https://webhook.site/5e294a1f-56c6-44ed-b4fc-b68e8b149f9f",
    "callbackMethod": "post",
    "returnUrl": "https://your-shop.com"
  },
  "payment": {
    "type": "sbp",
    "bank": "tinkoff"
  }
}
```
</details>

<details>
<summary><strong>Перевод СБП Любой банк</strong></summary>

```json
{
  "amount": 1001,
  "currency": "RUB",
  "customer": {
    "id": "{{customerId}}",
    "phone": "+791270271111",
    "name": "Иванов Иван",
    "email": "ivan@test-client.com"
  },
  "integration": {
    "callbackUrl": "",
    "callbackMethod": "post",
    "returnUrl": "https://your-shop.com"
  },
  "payment": {
    "type": "card2card",
    "bank": ""
  }
}
```
</details>

-------------------

### Структура ответа

| Поле              | Обязательное поле| Object| Тип            | Описание                                       | Значение по умолчанию |
| ----------------- | ---| -------------------| ---------------| ------------------------------------------------ | --------------------- |
| `id`          | Обязательно| Блок               | `float`        | ID ордера                                  |                       |
| `amount`          | Обязательно| Блок               | `float`        | Сумма операции в фиат валюте (RUB)                                   |                       |
| `currency`        | Обязательно| Блок               | `string`       | Валюта    | `RUB`                 |
| `status`        | Обязательно| Блок               | `string`       | Статус ордера    | `RUB`                 |
| `statusDetails`        | Обязательно| Блок               | `string`       | Описание статуса    | `RUB`                 |
| `statusTimeoutAt`        | Обязательно| Блок               | `string`       | Валюта    | `RUB`                 |
| `assetCurrencyAmount`        | Обязательно| Блок               | `string`       | Сумма операции в ассет валюте (USDT)    | `RUB`                 |
| `shopAmount`        | Обязательно| Блок               | `string`       | Валюта    | `RUB`                 |
| `shopFee`        | Обязательно| Блок               | `string`       | Комиссия магазина    | `RUB`                 |
| `currencyRate`        | Обязательно| Блок               | `string`       | Курс валюты    | `RUB`                 |
| `requisites.cardInfo`        | Обязательно| Блок               | `string`       | Валюта    | `RUB`                 |
| `requisites.cardholder`        | Обязательно| Блок               | `string`       | Валюта    | `RUB`                 |
| `requisites.swiftBic`        | Обязательно| Блок               | `string`       | Валюта    | `RUB`                 |
| `requisites.email`        | Обязательно| Блок               | `string`       | Валюта    | `RUB`                 |
| `requisites.idCard`            | Тип| payment            | `string`       | Предпочтительный банк. Если неважно — `any-bank` | `any-bank`            |
| `requisites.beneficiaryName`            | Обязательно| payment            | `string`       | Способ оплаты | `any-bank`            |
| `requisites.accountNumber`              | Обязательно| customer           | `string`       | ID получателя                                    |                       |
| `requisites.expirationDate`            | Тип| customer           | `string`       | ФИО получателя                                   |                       |
| `requisites.phone`           | Тип| customer           | `list[string]` | Email получателя                                    | `RU`                  |
| `requisites.bank`        | Тип| customer           | `list[string]` | Telegram получателя                | `["sbp"]`             |
| `requisites.bankName`        | Обязательно| customer.requisites| `string`       | Номер карты получателя                | `None`                |
| `requisites.countryCode`      | Тип| customer.requisites| `string`       | Держатель карты                | `None`                |
| `requisites.countryNameEn`  | Тип| customer.requisites| `string`       | Варианты реквизитов для получения                | `None`                |
| `requisites.sberPayUrl` | Тип| integration        | `string`       | ID ордера в системе мерчанта                | `None`                |
| `shop.name`     | Тип| integration        | `string`       | Имя магазина в системе               | `None`                |
| `shop.customerDataCollectionOrder`  | Тип| integration        | `string`       | Способ отправки коллбэков GET или POST               | `None`                |
| `shop.collectCustomerReceipts`  | Тип| integration        | `string`       | Способ отправки коллбэков GET или POST               | `None`                |
| `payment.type`  | Тип| integration        | `string`       | Метод оплаты               | `None`                |
| `customer.id`  | Тип| integration        | `string`       | ID пользователя               | `None`                |
| `customer.name`  | Тип| integration        | `string`       | ФИО пользователя               | `None`                |
| `customer.email`  | Тип| integration        | `string`       | Email пользователя               | `None`                |
| `customer.phone`  | Тип| integration        | `string`       | Номер телефона пользователя              | `None`                |
| `integration.link`  | Тип| integration        | `string`       | Способ отправки коллбэков GET или POST               | `None`                |
| `integration.token`  | Тип| integration        | `string`       | Способ отправки коллбэков GET или POST               | `None`                |
| `integration.callbackUrl`  | Тип| integration        | `string`       | URL адрес на который будут направлены коллбэки по ордеру               | `None`                |
| `integration.callbackMethod`  | Тип| integration        | `string`       | Способ отправки коллбэков GET или POST               | `None`                |
| `integration.callbackUrlStatus`  | Тип| integration        | `string`       | Статус отправки коллбэка               | `None`                |
| `integration.returnUrl`  | Тип| integration        | `string`       | Способ отправки коллбэков GET или POST               | `None`                |
| `integration.externalOrderId`  | Тип| integration        | `string`       | ID ордера в системе мерчанта               | `None`                |





### Примеры ответов





order_id - id ордера
domain - домен площадки
API_KEY - API ключ магазина