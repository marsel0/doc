---
title: "PayIn API: создание PayIn-ордеров"
---

## POST `/shop/orders`

Создаёт PayIn-ордер без синхронного поиска реквизитов. Используйте для Redirect или
H2H-сценария, в котором метод выбирается позже.

### Поля запроса

| Поле | Обязательно | Значение и источник |
| --- | --- | --- |
| `amount` | да | Положительное число — сумма PayIn-ордера |
| `currency` | да | Fiat-код из [`GET /shop/info`](/doc/api/shop/03-info/#get-shopinfo), например `RUB` |
| `customer` | да | Объект клиента |
| `customer.id` | да | Непустой стабильный ID клиента в системе магазина; не подменяйте его ID PayIn-ордера |
| `customer.phone` | нет | Телефон клиента |
| `customer.name` | нет | Имя клиента |
| `customer.email` | нет | Валидный email |
| `customer.ip` | нет | IP клиента, не сервера магазина |
| `customer.fingerprint` | нет | Постоянный идентификатор устройства для антифрода |
| `payment` | нет | Выбранный метод; для Redirect можно не передавать |
| `payment.type` | если есть `payment` | Согласованный `paymentType` или код из [списка методов](/doc/api/shop/04-dictionaries/#получение-методов); [назначение кодов](/doc/api/shop/05-payment-types/) |
| `payment.bank` | нет | Согласованный банк получателя или `bank` из [списка методов и банков](/doc/api/shop/04-dictionaries/#получение-методов), не `bankName`. Если поле не передано, платформа сама выберет доступный банк для `payment.type` |
| `payment.customerBank` | нет | Банк отправителя — откуда платит клиент. Код помогает подобрать совместимый маршрут и ссылку оплаты; это не банк получателя |
| `integration.externalOrderId` | нет по API, рекомендуется всегда | Уникальный ID PayIn-ордера в системе магазина |
| `integration.callbackUrl` | нет, рекомендуется | Полный URL обработчика статусов на сервере магазина |
| `integration.callbackMethod` | нет | `post` или `get`; по умолчанию `post` |
| `integration.returnUrl` | нет | URL возврата клиента |
| `integration.successUrl` | нет | URL возврата UI при успехе |
| `integration.failUrl` | нет | URL возврата UI при неуспехе |

Поля `card.*` относятся только к отдельно согласованным PCI DSS e-commerce
режимам и не нужны обычной P2P-интеграции.

```bash
curl "$BASE_URL/shop/orders" \
  --header "Authorization: Bearer $SHOP_TOKEN" \
  --header "Content-Type: application/json" \
  --data '{
    "amount": 1500,
    "currency": "RUB",
    "customer": {
      "id": "customer-42",
      "phone": "+79990001122"
    },
    "integration": {
      "externalOrderId": "merchant-20001",
      "callbackUrl": "https://merchant.example/payments/callback"
    }
  }'
```

Для Redirect перенаправьте клиента на `integration.link` из ответа. Это не
подтверждает оплату — дождитесь `completed`.

## POST `/shop/orders/sync-requisites`

Создаёт PayIn-ордер для H2H и сразу ищет реквизиты. Все поля совпадают с предыдущим
методом, но `payment` и `payment.type` обязательны.

Используйте согласованные `payment.type` и `payment.bank` из своей таблицы кодов
или [получите сочетания методов и банков через API](/doc/api/shop/04-dictionaries/#получение-методов).
[Назначение `payment.type`](/doc/api/shop/05-payment-types/) учитывайте при выборе.
`payment.bank` необязателен: без него платформа выбирает доступный банк для
указанного `payment.type`, поэтому ориентируйтесь на `payment.bank` и `requisites`
из ответа. `payment.customerBank` передавайте, если известен банк отправителя:
он может учитываться при выборе маршрута и формировании ссылки оплаты.

```bash
curl "$BASE_URL/shop/orders/sync-requisites" \
  --header "Authorization: Bearer $SHOP_TOKEN" \
  --header "Content-Type: application/json" \
  --data '{
    "amount": 1500,
    "currency": "RUB",
    "customer": { "id": "customer-42" },
    "payment": {
      "type": "sbp",
      "bank": "sberbank",
      "customerBank": "tbank"
    },
    "integration": {
      "externalOrderId": "merchant-20002",
      "callbackUrl": "https://merchant.example/payments/callback"
    }
  }'
```

Успешный ответ обычно содержит `status: customer_confirm` и `requisites`. Если
реквизиты не найдены, API вернёт `O10005` и отменённый ордер в поле `order`.

## Пример ответа создания

```json
{
  "id": "94215bfb-1963-4a41-9686-f90412e0a58f",
  "initialAmount": 1500,
  "amount": 1500,
  "currency": "RUB",
  "status": "customer_confirm",
  "statusDetails": null,
  "requisites": {
    "phone": "+79995554433",
    "bank": "sberbank",
    "cardholder": "IVAN IVANOV",
    "paymentLink": "https://bank.example/pay/abc123"
  },
  "payment": { "type": "sbp", "bank": "sberbank" },
  "customer": { "id": "customer-42" },
  "integration": {
    "externalOrderId": "merchant-20002",
    "link": "[[DOMAIN_URL]]/order/94215bfb-1963-4a41-9686-f90412e0a58f/token"
  }
}
```

Полный состав полей: [модель ордера](/doc/api/payin/01-overview/#основные-поля-ответа).
Если включена рандомизация, показывайте клиенту `amount`, а не `initialAmount`.
`requisites.paymentLink` необязателен. Если он получен, можно перенаправить
клиента на этот URL; иначе используйте `integration.link` или покажите реквизиты.

## GET `/shop/orders`

Возвращает страницу PayIn-ордеров.

| Query | Обязательно | Формат |
| --- | --- | --- |
| `from` | нет | `YYYY-MM-DD` или ISO 8601 |
| `to` | нет | `YYYY-MM-DD` или ISO 8601 |
| `tz` | нет | IANA timezone, например `Europe/Moscow`; по умолчанию UTC |
| `status` | нет | Статус PayIn-ордера |
| `take` | нет | Целое `1..1000`; по умолчанию `100` |
| `page` | нет | Номер страницы; по умолчанию `1` |

```bash
curl "$BASE_URL/shop/orders?from=2026-03-01&to=2026-03-14&status=completed&page=1" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

Ответ: `{ "items": [...], "page": 1, "pages": 1, "count": 1 }`.
