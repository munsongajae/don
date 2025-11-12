'use client';

import { useState } from 'react';
import TossCard from '@/components/ui/TossCard';
import TossButton from '@/components/ui/TossButton';
import { formatKrw } from '@/lib/utils/formatters';

interface InvestmentFormProps {
  currency: 'dollar' | 'jpy';
  currentRate: number;
  onSubmit: (data: {
    amount: number;
    exchangeRate: number;
    purchaseKrw: number;
    purchaseDate: string;
    exchangeName: string;
    investmentNumber?: number;
  }) => Promise<void>;
  onCancel: () => void;
}

export default function InvestmentForm({
  currency,
  currentRate,
  onSubmit,
  onCancel,
}: InvestmentFormProps) {
  const [amount, setAmount] = useState('');
  const [exchangeRate, setExchangeRate] = useState(currentRate.toString());
  const [purchaseDate, setPurchaseDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [exchangeName, setExchangeName] = useState('');
  const [investmentNumber, setInvestmentNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 주요 은행 목록
  const bankList = [
    '하나은행',
    'KB국민은행',
    '신한은행',
    '우리은행',
    'NH농협은행',
    'IBK기업은행',
    '카카오뱅크',
    '토스뱅크',
    '새마을금고',
    '신협',
  ];
  
  // 주요 증권사 목록
  const securitiesList = [
    '미래에셋증권',
    '삼성증권',
    'KB증권',
    'NH투자증권',
    '키움증권',
    '하나증권',
    '신한투자증권',
    '대신증권',
    '교보증권',
    '한국투자증권',
    '유안타증권',
    '메리츠증권',
    'SK증권',
    '한화투자증권',
    'DB금융투자',
    'IBK투자증권',
  ];
  
  // 전체 거래처 목록 (은행 + 증권사)
  const allExchangeList = [
    ...bankList.map(bank => ({ category: '은행', name: bank })),
    ...securitiesList.map(securities => ({ category: '증권사', name: securities })),
    { category: '기타', name: '기타' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amountNum = parseFloat(amount);
    const rateNum = parseFloat(exchangeRate);
    
    if (!amountNum || amountNum <= 0) {
      alert('금액을 입력해주세요.');
      return;
    }
    
    if (!rateNum || rateNum <= 0) {
      alert('환율을 입력해주세요.');
      return;
    }
    
    if (!exchangeName || exchangeName.trim() === '') {
      alert('거래처(은행)를 선택해주세요.');
      return;
    }
    
    // 엔화의 경우 환율이 100엔당 원화이므로 계산 방식이 다름
    const purchaseKrw = currency === 'jpy' 
      ? (amountNum * rateNum) / 100  // JPY: (엔화금액 * 100엔당환율) / 100
      : amountNum * rateNum;         // USD: 달러금액 * 환율
    
    setIsSubmitting(true);
    try {
      await onSubmit({
        amount: amountNum,
        exchangeRate: rateNum,
        purchaseKrw,
        purchaseDate,
        exchangeName: exchangeName.trim(),
        investmentNumber: investmentNumber ? parseInt(investmentNumber, 10) : undefined,
      });
      // 폼 초기화
      setAmount('');
      setExchangeRate(currentRate.toString());
      setPurchaseDate(new Date().toISOString().split('T')[0]);
      setExchangeName('');
      setInvestmentNumber('');
    } catch (error) {
      console.error('투자 등록 실패:', error);
      alert('투자 등록에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 엔화의 경우 환율이 100엔당 원화이므로 계산 방식이 다름
  const purchaseKrw = currency === 'jpy'
    ? (parseFloat(amount) * parseFloat(exchangeRate)) / 100 || 0
    : parseFloat(amount) * parseFloat(exchangeRate) || 0;

  return (
    <TossCard>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {currency === 'dollar' ? '💵 달러' : '💴 엔화'} 투자 등록
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            투자 번호 (선택사항)
          </label>
          <input
            type="number"
            step="1"
            min="1"
            value={investmentNumber}
            onChange={(e) => setInvestmentNumber(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-toss-blue-500 focus:border-transparent"
            placeholder="자동 생성 (비워두면 자동으로 번호가 생성됩니다)"
          />
          <p className="text-xs text-gray-500 mt-1">
            번호를 입력하지 않으면 자동으로 생성됩니다.
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {currency === 'dollar' ? '달러 금액 (USD)' : '엔화 금액 (JPY)'}
          </label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-toss-blue-500 focus:border-transparent"
            placeholder="0"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            환율 ({currency === 'dollar' ? 'USD/KRW' : 'JPY/KRW'})
          </label>
          <input
            type="number"
            step="0.01"
            value={exchangeRate}
            onChange={(e) => setExchangeRate(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-toss-blue-500 focus:border-transparent"
            placeholder={currentRate.toString()}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            현재 환율: {currentRate.toLocaleString()}
            {currency === 'jpy' && ' (100엔당)'}
          </p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            매수 일자
          </label>
          <input
            type="date"
            value={purchaseDate}
            onChange={(e) => setPurchaseDate(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-toss-blue-500 focus:border-transparent"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            거래처 (은행/증권사)
          </label>
          <select
            value={exchangeName === '기타' ? '기타' : exchangeName}
            onChange={(e) => {
              if (e.target.value === '기타') {
                setExchangeName('기타');
              } else {
                setExchangeName(e.target.value);
              }
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-toss-blue-500 focus:border-transparent"
            required={exchangeName !== '기타'}
          >
            <option value="">선택해주세요</option>
            <optgroup label="은행">
              {bankList.map((bank) => (
                <option key={bank} value={bank}>
                  {bank}
                </option>
              ))}
            </optgroup>
            <optgroup label="증권사">
              {securitiesList.map((securities) => (
                <option key={securities} value={securities}>
                  {securities}
                </option>
              ))}
            </optgroup>
            <option value="기타">기타</option>
          </select>
          {exchangeName === '기타' && (
            <input
              type="text"
              value=""
              onChange={(e) => setExchangeName(e.target.value)}
              placeholder="거래처를 입력해주세요"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-toss-blue-500 focus:border-transparent mt-2"
              required
              autoFocus
            />
          )}
        </div>
        
        {purchaseKrw > 0 && (
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">매수 금액</span>
              <span className="text-lg font-bold text-gray-900">
                {formatKrw(purchaseKrw)}
              </span>
            </div>
          </div>
        )}
        
        <div className="flex gap-3">
          <TossButton
            type="submit"
            variant="primary"
            fullWidth
            disabled={isSubmitting}
          >
            {isSubmitting ? '등록 중...' : '등록하기'}
          </TossButton>
          <TossButton
            type="button"
            variant="outline"
            fullWidth
            onClick={onCancel}
          >
            취소
          </TossButton>
        </div>
      </form>
    </TossCard>
  );
}

