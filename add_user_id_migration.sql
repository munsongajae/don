-- 사용자별 데이터 분리를 위한 user_id 컬럼 추가 마이그레이션

-- 1. user_id 컬럼 추가 (UUID, auth.users 테이블 참조)
ALTER TABLE dollar_investments 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE dollar_sell_records 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE jpy_investments 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE jpy_sell_records 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_dollar_investments_user_id ON dollar_investments(user_id);
CREATE INDEX IF NOT EXISTS idx_dollar_sell_records_user_id ON dollar_sell_records(user_id);
CREATE INDEX IF NOT EXISTS idx_jpy_investments_user_id ON jpy_investments(user_id);
CREATE INDEX IF NOT EXISTS idx_jpy_sell_records_user_id ON jpy_sell_records(user_id);

-- 3. 기존 RLS 정책 삭제
DROP POLICY IF EXISTS "Allow all operations for all users" ON dollar_investments;
DROP POLICY IF EXISTS "Allow all operations for all users" ON dollar_sell_records;
DROP POLICY IF EXISTS "Allow all operations for all users" ON jpy_investments;
DROP POLICY IF EXISTS "Allow all operations for all users" ON jpy_sell_records;

-- 4. 새로운 RLS 정책 생성 (사용자별 데이터 접근)
-- 사용자는 자신의 데이터만 조회/수정/삭제 가능
CREATE POLICY "Users can view their own dollar investments" 
ON dollar_investments FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own dollar investments" 
ON dollar_investments FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dollar investments" 
ON dollar_investments FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dollar investments" 
ON dollar_investments FOR DELETE 
USING (auth.uid() = user_id);

-- 달러 매도 기록
CREATE POLICY "Users can view their own dollar sell records" 
ON dollar_sell_records FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own dollar sell records" 
ON dollar_sell_records FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dollar sell records" 
ON dollar_sell_records FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dollar sell records" 
ON dollar_sell_records FOR DELETE 
USING (auth.uid() = user_id);

-- 엔화 투자
CREATE POLICY "Users can view their own jpy investments" 
ON jpy_investments FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own jpy investments" 
ON jpy_investments FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own jpy investments" 
ON jpy_investments FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own jpy investments" 
ON jpy_investments FOR DELETE 
USING (auth.uid() = user_id);

-- 엔화 매도 기록
CREATE POLICY "Users can view their own jpy sell records" 
ON jpy_sell_records FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own jpy sell records" 
ON jpy_sell_records FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own jpy sell records" 
ON jpy_sell_records FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own jpy sell records" 
ON jpy_sell_records FOR DELETE 
USING (auth.uid() = user_id);

-- 5. exchange_rate_history는 모든 사용자가 공유 (읽기 전용)
-- 기존 정책이 있으면 삭제 후 재생성
DROP POLICY IF EXISTS "Anyone can read exchange rate history" ON exchange_rate_history;
CREATE POLICY "Anyone can read exchange rate history" 
ON exchange_rate_history FOR SELECT 
USING (true);

-- 6. 기존 데이터가 있다면 (선택적)
-- 기존 데이터를 특정 사용자에게 할당하거나 삭제
-- 예: DELETE FROM dollar_investments WHERE user_id IS NULL;
-- 또는: UPDATE dollar_investments SET user_id = '특정-사용자-id' WHERE user_id IS NULL;

