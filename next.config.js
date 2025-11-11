/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
  },
  webpack: (config, { isServer }) => {
    // yahoo-finance2의 테스트 파일 제외
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    
    // 테스트 파일 제외
    config.module.rules.push({
      test: /\.test\.(js|ts|tsx)$/,
      use: 'ignore-loader',
    });
    
    // Deno 관련 모듈 제외
    config.resolve.fallback = {
      ...config.resolve.fallback,
      '@std/testing/mock': false,
      '@std/testing/bdd': false,
      '@gadicc/fetch-mock-cache/runtimes/deno.ts': false,
      '@gadicc/fetch-mock-cache/stores/fs.ts': false,
    };
    
    return config;
  },
}

module.exports = nextConfig

