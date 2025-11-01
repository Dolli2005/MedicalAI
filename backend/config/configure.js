import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

class Config {
  static DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;
  static GROQ_API_KEY = process.env.GROQ_API_KEY;
  static N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

  static validate() {
    const missing = [];
    
    if (!this.DEEPGRAM_API_KEY) {
      missing.push("DEEPGRAM_API_KEY");
    }
    if (!this.GROQ_API_KEY) {
      missing.push("GROQ_API_KEY");
    }
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
    
    console.log("✅ All environment variables loaded successfully");
    console.log(`   DEEPGRAM_API_KEY: ${this.DEEPGRAM_API_KEY.substring(0, 10)}...`);
    console.log(`   GROQ_API_KEY: ${this.GROQ_API_KEY.substring(0, 10)}...`);
  }
}

// Validate configuration on import
try {
  Config.validate();
} catch (error) {
  console.error('❌ Configuration Error:', error.message);
  console.log('   Please check your .env file');
  process.exit(1);
}

export default Config;