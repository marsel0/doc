---
title: "System API"
---

OpenAPI содержит не только merchant API, но и системные endpoint-ы.

## Что входит

- `customer` API
- `order-automation`
- `app-configs/multitransfer`
- `sci-domains`
- `deploy-info`, `metrics`
- внутренние webhook endpoint-ы `p2p-providers`

## Почему это вынесено отдельно

Эти запросы не нужны для стандартной merchant-интеграции `simple-pay`. Они используются:

- внутренними сервисами платформы;
- кастомными фронтами;
- провайдерами;
- технической командой.

Если потребуется, по этим endpoint-ам можно добавить отдельный внутренний раздел документации.
