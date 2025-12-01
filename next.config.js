// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // 画像最適化設定
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.thenewsapi.com",
      },
      {
        protocol: "https",
        hostname: "i.scdn.co",
      },
      {
        protocol: "https",
        hostname: "www.thesportsdb.com",
      },
      {
        protocol: "https",
        hostname: "thumbnail.image.rakuten.co.jp",
      },
      {
        protocol: "https",
        hostname: "openweathermap.org",
      },
    ],
  },

  // 環境変数
  env: {
    NEWS_API_KEY: process.env.NEWS_API_KEY,
    WEATHER_API_KEY: process.env.WEATHER_API_KEY,
    RAKUTEN_APP_ID: process.env.RAKUTEN_APP_ID,
    RAKUTEN_AFFILIATE_ID: process.env.RAKUTEN_AFFILIATE_ID,
    SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
    SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
  },

  // ヘッダー設定
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {key: "Access-Control-Allow-Credentials", value: "true"},
          {key: "Access-Control-Allow-Origin", value: "*"},
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,OPTIONS,PATCH,DELETE,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
          },
        ],
      },
    ];
  },

  // Turbopack設定（空でOK）
  turbopack: {},
};

module.exports = nextConfig;
