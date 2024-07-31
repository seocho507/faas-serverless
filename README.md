# AIOTION_Serverless_Backend

## 1. 프로젝트 환경

- **언어**: TypeScript
- **런타임**: Node.js 20
- **패키지 매니저**: Yarn

## 2. 주요 명령어

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

## 3. 예시

예를 들어, `package-a` 패키지를 로컬에서 테스트하려면:

    yarn offline

프롬프트에서 `package-a`와 `dev` 또는 `prod`를 입력합니다.

`package-a`를 서버리스로 배포하려면:

    yarn deploy

프롬프트에서 `package-a`와 `dev` 또는 `prod`를 입력합니다.