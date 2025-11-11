import { NextRequest, NextResponse } from 'next/server';
import {
  loadJpyInvestments,
  saveJpyInvestment,
  deleteJpyInvestment,
} from '@/lib/database/jpy-db';

export async function GET() {
  try {
    const investments = await loadJpyInvestments();
    return NextResponse.json(investments);
  } catch (error) {
    console.error('엔화 투자 목록 조회 실패:', error);
    return NextResponse.json(
      { error: 'Failed to load JPY investments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const investment = await saveJpyInvestment(body);
    
    if (!investment) {
      return NextResponse.json(
        { error: 'Failed to save JPY investment' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(investment);
  } catch (error) {
    console.error('엔화 투자 저장 실패:', error);
    return NextResponse.json(
      { error: 'Failed to save JPY investment' },
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
        { error: 'Investment ID is required' },
        { status: 400 }
      );
    }
    
    const success = await deleteJpyInvestment(id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete JPY investment' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('엔화 투자 삭제 실패:', error);
    return NextResponse.json(
      { error: 'Failed to delete JPY investment' },
      { status: 500 }
    );
  }
}

