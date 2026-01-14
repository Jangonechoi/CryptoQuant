# DBeaver PostgreSQL 연결 설정 가이드

## 문제

DBeaver에서 연결 시 `FATAL: role "postgres" does not exist` 에러 발생

## 원인

PostgreSQL에 "postgres" 사용자가 없고 "choi" 사용자만 존재함

## 해결 방법

### 방법 1: DBeaver 연결 설정에서 사용자명 변경 (권장)

1. **DBeaver에서 새 연결 생성 또는 기존 연결 수정**

   - 데이터베이스 → 새 데이터베이스 연결
   - 또는 기존 연결 우클릭 → 편집

2. **PostgreSQL 선택**

3. **연결 설정 입력**

   - **호스트**: `localhost`
   - **포트**: `5432`
   - **데이터베이스**: `cryptoquant`
   - **사용자명**: `choi` ⚠️ **중요: "postgres"가 아닌 "choi"로 설정**
   - **비밀번호**: 설정한 비밀번호 (없으면 비워두기)

4. **테스트 연결** 클릭하여 연결 확인

5. **저장** 후 연결

### 방법 2: postgres 사용자 생성

터미널에서 다음 명령어 실행:

```bash
psql cryptoquant -c "CREATE USER postgres WITH SUPERUSER PASSWORD '원하는_비밀번호';"
```

또는:

```bash
psql cryptoquant
```

접속 후:

```sql
CREATE USER postgres WITH SUPERUSER PASSWORD '원하는_비밀번호';
\q
```

그러면 DBeaver에서 "postgres" 사용자로도 연결 가능합니다.

## 연결 정보 요약

### choi 사용자로 연결 (현재 권장)

- **호스트**: localhost
- **포트**: 5432
- **데이터베이스**: cryptoquant
- **사용자명**: choi
- **비밀번호**: (설정한 경우 입력, 없으면 비워두기)

### postgres 사용자로 연결 (생성 후)

- **호스트**: localhost
- **포트**: 5432
- **데이터베이스**: cryptoquant
- **사용자명**: postgres
- **비밀번호**: (생성 시 설정한 비밀번호)

## 연결 테스트

DBeaver에서 "테스트 연결" 버튼을 클릭하여 연결이 성공하는지 확인하세요.

성공하면 다음과 같은 메시지가 표시됩니다:

- ✅ "연결 테스트 성공"
- 드라이버 정보 및 데이터베이스 버전 표시
