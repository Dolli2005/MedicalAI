// backend-server.js - Complete Voice Assistant Backend
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { createClient } from '@deepgram/sdk';
import cors from 'cors';
import Groq from 'groq-sdk';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Configuration - Add your API keys here
const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY; // Get from https://deepgram.com
const GROQ_API_KEY = process.env.GROQ_API_KEY; // Get from https://groq.com

// Initialize services
const deepgram = createClient(DEEPGRAM_API_KEY);
const groq = new Groq({ apiKey: GROQ_API_KEY });

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Mediverse AI Voice Assistant Backend Running' });
});

// System prompt for medical AI
const MEDICAL_SYSTEM_PROMPT = `You are Medi AI, an intelligent healthcare assistant for Mediverse.ai. Your role is to help users with health concerns, book appointments, find doctors, and provide medical guidance.

MEDICAL INTENT DETECTION RULES:
1. If user mentions symptoms, pain, or health issues → action: "health_advice"
2. If user wants to book appointment, see doctor, schedule → action: "book_appointment" 
3. If user needs to find a doctor, specialist, healthcare provider → action: "find_doctor"
4. If user mentions emergency, urgent, severe symptoms → action: "emergency"
5. Otherwise → action: "conversation"

MEDICAL GUIDELINES:
- Always be empathetic and professional
- For serious symptoms, recommend consulting healthcare professionals
- For emergencies, direct to seek immediate medical attention
- Ask clarifying questions when needed
- Provide clear next steps
- Keep responses concise (2-3 sentences max for voice)

RESPONSE FORMAT - ALWAYS return valid JSON:
{
  "text": "Your natural, concise medical response",
  "action": "health_advice|book_appointment|find_doctor|emergency|conversation",
  "shouldListen": true/false
}`;

// Store conversation history per socket
const conversationHistories = new Map();

io.on('connection', (socket) => {
  console.log(`✅ Client connected: ${socket.id}`);
  
  // Initialize conversation history for this socket
  conversationHistories.set(socket.id, []);
  
  let deepgramLive = null;

  socket.on('start_listening', async () => {
    try {
      console.log(`🎤 Starting Deepgram session for ${socket.id}`);
      
      // Create Deepgram live transcription connection
      deepgramLive = deepgram.listen.live({
        model: 'nova-2',
        language: 'en-US',
        smart_format: true,
        interim_results: true,
        utterance_end_ms: 1500,
        endpointing: 500
      });

      // Handle Deepgram connection open
      deepgramLive.on('open', () => {
        console.log('✅ Deepgram connection opened');
        socket.emit('deepgram_connected');
      });

      // Handle transcription results
      deepgramLive.on('Results', async (data) => {
        const transcript = data.channel.alternatives[0].transcript;
        const isFinal = data.is_final;
        
        if (transcript && transcript.trim().length > 0) {
          console.log(`📝 Transcript (${isFinal ? 'final' : 'interim'}): ${transcript}`);
          
          socket.emit('transcript', {
            transcript: transcript,
            is_final: isFinal
          });

          // Process final transcripts with AI
          if (isFinal && transcript.trim().length > 3) {
            try {
              const aiResponse = await processWithAI(socket.id, transcript);
              socket.emit('ai_response', { data: aiResponse });
              
              // Trigger speech synthesis on frontend
              socket.emit('speak', { text: aiResponse.text });
              
              // Handle special actions
              if (aiResponse.action === 'emergency') {
                socket.emit('workflow_result', {
                  action: 'emergency',
                  message: aiResponse.text
                });
              }
            } catch (error) {
              console.error('❌ Error processing with AI:', error);
              socket.emit('error', { error: 'Failed to process your request' });
            }
          }
        }
      });

      // Handle errors
      deepgramLive.on('error', (error) => {
        console.error('❌ Deepgram error:', error);
        socket.emit('error', { error: 'Speech recognition error' });
      });

      // Handle connection close
      deepgramLive.on('close', () => {
        console.log('🔌 Deepgram connection closed');
      });

    } catch (error) {
      console.error('❌ Error starting Deepgram:', error);
      socket.emit('error', { error: 'Failed to start speech recognition' });
    }
  });

  // Receive and forward audio data to Deepgram
  socket.on('audio_data', (audioData) => {
    if (deepgramLive && deepgramLive.getReadyState() === 1) {
      deepgramLive.send(audioData);
    }
  });

  socket.on('stop_listening', () => {
    if (deepgramLive) {
      console.log(`⏹️ Stopping Deepgram session for ${socket.id}`);
      deepgramLive.finish();
      deepgramLive = null;
    }
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
    if (deepgramLive) {
      deepgramLive.finish();
    }
    conversationHistories.delete(socket.id);
  });
});

// Process user message with Groq AI
async function processWithAI(socketId, message) {
  try {
    console.log(`🤖 Processing with Groq: "${message}"`);
    
    const history = conversationHistories.get(socketId) || [];
    
    // Emergency detection
    const emergencyKeywords = ['chest pain', 'heart attack', 'stroke', 'difficulty breathing', 'severe pain', 'bleeding', 'unconscious', 'cant breathe', 'emergency'];
    const messageLower = message.toLowerCase();
    
    if (emergencyKeywords.some(keyword => messageLower.includes(keyword))) {
      return {
        text: "This sounds like a medical emergency! Please call emergency services immediately or go to the nearest emergency room.",
        action: "emergency",
        shouldListen: false
      };
    }

    // Build messages for Groq
    const messages = [
      { role: "system", content: MEDICAL_SYSTEM_PROMPT },
      ...history.slice(-6), // Keep last 3 exchanges
      { role: "user", content: message }
    ];

    // Call Groq API
    const completion = await groq.chat.completions.create({
      messages,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.3,
      max_tokens: 150,
      response_format: { type: "json_object" }
    });

    const responseText = completion.choices[0].message.content;
    const responseData = JSON.parse(responseText);
    
    // Update conversation history
    history.push(
      { role: "user", content: message },
      { role: "assistant", content: responseText }
    );
    
    // Keep history manageable
    if (history.length > 20) {
      conversationHistories.set(socketId, history.slice(-20));
    } else {
      conversationHistories.set(socketId, history);
    }
    
    const result = {
      text: responseData.text || "I'm here to help with your healthcare needs.",
      shouldListen: responseData.shouldListen !== false,
      action: responseData.action || "conversation"
    };
    
    console.log(`✅ AI Response: ${result.action} - ${result.text.substring(0, 50)}...`);
    return result;
    
  } catch (error) {
    console.error('❌ Groq API error:', error);
    return {
      text: "I apologize, I'm having trouble processing your request. How else can I assist you?",
      shouldListen: true,
      action: "conversation"
    };
  }
}

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Mediverse AI Voice Assistant Backend running on port ${PORT}`);
  console.log(`📡 WebSocket server ready for connections`);
  console.log(`🏥 Health check: http://localhost:${PORT}/health`);
});