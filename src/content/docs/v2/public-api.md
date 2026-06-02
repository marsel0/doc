---
title: "Public API"
description: "Короткий вход в публичные справочники и helper endpoint-ы"
---

`Public API` нужен для чтения публичных справочников и вспомогательных endpoint-ов, которые используются рядом с merchant-интеграцией. Это не основной flow создания ордеров, а опорный слой для построения UI и проверки доступных значений.

## Когда сюда идти

- получить список банков;
- получить список `payment type`;
- прочитать доступные валюты;
- сверить доступные `trade methods`;
- использовать публичные helper endpoint-ы рядом с оплатой.

## Что здесь обычно нужно мерчанту

### Справочники

Чаще всего используются:

- `GET /public/api/v1/banks` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1banks/operation/BanksController_getBanks" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>
- `GET /public/api/v1/payment-types` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1payment-types/operation/PaymentTypesController_getPaymentTypes" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>
- `GET /public/api/v1/currencies/fiat` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1currencies/operation/CurrenciesController_getFiatCurrencies" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>
- `GET /public/api/v1/currencies/asset` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1currencies/operation/CurrenciesController_getCurrencies" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>
- `GET /public/api/v1/trade-methods` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1trade-methods/operation/TradeMethodsController_getTradeMethods" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>
- `GET /public/api/v1/meta` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1order-automation/operation/MetaController_getMeta" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>

Это полезно, если вы строите свой интерфейс выбора и хотите опираться не только на merchant flow, но и на публичные справочные данные.

### Helper endpoint-ы

Отдельно могут понадобиться:

- `GET /public/api/v1/order-requisites/{id}/qr-code` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1order-requisites/operation/OrderRequisitesControllerV1_getRequisitesQrCode" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>
- `GET /public/api/v1/order-requisites/{id}/nspk-details` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1order-requisites/operation/OrderRequisitesControllerV1_getRequisitesNspkDetails" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>
- `GET /public/api/v1/payment/sberpay/{id}` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1payment/operation/PaymentController_redirectToSberPay" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>

Эти методы используются точечно, когда рядом с платёжным сценарием нужны дополнительные публичные данные.

## Что важно

- `Public API` не заменяет merchant API.
- Для реальных сценариев создания ордеров источником истины остаются merchant endpoint-ы.
- Справочники удобны для UI, валидации и сопоставления значений, но не для управления статусами и действиями над ордерами.

## Куда идти дальше

- <a href="/doc/api/public/01-overview/" target="_blank" rel="noopener noreferrer">Public API: обзор</a>
- <a href="/doc/api/public/02-dictionaries/" target="_blank" rel="noopener noreferrer">Public API: справочники</a>
- <a href="/doc/api/public/03-payment-helpers/" target="_blank" rel="noopener noreferrer">Public API: платёжные helper endpoint-ы</a>

