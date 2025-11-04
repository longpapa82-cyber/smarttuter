#!/usr/bin/env node

const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: '.env.local' });

const apiKey = process.env.GEMINI_API_KEY;

async function listModels() {
  console.log('📋 Listing Available Gemini Models\n');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  try {
    const genAI = new GoogleGenerativeAI(apiKey);

    // List all available models
    const models = await genAI.listModels();

    console.log(`Found ${models.length} models:\n`);

    for (const model of models) {
      console.log(`📦 ${model.name}`);
      console.log(`   Display Name: ${model.displayName || 'N/A'}`);
      console.log(`   Description: ${model.description || 'N/A'}`);
      console.log(`   Supported Methods: ${model.supportedGenerationMethods?.join(', ') || 'N/A'}`);
      console.log('');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ Model listing complete\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

listModels();
