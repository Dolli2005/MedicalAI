import WebSocket from 'ws';
import Config from '../config/configure.js';
import GroqService from '../services/groqServices.js';
import { triggerAppointmentWorkflow, triggerCallWorkflow, triggerFindDoctorWorkflow } from '../services/n8nService.js';

const groqService = new GroqService();

export function setupWebSocket(io) {
  io.on('connection', (socket) => {
    console.log('🎙️ Client connected to WebSocket');

    socket.on('start_listening', async (data) => {
      console.log('🔊 Starting voice listening session');
      
      try {
        // Connect to Deepgram WebSocket
        const deepgramUrl = 'ws://api.deepgram.com/v1/listen?model=nova-2&encoding=linear16&sample_rate=16000&channels=1&punctuate=true&interim_results=true&endpointing=300';
        
        const deepgramSocket = new WebSocket(deepgramUrl, {
          headers: {
            'Authorization': `Token ${Config.DEEPGRAM_API_KEY}`
          }
        });

        deepgramSocket.on('open', () => {
          console.log('✅ Connected to Deepgram WebSocket');
          socket.emit('deepgram_connected');
        });

        deepgramSocket.on('message', (data) => {
          try {
            const message = JSON.parse(data);
            
            // Extract transcript from Deepgram response
            const channel = message.channel || {};
            const alternatives = channel.alternatives || [];
            
            if (alternatives.length > 0) {
              const transcript = alternatives[0].transcript || '';
              const isFinal = message.is_final || false;
              
              if (transcript.trim()) {
                // Send transcript back to client
                socket.emit('transcript', {
                  transcript,
                  is_final: isFinal
                });
                
                if (isFinal) {
                  console.log(`🗣️ Final Transcript: ${transcript}`);
                  // Process final transcript with AI
                  processFinalTranscript(transcript, socket);
                } else {
                  console.log(`📝 Interim Transcript: ${transcript}`);
                }
              }
            }
          } catch (error) {
            console.error('❌ Error processing Deepgram message:', error);
          }
        });

        deepgramSocket.on('error', (error) => {
          console.error('❌ Deepgram WebSocket error:', error);
          socket.emit('error', { error: 'Deepgram connection error' });
        });

        deepgramSocket.on('close', () => {
          console.log('🔌 Deepgram connection closed');
        });

        // Handle audio data from client
        socket.on('audio_data', (audioData) => {
          if (deepgramSocket.readyState === WebSocket.OPEN) {
            deepgramSocket.send(audioData);
          }
        });

        // Clean up when client disconnects
        socket.on('disconnect', () => {
          console.log('🔌 Client disconnected');
          if (deepgramSocket.readyState === WebSocket.OPEN) {
            deepgramSocket.close();
          }
        });

      } catch (error) {
        console.error('❌ WebSocket setup error:', error);
        socket.emit('error', { error: error.message });
      }
    });
  });
}

async function processFinalTranscript(transcript, socket) {
  try {
    // Process with Groq AI
    const aiResponse = await groqService.processMessage(transcript);
    
    // Send AI response back to client
    socket.emit('ai_response', {
      type: 'ai_response',
      data: {
        text: aiResponse.text,
        shouldListen: aiResponse.shouldListen,
        action: aiResponse.action,
        contactName: aiResponse.contactName,
        phoneNumber: aiResponse.phoneNumber
      }
    });
    
    // Speak the response
    socket.emit('speak', {
      type: 'speak',
      text: aiResponse.text
    });
    
    console.log(`🤖 AI Action: ${aiResponse.action}`);
    console.log(`💬 Response: ${aiResponse.text}`);
    
    // Handle medical actions
    if (aiResponse.action !== 'conversation') {
      await handleMedicalAction(aiResponse, socket);
    }
    
  } catch (error) {
    console.error('❌ Error processing transcript:', error);
    socket.emit('ai_response', {
      type: 'ai_response',
      data: {
        text: "I apologize, but I'm having trouble processing your request. Please try again.",
        shouldListen: true,
        action: 'conversation'
      }
    });
  }
}

async function handleMedicalAction(aiResponse, socket) {
  try {
    const action = aiResponse.action;
    
    if (action === 'emergency') {
      socket.emit('workflow_result', {
        type: 'workflow_result',
        action: 'emergency',
        status: 'critical',
        message: '🚨 Emergency protocol activated. Please seek immediate medical attention.'
      });
      
    } else if (action === 'book_appointment') {
      socket.emit('workflow_result', {
        type: 'workflow_result',
        action: 'appointment_booking',
        status: 'initiated',
        message: 'Starting appointment booking process...'
      });
      
      // Trigger n8n workflow
      await triggerAppointmentWorkflow(aiResponse, socket);
      
    } else if (action === 'find_doctor') {
      socket.emit('workflow_result', {
        type: 'workflow_result',
        action: 'find_doctor',
        status: 'searching',
        message: 'Searching for healthcare providers...'
      });
      
      // Trigger n8n workflow
      await triggerFindDoctorWorkflow(aiResponse, socket);
      
    } else if (action === 'call_contact') {
      socket.emit('workflow_result', {
        type: 'workflow_result',
        action: 'call_contact',
        status: 'connecting',
        message: `Connecting you with ${aiResponse.contactName || 'your contact'}...`
      });
      
      // Trigger n8n workflow
      await triggerCallWorkflow(aiResponse, socket);
    }
    
  } catch (error) {
    console.error('❌ Error handling medical action:', error);
  }
}