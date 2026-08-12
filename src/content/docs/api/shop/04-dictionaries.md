---
title: "Shop API: доступные методы и поля"
description: "Как получать актуальные PayIn/PayOut methods и строить форму без хардкода"
---

Trade method — сочетание `paymentType`, банка и валюты, которое доступно конкретному
магазину в конкретный момент. Это единственный источник истины для выбора метода и
набора полей: не подставляйте коды банков и полей из старого ответа или примера.

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
   выбранного trade method, чтобы правильно показать `requisites` из ответа
   ордера. Набор может отличаться даже у методов с похожими названиями.
5. Перед новым PayIn/PayOut или при ошибке `T10000`, `B10000`, `P10000` обновите
   список методов. Недоступность реквизитов и изменение настроек могут сделать
   старый список неактуальным.

## `fields` и `customerFields`

У каждого поля есть `name` — ключ для payload/реквизита — и `type` — подсказка для
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
  фактически возвращённые API, и сохраняйте обычный web-flow как fallback.
- `comment`: необязательная инструкция для платёжного интерфейса; покажите её без
  интерпретации как HTML.

Полный разбор mapping приведён в [Поля реквизитов и customerFields](/doc/v2/field-reference/)
и [справочнике `payment.type`](/doc/api/shop/05-payment-types/).
