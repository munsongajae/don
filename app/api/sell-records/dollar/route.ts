import { NextRequest, NextResponse } from 'next/server';
import {
  loadDollarSellRecords,
  saveDollarSellRecord,
  deleteDollarSellRecord,
} from '@/lib/database/dollar-db';

export async function GET() {
  try {
    const records = await loadDollarSellRecords();
    return NextResponse.json(records);
  } catch (error) {
    console.error('달러 매도 기록 조회 실패:', error);
    return NextResponse.json(
      { error: 'Failed to load dollar sell records' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const record = await saveDollarSellRecord(body);
    
    if (!record) {
      return NextResponse.json(
        { error: 'Failed to save dollar sell record' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(record);
  } catch (error) {
    console.error('달러 매도 기록 저장 실패:', error);
    return NextResponse.json(
      { error: 'Failed to save dollar sell record' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: 'Record ID is required' },
        { status: 400 }
      );
    }
    
    const success = await deleteDollarSellRecord(id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete dollar sell record' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('달러 매도 기록 삭제 실패:', error);
    return NextResponse.json(
      { error: 'Failed to delete dollar sell record' },
      { status: 500 }
    );
  }
}

