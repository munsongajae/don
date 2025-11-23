// ... existing code ...
        // JPY/KRW 계산 (분석 탭과 동일한 데이터 소스 사용, currentRates 우선)
        // currentRates.investingJpy는 이미 100엔당으로 변환된 값
        let currentJpyKrw = data.currentRates.investingJpy || 0;
        if (currentJpyKrw === 0) {
          // Fallback: currentPrices 사용 (1엔당이므로 100을 곱해야 함)
          currentJpyKrw = currentPrices.JPY_KRW ? currentPrices.JPY_KRW * 100 : 0;
        }
        if (currentJpyKrw === 0) {
          // 추가 Fallback: USD_KRW와 USD_JPY로부터 계산 (1엔당이므로 100을 곱해야 함)
          const usdKrw = getCurrentPrice('USD_KRW');
          const usdJpy = getCurrentPrice('USD_JPY');
          if (usdKrw > 0 && usdJpy > 0) {
            currentJpyKrw = (usdKrw / usdJpy) * 100; // 1엔당을 100엔당으로 변환
          }
        }
        const jpyKrwHigh = Math.max(...((data.high.JPY_KRW || []).filter(v => v > 0)));
        const jpyKrwLow = Math.min(...((data.low.JPY_KRW || []).filter(v => v > 0)));
        // jpyKrwHigh와 jpyKrwLow는 1엔당이므로 100엔당으로 변환
        const jpyKrwMid = jpyKrwHigh > 0 && jpyKrwLow > 0 ? ((jpyKrwHigh + jpyKrwLow) / 2) * 100 : 0;

        // 지표 계산 (모든 값이 유효한 경우에만)
        // currentJpyKrw와 jpyKrwMid는 모두 100엔당으로 정규화됨
        if (currentDxy > 0 && dxyMid > 0 && currentUsdKrw > 0 && usdKrwMid > 0 && 
            currentJxy > 0 && jxyMid > 0 && currentJpyKrw > 0 && jpyKrwMid > 0) {
          const periodSignals = calculateIndicatorSignals(
            currentDxy,
            dxyMid,
            currentUsdKrw,
            usdKrwMid,
            currentJxy,
            jxyMid,
            currentJpyKrw,
            jpyKrwMid
          );
// ... existing code ...