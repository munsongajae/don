import axios from 'axios';
import * as cheerio from 'cheerio';

interface RateData {
  bank: string;
  rate: number;
  time: string;
  date: string;
  currency: string;
  round?: string;
}

/**
 * 시간 문자열을 HH:MM:SS 형식으로 통일합니다.
 */
function normalizeTime(timeStr: string | null | undefined): string {
  if (!timeStr) {
    return '';
  }

  // 날짜가 포함된 경우 제거
  let cleaned = timeStr
    .replace(/\d{4}\.\d{2}\.\d{2}\s+/g, '')
    .replace(/\d{4}-\d{2}-\d{2}\s+/g, '')
    .replace(/\d{4}\/\d{2}\/\d{2}\s+/g, '');

  // 한글 형식 변환 (예: "22시06분00초" → "22:06:00")
  const hanMatch = cleaned.match(/(\d{1,2})시\s*(\d{1,2})분\s*(\d{1,2})초/);
  if (hanMatch) {
    const [, h, m, s] = hanMatch;
    return `${parseInt(h).toString().padStart(2, '0')}:${m}:${s}`;
  }

  // HH:MM:SS 형식 추출
  const timeMatch = cleaned.match(/(\d{1,2}):(\d{2}):(\d{2})/);
  if (timeMatch) {
    const [, h, m, s] = timeMatch;
    return `${parseInt(h).toString().padStart(2, '0')}:${m}:${s}`;
  }

  // HH:MM 형식 추출
  const timeMatch2 = cleaned.match(/(\d{1,2}):(\d{2})/);
  if (timeMatch2) {
    const [, h, m] = timeMatch2;
    return `${parseInt(h).toString().padStart(2, '0')}:${m}:00`;
  }

  return cleaned.trim();
}

/**
 * 날짜가 주말인지 확인
 */
function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 = 일요일, 6 = 토요일
}

/**
 * 날짜를 YYYYMMDD 형식으로 변환
 */
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * 국민은행 환율 조회
 */
async function getKbRate(currency: string = 'USD'): Promise<RateData | null> {
  const baseUrl = 'https://obiz.kbstar.com/quics';
  const upperCurrency = currency.toUpperCase();

  for (let daysBack = 0; daysBack < 10; daysBack++) {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - daysBack);
    
    // 주말 건너뛰기
    if (isWeekend(targetDate)) {
      continue;
    }
    
    const dateStr = formatDate(targetDate);

    const headers = {
      'Accept': 'text/html, */*; q=0.01',
      'Accept-Language': 'ko-KR,ko;q=0.9',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    };

    const data = new URLSearchParams({
      'btnClick': 'Y',
      'DocType': '1',
      '고시회차기준': '1',
      '고시종류기준': '0',
      '조회기준': '1',
      '요청페이지': '1',
      'monyCd': upperCurrency,
      'selDate': dateStr,
      'SEL_통화구분': upperCurrency,
      '조회일자구분': '1',
      'searchDate': dateStr,
      'startDate': dateStr,
      'endDate': dateStr,
      '고시회차선택': '1',
      '고시종류선택': '0',
    });

    try {
      const response = await axios.post(
        `${baseUrl}?chgCompId=b102864&baseCompId=b102864&page=C101597&cc=b102864:b102864`,
        data,
        { headers, timeout: 10000 }
      );

      if (response.status !== 200) continue;

      const $ = cheerio.load(response.data);
      const tables = $('table');

      for (let i = 0; i < tables.length; i++) {
        const rows = $(tables[i]).find('tr');

        for (let j = 0; j < rows.length; j++) {
          const cells = $(rows[j]).find('td');
          if (cells.length >= 7) {
            const cellTexts = cells.map((_, el) => $(el).text().trim()).get();

            if (cellTexts[0] && /^\d+$/.test(cellTexts[0])) {
              const rateTime = cellTexts[1] || '';
              const rateStr = cellTexts[2] || '';

              if (rateStr) {
                try {
                  const rate = parseFloat(rateStr.replace(/,/g, ''));

                  return {
                    bank: 'KB',
                    rate,
                    time: normalizeTime(rateTime),
                    date: dateStr,
                    currency: upperCurrency,
                  };
                } catch {
                  continue;
                }
              }
            }
          }
        }
      }
    } catch {
      continue;
    }
  }

  return null;
}

