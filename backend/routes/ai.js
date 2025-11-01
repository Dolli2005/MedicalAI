import express from 'express';
import GroqService from '../services/groqServices.js';
import { parseCommandFromText } from '../services/parse_voice.js';

const router = express.Router();
const groqService = new GroqService();

// Process message with Groq AI
router.post('/process-message', async (req, res) => {
  try {
    const { message, command } = req.body;
    
    if (!message) {
      return res.status(400).json({
        success: false,
        error: "Message is required"
      });
    }
    
    console.log(`🤖 Processing message: '${message}'`);
    
    // Process with Groq AI
    const response = await groqService.processMessage(message, command);
    
    res.json({
      success: true,
      data: {
        text: response.text,
        shouldListen: response.shouldListen,
        action: response.action,
        contactName: response.contactName,
        phoneNumber: response.phoneNumber
      }
    });
    
  } catch (error) {
    console.error('❌ Error processing message:', error.message);
    res.status(500).json({
      success: false,
      error: `Message processing failed: ${error.message}`
    });
  }
});

// Parse voice command from transcript
router.post('/parse-command', async (req, res) => {
  try {
    const { transcript } = req.body;
    
    if (!transcript) {
      return res.status(400).json({
        success: false,
        error: "Transcript is required"
      });
    }
    
    console.log(`🎯 Parsing command from: '${transcript}'`);
    
    // Simple command parsing
    const command = parseCommandFromText(transcript);
    
    res.json({
      success: true,
      data: command
    });
    
  } catch (error) {
    console.error('❌ Error parsing command:', error.message);
    res.status(500).json({
      success: false,
      error: `Command parsing failed: ${error.message}`
    });
  }
});

// Get AI suggestions for a contact
router.get('/suggestions/:contact_id', async (req, res) => {
  try {
    const { contact_id } = req.params;
    const suggestions = await groqService.getSuggestions(contact_id);
    
    res.json({
      success: true,
      data: suggestions
    });
    
  } catch (error) {
    console.error('❌ Error getting suggestions:', error.message);
    res.status(500).json({
      success: false,
      error: `Suggestions error: ${error.message}`
    });
  }
});

// Get contact insights
router.get('/contact-insights/:contact_id', async (req, res) => {
  try {
    const { contact_id } = req.params;
    const insights = await groqService.getContactInsights(contact_id);
    
    res.json({
      success: true,
      data: insights
    });
    
  } catch (error) {
    console.error('❌ Error getting insights:', error.message);
    res.status(500).json({
      success: false,
      error: `Insights error: ${error.message}`
    });
  }
});

// Health check
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'ai-processor',
    message: 'Ready to process AI messages'
  });
});

export default router;