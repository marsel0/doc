---
title: "Shop API: информация и курсы"
---

## GET `/shop/info`

Первый запрос, который стоит сделать после получения домена и `Shop API key`.

```bash
curl --location "$BASE_URL/shop/info" \
  --header "Authorization: Bearer $TOKEN"
```

### Пример ответа

```json
{
  "id": "374e21dc-0fa7-42f8-b523-f95a8c0e9a2c",
  "name": "simple-pay-demo",
  "status": "active",
  "fiatCurrency": "RUB",
  "assetCurrency": "USDT"
}
```

## GET `/shop/info/exchange`

Показывает активные курсы магазина для `payin` и `payout`.

```bash
curl --location "$BASE_URL/shop/info/exchange" \
  --header "Authorization: Bearer $TOKEN"
```

### Пример ответа

```json
{
  "payinCurrencyRate": 100,
  "payoutCurrencyRate": 100
}
```

## Когда использовать

- сразу после получения ключей;
- для диагностики среды и авторизации;
- для сверки валют магазина и обменных курсов перед расчётами.
