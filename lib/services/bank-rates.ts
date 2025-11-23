// ... existing code ...
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // 첫 시도 전에도 약간의 랜덤 딜레이 (0.5~1.5초) - Cloudflare 우회를 위해
      if (attempt === 1) {
        const initialDelay = 500 + Math.random() * 1000; // 0.5~1.5초 랜덤
        await new Promise(resolve => setTimeout(resolve, initialDelay));
      } else {
        // 재시도 간 딜레이 증가 (3초, 5초, 8초)
        const delay = 2000 + (attempt - 1) * 2000; // 3초, 5초, 8초
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      const response = await axios.get(url, { 
        headers, 
        timeout: 10000, // Vercel 무료 플랜 제한을 고려하여 10초로 설정
        // Cloudflare 우회를 위한 추가 옵션
        maxRedirects: 5,
        validateStatus: (status) => status < 500, // 5xx 에러만 throw
      });
// ... existing code ...