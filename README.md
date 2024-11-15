# FaaS Serverless demo project
----------------
## 1. 개념
### 1-1. 조직(Organization)
- Tenant 단위, B to B 에서 상대 회사
### 1-2. 그룹(Group)
- 조직은 하위의 여러 그룹을 가질 수 있다.
- Tenant 내부 카테고리
### 1-3. 유저(User)
- 조직은 하위에 여러 유저를 가질 수 있다.
- 유저는 엑세스 할 수 있는 그룹을 보유하고 있다.
----------------
## 2. 주요 코드
- packages 하위에 위치
----------------

## 3. 프로젝트 환경

- **언어**: TypeScript
- **런타임**: Node.js 20
- **패키지 매니저**: Yarn

## 4. 주요 명령어

### 가. 종속성 설치

프로젝트의 루트 디렉토리에서 다음 명령어를 실행하여 모든 종속성을 설치합니다.

    yarn install

### 나. 로컬 테스트

로컬에서 Serverless Offline을 사용하여 테스트를 실행합니다.

    yarn offline

스크립트를 실행하면 서비스 이름과 스테이지(dev/prod)를 입력하라는 프롬프트가 나타납니다.  
패키지 이름과 스테이지를 입력하면 해당 패키지의 Serverless Offline이 실행됩니다.

### 다. 서버리스 배포

특정 패키지를 서버리스로 배포합니다.

    yarn deploy

스크립트를 실행하면 서비스 이름과 스테이지(dev/prod)를 입력하라는 프롬프트가 나타납니다.  
패키지 이름과 스테이지를 입력하면 해당 패키지의 serverless.yml을 참조하여 배포합니다.

## 5. 예시

예를 들어, `package-a` 패키지를 로컬에서 테스트하려면:

    yarn offline

프롬프트에서 `package-a`와 `dev` 또는 `prod`를 입력합니다.

`package-a`를 서버리스로 배포하려면:

    yarn deploy

프롬프트에서 `package-a`와 `dev` 또는 `prod`를 입력합니다.
