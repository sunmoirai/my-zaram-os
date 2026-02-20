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

# CI/CD 자동화하여 내가 만든 시스템 운영하기

This project demonstrates how to deploy a local React (Vite) application to AWS S3 using GitHub Actions (CI/CD automation).

---

## 🚀 Step 1. GitHub Repository 생성

1. GitHub에서 새로운 Repository 생성
2. 로컬 프로젝트 폴더에서 Git 초기화

```
git init
git add .
git commit -m "init: my app"
git branch -M main
git remote add origin https://github.com/sunmoirai/<repo>.git
git push -u origin main
```

## ☁ Step 2. AWS S3 Bucket 생성

AWS Academy 접속

S3 → Create bucket

Bucket name 설정

(Academy 환경에 맞게 Public Access 설정 조정)

## ⚙ Step 3. GitHub Actions Workflow 생성

Repository에서 아래 경로에 파일 생성:

.github/workflows/deploy.yml

deploy.yml 내용
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
        aws s3 sync dist/ s3://<your-bucket-name> --delete

## 🔐 Step 4. GitHub Secrets 설정

GitHub Repository →
Settings → Secrets and variables → Actions → New repository secret

추가할 값:

AWS_ACCESS_KEY_ID

AWS_SECRET_ACCESS_KEY

AWS_SESSION_TOKEN

AWS Academy → AWS Details에서 발급된 값 복사

## 🔄 Step 5. Actions 실행
방법 1: 로컬에서 실행
```
git add .
git commit -m "trigger deploy"
git push
```

방법 2: GitHub 웹에서 실행

README.md 한 줄 수정

Commit changes

Push 되면 자동으로 GitHub Actions 실행

## 🌐 Step 6. 웹사이트 접속

S3 → 해당 버킷 클릭
Properties → Static website hosting
→ Bucket website endpoint URL 클릭

앱이 브라우저에서 열리면 배포 성공 🎉
