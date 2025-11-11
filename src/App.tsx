import { useEffect } from 'react';
import { Tabs } from './components/Tabs';
import { ErrorMessage } from './components/ErrorMessage';
import { useExchangeRateStore } from './store/useExchangeRateStore';
import { useInvestmentStore } from './store/useInvestmentStore';
import { SummaryTab } from './pages/SummaryTab';
import { AnalysisTab } from './pages/AnalysisTab';
import { InvestmentTab } from './pages/InvestmentTab';
import { SellRecordsTab } from './pages/SellRecordsTab';

function App() {
  const { fetchCurrentRates, lastUpdated, error: exchangeError, clearError: clearExchangeError } = useExchangeRateStore();
  const {
    fetchDollarInvestments,
    fetchJpyInvestments,
    fetchDollarSellRecords,
    fetchJpySellRecords,
    error: investmentError,
    clearError: clearInvestmentError,
  } = useInvestmentStore();

  useEffect(() => {
    // 초기 데이터 로드
    const loadData = async () => {
      try {
        await fetchCurrentRates();
        await fetchDollarInvestments();
        await fetchJpyInvestments();
        await fetchDollarSellRecords();
        await fetchJpySellRecords();
      } catch (error) {
        console.error('초기 데이터 로드 실패:', error);
      }
    };
    
    loadData();

    // 5분마다 환율 데이터 갱신
    const interval = setInterval(() => {
      fetchCurrentRates().catch((error) => {
        console.error('환율 데이터 갱신 실패:', error);
      });
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const tabs = [
    {
      id: 'summary',
      label: '📊 종합',
      content: <SummaryTab />,
    },
    {
      id: 'analysis',
      label: '📈 분석',
      content: <AnalysisTab />,
    },
    {
      id: 'investment',
      label: '💰 투자',
      content: <InvestmentTab />,
    },
    {
      id: 'sell-records',
      label: '📋 매도',
      content: <SellRecordsTab />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <header className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-900">
              환율 투자 관리
            </h1>
            <div className="text-sm text-gray-500">
              {lastUpdated
                ? `마지막 업데이트: ${lastUpdated.toLocaleString('ko-KR')}`
                : '데이터 로딩 중...'}
            </div>
          </div>
        </header>

        {(exchangeError || investmentError) && (
          <div className="mb-4">
            {exchangeError && (
              <ErrorMessage
                message={exchangeError}
                onDismiss={clearExchangeError}
                onRetry={fetchCurrentRates}
              />
            )}
            {investmentError && (
              <ErrorMessage
                message={investmentError}
                onDismiss={clearInvestmentError}
              />
            )}
          </div>
        )}

        <Tabs tabs={tabs} defaultTab="summary" />

        <footer className="mt-12 text-center text-gray-500 text-sm py-5">
          <div>
            📊 데이터 출처: Yahoo Finance, 인베스팅닷컴, 빗썸
          </div>
          <div className="mt-2">
            🔄 업데이트: 5분마다 자동 갱신
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;

