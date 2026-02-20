# Zaram-i (자람이)

## 🇰🇷 프로젝트 소개
자람이는 아이의 특성(수면, 언어, 운동 발달 등),  
식단 기록, 행동 기록을 기반으로  
룰 기반 발달 가이드를 생성하는 육아 지원 시스템입니다.

외부 AI API 없이 동작하며,  
GitHub Actions와 AWS를 이용해 자동 배포되는 개인 프로젝트입니다.

---

## 🇺🇸 Project Overview
Zaram-i is a rule-based parenting support system.

It generates personalized development guidance based on:
- Child traits
- Diet logs
- Behavior records

This version works fully offline (no external AI API).
The project is deployed automatically using GitHub Actions and AWS.

---

<CI/CD 자동화 하여 내가 만든 시스템 운영하기>

1. github repository 생성

2. AWS S3 bucket 생성

3. OS push

로컬 프로젝트 폴더에서 
git init
git add .
git commit -m “init: 000000 app”
git branch -M main
git remote add origin https://github.com/sunmoirai/<repo>.git
git push -u origin main


4. yml 파일 생성

github repo 에서 .yml 파일 생성(.github/workflows/deploy.yml)

name: Deploy to AWS S3 (Academy)

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout source code
      uses: actions/checkout@v4

    - name: Setup Node
      uses: actions/setup-node@v4
      with:
        node-version: 20
        cache: 'npm'

    - name: Install dependencies
      run: npm ci

    - name: Build project
      run: npm run build

    - name: Configure AWS credentials
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-session-token: ${{ secrets.AWS_SESSION_TOKEN }}
        aws-region: us-east-1

    - name: Deploy build files to S3
      run: |
        aws s3 sync dist/ s3://<mybucket name> --delete


5. README.md 작성

6. github 사이트내 Settings -> Deploy keys

Title=Key 입력

aws_access_key_id=0000000
aws_secret_access_key=0000000
aws_session_token=0000000

AWS Academy Leaders Lab 시작 페이지에서 AWS Details 클릭 후 ID, KEY, TOKEN 복사


8. Actions 진행 (로컬 or github)

로컬에서
git add .
git commit -m "trigger deploy"
git push

github 에서
README.md 열기
한줄 수정
Commit changes


8. 웹사이트 연결
해당 버킷 클릭 -> 정적 웹 사이트 호스팅 -> 버킷 웹 사이트 엔드포인트 URL 클릭!
