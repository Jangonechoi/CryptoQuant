# PostgreSQL 비밀번호 설정 가이드

## 방법 1: psql을 통한 비밀번호 설정

```bash
# PostgreSQL 접속
psql cryptoquant

# 또는 특정 사용자로 접속
psql -U choi cryptoquant
```

접속 후 다음 명령어로 비밀번호 설정:

```sql
ALTER USER choi WITH PASSWORD '원하는_비밀번호';
```

## 방법 2: 명령어 한 줄로 설정

```bash
psql cryptoquant -c "ALTER USER choi WITH PASSWORD '원하는_비밀번호';"
```

## .env 파일 업데이트

비밀번호를 설정한 후, `.env` 파일의 `DATABASE_URL`을 업데이트하세요:

```bash
# 비밀번호가 있는 경우
DATABASE_URL=postgresql://choi:원하는_비밀번호@localhost:5432/cryptoquant

# 비밀번호에 특수문자가 있는 경우 URL 인코딩 필요
# 예: 비밀번호가 "pass@word"인 경우
DATABASE_URL=postgresql://choi:pass%40word@localhost:5432/cryptoquant
```

## 특수문자 URL 인코딩

비밀번호에 특수문자가 포함된 경우 URL 인코딩이 필요합니다:

- `@` → `%40`
- `#` → `%23`
- `$` → `%24`
- `%` → `%25`
- `&` → `%26`
- `+` → `%2B`
- `=` → `%3D`
- `?` → `%3F`
- `/` → `%2F`
- `:` → `%3A`

## 연결 테스트

비밀번호 설정 후 연결을 테스트하세요:

```bash
# Python으로 테스트
cd cryptoquant-backend
source venv/bin/activate
python -c "from app.database import engine; from sqlalchemy import text; conn = engine.connect(); result = conn.execute(text('SELECT 1')); print('✅ 연결 성공!'); conn.close()"
```

## 보안 권장사항

1. **강력한 비밀번호 사용**: 최소 12자 이상, 대소문자, 숫자, 특수문자 조합
2. **환경 변수 보호**: `.env` 파일을 `.gitignore`에 추가 (이미 되어 있을 수 있음)
3. **프로덕션 환경**: 프로덕션에서는 더 강력한 인증 방법 사용 고려
