---
title: "Shop API"
---

Папка `api/shop` содержит служебные merchant endpoint-ы магазина.

Если вы только начинаете интеграцию, порядок обычно такой:

1. `GET /shop/info` , проверить, что домен и `Shop API key` работают.
2. `GET /shop/info/exchange` , понять рабочие курсы магазина.
3. `GET /shop/trade-methods` или `GET /shop/trade-methods/payout` , получить доступные методы.
4. `GET /shop/assets` , проверить баланс магазина, если у вас есть `Balance API key`.

## Аутентификация

- для `/shop/info`, `/shop/info/exchange`, `/shop/trade-methods` используйте `Shop API key`
- для `/shop/assets` и withdrawals используйте `Balance API key`

Формат:

```http
Authorization: Bearer <token>
```

## Страницы

- [Баланс и выводы](/doc/api/shop/02-balances/)
- [Информация о магазине и курсы](/doc/api/shop/03-info/)
- [Trade methods и справочники](/doc/api/shop/04-dictionaries/)
