import { NextRequest, NextResponse } from 'next/server';
import {
  loadDollarInvestments,
  saveDollarInvestment,
  deleteDollarInvestment,
} from '@/lib/database/dollar-db';

export async function GET() {
  try {
    const investments = await loadDollarInvestments();
    return NextResponse.json(investments);
  } catch (error) {
    console.error('달러 투자 목록 조회 실패:', error);
    return NextResponse.json(
      { error: 'Failed to load dollar investments' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const investment = await saveDollarInvestment(body);
    
    if (!investment) {
      return NextResponse.json(
        { error: 'Failed to save dollar investment' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(investment);
  } catch (error) {
    console.error('달러 투자 저장 실패:', error);
    return NextResponse.json(
      { error: 'Failed to save dollar investment' },
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
    
    const success = await deleteDollarInvestment(id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete dollar investment' },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('달러 투자 삭제 실패:', error);
    return NextResponse.json(
      { error: 'Failed to delete dollar investment' },
      { status: 500 }
    );
  }
}

