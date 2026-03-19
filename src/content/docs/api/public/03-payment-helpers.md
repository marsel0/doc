---
title: "Public API: платёжные helper endpoint-ы"
---

## GET `/order-requisites/{id}/qr-code`

Получить QR-код по реквизитам ордера.

## GET `/order-requisites/{id}/nspk-details`

Получить NSPK-детали для реквизитов ордера.

## GET `/payment/sberpay/{id}`

Получить ссылку или данные для `sberpay`-сценария.

## Когда это нужно

Эти endpoint-ы используются только в проектах, где merchant-frontend сам дорисовывает специальные платёжные сценарии.
