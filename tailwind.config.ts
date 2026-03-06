import { defineConfig } from 'tailwindcss';
import { blackA, cyan, mauve } from '@radix-ui/colors';

export default defineConfig({
    darkMode: 'class',
    content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
    theme: {
        extend: {
            colors: {
                ...blackA,
                ...cyan,
                ...mauve,
            },
        },
    },
    plugins: [],
});
