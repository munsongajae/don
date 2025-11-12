import { NextRequest } from 'next/server';
import {
  loadJpySellRecords,
  saveJpySellRecord,
  deleteJpySellRecord,
} from '@/lib/database/jpy-db';
import { createServerClientFromHeaders } from '@/lib/middleware/auth';
import { corsResponse, corsOptions } from '@/lib/utils/cors';

export async function OPTIONS() {
  return corsOptions();
}

export async function GET(request: NextRequest) {
  try {
    // 인증 확인
    const { client } = createServerClientFromHeaders(request);
    const { data: { user } } = await client.auth.getUser();
    
    if (!user) {
      return corsResponse(
        { error: 'Unauthorized' },
        401
      );
    }

    // 사용자별 데이터 로드
    const records = await loadJpySellRecords(user.id);
    return corsResponse(records);
  } catch (error) {
    console.error('엔화 매도 기록 조회 실패:', error);
    return corsResponse(
      { error: 'Failed to load JPY sell records' },
      500
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // 인증 확인
    const { client } = createServerClientFromHeaders(request);
    const { data: { user } } = await client.auth.getUser();
    
    if (!user) {
      return corsResponse(
        { error: 'Unauthorized' },
        401
      );
    }

    const body = await request.json();
    // user_id 추가
    const record = await saveJpySellRecord({ ...body, user_id: user.id });
    
    if (!record) {
      return corsResponse(
        { error: 'Failed to save JPY sell record' },
        500
      );
    }
    
    return corsResponse(record);
  } catch (error) {
    console.error('엔화 매도 기록 저장 실패:', error);
    return corsResponse(
      { error: 'Failed to save JPY sell record' },
      500
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // 인증 확인
    const { client } = createServerClientFromHeaders(request);
    const { data: { user } } = await client.auth.getUser();
    
    if (!user) {
      return corsResponse(
        { error: 'Unauthorized' },
        401
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return corsResponse(
        { error: 'Record ID is required' },
        400
      );
    }
    
    // 사용자별 삭제 (본인 데이터만 삭제 가능)
    const success = await deleteJpySellRecord(id, user.id);
    
    if (!success) {
      return corsResponse(
        { error: 'Failed to delete JPY sell record' },
        500
      );
    }
    
    return corsResponse({ success: true });
  } catch (error) {
    console.error('엔화 매도 기록 삭제 실패:', error);
    return corsResponse(
      { error: 'Failed to delete JPY sell record' },
      500
    );
  }
}

