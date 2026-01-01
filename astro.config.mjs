// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

// плагины для заголовков
import remarkSlug from 'remark-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';

export default defineConfig({
  base: '/doc/', // Указываем имя репозитория с косой чертой
  site: 'https://alexbalykin.github.io/doc', // URL сайта на GitHub Pages
  integrations: [
    starlight({
      title: 'Документация',
      sidebar: [
	{
          label: 'Начало работы',
          autogenerate: { directory: 'docs' },
        },
        {
          label: 'Payin',
          autogenerate: { directory: 'payin' },
        },
        {
          label: 'Payout',
          autogenerate: { directory: 'payout' },
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
	  }
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

