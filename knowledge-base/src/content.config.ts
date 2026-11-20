import { defineCollection } from 'astro:content';
import { docsLoader, i18nLoader } from '@astrojs/starlight/loaders';
import { docsSchema, i18nSchema } from '@astrojs/starlight/schema';

export const collections = {
  docs: defineCollection({ loader: docsLoader(), schema: docsSchema() }),
  // Register Starlight's optional translation collection even when no custom
  // locale files exist, which keeps collection discovery explicit and quiet.
  i18n: defineCollection({ loader: i18nLoader(), schema: i18nSchema() }),
};

