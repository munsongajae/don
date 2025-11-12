/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export', // 정적 내보내기 (APK 빌드용)
  images: {
    domains: [],
    unoptimized: true, // Capacitor를 위해 이미지 최적화 비활성화
  },
  // API Routes는 정적 빌드에서 사용할 수 없으므로 제외
  // 대신 Netlify 배포 URL을 사용해야 함
  
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

