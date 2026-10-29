/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./components/**/*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./*.{js,ts,jsx,tsx}"
    ],
    theme: {
        extend: {
            colors: {
                offWhite: '#F2F0EB',
                cream: '#E0D5C7',
                highlight: '#F8EACF',
                softBlack: '#1A1A1A',
                stone: {
                    50: '#fafaf9',
                    100: '#f5f5f4',
                    200: '#e7e5e4',
                    300: '#d6d3d1',
                    400: '#a8a29e',
                    500: '#78716c',
                    600: '#57534e',
                    700: '#44403c',
                    800: '#292524',
                    900: '#1c1917',
                }
            },
            fontFamily: {
                serif: ['"Playfair Display"', 'serif'],
                sans: ['"Inter"', 'sans-serif'],
                display: ['"Cormorant Garamond"', 'serif'],
            },
            animation: {
                'spin-slow': 'spin 20s linear infinite',
            }
        }
    },
    plugins: [],
}
