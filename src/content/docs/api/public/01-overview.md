---
title: "Public API"
pagefind: false
---

Этот раздел содержит общие справочники и вспомогательные endpoint-ы. Для обычной
merchant-интеграции сначала используйте Shop API: его методы уже отфильтрованы по
настройкам конкретного магазина. Public API нужен, когда сценарий явно требует
общего справочника или helper endpoint-а.

Не используйте [`GET /trade-methods`](/doc/api/public/02-dictionaries/) вместо
[`GET /shop/trade-methods`](/doc/api/shop/04-dictionaries/#получение-методов): второй отражает
текущую доступность именно вашего магазина.

## Страницы

- [Справочники](/doc/api/public/02-dictionaries/)
- [Платёжные helper endpoint-ы](/doc/api/public/03-payment-helpers/)
