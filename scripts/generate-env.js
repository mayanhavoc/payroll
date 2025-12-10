#!/usr/bin/env node

/**
 * Generate environment variables for production setup
 * Run: node scripts/generate-env.js
 */

(async () => {
  const { randomBytes } = await import('node:crypto');
  const fs = await import('node:fs');
  const path = await import('node:path');

  // Generate encryption key (32 bytes = 256 bits for AES-256)
  const encryptionKey = randomBytes(32).toString('hex');

  // Generate NextAuth secret
  const nextAuthSecret = randomBytes(32).toString('base64');

  console.log('\n🔐 Generated Security Keys\n');
  console.log('═'.repeat(60));
  console.log('\n📋 Copy these values to your .env file:\n');

  console.log('ENCRYPTION_KEY="' + encryptionKey + '"');
  console.log('NEXTAUTH_SECRET="' + nextAuthSecret + '"');

  console.log('\n' + '═'.repeat(60));
  console.log('\n⚠️  IMPORTANT:');
  console.log('  - Keep these keys SECRET');
  console.log('  - Never commit them to version control');
  console.log('  - Use different keys for development and production');
  console.log('  - Store production keys securely (e.g., 1Password, AWS Secrets Manager)\n');

  // Optionally update .env file
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    console.log('📝 Would you like to update .env file automatically?');
    console.log('   (Make sure to backup your .env first!)');
    console.log('\n   To update manually, copy the values above to your .env file\n');
  } else {
    console.log('❌ .env file not found. Create it from .env.example first.\n');
  }
})();
