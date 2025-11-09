#!/bin/bash
# Render 빌드 스크립트

set -e  # 오류 발생 시 즉시 중단

echo "🔧 Upgrading pip, setuptools, and wheel..."
pip install --upgrade pip setuptools wheel

echo "📦 Installing dependencies..."
pip install --no-cache-dir -r requirements.txt

echo "✅ Build completed successfully!"