/**
 * 신한은행 환율 조회
 */
async function getShinhanRate(currency: string = 'USD'): Promise<RateData | null> {
  const baseUrl = 'https://bank.shinhan.com/serviceEndpoint/httpDigital';
  const upperCurrency = currency.toUpperCase();

  for (let daysBack = 0; daysBack < 10; daysBack++) {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - daysBack);
    
    // 주말 건너뛰기
    if (isWeekend(targetDate)) {
      continue;
    }
    
    const dateStr = formatDate(targetDate);

    const headers = {
      'Accept': 'application/json',
      'Accept-Language': 'ko-KR,ko;q=0.9',
      'Content-Type': 'application/json; charset="UTF-8"',
      'Origin': 'https://bank.shinhan.com',
      'Referer': 'https://bank.shinhan.com/index.jsp',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'submissionid': 'sbm_F3730',
    };

    const data = {
      dataBody: {
        ricInptRootInfo: {
          serviceType: 'GU',
          serviceCode: 'F3730',
          language: 'ko',
          webUri: '/index.jsp',
          isRule: 'N',
        },
        '조회구분': '',
        '조회일자': dateStr,
        '고시회차': 0,
        '조회일자_display': '',
        startPoint: '',
        endPoint: '',
      },
      dataHeader: {
        trxCd: 'RSHRC0213A01',
        language: 'ko',
        subChannel: '49',
        channelGbn: 'D0',
      },
    };

    try {
      const response = await axios.post(baseUrl, data, { headers, timeout: 10000 });

      if (response.status !== 200) continue;

      const result = response.data;

      if (result.dataBody) {
        const dataBody = result.dataBody;
        const actualRound = dataBody['고시회차'] || '';

        let rateTime = dataBody['고시시간_display'] || '';
        if (!rateTime) {
          rateTime = dataBody['고시시간'] || '';
          if (rateTime && rateTime.length === 6) {
            rateTime = `${rateTime.slice(0, 2)}:${rateTime.slice(2, 4)}:${rateTime.slice(4, 6)}`;
          }
        }
        if (!rateTime) {
          rateTime = actualRound ? `회차 ${actualRound}` : '';
        }

        if (dataBody.R_RIBF3730_1) {
          const exrtList = dataBody.R_RIBF3730_1;

          for (const item of exrtList) {
            const currencyCode = (item['통화CODE'] || '').toUpperCase();

            if (currencyCode === upperCurrency) {
              let rate = item['매매기준환율'] || 0;
              if (typeof rate === 'string') {
                rate = parseFloat(rate.replace(/,/g, ''));
              }

              return {
                bank: 'SHINHAN',
                rate,
                time: normalizeTime(rateTime),
                date: dateStr,
                currency: upperCurrency,
                round: actualRound,
              };
            }
          }
        }
      }
    } catch {
      continue;
    }
  }

  return null;
}

/**
 * 하나은행 환율 조회
 */
