---
title: "PayOut API"
---

Здесь описаны запросы PayOut: URL, параметры, тело и разрешённые действия.
Порядок подключения смотрите в
[Payout H2H](/doc/v2/payout/).

Минимальный onboarding для payout:

1. проверить магазин через [`GET /shop/info`](/doc/api/shop/03-info/#get-shopinfo);
2. при необходимости проверить баланс через [`GET /shop/assets`](/doc/api/shop/02-balances/#get-shopassets);
3. получить методы выплат через [`GET /shop/trade-methods/payout`](/doc/api/payout/04-dictionaries/#get-shoptrade-methodspayout);
4. создать payout;
5. читать статус через [`GET /shop/payout-orders/{id}`](/doc/api/payout/03-read-and-cancel/#get-shoppayout-ordersid) или получать уведомления.

## Что важно понимать

- payout создаётся через [`POST /shop/payout-orders`](/doc/api/payout/02-orders/#post-shoppayout-orders);
- статус после create обычно не финальный, а промежуточный `requisites`;
- payout нельзя произвольно перевести в `completed` прямой записью статуса;
- из action-методов мерчанту доступна только отмена, если статус это допускает.
- перед созданием используйте согласованную таблицу кодов для
  [`payment.type`](/doc/api/shop/05-payment-types/), рекомендуемого `payment.bank`
  и обязательных `customer.requisites` либо
  [получите PayOut-методы и банки через API](/doc/api/payout/04-dictionaries/#get-shoptrade-methodspayout).
- `externalOrderId` должен быть уникальным в вашей системе: он нужен для безопасного
  поиска ордера после сбоя или таймаута.
- если создание не завершилось стандартным ответом API с явным отказом, считайте
  payout созданным и проверьте его через
  [`GET /shop/payout-orders/external/{id}`](/doc/api/payout/03-read-and-cancel/#get-shoppayout-ordersexternalid).
  До проверки не повторяйте `POST` и не создавайте выплату с новым `externalOrderId`.

## Страницы

- [Создание и список payout-ордеров](/doc/api/payout/02-orders/)
- [Чтение и отмена payout-ордеров](/doc/api/payout/03-read-and-cancel/)
- [Способы выплаты и поля](/doc/api/payout/04-dictionaries/)
