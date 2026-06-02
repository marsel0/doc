---
title: "Shop API"
description: "Короткий вход в служебные merchant endpoint-ы магазина"
---

`Shop API` нужен для служебных merchant-запросов вокруг основной интеграции: проверить магазин, получить курсы, прочитать баланс, получить доступные trade methods и работать с заявками на вывод средств магазина.

Это не отдельный сценарий интеграции, а вспомогательный раздел, который почти всегда нужен рядом с `PayIn` и `PayOut`.

## Когда сюда идти

- проверить, что домен и `Shop API key` рабочие;
- прочитать курсы магазина;
- получить доступные `trade methods` для `PayIn` или `PayOut`;
- проверить баланс магазина;
- создать или проверить заявку на вывод средств магазина.

## Что здесь обычно нужно мерчанту

### Проверка доступа

Первый полезный запрос:

- `GET /public/api/v1/shop/info` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shopinfo/operation/ShopsController_getShopInfo" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>

Он помогает проверить:

- домен;
- `Shop API key`;
- что вы попали в нужное окружение.

### Курсы магазина

Для сверки расчётов:

- `GET /public/api/v1/shop/info/exchange` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shopinfo/operation/ShopsController_getShopExchange" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>

### Доступные методы

Для `PayIn`:

- `GET /public/api/v1/shop/trade-methods` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shoptrade-methods/operation/ShopTradeMethodsController_getTradeMethods" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>

Для `PayOut`:

- `GET /public/api/v1/shop/trade-methods/payout` <a href="[[DOMAIN_URL]]/public/api/payout#tag/v1shoptrade-methodspayout/operation/ShopTradeMethodsController_getPayoutTradeMethods" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>

Именно эти запросы считаются источником истины для доступных методов, банков и обязательных полей.

### Баланс магазина

Если у вас есть `Balance API key`:

- `GET /public/api/v1/shop/assets` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shopassets/operation/ShopAssetsController_getShopAssets" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>

Это особенно важно перед массовыми выплатами.

### Вывод средств магазина

Если нужно работать не с payout-ордерами клиента, а с балансом самого магазина:

- `POST /public/api/v1/shop/assets/withdrawals` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shopassets/operation/ShopAssetsController_createWithdrawallRequest" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>
- `GET /public/api/v1/shop/assets/withdrawals/{id}` <a href="[[DOMAIN_URL]]/public/api/payin#tag/v1shopassets/operation/ShopAssetsController_getWithdrawallRequest" target="_blank" rel="noopener noreferrer">(ссылка на документацию)</a>

## Какие ключи использовать

- для `/shop/info`, `/shop/info/exchange`, `/shop/trade-methods` используйте `Shop API key`;
- для `/shop/assets` и withdrawals используйте `Balance API key`.

## Куда идти дальше

- <a href="/doc/api/shop/01-overview/" target="_blank" rel="noopener noreferrer">Shop API: обзор</a>
- <a href="/doc/api/shop/02-balances/" target="_blank" rel="noopener noreferrer">Shop API: баланс и выводы</a>
- <a href="/doc/api/shop/03-info/" target="_blank" rel="noopener noreferrer">Shop API: информация и курсы</a>
- <a href="/doc/api/shop/04-dictionaries/" target="_blank" rel="noopener noreferrer">Shop API: trade methods и справочники</a>