async function getHanaRate(currency: string = 'USD'): Promise<RateData | null> {
  const url = 'https://www.kebhana.com/cms/rate/wpfxd651_01i_01.do';
  const upperCurrency = currency.toUpperCase();
  const currencyDisplay = upperCurrency === 'JPY' ? `${upperCurrency} (100)` : upperCurrency;

  for (let daysBack = 0; daysBack < 10; daysBack++) {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - daysBack);
    
    // 주말 건너뛰기
    if (isWeekend(targetDate)) {
      continue;
    }
    
    const dateStr = formatDate(targetDate);
    const tmpDate = `${targetDate.getFullYear()}-${(targetDate.getMonth() + 1).toString().padStart(2, '0')}-${targetDate.getDate().toString().padStart(2, '0')}`;

    const headers = {
      'Accept': 'text/javascript, text/html, application/xml, text/xml, */*',
      'Accept-Language': 'ko-KR,ko;q=0.9',
      'Content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Origin': 'https://www.kebhana.com',
      'Referer': 'https://www.kebhana.com/cms/rate/index.do?contentUrl=/cms/rate/wpfxd651_01i.do',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'X-Requested-With': 'XMLHttpRequest',
    };

    const data = new URLSearchParams({
      'ajax': 'true',
      'curCd': '',
      'tmpInqStrDt': tmpDate,
      'pbldDvCd': '3',
      'pbldSqn': '',
      'hid_key_data': '',
      'inqStrDt': dateStr,
      'inqKindCd': '1',
      'hid_enc_data': '',
      'requestTarget': 'searchContentDiv',
    });

    try {
      const response = await axios.post(url, data, { headers, timeout: 10000 });

      if (response.status !== 200) continue;

      const $ = cheerio.load(response.data);

      // 고시 시간 추출
      let rateTime = '';
      const timeSpans = $('strong');
      for (let i = 0; i < timeSpans.length; i++) {
        const text = $(timeSpans[i]).text().trim();
        if (text.includes('시') && text.includes('분') && text.includes('초')) {
          rateTime = text;
          break;
        }
      }

      // 테이블에서 환율 정보 추출
      const tables = $('table');

      for (let i = 0; i < tables.length; i++) {
        const rows = $(tables[i]).find('tr');

        for (let j = 0; j < rows.length; j++) {
          const cells = $(rows[j]).find('td');
          if (cells.length >= 9) {
            const cellTexts = cells.map((_, el) => $(el).text().trim()).get();
            const currencyCell = cellTexts[0];

            if ((upperCurrency === 'USD' && currencyCell.includes('USD')) ||
                (upperCurrency === 'JPY' && (currencyCell.includes('JPY') || currencyCell.includes(currencyDisplay)))) {
              const rateStr = cellTexts[8] || '';

              if (rateStr && rateStr !== '0.00') {
                try {
                  const rate = parseFloat(rateStr.replace(/,/g, ''));

                  return {
                    bank: 'HANA',
                    rate,
                    time: normalizeTime(rateTime),
                    date: dateStr,
                    currency: upperCurrency,
                  };
                } catch {
                  continue;
                }
              }
            }
          }
        }
      }
    } catch {
      continue;
    }
  }

  return null;
}

/**
 * 우리은행 환율 조회 (mibank.me)
 */
async function getWooriRate(currency: string = 'USD'): Promise<RateData | null> {
  const url = 'https://www.mibank.me/exchange/bank/index.php?search_code=020'; // 020 = 우리은행
  const upperCurrency = currency.toUpperCase();
  const dateStr = formatDate(new Date());

  const headers = {
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
    'referer': 'https://www.mibank.me/exchange/bank/index.php?search_code=011',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
  };

  try {
    const response = await axios.get(url, { headers, timeout: 10000 });

    if (response.status !== 200) return null;

    const $ = cheerio.load(response.data);
    const allText = $('body').text();

    // 고시 시간 추출
    let rateTime = '';
    const timeMatch = allText.match(/(\d{4}\.\d{2}\.\d{2})\s+(\d{1,2}:\d{2})\s+기준/);
    if (timeMatch) {
      rateTime = `${timeMatch[2]}:00`;
    }

    // 테이블에서 환율 정보 추출
    const tables = $('table');

    for (let i = 0; i < tables.length; i++) {
      const rows = $(tables[i]).find('tr');

      for (let j = 0; j < rows.length; j++) {
        const cells = $(rows[j]).find('td, th');
        if (cells.length >= 9) {
          const cellTexts = cells.map((_, el) => $(el).text().trim()).get();

          if (cellTexts.length >= 2) {
            const countryCell = cellTexts[1];
            const rateStr = cellTexts[cellTexts.length - 1] || '';

            const currencyMatch =
              (upperCurrency === 'USD' && (countryCell.includes('미국') || countryCell.toUpperCase().includes('USD'))) ||
              (upperCurrency === 'JPY' && (countryCell.includes('일본') || countryCell.toUpperCase().includes('JPY') || countryCell.includes('엔')));

            if (currencyMatch && rateStr) {
              try {
                const rate = parseFloat(rateStr.replace(/,/g, ''));

                if (rate && rate > 0) {
                  return {
                    bank: 'WOORI',
                    rate,
                    time: normalizeTime(rateTime),
                    date: dateStr,
                    currency: upperCurrency,
                  };
                }
              } catch {
                continue;
              }
            }
          }
        }
      }
    }
  } catch {
    // Ignore errors
  }

  return null;
}

