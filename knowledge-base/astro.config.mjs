import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

const repositoryName = 'Tweaks-Configurations-Troubleshooting';

export default defineConfig({
  site: 'https://secretlyspy.github.io',
  base: `/${repositoryName}`,
  trailingSlash: 'always',
  integrations: [
    starlight({
      title: 'Technical Resources',
      description: 'A searchable field guide to operating-system setup, tuning, and troubleshooting.',
      disable404Route: true,
      customCss: ['./src/styles/global.css'],
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/SecretlySpy/Tweaks-Configurations-Troubleshooting',
        },
      ],
      sidebar: [
        { label: 'Overview', link: '/' },
        { label: 'Windows', link: '/windows/' },
        { label: 'Linux', link: '/linux/' },
        { label: 'Android', link: '/android/' },
        { label: 'All Guides', link: '/all-guides/' },
        { label: 'Saved Guides', link: '/saved/' },
      ],
    }),
  ],
});

