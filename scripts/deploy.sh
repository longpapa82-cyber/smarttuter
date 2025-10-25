#!/bin/bash

# SmartTuter 자동 배포 스크립트
# 사용법: ./scripts/deploy.sh

set -e  # 에러 발생 시 중단

# 색상 정의
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 함수 정의
print_header() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# 배너 출력
clear
echo -e "${BLUE}"
cat << "EOF"
   _____ __  ______    _______________  ____________
  / ___//  |/  / _ |  / __/_  __/ __ \/_  __/ __/ _ \
 _\ \_/ /|_/ / __ | / _/  / / / /_/ / / / / _// , _/
/___/_/  /_/_/ |_|/___/ /_/  \____/ /_/ /___/_/|_|

AI-Powered Learning Platform
배포 자동화 스크립트 v1.0.0
EOF
echo -e "${NC}\n"

# 1. 환경 확인
print_header "1️⃣  환경 확인"

# Git 확인
if ! command -v git &> /dev/null; then
    print_error "Git이 설치되어 있지 않습니다."
    echo "Git 설치: https://git-scm.com/downloads"
    exit 1
fi
print_success "Git 설치 확인"

# Node.js 확인
if ! command -v node &> /dev/null; then
    print_error "Node.js가 설치되어 있지 않습니다."
    echo "Node.js 설치: https://nodejs.org"
    exit 1
fi
NODE_VERSION=$(node -v)
print_success "Node.js $NODE_VERSION 확인"

# npm 확인
if ! command -v npm &> /dev/null; then
    print_error "npm이 설치되어 있지 않습니다."
    exit 1
fi
NPM_VERSION=$(npm -v)
print_success "npm $NPM_VERSION 확인"

# 2. Git 상태 확인
print_header "2️⃣  Git 저장소 확인"

# Git 저장소 확인
if [ ! -d .git ]; then
    print_error "Git 저장소가 초기화되지 않았습니다."
    exit 1
fi
print_success "Git 저장소 확인"

# 커밋 확인
COMMIT_COUNT=$(git rev-list --count HEAD 2>/dev/null || echo "0")
if [ "$COMMIT_COUNT" -eq "0" ]; then
    print_error "커밋이 없습니다. 먼저 커밋을 생성하세요."
    exit 1
fi
print_success "총 $COMMIT_COUNT개 커밋 확인"

# 작업 디렉토리 확인
if [ -n "$(git status --porcelain)" ]; then
    print_warning "커밋되지 않은 변경사항이 있습니다."
    git status --short
    echo ""
    read -p "계속 진행하시겠습니까? (y/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "배포를 취소했습니다."
        exit 0
    fi
else
    print_success "작업 디렉토리 깨끗함"
fi

# 3. GitHub 저장소 설정
print_header "3️⃣  GitHub 저장소 설정"

# 원격 저장소 확인
REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")

if [ -z "$REMOTE_URL" ]; then
    print_warning "GitHub 원격 저장소가 설정되지 않았습니다."
    echo ""
    print_info "GitHub 저장소를 먼저 생성해야 합니다:"
    echo "  1. https://github.com/new 접속"
    echo "  2. Repository name: smarttuter"
    echo "  3. Public 선택"
    echo "  4. Create repository 클릭"
    echo ""
    read -p "GitHub 사용자명을 입력하세요: " GITHUB_USERNAME

    if [ -z "$GITHUB_USERNAME" ]; then
        print_error "사용자명이 비어있습니다."
        exit 1
    fi

    REPO_URL="https://github.com/$GITHUB_USERNAME/smarttuter.git"
    print_info "원격 저장소 추가: $REPO_URL"

    git remote add origin "$REPO_URL"
    print_success "원격 저장소 추가 완료"
else
    print_success "원격 저장소: $REMOTE_URL"
fi

# 4. GitHub에 푸시
print_header "4️⃣  GitHub에 푸시"

print_info "main 브랜치를 GitHub에 푸시합니다..."
echo ""

if git push -u origin main; then
    print_success "GitHub 푸시 완료!"
else
    print_error "푸시 실패"
    echo ""
    print_info "인증이 필요한 경우:"
    echo "  1. Personal Access Token 생성: https://github.com/settings/tokens"
    echo "  2. repo 권한 선택"
    echo "  3. Username: GitHub 사용자명"
    echo "  4. Password: 생성한 토큰 (ghp_로 시작)"
    exit 1
fi

# 5. Vercel 배포 안내
print_header "5️⃣  Vercel 배포"

echo -e "${GREEN}✅ GitHub 푸시 완료!${NC}\n"
echo "이제 Vercel에서 배포하세요:"
echo ""
echo "1️⃣  Vercel 웹사이트 접속:"
echo "   ${BLUE}https://vercel.com${NC}"
echo ""
echo "2️⃣  로그인:"
echo "   'Continue with GitHub' 클릭"
echo ""
echo "3️⃣  프로젝트 Import:"
echo "   'Add New Project' → 'smarttuter' 선택"
echo ""
echo "4️⃣  환경 변수 설정:"
echo "   Name:  ANTHROPIC_API_KEY"
echo "   Value: sk-ant-api03-여기에-API-키-붙여넣기"
echo ""
echo "5️⃣  배포:"
echo "   'Deploy' 버튼 클릭 → 2-3분 대기"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Anthropic API 키 안내
print_header "📝 Anthropic API 키 발급"

echo "Anthropic API 키가 필요합니다:"
echo ""
echo "1️⃣  Console 접속:"
echo "   ${BLUE}https://console.anthropic.com${NC}"
echo ""
echo "2️⃣  API Keys 메뉴:"
echo "   'Create Key' 클릭"
echo ""
echo "3️⃣  키 복사:"
echo "   sk-ant-api03-로 시작하는 키 복사"
echo ""
echo "4️⃣  Vercel 환경 변수에 입력"
echo ""

# 자동으로 브라우저 열기 (선택사항)
read -p "Vercel 웹사이트를 지금 여시겠습니까? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    if command -v open &> /dev/null; then
        open "https://vercel.com/new"
    elif command -v xdg-open &> /dev/null; then
        xdg-open "https://vercel.com/new"
    else
        print_info "브라우저를 수동으로 열어주세요: https://vercel.com/new"
    fi
fi

# 완료 메시지
echo ""
print_header "🎉 배포 준비 완료!"

echo -e "${GREEN}GitHub 푸시 완료!${NC}"
echo ""
echo "📚 추가 문서:"
echo "  - START_DEPLOYMENT.md : 상세 배포 가이드"
echo "  - DEPLOY_NOW.md       : 15분 빠른 가이드"
echo "  - NEXT_STEPS.md       : 배포 후 다음 단계"
echo ""
echo "🔗 유용한 링크:"
echo "  - GitHub: $REMOTE_URL"
echo "  - Vercel: https://vercel.com"
echo "  - Anthropic: https://console.anthropic.com"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