/**
 * 기업은행 환율 조회
 */
async function getIbkRate(currency: string = 'USD'): Promise<RateData | null> {
  const url = 'https://www.ibk.co.kr/fxtr/excRateList.ibk';
  const upperCurrency = currency.toUpperCase();

  for (let daysBack = 0; daysBack < 10; daysBack++) {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - daysBack);
    
    // 주말 건너뛰기
    if (isWeekend(targetDate)) {
      continue;
    }
    
    const dateStr = formatDate(targetDate);
    const dateDisplay = `${targetDate.getFullYear()}.${(targetDate.getMonth() + 1).toString().padStart(2, '0')}.${targetDate.getDate().toString().padStart(2, '0')}`;

    const headers = {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
      'Content-Type': 'application/x-www-form-urlencoded',
      'Origin': 'https://www.ibk.co.kr',
      'Referer': 'https://www.ibk.co.kr/fxtr/excRateList.ibk?pageId=SM03020100',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
    };

    const data = new URLSearchParams({
      'pageId': 'SM03020100',
      'dsCd': '',
      'curCd': '',
      'ecrtInqyDscd': '01',
      'efpsId': '',
      'inDate': dateDisplay,
    });

    try {
      const response = await axios.post(url, data, { headers, timeout: 10000 });

      if (response.status !== 200) continue;

      const $ = cheerio.load(response.data);
      const allText = $('body').text();

      // 고시 시간 추출
      let rateTime = '';
      let timeMatch = allText.match(/고시완료\s*시각\s*:\s*(\d{1,2}:\d{2}:\d{2})/);
      if (timeMatch) {
        rateTime = timeMatch[1];
      } else {
        timeMatch = allText.match(/시각\s*:\s*(\d{1,2}:\d{2}:\d{2})/);
        if (timeMatch) {
          rateTime = timeMatch[1];
        } else {
          timeMatch = allText.match(/(\d{1,2}:\d{2}:\d{2})/);
          if (timeMatch) {
            rateTime = timeMatch[1];
          }
        }
      }

      // 테이블에서 환율 정보 추출
      const tables = $('table');

      for (let i = 0; i < tables.length; i++) {
        const rows = $(tables[i]).find('tr');

        for (let j = 0; j < rows.length; j++) {
          const cells = $(rows[j]).find('td, th');
          if (cells.length >= 5) {
            const cellTexts = cells.map((_, el) => $(el).text().trim()).get();

            let currencyMatch = false;
            let rateStr: string | null = null;

            for (let k = 0; k < cellTexts.length; k++) {
              const cellText = cellTexts[k];

              if (cellText.toUpperCase().includes(upperCurrency)) {
                currencyMatch = true;
                for (let l = k + 1; l < Math.min(k + 4, cellTexts.length); l++) {
                  const potentialRate = cellTexts[l].replace(/,/g, '').replace(/\s/g, '');
                  if (!isNaN(parseFloat(potentialRate))) {
                    rateStr = potentialRate;
                    break;
                  }
                }
                break;
              } else if (
                (upperCurrency === 'USD' && (cellText.includes('미국') || cellText.includes('달러'))) ||
                (upperCurrency === 'JPY' && (cellText.includes('일본') || cellText.includes('엔')))
              ) {
                currencyMatch = true;
                for (let l = k + 1; l < Math.min(k + 4, cellTexts.length); l++) {
                  const potentialRate = cellTexts[l].replace(/,/g, '').replace(/\s/g, '');
                  if (!isNaN(parseFloat(potentialRate))) {
                    rateStr = potentialRate;
                    break;
                  }
                }
                break;
              }
            }

            if (currencyMatch && rateStr) {
              try {
                const rate = parseFloat(rateStr);

                return {
                  bank: 'IBK',
                  rate,
                  time: normalizeTime(rateTime),
                  date: dateStr,
                  currency: upperCurrency,
                };
              } catch {
                continue;
              }
            }
          }
        }
      }
    } catch {
      continue;
    }
  }

  return null;
}

/**
 * SC제일은행 환율 조회
 */
