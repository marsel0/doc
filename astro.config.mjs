// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// плагины для заголовков
import remarkSlug from 'remark-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

export default defineConfig({
  base: '/doc/', // Указываем имя репозитория с косой чертой
  site: 'https://marsel0.github.io/doc/', // URL сайта на GitHub Pages
  integrations: [
    starlight({
      title: 'Документация для магазина',
      locales: {
        root: { label: 'Русский', lang: 'ru' },
      },
      customCss: ['./src/styles/global.css'],
      tableOfContents: {
        minHeadingLevel: 2,
        maxHeadingLevel: 3,
      },
      sidebar: [
        {
          label: 'Начало работы',
          items: [
            { label: 'Интеграция', link: '/v2/integration/' },
            { label: 'PayIn Redirect', link: '/v2/red/' },
            { label: 'PayIn H2H: реквизиты сразу', link: '/v2/h2h-sync/' },
            { label: 'PayIn H2H: по шагам (не рекомендуется)', link: '/v2/h2h-step/' },
            { label: 'PayOut H2H', link: '/v2/payout/' },
          ],
        },
        {
          label: 'PayIn API',
          items: [
            { label: 'Обзор и статусы', link: '/api/payin/01-overview/' },
            { label: 'Создание ордеров', link: '/api/payin/02-orders/' },
            { label: 'Получение статуса', link: '/api/payin/03-read/' },
            { label: 'Действия над ордером', link: '/api/payin/04-actions/' },
            { label: 'Чеки', link: '/api/payin/05-receipts-and-fields/' },
            { label: 'Диспуты', link: '/api/payin/06-disputes/' },
          ],
        },
        {
          label: 'PayOut API',
          items: [
            { label: 'Обзор и статусы', link: '/api/payout/01-overview/' },
            { label: 'Создание ордеров', link: '/api/payout/02-orders/' },
            { label: 'Чтение и отмена', link: '/api/payout/03-read-and-cancel/' },
            { label: 'Способы и поля', link: '/api/payout/04-dictionaries/' },
          ],
        },
        {
          label: 'Магазин',
          items: [
            { label: 'Доступ и ключи', link: '/api/shop/01-overview/' },
            { label: 'Баланс и вывод средств', link: '/api/shop/02-balances/' },
            { label: 'Информация и курсы', link: '/api/shop/03-info/' },
            { label: 'Способы оплаты и поля', link: '/api/shop/04-dictionaries/' },
            { label: 'Типы оплаты', link: '/api/shop/05-payment-types/' },
          ],
        },
        {
          label: 'Справочник',
          items: [
            { label: 'Callback и подпись', link: '/v2/callback-signature/' },
            { label: 'Поля методов оплаты', link: '/v2/field-reference/' },
            { label: 'Ошибки', link: '/docs/02-api_error_guide/' },
            { label: 'Уникализация суммы', link: '/docs/03-randomization/' },
            { label: 'Антифрод', link: '/docs/04-antifrod/' },
          ],
        },
      ],
    }),
  ],

  markdown: {
    remarkPlugins: [
      remarkSlug, // генерирует id для заголовков
    ],
    rehypePlugins: [
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'append', // ссылка в конец заголовка
          properties: {
            class: 'anchor-link',
            ariaHidden: 'true',
          },
        },
      ],
      () => {
        return (tree) => {
          const base = '/doc/'; // Используем Astro.base для корректного пути
          tree.children.unshift({
            type: 'element',
            tagName: 'script',
            properties: { src: `${base}q.js`, type: 'module' },
            children: [],
          });
        };
      },
    ],
  },
});
