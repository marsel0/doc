---
title: "PAYOUT API"
---

Папка `api/payout` содержит merchant API для выплат.

Минимальный onboarding для payout:

1. проверить магазин через `GET /shop/info`;
2. при необходимости проверить баланс через `GET /shop/assets`;
3. получить методы выплат через `GET /shop/trade-methods/payout`;
4. создать payout;
5. читать статусы через `GET` или принимать callback.

## Что важно понимать

- payout создаётся через `POST /shop/payout-orders`;
- статус после create обычно не финальный, а промежуточный `requisites`;
- payout нельзя произвольно перевести в `completed` прямой записью статуса;
- из action-методов мерчанту доступна только отмена, если статус это допускает.

## Страницы

- [Создание и список payout-ордеров](/doc/api/payout/02-orders/)
- [Чтение и отмена payout-ордеров](/doc/api/payout/03-read-and-cancel/)
