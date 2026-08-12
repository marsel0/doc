---
title: "Shop API: информация, статус и курсы"
description: "Проверка среды, состояния магазина и валютных настроек"
---

Эти методы вызываются с `Shop API key`. Выполните [`GET /shop/info`](#get-shopinfo) при развёртывании
интеграции и после каждой смены ключа или среды.

## GET `/shop/info`

```bash
curl --fail-with-body --silent --show-error \
  "$BASE_URL/shop/info" \
  --header "Authorization: Bearer $SHOP_TOKEN" \
  --header "Accept: application/json"
```

Пример успешного ответа:

```json
{
  "id": "374e21dc-0fa7-42f8-b523-f95a8c0e9a2c",
  "name": "demo-shop",
  "status": "active",
  "fiatCurrency": "RUB",
  "assetCurrency": "USDT"
}
```

| Поле | Как использовать |
| --- | --- |
| `id` | Идентификатор магазина. Сохраните для диагностики, но не подменяйте им API key. |
| `name` | Контрольное имя: помогает выявить ошибочно выбранную среду. |
| `status` | `active` — магазин может работать; `inactive` — остановите создание операций и выясните причину. |
| `fiatCurrency` | Валюта сумм PayIn/PayOut и отображения курса. |
| `assetCurrency` | Актив магазина и валюта баланса/вывода. |

Проверяйте ответ программно: совпадение `id` и валют с конфигурацией вашей среды
лучше, чем проверка только HTTP-кода `200`.

## GET `/shop/info/exchange`

```bash
curl --fail-with-body --silent --show-error \
  "$BASE_URL/shop/info/exchange" \
  --header "Authorization: Bearer $SHOP_TOKEN" \
  --header "Accept: application/json"
```

Пример:

```json
{
  "payinCurrencyRate": 100,
  "payoutCurrencyRate": 99.5
}
```

- `payinCurrencyRate` — настроенный курс для PayIn;
- `payoutCurrencyRate` — настроенный курс для PayOut.

Значение может отсутствовать (`null`), если для соответствующего направления курс
не настроен. Не заменяйте его «последним известным» или внешним рыночным курсом:
уточните конфигурацию у платформы. Для отображения баланса в fiat используйте
[`GET /shop/assets?exchange=payin`](/doc/api/shop/02-balances/#get-shopassets) или `...=payout` — там вернётся курс, фактически
применённый к активу, если он доступен.

## Диагностика

| Результат | Действие |
| --- | --- |
| `401 Unauthorized` | Проверьте `Bearer`-формат, Shop API key и соответствие среды. |
| `S10000` / inactive | Не ретрайте создание заказов; попросите активировать магазин. |
| Валюта или ID не те | Немедленно остановите запросы: используется не тот домен или ключ. |
| Курс `null` | Не рассчитывайте сумму самостоятельно; проверьте настройку PayIn/PayOut в кабинете. |
