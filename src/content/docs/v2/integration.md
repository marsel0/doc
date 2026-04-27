---
title: "Интеграция"
description: "Общая точка входа в merchant-интеграцию"
---

Эта страница будет общей точкой входа для мерчанта. Здесь остаётся только верхнеуровневая схема подключения и выбор сценария.

## Что нужно на старте

- домен инстанса `simple-pay`;
- `Shop API key`;
- `Balance API key`;
- `Signature key` для callback.

## Базовые переменные

```bash
export DOMAIN="[[DOMAIN_URL]]"
export BASE_URL="[[BASE_URL]]"
export SHOP_TOKEN="<SHOP_API_KEY>"
export BALANCE_TOKEN="<BALANCE_API_KEY>"
export SIGNATURE_KEY="<SIGNATURE_KEY>"
```

## Как читать эту справку

- Если клиент остаётся на вашем интерфейсе, начните с [H2H](/doc/v2/h2h/).
- Если клиент переходит на платёжную страницу, начните с [RED](/doc/v2/red/).
- Если используется сценарий с несколькими redirect-вариантами, начните с [RED-MULTI](/doc/v2/red-multi/).
- За полным описанием endpoint-ов переходите в `/doc/api/...`.
- За готовыми запросами и ответами переходите в [Примеры](/doc/v2/examples/).

## Что важно

- Мерчант не выставляет `status` напрямую.
- Основной канал статусов: callback.
- `GET`-чтение статуса остаётся резервным каналом контроля.
- `externalOrderId` в production лучше считать обязательным.
