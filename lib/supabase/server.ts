import { createClient } from '@supabase/supabase-js';

// 서버 사이드에서는 NEXT_PUBLIC_ 접두사가 없어도 되지만, 
// 환경 변수 이름을 통일하기 위해 NEXT_PUBLIC_ 사용
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase 환경 변수가 설정되지 않았습니다.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

