// @ts-check
import { defineConfig } from 'astro/config';
//import i18n from '@astrojs/i18n';

// https://astro.build/config
export default defineConfig(
    {
    i18n: {

        defaultLocale: 'en',

        locales: ['en', 'de'],
        // Optional: Specify a custom path for the locale files
        // This is useful if you want to keep your locale files in a specific directory
        // localePath: './src/locales',
        routing: {
            prefixDefaultLocale: true,
        }
    }
});
