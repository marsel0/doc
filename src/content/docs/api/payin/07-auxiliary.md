---
title: "PayIn API: способы и поля"
pagefind: false
---

Актуальные описания находятся в общих разделах API магазина:

- [доступные способы оплаты и состав полей](/doc/api/shop/04-dictionaries/);
- [`payment.type`: назначение и технические ограничения](/doc/api/shop/05-payment-types/).

Перед созданием ордера получайте доступные для магазина сочетания
`paymentType + bank` через
[`GET /shop/trade-methods`](/doc/api/shop/04-dictionaries/#получение-методов).
