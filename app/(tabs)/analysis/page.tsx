'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState } from 'react';
import { useExchangeRateStore } from '@/store/useExchangeRateStore';
import ProgressIndicator from '@/components/indicators/ProgressIndicator';
import TossChart from '@/components/charts/TossChart';
import { calculateDollarIndexSeries, calculateCurrentDxy, calculateJpyIndexSeries, calculateCurrentJxy, calculateIndicatorSignal } from '@/lib/utils/calculations';

export default function AnalysisPage() {
  const { currentRates, periodData, fetchPeriodData, loading } = useExchangeRateStore();
  const [currency, setCurrency] = useState<'dollar' | 'jpy'>('dollar');
  const [period, setPeriod] = useState<number>(12);
  const [analysisData, setAnalysisData] = useState<any>(null);

  useEffect(() => {
    fetchPeriodData(period);
  }, [period]);

  useEffect(() => {
    const data = periodData[period];
    if (!data || loading) {
      setAnalysisData(null);
      return;
    }

    try {
      if (currency === 'dollar') {
        // 달러 분석
        const dxySeries = calculateDollarIndexSeries(data.close);
        if (!dxySeries || dxySeries.length === 0) {
          console.warn('DXY 시리즈 데이터가 없습니다.');
          setAnalysisData(null);
          return;
        }

        // 원본과 동일: currentPrices에서 현재 가격 가져오기
        const currentPrices = data.currentPrices || {};
        const currentDxy = calculateCurrentDxy({
          EUR_USD: currentPrices.EUR_USD || 0,
          USD_JPY: currentPrices.USD_JPY || 0,
          GBP_USD: currentPrices.GBP_USD || 0,
          USD_CAD: currentPrices.USD_CAD || 0,
          USD_SEK: currentPrices.USD_SEK || 0,
          USD_CHF: currentPrices.USD_CHF || 0,
        });

        if (currentDxy === 0) {
          console.warn('DXY 현재값 계산 실패. currentPrices:', currentPrices);
          setAnalysisData(null);
          return;
        }

        const dxyHigh = Math.max(...dxySeries);
        const dxyLow = Math.min(...dxySeries);
        const dxyMid = (dxyHigh + dxyLow) / 2;
        const dxySignal = calculateIndicatorSignal(currentDxy, dxyMid, true);

        const usdKrwHighArray = data.high.USD_KRW || [];
        const usdKrwLowArray = data.low.USD_KRW || [];
        
        if (usdKrwHighArray.length === 0 || usdKrwLowArray.length === 0) {
          console.warn('USD/KRW 데이터가 없습니다.');
          setAnalysisData(null);
          return;
        }

        const usdKrwHigh = Math.max(...usdKrwHighArray);
        const usdKrwLow = Math.min(...usdKrwHighArray);
        const usdKrwMid = (usdKrwHigh + usdKrwLow) / 2;
        // 종합 탭과 동일한 데이터 소스 사용 (currentRates 우선)
        const currentUsdKrw = data.currentRates.investingUsd || data.currentRates.hanaRate || currentPrices.USD_KRW || 0;

        if (currentUsdKrw === 0 || usdKrwMid === 0) {
          console.warn('USD/KRW 현재값 또는 중간값이 0입니다.', {
            currentUsdKrw,
            usdKrwMid,
            currentPrices,
            currentRates: data.currentRates,
          });
          setAnalysisData(null);
          return;
        }

        const usdKrwSignal = calculateIndicatorSignal(currentUsdKrw, usdKrwMid, true);

        // 원본과 동일: 갭 비율 계산
        const currentGapRatio = (currentDxy / currentUsdKrw) * 100;
        const midGapRatio = (dxyMid / usdKrwMid) * 100;
        const gapRatioSignal = calculateIndicatorSignal(currentGapRatio, midGapRatio, false);

        // 원본과 동일: 적정 환율 계산
        const fairExchangeRate = (currentDxy / midGapRatio) * 100;
        const fairRateSignal = calculateIndicatorSignal(currentUsdKrw, fairExchangeRate, true);

        // 차트 데이터 (원본과 동일: dates와 시리즈 매핑)
        const dxyChartData = data.dates.map((date: string, i: number) => ({
          date,
          value: dxySeries[i] || 0,
        })).filter(item => item.value > 0);

        const usdKrwChartData = data.dates.map((date: string, i: number) => ({
          date,
          value: (data.close.USD_KRW || [])[i] || 0,
        })).filter(item => item.value > 0);

        setAnalysisData({
          dxy: {
            current: currentDxy,
            high: dxyHigh,
            low: dxyLow,
            mid: dxyMid,
            signal: dxySignal,
            series: dxySeries,
          },
          usdKrw: {
            current: currentUsdKrw,
            high: usdKrwHigh,
            low: usdKrwLow,
            mid: usdKrwMid,
            signal: usdKrwSignal,
            series: data.close.USD_KRW || [],
          },
          gapRatio: {
            current: currentGapRatio,
            mid: midGapRatio,
            signal: gapRatioSignal,
          },
          fairRate: {
            current: currentUsdKrw,
            fair: fairExchangeRate,
            signal: fairRateSignal,
          },
          dates: data.dates,
        });
      } else {
        // 엔화 분석
        const currentPrices = data.currentPrices || {};
        
        // JXY 계산 (원본과 동일: USD/JPY 역수 × 100)
        const jxySeries = calculateJpyIndexSeries(data.close);
        if (jxySeries.length === 0) {
          console.warn('JXY 시리즈 데이터가 없습니다.');
          setAnalysisData(null);
          return;
        }

        const jxyHigh = Math.max(...jxySeries);
        const jxyLow = Math.min(...jxySeries);
        const jxyMid = (jxyHigh + jxyLow) / 2;
        const currentJxy = currentPrices.JXY || calculateCurrentJxy(currentPrices.USD_JPY || 0);
        
        if (currentJxy === 0) {
          console.warn('JXY 현재값 계산 실패. currentPrices:', currentPrices);
          setAnalysisData(null);
          return;
        }

        const jxySignal = calculateIndicatorSignal(currentJxy, jxyMid, true);

        const jpyKrwHighArray = (data.high.JPY_KRW || []).filter(v => v > 0);
        const jpyKrwLowArray = (data.low.JPY_KRW || []).filter(v => v > 0);
        
        if (jpyKrwHighArray.length === 0 || jpyKrwLowArray.length === 0) {
          console.warn('JPY/KRW 데이터가 없습니다.');
          setAnalysisData(null);
          return;
        }

        const jpyKrwHigh = Math.max(...jpyKrwHighArray);
        const jpyKrwLow = Math.min(...jpyKrwLowArray);
        const jpyKrwMid = (jpyKrwHigh + jpyKrwLow) / 2;
        // 종합 탭과 동일한 데이터 소스 사용 (currentRates 우선)
        // currentRates.investingJpy는 이미 100엔당으로 변환된 값
        // currentPrices.JPY_KRW는 1엔당이므로 100을 곱해야 함
        let currentJpyKrw = data.currentRates.investingJpy || 0;
        if (currentJpyKrw === 0 && currentPrices.JPY_KRW) {
          currentJpyKrw = currentPrices.JPY_KRW * 100; // 1엔당을 100엔당으로 변환
        }

        // jpyKrwMid는 1엔당이므로 100엔당으로 변환
        const jpyKrwMid100 = jpyKrwMid * 100;

        if (currentJpyKrw === 0 || jpyKrwMid === 0) {
          console.warn('JPY/KRW 현재값 또는 중간값이 0입니다.', {
            currentJpyKrw,
            jpyKrwMid,
            currentPrices,
            currentRates: data.currentRates,
          });
          setAnalysisData(null);
          return;
        }

        const jpyKrwSignal = calculateIndicatorSignal(currentJpyKrw, jpyKrwMid100, true);

        // 원본과 동일: 엔화 갭 비율 (100엔당 기준)
        const currentJpyGapRatio = (currentJxy * 100) / currentJpyKrw;
        const midJpyGapRatio = (jxyMid * 100) / jpyKrwMid100;
        const jpyGapRatioSignal = calculateIndicatorSignal(currentJpyGapRatio, midJpyGapRatio, false);

        // 원본과 동일: 엔화 적정 환율 (100엔당 기준)
        const midJpyGapRatioRaw = (jxyMid * 100) / jpyKrwMid100;
        const jpyFairExchangeRate = (currentJxy * 100) / midJpyGapRatioRaw;
        const jpyFairRateSignal = calculateIndicatorSignal(currentJpyKrw, jpyFairExchangeRate, true);

        // 차트 데이터 (원본과 동일: dates와 시리즈 매핑, 100엔당으로 변환)
        const jpyKrwChartData = data.dates.map((date: string, i: number) => ({
          date,
          value: ((data.close.JPY_KRW || [])[i] || 0) * 100, // 100엔당으로 변환
        })).filter(item => item.value > 0);

        setAnalysisData({
          jxy: {
            current: currentJxy,
            high: jxyHigh,
            low: jxyLow,
            mid: jxyMid,
            signal: jxySignal,
            series: jxySeries,
          },
          jpyKrw: {
            current: currentJpyKrw, // 이미 100엔당
            high: jpyKrwHigh * 100, // 1엔당을 100엔당으로 변환
            low: jpyKrwLow * 100, // 1엔당을 100엔당으로 변환
            mid: jpyKrwMid100, // 이미 변환됨
            signal: jpyKrwSignal,
            series: (data.close.JPY_KRW || []).map(v => v * 100), // 100엔당
          },
          jpyGapRatio: {
            current: currentJpyGapRatio,
            mid: midJpyGapRatio,
            signal: jpyGapRatioSignal,
          },
          jpyFairRate: {
            current: currentJpyKrw, // 이미 100엔당
            fair: jpyFairExchangeRate,
            signal: jpyFairRateSignal,
          },
          dates: data.dates,
        });
      }
    } catch (error) {
      console.error('분석 데이터 계산 실패:', error);
    }
  }, [periodData, period, currency, loading]);

  if (loading || !analysisData) {
    return (
      <div className="space-y-6 animate-fade-in">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">분석</h1>
        <div className="text-center text-gray-500 py-8">데이터 로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in pb-6">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">분석</h1>

      {/* 통화 선택 */}
      <div className="flex gap-3 sm:gap-4 mb-4 sm:mb-6">
        <button
          onClick={() => setCurrency('dollar')}
          className={`flex-1 px-4 py-3.5 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-all touch-manipulation min-h-[48px] ${
            currency === 'dollar'
              ? 'bg-toss-blue-500 text-white shadow-lg scale-100'
              : 'bg-white text-gray-700 border border-gray-300 active:scale-95'
          }`}
        >
          💵 달러
        </button>
        <button
          onClick={() => setCurrency('jpy')}
          className={`flex-1 px-4 py-3.5 sm:py-4 rounded-xl font-semibold text-base sm:text-lg transition-all touch-manipulation min-h-[48px] ${
            currency === 'jpy'
              ? 'bg-toss-blue-500 text-white shadow-lg scale-100'
              : 'bg-white text-gray-700 border border-gray-300 active:scale-95'
          }`}
        >
          💴 엔화
        </button>
      </div>

      {/* 기간 선택 */}
      <div className="flex gap-2 sm:gap-3 mb-4 sm:mb-6 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {[1, 3, 6, 12].map((p) => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-medium text-sm sm:text-base transition-all touch-manipulation whitespace-nowrap min-h-[44px] flex-shrink-0 ${
              period === p
                ? 'bg-toss-blue-500 text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-300 active:scale-95'
            }`}
          >
            {p === 12 ? '1년' : `${p}개월`}
          </button>
        ))}
      </div>

      {currency === 'dollar' ? (
        <>
          {/* 달러 지표 */}
          {analysisData.dxy && (
            <ProgressIndicator
              title="💵 달러지수 (DXY)"
              current={analysisData.dxy.current}
              high={analysisData.dxy.high}
              low={analysisData.dxy.low}
              mid={analysisData.dxy.mid}
              signal={analysisData.dxy.signal}
              reverseLogic={true}
            />
          )}

          {analysisData.usdKrw && (
            <ProgressIndicator
              title="💵 달러환율 (USD/KRW)"
              current={analysisData.usdKrw.current}
              high={analysisData.usdKrw.high}
              low={analysisData.usdKrw.low}
              mid={analysisData.usdKrw.mid}
              signal={analysisData.usdKrw.signal}
              reverseLogic={true}
              unit="원"
            />
          )}

          {analysisData.gapRatio && (
            <ProgressIndicator
              title="📊 달러 갭 비율"
              current={analysisData.gapRatio.current}
              high={analysisData.gapRatio.mid * 1.2}
              low={analysisData.gapRatio.mid * 0.8}
              mid={analysisData.gapRatio.mid}
              signal={analysisData.gapRatio.signal}
              hideHighLow={true}
            />
          )}

          {analysisData.fairRate && (
            <ProgressIndicator
              title="💰 적정 환율"
              current={analysisData.fairRate.current}
              high={analysisData.fairRate.fair * 1.1}
              low={analysisData.fairRate.fair * 0.9}
              mid={analysisData.fairRate.fair}
              signal={analysisData.fairRate.signal}
              reverseLogic={true}
              hideHighLow={true}
              unit="원"
            />
          )}

          {/* 차트 */}
          {analysisData.dates && analysisData.dxy && (
            <TossChart
              title={`💵 달러지수 (DXY) ${period === 12 ? '1년' : `${period}개월`} 추이`}
              data={analysisData.dates.map((date: string, i: number) => ({
                date,
                value: analysisData.dxy.series[i] || 0,
              })).filter((item: { date: string; value: number }) => item.value > 0)}
              currentValue={analysisData.dxy.current}
              highValue={analysisData.dxy.high}
              lowValue={analysisData.dxy.low}
              midValue={analysisData.dxy.mid}
              yAxisLabel=""
              yAxisDecimals={2}
            />
          )}

          {analysisData.dates && analysisData.usdKrw && (
            <TossChart
              title={`💵 달러환율 (USD/KRW) ${period === 12 ? '1년' : `${period}개월`} 추이`}
              data={analysisData.dates.map((date: string, i: number) => ({
                date,
                value: analysisData.usdKrw.series[i] || 0,
              })).filter((item: { date: string; value: number }) => item.value > 0)}
              currentValue={analysisData.usdKrw.current}
              highValue={analysisData.usdKrw.high}
              lowValue={analysisData.usdKrw.low}
              midValue={analysisData.usdKrw.mid}
              yAxisLabel="원"
              yAxisDecimals={2}
            />
          )}
        </>
      ) : (
        <>
          {/* 엔화 지표 */}
          {analysisData.jxy && (
            <ProgressIndicator
              title="💴 엔화지수 (JXY)"
              current={analysisData.jxy.current}
              high={analysisData.jxy.high}
              low={analysisData.jxy.low}
              mid={analysisData.jxy.mid}
              signal={analysisData.jxy.signal}
              reverseLogic={true}
            />
          )}

          {analysisData.jpyKrw && (
            <ProgressIndicator
              title="💴 엔화환율 (JPY/KRW, 100엔당)"
              current={analysisData.jpyKrw.current}
              high={analysisData.jpyKrw.high}
              low={analysisData.jpyKrw.low}
              mid={analysisData.jpyKrw.mid}
              signal={analysisData.jpyKrw.signal}
              reverseLogic={true}
              unit="원"
            />
          )}

          {analysisData.jpyGapRatio && (
            <ProgressIndicator
              title="📊 엔화 갭 비율"
              current={analysisData.jpyGapRatio.current}
              high={analysisData.jpyGapRatio.mid * 1.2}
              low={analysisData.jpyGapRatio.mid * 0.8}
              mid={analysisData.jpyGapRatio.mid}
              signal={analysisData.jpyGapRatio.signal}
              hideHighLow
            />
          )}

          {analysisData.jpyFairRate && (
            <ProgressIndicator
              title="💰 적정 환율"
              current={analysisData.jpyFairRate.current}
              high={analysisData.jpyFairRate.fair * 1.1}
              low={analysisData.jpyFairRate.fair * 0.9}
              mid={analysisData.jpyFairRate.fair}
              signal={analysisData.jpyFairRate.signal}
              reverseLogic={true}
              hideHighLow
              unit="원"
            />
          )}

          {/* 차트 */}
          {analysisData.dates && analysisData.jxy && (
            <TossChart
              title={`💴 엔화지수 (JXY) ${period === 12 ? '1년' : `${period}개월`} 추이`}
              data={analysisData.dates.map((date: string, i: number) => ({
                date,
                value: analysisData.jxy.series[i] || 0,
              })).filter((item: { date: string; value: number }) => item.value > 0)}
              currentValue={analysisData.jxy.current}
              highValue={analysisData.jxy.high}
              lowValue={analysisData.jxy.low}
              midValue={analysisData.jxy.mid}
              yAxisLabel=""
              yAxisDecimals={4}
            />
          )}

          {analysisData.dates && analysisData.jpyKrw && (
            <TossChart
              title={`💴 엔화환율 (JPY/KRW, 100엔당) ${period === 12 ? '1년' : `${period}개월`} 추이`}
              data={analysisData.dates.map((date: string, i: number) => ({
                date,
                value: analysisData.jpyKrw.series[i] || 0,
              })).filter((item: { date: string; value: number }) => item.value > 0)}
              currentValue={analysisData.jpyKrw.current}
              highValue={analysisData.jpyKrw.high}
              lowValue={analysisData.jpyKrw.low}
              midValue={analysisData.jpyKrw.mid}
              yAxisLabel="원"
              yAxisDecimals={4}
            />
          )}
        </>
      )}
    </div>
  );
}