async function getScRate(currency: string = 'USD'): Promise<RateData | null> {
  const url = 'https://www.standardchartered.co.kr/np/kr/pl/et/selectExchangeRateList';
  const upperCurrency = currency.toUpperCase();

  for (let daysBack = 0; daysBack < 10; daysBack++) {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - daysBack);
    
    // 주말 건너뛰기
    if (isWeekend(targetDate)) {
      continue;
    }
    
    const dateStr = formatDate(targetDate);

    const headers = {
      'Accept': 'application/json, text/javascript, */*; q=0.01',
      'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
      'Content-Type': 'application/json;charset=UTF-8',
      'Origin': 'https://www.standardchartered.co.kr',
      'Referer': 'https://www.standardchartered.co.kr/np/kr/pl/et/ExchangeRateP1.jsp',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
      'X-Requested-With': 'XMLHttpRequest',
    };

    const data = {
      serviceID: 'HP_FP_PR_ExchangeRate.selectExchangeRateList',
      task: 'com.scfirstbank.web.fp.pr.task.HP_FP_PR_ExchangeRateTask',
      action: 'selectExchangeRateList',
      TYPE_CD: '1',
      CNT_TYPE_CD: '1',
      CUR_YEAR: targetDate.getFullYear().toString(),
      CUR_MONTH: (targetDate.getMonth() + 1).toString().padStart(2, '0'),
      CUR_DAY: targetDate.getDate().toString().padStart(2, '0'),
    };

    try {
      const response = await axios.post(url, data, { headers, timeout: 10000 });

      if (response.status !== 200) continue;

      const result = response.data;

      if (!result || !result.vector || !Array.isArray(result.vector)) continue;

      for (const item of result.vector) {
        if (!item || !item.TYPE_A_RESULT) continue;

        const data = item.TYPE_A_RESULT;
        const itemCurrency = (data.CURRENCY || '').toUpperCase();

        const currencyMatch =
          (upperCurrency === 'USD' && itemCurrency === 'USD') ||
          (upperCurrency === 'JPY' && itemCurrency === '100JPY');

        if (currencyMatch) {
          const rateStr = data.TMP_RATE || '0';
          const datetimeStr = data.DATETIME || '';

          let rateTime = '';
          if (datetimeStr && datetimeStr.length >= 14) {
            rateTime = `${datetimeStr.slice(8, 10)}:${datetimeStr.slice(10, 12)}:${datetimeStr.slice(12, 14)}`;
          }

          try {
            const rate = parseFloat(rateStr.replace(/,/g, ''));

            if (rate && rate > 0) {
              return {
                bank: 'SC',
                rate,
                time: normalizeTime(rateTime),
                date: dateStr,
                currency: upperCurrency,
              };
            }
          } catch {
            continue;
          }
        }
      }
    } catch {
      continue;
    }
  }

  return null;
}

/**
 * 부산은행 환율 조회 (mibank.me)
 */
async function getBusanRate(currency: string = 'USD'): Promise<RateData | null> {
  const url = 'https://www.mibank.me/exchange/bank/index.php?search_code=032';
  const upperCurrency = currency.toUpperCase();
  const dateStr = formatDate(new Date());

  const headers = {
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
    'referer': 'https://www.mibank.me/exchange/bank/index.php?search_code=005',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
  };

  try {
    const response = await axios.get(url, { headers, timeout: 10000 });

    if (response.status !== 200) return null;

    const $ = cheerio.load(response.data);
    const allText = $('body').text();

    // 고시 시간 추출
    let rateTime = '';
    const timeMatch = allText.match(/(\d{4}\.\d{2}\.\d{2})\s+(\d{1,2}:\d{2})\s+기준/);
    if (timeMatch) {
      rateTime = `${timeMatch[2]}:00`;
    }

    // 테이블에서 환율 정보 추출
    const tables = $('table');

    for (let i = 0; i < tables.length; i++) {
      const rows = $(tables[i]).find('tr');

      for (let j = 0; j < rows.length; j++) {
        const cells = $(rows[j]).find('td, th');
        if (cells.length >= 9) {
          const cellTexts = cells.map((_, el) => $(el).text().trim()).get();

          if (cellTexts.length >= 2) {
            const countryCell = cellTexts[1];
            const rateStr = cellTexts[cellTexts.length - 1] || '';

            const currencyMatch =
              (upperCurrency === 'USD' && (countryCell.includes('미국') || countryCell.toUpperCase().includes('USD'))) ||
              (upperCurrency === 'JPY' && (countryCell.includes('일본') || countryCell.toUpperCase().includes('JPY') || countryCell.includes('엔')));

            if (currencyMatch && rateStr) {
              try {
                const rate = parseFloat(rateStr.replace(/,/g, ''));

                if (rate && rate > 0) {
                  return {
                    bank: 'BUSAN',
                    rate,
                    time: normalizeTime(rateTime),
                    date: dateStr,
                    currency: upperCurrency,
                  };
                }
              } catch {
                continue;
              }
            }
          }
        }
      }
    }
  } catch {
    // Ignore errors
  }

  return null;
}

