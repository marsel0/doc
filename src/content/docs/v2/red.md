---
title: "PayIn Redirect"
description: "Оплата на странице платёжной платформы"
---

Используйте Redirect, если клиента можно перевести на `integration.link`, который
площадка вернула при создании PayIn-ордера. Магазину не нужно показывать реквизиты.

## Сценарий

1. Создайте [`POST /shop/orders`](/doc/api/payin/02-orders/#post-shoporders) с уникальным `externalOrderId` и `callbackUrl`.
2. Сохраните `id` и `integration.link` из ответа.
3. Перенаправьте клиента на `integration.link`.
4. Получите уведомление о статусе и проверьте его подпись.
5. При необходимости перепроверьте PayIn-ордер через [`GET /shop/orders/{id}`](/doc/api/payin/03-read/#по-внутреннему-id).

[`payment.type`](/doc/api/shop/05-payment-types/) и `payment.bank` обычно не
передаются: клиент выбирает их на платёжной странице. Если магазин всё же задаёт
их заранее, используйте согласованную пару, свою таблицу кодов или
[получите методы и банки через API](/doc/api/shop/04-dictionaries/#получение-методов).

## Ссылка оплаты в H2H

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
| Таймаут создания (`S10002`) | Найдите PayIn-ордер по `externalOrderId`; не создавайте новый вслепую |
| `O10006` | PayIn-ордер с таким `externalOrderId` уже существует: прочитайте и используйте его |
| Клиент вернулся по `returnUrl` | Не отмечайте оплату успешной; дождитесь `completed` в уведомлении или ответе API |
| `requisites.paymentLink` отсутствует | Перенаправьте на `integration.link`; не собирайте прямую ссылку самостоятельно |
| Уведомление пришло повторно | Не выполняйте действие второй раз и ответьте HTTP `200` |

- [Создание PayIn-ордера: поля и curl](/doc/api/payin/02-orders/#post-shoporders)
- [Создание с реквизитами: поля и curl](/doc/api/payin/02-orders/#post-shoporderssync-requisites)
- [Получение статуса](/doc/api/payin/03-read/)
- [Уведомления и подпись](/doc/v2/callback-signature/)
