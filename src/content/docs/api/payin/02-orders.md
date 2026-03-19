---
title: "PAYIN API: создание и список ордеров"
---

## GET `/shop/orders`

Возвращает список payin-ордеров магазина в формате `PaginatedData<GetShopOrderDto>`.

### Query

- `from` , обязательно
- `to` , обязательно
- `status` , опционально
- `take` , опционально
- `page` , опционально

### Пример

```bash
curl --location "$BASE_URL/shop/orders?from=2026-03-01&to=2026-03-14&status=completed&take=50&page=1" \
  --header "Authorization: Bearer $TOKEN"
```

### Что приходит в ответе

- `items[]`
- `page`
- `pages`
- `count`

## POST `/shop/orders`

Создаёт payin-ордер в статусе `new`.

Используйте:

- для redirect-интеграции;
- для H2H-сценария, если `payment.type` будет выбран позже.

### Пример

```bash
curl --location "$BASE_URL/shop/orders" \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer $TOKEN" \
  --data '{
    "amount": 1500,
    "currency": "RUB",
    "customer": { "id": "order-20001" },
    "integration": {
      "externalOrderId": "merchant-20001",
      "callbackUrl": "[[CALLBACK_URL]]",
      "callbackMethod": "post"
    }
  }'
```

### Ответ

Возвращает `GetShopOrderDto`.

Важные поля:

- `integration.link`
- `integration.token`
- `initialAmount`
- `amount`

## POST `/shop/orders/sync-requisites`

Основной H2H-метод. Создаёт ордер и сразу пытается подобрать реквизиты.

### Пример

```bash
curl --location "$BASE_URL/shop/orders/sync-requisites" \
  --header "Content-Type: application/json" \
  --header "Authorization: Bearer $TOKEN" \
  --data '{
    "amount": 1500,
    "currency": "RUB",
    "customer": { "id": "order-20002", "phone": "+79990001122" },
    "payment": { "type": "sbp", "bank": "sberbank" },
    "integration": {
      "externalOrderId": "merchant-20002",
      "callbackUrl": "[[CALLBACK_URL]]",
      "callbackMethod": "post"
    }
  }'
```

### Что возвращает

- `201` с `GetShopOrderDto`, если реквизиты найдены;
- типичный успешный статус такого ордера это `customer_confirm`;
- `404` с `O10005`, если реквизиты не найдены;
- при `404` в ответе обычно приходит и объект `order` со снимком созданного ордера.

### Практическая тонкость

Если на магазине включена уникализация, ориентируйтесь на фактическое `amount`, а не только на `initialAmount`.
