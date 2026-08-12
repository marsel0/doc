---
title: "PayIn Redirect"
description: "Оплата на странице платёжной платформы"
---

Используйте Redirect, если клиент может перейти на страницу платёжной платформы.
Магазину не нужно самостоятельно показывать реквизиты.

## Сценарий

1. Создайте [`POST /shop/orders`](/doc/api/payin/02-orders/#post-shoporders) с уникальным `externalOrderId` и `callbackUrl`.
2. Сохраните `id` и `integration.link` из ответа.
3. Перенаправьте клиента на `integration.link`.
4. Получите результат через подписанный callback.
5. При необходимости перепроверьте ордер через [`GET /shop/orders/{id}`](/doc/api/payin/03-read/#по-внутреннему-id).

[`payment.type`](/doc/api/shop/05-payment-types/) и `payment.bank` обычно не
передаются: клиент выбирает их на платёжной странице. Если магазин всё же задаёт
их заранее, используйте только [актуальное сочетание метода и банка](/doc/api/shop/04-dictionaries/#получение-методов).

## Redirect с реквизитами сразу

Если тип оплаты известен заранее, создайте
[`POST /shop/orders/sync-requisites`](/doc/api/payin/02-orders/#post-shoporderssync-requisites).
При успешном ответе:

1. Если заполнен `requisites.paymentLink`, перенаправьте клиента на этот URL.
2. Если `requisites.paymentLink` отсутствует, используйте `integration.link` —
   платёжная страница покажет полученные реквизиты.

`requisites.paymentLink` возвращается не для каждого метода. Не формируйте ссылку
самостоятельно и используйте её без изменений.

Возврат клиента на сайт не подтверждает оплату. Успешный финал — только
`status: completed`.

## Частые ошибки

| Ошибка | Что делать |
| --- | --- |
| Таймаут create (`S10002`) | Найдите ордер по `externalOrderId`; не создавайте новый вслепую |
| `O10006` | Ордер с таким `externalOrderId` уже существует: прочитайте и используйте его |
| Клиент вернулся по `returnUrl` | Не отмечайте оплату успешной; дождитесь `completed` через callback или чтение ордера |
| `requisites.paymentLink` отсутствует | Перенаправьте на `integration.link`; не собирайте прямую ссылку самостоятельно |
| Callback пришёл повторно | Обработайте идемпотентно и ответьте HTTP `200` |

- [Создание ордера: поля и curl](/doc/api/payin/02-orders/#post-shoporders)
- [Создание с реквизитами: поля и curl](/doc/api/payin/02-orders/#post-shoporderssync-requisites)
- [Получение статуса](/doc/api/payin/03-read/)
- [Callback и подпись](/doc/v2/callback-signature/)
