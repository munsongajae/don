/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Fly.io 배포를 위한 standalone 모드 (Docker 이미지 크기 최적화)
  // 오라클 클라우드 배포 시에도 사용 가능
  output: process.env.FLY_DEPLOY || process.env.ORACLE_CLOUD_DEPLOY ? 'standalone' : undefined,
  images: {
    domains: [],
    unoptimized: true, // Capacitor를 위해 이미지 최적화 비활성화
  },
  // 안드로이드 빌드용: 환경 변수로 제어
  // 주의: output: 'export'를 사용하면 동적 API Routes가 작동하지 않습니다
  // 개발 모드에서는 이 옵션을 비활성화하고 Next.js 개발 서버를 사용하세요
  // ...(process.env.NEXT_CONFIG === 'apk' && { output: 'export' }),
  
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
