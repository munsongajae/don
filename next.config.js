/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
  },
  // yahoo-finance2를 서버 사이드 전용 패키지로 설정
  serverExternalPackages: ['yahoo-finance2'],
  
  webpack: (config, { isServer }) => {
    // 클라이언트 사이드에서 Node.js 모듈 완전 제외
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        'yahoo-finance2': false,
      };
      
      // 클라이언트 번들에서 yahoo-finance2 완전 제외
      config.resolve.alias = {
        ...config.resolve.alias,
        'yahoo-finance2': false,
      };
    }
    
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

