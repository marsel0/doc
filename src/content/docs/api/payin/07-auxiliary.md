---
title: "PAYIN API: trade methods"
---

## GET `/shop/trade-methods`

Возвращает payin trade methods, доступные магазину в текущий момент.

```bash
curl --location "$BASE_URL/shop/trade-methods" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

### Ожидаемый ответ

```json
[
  {
    "bank": "sberbank",
    "bankName": "Sberbank",
    "fiatCurrency": "RUB",
    "fiatCurrencySymbol": "₽",
    "fiatCurrencySymbolPosition": "after",
    "paymentType": "sbp",
    "paymentTypeName": "СБП",
    "fields": [
      { "type": "phone", "name": "phone", "required": true, "primary": true }
    ],
    "customerFields": [
      { "type": "phone", "name": "phone", "required": false }
    ],
    "parallelGroupOrdersEnabled": false,
    "compareCardLast4DigitsEnabled": false,
    "compareAccountLast4DigitsEnabled": false,
    "compareUTREnabled": false,
    "enabled": true,
    "deeplinks": []
  }
]
```

### Что читать в ответе

- `paymentType` и `bank` для выбора `payment`
- `fields[]` для состава `requisites`
- `customerFields[]` для данных плательщика
- `enabled` для фильтрации нерабочих методов
- `deeplinks[]`, если конкретный метод поддерживает deeplink
