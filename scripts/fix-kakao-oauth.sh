#!/bin/bash

# Kakao OAuth Fix Script
# Purpose: Update KAKAO_CLIENT_SECRET in Vercel production
# Date: 2025-11-10
# Issue: Client Secret mismatch causing OAuthCallback error

set -e  # Exit on error

echo "🔧 Kakao OAuth Fix Script"
echo "=========================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Correct secret (from .env.local)
CORRECT_SECRET="V4pYxA4vn67ib4iYn0r4900Ct4wCwUd9"

echo -e "${YELLOW}⚠️  WARNING: This will update production environment variable${NC}"
echo ""
echo "Current (WRONG):  V4pYxA4vn67ib4iYn0r4900Ct4wCwlJd9"
echo "Correct (LOCAL):  V4pYxA4vn67ib4iYn0r4900Ct4wCwUd9"
echo ""
echo "Difference: Characters 29-31 (Ud9 vs lJd9)"
echo ""

read -p "Continue with fix? (y/N) " -n 1 -r
echo
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Fix cancelled${NC}"
    exit 1
fi

echo "Step 1: Removing incorrect KAKAO_CLIENT_SECRET from production..."
vercel env rm KAKAO_CLIENT_SECRET production --yes

echo ""
echo "Step 2: Adding correct KAKAO_CLIENT_SECRET to production..."
echo "$CORRECT_SECRET" | vercel env add KAKAO_CLIENT_SECRET production

echo ""
echo "Step 3: Verifying update..."
vercel env pull .env.production.verify --environment production

# Verify the secret
DEPLOYED_SECRET=$(grep "KAKAO_CLIENT_SECRET" .env.production.verify | cut -d'=' -f2 | tr -d '"' | tr -d '\n')

if [ "$DEPLOYED_SECRET" = "$CORRECT_SECRET" ]; then
    echo -e "${GREEN}✅ Environment variable updated successfully!${NC}"
else
    echo -e "${RED}❌ Verification failed - secret mismatch${NC}"
    echo "Expected: $CORRECT_SECRET"
    echo "Got:      $DEPLOYED_SECRET"
    exit 1
fi

# Cleanup temp file
rm -f .env.production.verify

echo ""
echo "Step 4: Redeploying application to apply changes..."
echo ""
read -p "Deploy to production now? (y/N) " -n 1 -r
echo
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    vercel --prod --yes
    echo ""
    echo -e "${GREEN}✅ Deployment triggered!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Wait for deployment to complete (2-3 minutes)"
    echo "2. Test Kakao login at: https://aipark.vercel.app/login"
    echo "3. Verify no OAuthCallback error"
    echo "4. Check user is redirected to /dashboard"
    echo ""
    echo "Monitor logs:"
    echo "  vercel logs --follow | grep -i 'oauth\\|kakao'"
else
    echo -e "${YELLOW}⚠️  Manual deployment required${NC}"
    echo ""
    echo "To deploy manually:"
    echo "  vercel --prod --yes"
    echo ""
    echo "Or use Vercel Dashboard:"
    echo "  Deployments → Latest → Redeploy"
fi

echo ""
echo -e "${GREEN}🎉 Fix process completed!${NC}"