/**
 * IM뱅크 환율 조회 (mibank.me)
 */
async function getImbankRate(currency: string = 'USD'): Promise<RateData | null> {
  const url = 'https://www.mibank.me/exchange/bank/index.php?search_code=031';
  const upperCurrency = currency.toUpperCase();
  const dateStr = formatDate(new Date());

  const headers = {
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
    'referer': 'https://www.mibank.me/exchange/bank/index.php?search_code=027',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
  };

  try {
    const response = await axios.get(url, { headers, timeout: 10000 });

    if (response.status !== 200) return null;

    const $ = cheerio.load(response.data);
    const allText = $('body').text();

    // 고시 시간 추출
    let rateTime = '';
    const timeMatch = allText.match(/(\d{4}\.\d{2}\.\d{2})\s+(\d{1,2}:\d{2})\s+기준/);
    if (timeMatch) {
      rateTime = `${timeMatch[2]}:00`;
    }

    // 테이블에서 환율 정보 추출
    const tables = $('table');

    for (let i = 0; i < tables.length; i++) {
      const rows = $(tables[i]).find('tr');

      for (let j = 0; j < rows.length; j++) {
        const cells = $(rows[j]).find('td, th');
        if (cells.length >= 9) {
          const cellTexts = cells.map((_, el) => $(el).text().trim()).get();

          if (cellTexts.length >= 2) {
            const countryCell = cellTexts[1];
            const rateStr = cellTexts[cellTexts.length - 1] || '';

            const currencyMatch =
              (upperCurrency === 'USD' && (countryCell.includes('미국') || countryCell.toUpperCase().includes('USD'))) ||
              (upperCurrency === 'JPY' && (countryCell.includes('일본') || countryCell.toUpperCase().includes('JPY') || countryCell.includes('엔')));

            if (currencyMatch && rateStr) {
              try {
                const rate = parseFloat(rateStr.replace(/,/g, ''));

                if (rate && rate > 0) {
                  return {
                    bank: 'IMBANK',
                    rate,
                    time: normalizeTime(rateTime),
                    date: dateStr,
                    currency: upperCurrency,
                  };
                }
              } catch {
                continue;
              }
            }
          }
        }
      }
    }
  } catch {
    // Ignore errors
  }

  return null;
}

/**
 * NH농협은행 환율 조회 (mibank.me)
 */
