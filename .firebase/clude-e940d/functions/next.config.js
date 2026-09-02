"use strict";

// frontend/next.config.js
var nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || ""
  }
};
module.exports = nextConfig;
