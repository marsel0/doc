---
title: "Shop API: доступные методы и поля"
description: "Как получать доступные PayIn/PayOut methods и метаданные полей"
---

Способ оплаты здесь — сочетание `paymentType`, банка и валюты, доступное конкретному
магазину. Коды можно получить от платформы заранее, хранить в собственном
таблице кодов или запрашивать через API ниже. API также возвращает названия, доступность
и метаданные полей для построения формы.

## Получение методов

PayIn:

```bash
curl --fail-with-body --silent --show-error \
  "$BASE_URL/shop/trade-methods" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

PayOut:

```bash
curl --fail-with-body --silent --show-error \
  "$BASE_URL/shop/trade-methods/payout" \
  --header "Authorization: Bearer $SHOP_TOKEN"
```

Пример элемента ответа:

```json
{
  "bank": "sberbank",
  "bankName": "Sberbank",
  "fiatCurrency": "RUB",
  "paymentType": "sbp",
  "paymentTypeName": "СБП",
  "fields": [
    { "type": "phone", "name": "phone", "required": true, "primary": true }
  ],
  "customerFields": [
    { "type": "last_phone_digits", "name": "customerPhoneLastDigits", "required": false }
  ],
  "parallelGroupOrdersEnabled": false,
  "compareCardLast4DigitsEnabled": false,
  "compareAccountLast4DigitsEnabled": false,
  "compareUTREnabled": false,
  "enabled": true,
  "deeplinks": []
}
```

## Как обрабатывать ответ

1. Оставьте только элементы с `enabled: true`.
2. Покажите пользователю `bankName` и `paymentTypeName`; в API создания заказа
   передавайте машинные коды `bank` и `paymentType`.
3. Храните выбранную пару `bank + paymentType` вместе с операцией. Не выбирайте
   банк только по отображаемому имени.
4. Стройте поля формы только по `customerFields`. Для PayIn используйте `fields`
   выбранного способа оплаты, чтобы правильно показать `requisites` из ответа
   ордера. Набор может отличаться даже у методов с похожими названиями.
5. При ошибке `T10000`, `B10000` или `P10000` проверьте согласованные коды и
   свою таблицу кодов либо запросите список методов заново.

## `fields` и `customerFields`

У каждого поля есть `name` — ключ в запросе или реквизите — и `type` — подсказка для
UI и проверки формата. Обрабатывайте метаданные поля:

| Атрибут | Правило для интеграции |
| --- | --- |
| `required` | Не отправляйте форму без значения. |
| `hidden` | Передайте поле, если оно обязательно, но не показывайте его пользователю. |
| `readonly` | Покажите как нередактируемое значение. |
| `pattern`, `maxLength` | Примените проверку до отправки; серверная проверка всё равно обязательна. |
| `patternExample` | Используйте как пример ввода, не как фиксированное значение. |
| `primary`, `unique` | Метаданные реквизита; не меняйте и не генерируйте значение сами. |

Для PayIn `fields` описывают реквизиты, которые платформа выдаст для платежа:
телефон, карту, счёт, получателя или ссылку. `customerFields` описывают данные
плательщика, которые надо собрать и передать в `payment` в сценариях, где они нужны.
Для PayOut поля описывают реквизиты получателя, которые магазин собирает и передаёт
в `customer.requisites`.

### Особые флаги метода

- `parallelGroupOrdersEnabled`: метод допускает параллельные заказы в группе;
  это не разрешение повторно создавать один и тот же `externalOrderId`.
- `compareCardLast4DigitsEnabled`, `compareAccountLast4DigitsEnabled`,
  `compareUTREnabled`: передавайте соответствующие customer-данные, если они
  запрошены выбранным сценарием; они используются для сопоставления платежа.
- `deeplinks`: доступные deeplink-конфигурации. Используйте только элементы,
  которые вернул API. Обычную ссылку оплаты сохраните как запасной вариант.
- `comment`: необязательная инструкция для платёжного интерфейса; покажите её без
  интерпретации как HTML.

Полный список полей приведён в [Поля реквизитов и customerFields](/doc/v2/field-reference/)
и [справочнике `payment.type`](/doc/api/shop/05-payment-types/).