async function getNhRate(currency: string = 'USD'): Promise<RateData | null> {
  const url = 'https://www.mibank.me/exchange/bank/index.php?search_code=011';
  const upperCurrency = currency.toUpperCase();
  const dateStr = formatDate(new Date());

  const headers = {
    'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
    'referer': 'https://www.mibank.me/exchange/bank/index.php?search_code=037',
    'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
  };

  try {
    const response = await axios.get(url, { headers, timeout: 10000 });

    if (response.status !== 200) return null;

    const $ = cheerio.load(response.data);
    const allText = $('body').text();

    // 고시 시간 추출
    let rateTime = '';
    const timeMatch = allText.match(/(\d{4}\.\d{2}\.\d{2})\s+(\d{1,2}:\d{2})\s+기준/);
    if (timeMatch) {
      rateTime = `${timeMatch[2]}:00`;
    }

    // 테이블에서 환율 정보 추출
    const tables = $('table');

    for (let i = 0; i < tables.length; i++) {
      const rows = $(tables[i]).find('tr');

      for (let j = 0; j < rows.length; j++) {
        const cells = $(rows[j]).find('td, th');
        if (cells.length >= 9) {
          const cellTexts = cells.map((_, el) => $(el).text().trim()).get();

          if (cellTexts.length >= 2) {
            const countryCell = cellTexts[1];
            const rateStr = cellTexts[cellTexts.length - 1] || '';

            const currencyMatch =
              (upperCurrency === 'USD' && (countryCell.includes('미국') || countryCell.toUpperCase().includes('USD'))) ||
              (upperCurrency === 'JPY' && (countryCell.includes('일본') || countryCell.toUpperCase().includes('JPY') || countryCell.includes('엔')));

            if (currencyMatch && rateStr) {
              try {
                const rate = parseFloat(rateStr.replace(/,/g, ''));

                if (rate && rate > 0) {
                  return {
                    bank: 'NH',
                    rate,
                    time: normalizeTime(rateTime),
                    date: dateStr,
                    currency: upperCurrency,
                  };
                }
              } catch {
                continue;
              }
            }
          }
        }
      }
    }
  } catch {
    // Ignore errors
  }

  return null;
}

/**
 * 인베스팅닷컴 환율 조회
 */
async function getInvestingRate(currency: string = 'USD'): Promise<RateData | null> {
  const url = 'https://kr.investing.com/currencies/exchange-rates-table';
  const upperCurrency = currency.toUpperCase();
  const dateStr = formatDate(new Date());

  // Cloudflare 우회를 위한 최적화된 헤더 세트
  // Accept-Encoding 제거: axios가 자동으로 처리하므로 중복 방지
  // 최신 Chrome User-Agent 사용
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Referer': 'https://kr.investing.com/',
    'DNT': '1',
  };

  // 재시도 로직 (최대 3회)
  const maxRetries = 3;
  let lastError: any = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // 재시도 간 딜레이 (첫 시도 제외)
      if (attempt > 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // 2초, 3초 딜레이
      }

      const response = await axios.get(url, { 
        headers, 
        timeout: 15000,
        // Cloudflare 우회를 위한 추가 옵션
        maxRedirects: 5,
        validateStatus: (status) => status < 500, // 5xx 에러만 throw
      });

      // Cloudflare 보호 페이지 체크
      if (response.data && typeof response.data === 'string' && response.data.includes('Just a moment')) {
        console.warn(`[getInvestingRate] ${upperCurrency} Cloudflare 보호 페이지 감지 (시도 ${attempt}/${maxRetries})`);
        if (attempt < maxRetries) {
          continue; // 재시도
        }
        return null;
      }

      if (response.status !== 200) {
        if (attempt < maxRetries) {
          continue; // 재시도
        }
        return null;
      }

      const $ = cheerio.load(response.data);

      // 환율표 테이블 찾기
      const table = $('#exchange_rates_1');
      if (!table.length) {
        if (attempt < maxRetries) {
          continue; // 재시도
        }
        return null;
      }

    // 현재 시간
    const now = new Date();
    const rateTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    let rateStr = '';

    if (upperCurrency === 'USD') {
      const row = $('#pair_12');
      if (row.length) {
        const krwCell = row.find('td').last();
        rateStr = krwCell.text().trim().replace(/,/g, '');
      }
    } else if (upperCurrency === 'JPY') {
      // fetchInvestingJpyKrwRate()와 동일한 셀렉터 사용 (td#last_2_28)
      const cell = $('td#last_2_28').first();
      if (cell.length) {
        rateStr = cell.text().trim().replace(/,/g, '').replace('원', '').trim();
      }
    } else {
      return null;
    }

    if (rateStr) {
      try {
        let rate = parseFloat(rateStr);

        // JPY는 1엔 기준이므로 100엔 기준으로 변환
        if (upperCurrency === 'JPY') {
          rate = rate * 100;
        }

        if (rate && rate > 0) {
          return {
            bank: 'INVESTING',
            rate,
            time: normalizeTime(rateTime),
            date: dateStr,
            currency: upperCurrency,
          };
        }
      } catch (parseError: any) {
        console.error(`[getInvestingRate] ${upperCurrency} 파싱 실패:`, parseError?.message);
      }
      }

      // 성공적으로 파싱했지만 rate가 없으면 재시도
      if (attempt < maxRetries) {
        continue;
      }
    } catch (error: any) {
      lastError = error;
      
      // 403 에러인 경우 재시도
      if (error?.response?.status === 403 && attempt < maxRetries) {
        console.warn(`[getInvestingRate] ${upperCurrency} 403 에러 (시도 ${attempt}/${maxRetries}), 재시도 중...`);
        continue;
      }

      // 마지막 시도에서만 에러 로깅
      if (attempt === maxRetries) {
        console.error(`[getInvestingRate] ${upperCurrency} 조회 실패 (${maxRetries}회 시도 후):`, {
          message: error?.message,
          status: error?.response?.status,
          statusText: error?.response?.statusText,
          data: error?.response?.data?.substring?.(0, 200),
        });
      }
    }
  }

  return null;
}

