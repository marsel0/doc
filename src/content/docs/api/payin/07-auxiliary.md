---
title: "PAYIN API: вспомогательные endpoint-ы"
---

## POST `/shop/orders/rosa-one`

Специальный endpoint создания ордера для отдельного сценария `rosa-one`.

## GET `/shop/orders/rosa-one/{id}`

Чтение `rosa-one` ордера по ID.

## Когда использовать

Используйте эти endpoint-ы только если в вашем проекте отдельно согласован сценарий `rosa-one`. Для обычной merchant-интеграции применяйте стандартные `shop/orders`.
