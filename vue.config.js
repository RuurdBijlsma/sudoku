module.exports = {
    "transpileDependencies": [
        "vuetify"
    ],
    publicPath: '/sudoku',
    pwa: {
        name: 'Vue Music',
        themeColor: '#1b1b1c',
        msTileColor: "#f38704",
        manifestOptions: {
            "name": "Sudoku",
            "short_name": "Sudoku",
            "start_url": "./",
            "display": "standalone",
            "background_color": "#1b1b1c",
            "theme_color": "#f38704",
            "description": "Browse, play and create sudokus™",
            "icons": [
                {
                    "src": "img/icons/favicon-16x16.png",
                    "sizes": "16x16",
                    "type": "image/png"
                },
                {
                    "src": "img/icons/apple-touch-icon-76x76.png",
                    "sizes": "76x76",
                    "type": "image/png"
                },
                {
                    "src": "img/icons/favicon-32x32.png",
                    "sizes": "32x32",
                    "type": "image/png"
                },
                {
                    "src": "img/icons/msapplication-icon-144x144.png",
                    "sizes": "144x144",
                    "type": "image/png"
                },
                {
                    "src": "img/icons/android-chrome-512x512.png",
                    "sizes": "512x512",
                    "type": "image/png"
                },
                {
                    "src": "img/icons/android-chrome-192x192.png",
                    "sizes": "192x192",
                    "type": "image/png"
                },
                {
                    "src": "img/icons/android-chrome-maskable-512x512.png",
                    "sizes": "512x512",
                    "purpose":"maskable",
                    "type": "image/png"
                },
                {
                    "src": "img/icons/android-chrome-maskable-192x192.png",
                    "sizes": "192x192",
                    "type": "image/png",
                    "purpose":"maskable"
                }
            ]
        },
    }
}