/**
 * 모든 은행의 환율을 조회합니다.
 */
export async function getAllBankRates(currency: string = 'USD'): Promise<{
  KB: RateData | null;
  SHINHAN: RateData | null;
  HANA: RateData | null;
  WOORI: RateData | null;
  IBK: RateData | null;
  SC: RateData | null;
  BUSAN: RateData | null;
  IMBANK: RateData | null;
  NH: RateData | null;
  INVESTING: RateData | null;
}> {
  const upperCurrency = currency.toUpperCase();
  console.log(`[getAllBankRates] Starting to fetch rates for ${upperCurrency}`);
  
  const results = await Promise.allSettled([
    getKbRate(upperCurrency).catch(err => {
      console.error(`[getAllBankRates] KB failed for ${upperCurrency}:`, err);
      return null;
    }),
    getShinhanRate(upperCurrency).catch(err => {
      console.error(`[getAllBankRates] SHINHAN failed for ${upperCurrency}:`, err);
      return null;
    }),
    getHanaRate(upperCurrency).catch(err => {
      console.error(`[getAllBankRates] HANA failed for ${upperCurrency}:`, err);
      return null;
    }),
    getWooriRate(upperCurrency).catch(err => {
      console.error(`[getAllBankRates] WOORI failed for ${upperCurrency}:`, err);
      return null;
    }),
    getIbkRate(upperCurrency).catch(err => {
      console.error(`[getAllBankRates] IBK failed for ${upperCurrency}:`, err);
      return null;
    }),
    getScRate(upperCurrency).catch(err => {
      console.error(`[getAllBankRates] SC failed for ${upperCurrency}:`, err);
      return null;
    }),
    getBusanRate(upperCurrency).catch(err => {
      console.error(`[getAllBankRates] BUSAN failed for ${upperCurrency}:`, err);
      return null;
    }),
    getImbankRate(upperCurrency).catch(err => {
      console.error(`[getAllBankRates] IMBANK failed for ${upperCurrency}:`, err);
      return null;
    }),
    getNhRate(upperCurrency).catch(err => {
      console.error(`[getAllBankRates] NH failed for ${upperCurrency}:`, err);
      return null;
    }),
    getInvestingRate(upperCurrency).catch(err => {
      console.error(`[getAllBankRates] INVESTING failed for ${upperCurrency}:`, err);
      return null;
    }),
  ]);

  const [
    kbResult,
    shinhanResult,
    hanaResult,
    wooriResult,
    ibkResult,
    scResult,
    busanResult,
    imbankResult,
    nhResult,
    investingResult,
  ] = results.map(result => 
    result.status === 'fulfilled' ? result.value : null
  );

  const successfulCount = results.filter(r => r.status === 'fulfilled' && r.value !== null).length;
  console.log(`[getAllBankRates] Completed for ${upperCurrency}: ${successfulCount}/10 banks succeeded`);

  return {
    KB: kbResult,
    SHINHAN: shinhanResult,
    HANA: hanaResult,
    WOORI: wooriResult,
    IBK: ibkResult,
    SC: scResult,
    BUSAN: busanResult,
    IMBANK: imbankResult,
    NH: nhResult,
    INVESTING: investingResult,
  };
}
