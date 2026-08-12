---
title: "PayOut API"
---

Этот раздел — точный контракт merchant API для выплат: URL, query-параметры, тело
запроса и допустимые действия. Пошаговое объяснение сценария сначала читайте в
[Payout H2H](/doc/v2/payout/).

Минимальный onboarding для payout:

1. проверить магазин через [`GET /shop/info`](/doc/api/shop/03-info/#get-shopinfo);
2. при необходимости проверить баланс через [`GET /shop/assets`](/doc/api/shop/02-balances/#get-shopassets);
3. получить методы выплат через [`GET /shop/trade-methods/payout`](/doc/api/payout/04-dictionaries/#get-shoptrade-methodspayout);
4. создать payout;
5. читать статус через [`GET /shop/payout-orders/{id}`](/doc/api/payout/03-read-and-cancel/#get-shoppayout-ordersid) или принимать callback.

## Что важно понимать

- payout создаётся через [`POST /shop/payout-orders`](/doc/api/payout/02-orders/#post-shoppayout-orders);
- статус после create обычно не финальный, а промежуточный `requisites`;
- payout нельзя произвольно перевести в `completed` прямой записью статуса;
- из action-методов мерчанту доступна только отмена, если статус это допускает.
- перед созданием берите [`payment.type`](/doc/api/shop/05-payment-types/),
  рекомендуемый `payment.bank` и обязательные поля `customer.requisites` из
  [актуального списка PayOut-методов и банков](/doc/api/payout/04-dictionaries/#get-shoptrade-methodspayout).
- `externalOrderId` должен быть уникальным в вашей системе: он нужен для безопасного
  поиска ордера после сбоя или таймаута.

## Страницы

- [Создание и список payout-ордеров](/doc/api/payout/02-orders/)
- [Чтение и отмена payout-ордеров](/doc/api/payout/03-read-and-cancel/)
- [Trade methods и справочники](/doc/api/payout/04-dictionaries/)
