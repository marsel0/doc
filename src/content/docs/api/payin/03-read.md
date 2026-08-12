---
title: "PayIn API: получение статуса"
---

Оба endpoint возвращают один и тот же объект PayIn-ордера.

## По внутреннему `id`

`id` берётся из ответа создания ордера.

```bash
curl "$BASE_URL/shop/orders/94215bfb-1963-4a41-9686-f90412e0a58f" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

## По `externalOrderId`

Используйте ID, который магазин передал при создании. Этот запрос нужен после
таймаута create-запроса.

```bash
curl "$BASE_URL/shop/orders/external/merchant-20001" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

Если один `externalOrderId` относится к нескольким ордерам, API вернёт `O10007`.

## Пример ответа

```json
{
  "id": "94215bfb-1963-4a41-9686-f90412e0a58f",
  "initialAmount": 1500,
  "amount": 1500,
  "currency": "RUB",
  "status": "completed",
  "statusDetails": null,
  "requisites": { "phone": "+79995554433", "bank": "sberbank" },
  "payment": { "type": "sbp", "bank": "sberbank" },
  "customer": { "id": "customer-42" },
  "integration": { "externalOrderId": "merchant-20001" }
}
```

Для бизнес-логики проверяйте `status`, `statusDetails` и `amount`. Для корреляции —
`id` и `integration.externalOrderId`. Полный состав: [модель ордера](/doc/api/payin/01-overview/#основные-поля-ответа).
