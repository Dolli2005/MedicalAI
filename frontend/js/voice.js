const tryAssistantBtn = document.querySelector('.nav-item[data-nav="AI Assistant"]');
    
    // Voice Assistant State
    let isListening = false;
    let mediaStream = null;
    let socket = null;
    let audioContext = null;
    let processor = null;

    // Create Voice Modal dynamically
    function createVoiceModal() {
        const modalHTML = `
        <div class="voice-modal" id="voice-modal">
            <div class="voice-modal-content">
                <h2>Medi AI Voice Assistant</h2>
                <div class="voice-status" id="voice-status">Click "Start Listening" to begin</div>
                
                <div class="voice-animation" id="voice-animation">
                    <div class="pulse-ring"></div>
                    <div class="pulse-ring"></div>
                    <div class="pulse-ring"></div>
                    <div class="voice-icon">
                        <i class="fas fa-microphone"></i>
                    </div>
                </div>
                
                <div class="transcript-container">
                    <div class="transcript" id="transcript">
                        <div style="color: #b886db; text-align: center; padding: 20px;">
                            <i class="fas fa-robot" style="font-size: 2rem; margin-bottom: 10px; display: block;"></i>
                            Hello! Nice To meet You. To enable me click on Start Listening<br>and enjoy the show.<br>
                            <br>
                        </div>
                    </div>
                </div>
                
                <div class="voice-controls">
                    <button class="voice-btn voice-btn-primary" id="start-listening">
                        <i class="fas fa-microphone"></i> Start Listening
                    </button>
                    <button class="voice-btn voice-btn-outline" id="close-modal">
                        <i class="fas fa-times"></i> Close
                    </button>
                </div>
            </div>
        </div>
        
        <style>
            /* Voice Assistant Modal */
            .voice-modal {
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.9);
                z-index: 10000;
                justify-content: center;
                align-items: center;
                backdrop-filter: blur(10px);
            }

            .voice-modal.active {
                display: flex;
            }

            .voice-modal-content {
                background: linear-gradient(135deg, #1a1a4a, #2a0a4a);
                border-radius: 20px;
                padding: 30px;
                width: 90%;
                max-width: 500px;
                text-align: center;
                box-shadow: 0 20px 60px rgba(138, 43, 226, 0.3);
                border: 2px solid #8a2be2;
                animation: modalSlideIn 0.3s ease-out;
            }

            @keyframes modalSlideIn {
                from {
                    opacity: 0;
                    transform: translateY(-50px) scale(0.9);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }

            .voice-status {
                margin: 20px 0;
                font-size: 1.2rem;
                color: #b886db;
                font-weight: 600;
                min-height: 30px;
            }

            .voice-animation {
                width: 100px;
                height: 100px;
                margin: 20px auto;
                position: relative;
            }

            .pulse-ring {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                border-radius: 50%;
                border: 3px solid #8a2be2;
                animation: pulse-ring 1.5s infinite;
                opacity: 0;
            }

            .pulse-ring:nth-child(1) { animation-delay: 0s; }
            .pulse-ring:nth-child(2) { animation-delay: 0.5s; }
            .pulse-ring:nth-child(3) { animation-delay: 1s; }

            @keyframes pulse-ring {
                0% {
                    transform: scale(0.8);
                    opacity: 1;
                }
                100% {
                    transform: scale(1.5);
                    opacity: 0;
                }
            }

            .voice-icon {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                font-size: 2.5rem;
                color: #8a2be2;
                transition: all 0.3s;
            }

            .listening .voice-icon {
                color: #b886db;
                animation: pulse 1s infinite;
            }

            @keyframes pulse {
                0%, 100% { transform: translate(-50%, -50%) scale(1); }
                50% { transform: translate(-50%, -50%) scale(1.1); }
            }

            .transcript-container {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 15px;
                padding: 20px;
                margin: 20px 0;
                min-height: 150px;
                max-height: 300px;
                overflow-y: auto;
                border: 1px solid rgba(138, 43, 226, 0.3);
            }

            .transcript {
                color: #fff;
                font-size: 1rem;
                line-height: 1.6;
            }

            .transcript div {
                margin-bottom: 15px;
                padding: 10px;
                border-radius: 10px;
            }

            .voice-controls {
                display: flex;
                justify-content: center;
                gap: 15px;
                margin-top: 20px;
            }

            .voice-btn {
                padding: 12px 24px;
                border-radius: 30px;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.3s;
                border: none;
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 1rem;
            }

            .voice-btn-primary {
                background: linear-gradient(135deg, #8a2be2, #b886db);
                color: #fff;
            }

            .voice-btn-primary:hover {
                box-shadow: 0 0 25px rgba(138, 43, 226, 0.7);
                transform: translateY(-2px);
            }

            .voice-btn-primary:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: none;
                box-shadow: none;
            }

            .voice-btn-outline {
                background: transparent;
                border: 2px solid #8a2be2;
                color: #fff;
            }

            .voice-btn-outline:hover {
                background: rgba(138, 43, 226, 0.2);
                transform: translateY(-2px);
            }

            .user-message {
                background: rgba(138, 43, 226, 0.1);
                border-left: 4px solid #8a2be2;
                margin: 10px 0;
                padding: 12px;
                border-radius: 10px;
            }

            .ai-message {
                background: rgba(184, 134, 219, 0.1);
                border-left: 4px solid #b886db;
                margin: 10px 0;
                padding: 12px;
                border-radius: 10px;
            }

            .emergency-message {
                background: rgba(255, 68, 68, 0.1);
                border-left: 4px solid #ff4444;
                margin: 10px 0;
                padding: 12px;
                border-radius: 10px;
                animation: emergencyPulse 1s infinite;
            }

            @keyframes emergencyPulse {
                0%, 100% { border-left-color: #ff4444; }
                50% { border-left-color: #ff8888; }
            }

            .speaking .voice-icon {
                color: #00ff88;
                animation: speakPulse 0.5s infinite;
            }

            @keyframes speakPulse {
                0%, 100% { transform: translate(-50%, -50%) scale(1); }
                50% { transform: translate(-50%, -50%) scale(1.2); }
            }
        </style>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    let lastSpokenText = "";

    // Text-to-Speech function
    function speakText(text) {
        return new Promise((resolve) => {
            if (!('speechSynthesis' in window)) {
                console.warn('Speech synthesis not supported');
                resolve();
                return;
            }
            lastSpokenText = text;

            // Stop any ongoing speech
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            
            // Configure voice settings
            utterance.rate = 0.9;
            utterance.pitch = 1.0;
            utterance.volume = 1.0;
            
            // Try to get a pleasant voice
            const voices = window.speechSynthesis.getVoices();
            const preferredVoices = voices.filter(voice => 
                voice.lang.includes('en') && 
                (voice.name.includes('Female') || voice.name.includes('Google') || voice.name.includes('Microsoft'))
            );
            
            if (preferredVoices.length > 0) {
                utterance.voice = preferredVoices[0];
            }

            // Visual feedback for speaking
            if (window.voiceAnimation) {
                window.voiceAnimation.classList.add('speaking');
            }
            if (window.voiceStatus) {
                window.voiceStatus.textContent = '🗣️ Speaking...';
            }
            utterance.onstart = () => {
                console.log('🔊 Started speaking:', text);
            };

            utterance.onend = () => {
                console.log('🔇 Finished speaking');
                if (window.voiceAnimation) {
                    window.voiceAnimation.classList.remove('speaking');
                }
                if (window.voiceStatus && !isListening) {
                    window.voiceStatus.textContent = 'Ready to listen';
                }
                resolve();
            };

            utterance.onerror = (event) => {
                console.error('Speech synthesis error:', event);
                if (window.voiceAnimation) {
                    window.voiceAnimation.classList.remove('speaking');
                }
                if (window.voiceStatus) {
                    window.voiceStatus.textContent = 'Ready to listen';
                }
                resolve();
            };

            // Start speaking
            window.speechSynthesis.speak(utterance);
        });
    }

    // Wait for voices to load
    function loadVoices() {
        return new Promise((resolve) => {
            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
                resolve(voices);
            } else {
                window.speechSynthesis.onvoiceschanged = () => {
                    resolve(window.speechSynthesis.getVoices());
                };
            }
        });
    }

    // Initialize the voice assistant
    async function initVoiceAssistant() {
        // Create the modal first
        createVoiceModal();
        
        // Load available voices
        await loadVoices();
        
        // Get references to modal elements
        const voiceModal = document.getElementById('voice-modal');
        const startListeningBtn = document.getElementById('start-listening');
        const closeModalBtn = document.getElementById('close-modal');
        const voiceStatus = document.getElementById('voice-status');
        const transcriptElement = document.getElementById('transcript');
        const voiceAnimation = document.getElementById('voice-animation');
        
        // Set up main button click
        tryAssistantBtn.addEventListener('click', () => {
            console.log('🎯 Try AI Assistant button clicked');
            openVoiceModal();
        });
        
        // Set up modal button events
        startListeningBtn.addEventListener('click', toggleListening);
        closeModalBtn.addEventListener('click', closeVoiceModal);
        
        // Connect to WebSocket
        connectWebSocket();
        
        // Store references globally for other functions to use
        window.voiceModal = voiceModal;
        window.startListeningBtn = startListeningBtn;
        window.voiceStatus = voiceStatus;
        window.transcriptElement = transcriptElement;
        window.voiceAnimation = voiceAnimation;

        console.log('✅ Voice assistant initialized with TTS support');
    }

    // Connect to WebSocket - FIXED: Now properly connects to your backend
    function connectWebSocket() {
        try {
            // Use the same port as your Express server (3000)
            socket = io('http://localhost:3000');
            
            socket.on('connect', () => {
                console.log('✅ Connected to WebSocket server');
                if (window.voiceStatus) {
                    window.voiceStatus.textContent = 'Connected - Ready to listen';
                }
                enableListeningButton();
            });
            
            socket.on('deepgram_connected', () => {
                console.log('✅ Deepgram WebSocket connected');
                if (window.voiceStatus) {
                    window.voiceStatus.textContent = 'Ready - Click Start Listening';
                }
                if (window.startListeningBtn) {
                    window.startListeningBtn.disabled = false;
                }
            });
            
            socket.on('transcript', (data) => {
                handleTranscript(data);
            });
            
            socket.on('ai_response', async (data) => {
                await handleAIResponse(data);
            });
            
            socket.on('speak', async (data) => {
                await speakText(data.text);
            });
            
            socket.on('workflow_result', (data) => {
                handleWorkflowResult(data);
            });
            
            socket.on('error', (data) => {
                console.error('WebSocket error:', data.error);
                if (window.voiceStatus) {
                    window.voiceStatus.textContent = `Error: ${data.error}`;
                }
            });
            
            socket.on('disconnect', () => {
                console.log('🔌 Disconnected from WebSocket');
                if (window.voiceStatus) {
                    window.voiceStatus.textContent = 'Connection lost - Reconnecting...';
                }
            });
            
        } catch (error) {
            console.error('Error connecting to WebSocket:', error);
            if (window.voiceStatus) {
                window.voiceStatus.textContent = 'Failed to connect to server';
            }
        }
    }

    function openVoiceModal() {
    if (window.voiceModal) {
        window.voiceModal.classList.add('active');
        window.voiceStatus.textContent = 'Connecting to server...';
        window.startListeningBtn.disabled = true;
        window.startListeningBtn.style.cursor = 'not-allowed';
        window.startListeningBtn.innerHTML = '<i class="fas fa-microphone"></i> Start Listening';
        window.voiceAnimation.classList.remove('listening');
        window.voiceAnimation.classList.remove('speaking');
        
        // Clear previous transcripts except the welcome message
        const welcomeMsg = window.transcriptElement.querySelector('div');
        window.transcriptElement.innerHTML = '';
        if (welcomeMsg) {
            window.transcriptElement.appendChild(welcomeMsg);
        }

        // If not connected, reconnect WebSocket
        if (!socket || !socket.connected) {
            connectWebSocket();
        } else {
            enableListeningButton();
        }
    }
}

function enableListeningButton() {
    if (window.startListeningBtn) {
        window.startListeningBtn.disabled = false;
        window.startListeningBtn.style.cursor = 'pointer';
        window.voiceStatus.textContent = 'Ready - Click Start Listening';
    }
}


    // Close the voice modal
    function closeVoiceModal() {
        stopListening();
        // Stop any ongoing speech
        window.speechSynthesis.cancel();
        if (window.voiceModal) {
            window.voiceModal.classList.remove('active');
        }
    }

    // Toggle listening state
    function toggleListening() {
        if (isListening) {
            stopListening();
        } else {
            startListening();
        }
    }

    // Start listening to user's voice
    async function startListening() {
        try {
            if (!socket || !socket.connected) {
                window.voiceStatus.textContent = 'Not connected to server';
                return;
            }

            window.voiceStatus.textContent = 'Requesting microphone access...';
            
            // Request microphone access
            mediaStream = await navigator.mediaDevices.getUserMedia({ 
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    channelCount: 1,
                    sampleRate: 8000
                } 
            });
            
            // Set up audio processing for WebSocket streaming
            audioContext = new AudioContext({ sampleRate: 16000 });
            const source = audioContext.createMediaStreamSource(mediaStream);
            processor = audioContext.createScriptProcessor(4096, 1, 1);
            
            source.connect(processor);
            processor.connect(audioContext.destination);
            
            processor.onaudioprocess = (event) => {
                if (socket && socket.connected && isListening) {
                    const audioData = event.inputBuffer.getChannelData(0);
                    const pcmData = convertFloat32ToInt16(audioData);
                    socket.emit('audio_data', pcmData);
                }
            };
            
            // Start the listening session
            socket.emit('start_listening');
            
            isListening = true;
            
            // Update UI
            window.voiceStatus.textContent = '🎤 Listening... Speak now';
            window.startListeningBtn.innerHTML = '<i class="fas fa-stop"></i> Stop Listening';
            window.voiceAnimation.classList.add('listening');
            
            // Add listening started message
            addTranscriptMessage("🎤 Listening started... Speak clearly and naturally", "system");
            
        } catch (error) {
            console.error('Error accessing microphone:', error);
            window.voiceStatus.textContent = '❌ Microphone access denied';
            addTranscriptMessage("❌ Could not access microphone. Please check browser permissions and allow microphone access.", "error");
        }
    }

    // Stop Listening
function stopListening() {
    if (!isListening) return;
    isListening = false;

    if (processor) {
        processor.disconnect();
        processor = null;
    }
    if (source) {
        source.disconnect();
        source = null;
    }
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
        mediaStream = null;
    }
    if (audioContext) {
        audioContext.close();
        audioContext = null;
    }

    window.voiceStatus.textContent = "🛑 Stopped listening";
    window.voiceAnimation.classList.remove("listening");
    console.log("Listening stopped cleanly");
}

    // Convert Float32 to Int16 for WebSocket streaming
    function convertFloat32ToInt16(buffer) {
        const l = buffer.length;
        const buf = new Int16Array(l);
        for (let i = 0; i < l; i++) {
            buf[i] = Math.min(1, buffer[i]) * 0x7FFF;
        }
        return buf.buffer;
    }

    // Handle transcript from Deepgram
    function handleTranscript(data) {
        if (data.transcript.trim()) {
            addTranscriptMessage(data.transcript, "user");
        }
        
        if (data.is_final && data.transcript.trim()) {
            window.voiceStatus.textContent = '🤔 Processing with AI...';
        }
    }

    // Handle AI response - FIXED: Now uses actual backend AI responses
    async function handleAIResponse(data) {
        addTranscriptMessage(data.data.text, "ai");
        
        // Speak the AI response
        await speakText(data.data.text);
        
        window.voiceStatus.textContent = '✅ Ready for your next request';
    }

    // Handle workflow results
    function handleWorkflowResult(data) {
        const messageType = data.action === 'emergency' ? 'emergency' : 'ai';
        addTranscriptMessage(data.message, messageType);
        
        // Special handling for emergencies
        if (data.action === 'emergency') {
            window.voiceStatus.textContent = '🚨 EMERGENCY - Please take action!';
            // Flash the status for emergencies
            flashEmergency();
            // Speak emergency message
            speakText("Emergency! " + data.message);
        }
    }

    // Add message to transcript
    function addTranscriptMessage(text, type = "system") {
        const messageDiv = document.createElement('div');
        
        switch (type) {
            case "user":
                messageDiv.className = "user-message";
                messageDiv.innerHTML = `<strong>You:</strong> ${text}`;
                break;
            case "ai":
                messageDiv.className = "ai-message";
                messageDiv.innerHTML = `<strong>Medi AI:</strong> ${text}`;
                break;
            case "emergency":
                messageDiv.className = "emergency-message";
                messageDiv.innerHTML = `<strong>🚨 EMERGENCY:</strong> ${text}`;
                break;
            case "error":
                messageDiv.className = "emergency-message";
                messageDiv.innerHTML = `<strong>❌ Error:</strong> ${text}`;
                break;
            default:
                messageDiv.innerHTML = text;
                messageDiv.style.color = '#b886db';
                messageDiv.style.textAlign = 'center';
        }
        
        window.transcriptElement.appendChild(messageDiv);
        window.transcriptElement.scrollTop = window.transcriptElement.scrollHeight;
    }

    // Flash emergency style
    function flashEmergency() {
        const originalColor = window.voiceStatus.style.color;
        window.voiceStatus.style.color = '#ff4444';
        setTimeout(() => {
            window.voiceStatus.style.color = originalColor;
        }, 2000);
    }

    // Initialize when page loads
    document.addEventListener('DOMContentLoaded', async () => {
        console.log('🚀 Initializing Medi AI Voice Assistant...');
        await initVoiceAssistant();
        
        // Add 3D effect for logo
        document.addEventListener('mousemove', (e) => {
            const logo = document.querySelector('.logo');
            if (logo) {
                const x = (window.innerWidth / 2 - e.pageX) / 25;
                const y = (window.innerHeight / 2 - e.pageY) / 25;
                logo.style.transform = `rotateY(${x}deg) rotateX(${y}deg)`;
            }
        });

        // Add twinkling stars
        const starsContainer = document.querySelector('.stars');
        if (starsContainer) {
            for (let i = 0; i < 100; i++) {
                const star = document.createElement('div');
                star.style.position = 'absolute';
                star.style.width = Math.random() * 3 + 'px';
                star.style.height = star.style.width;
                star.style.backgroundColor = '#fff';
                star.style.borderRadius = '50%';
                star.style.top = Math.random() * 100 + '%';
                star.style.left = Math.random() * 100 + '%';
                star.style.boxShadow = '0 0 10px #fff';
                star.style.animation = `twinkle ${Math.random() * 5 + 3}s infinite ${Math.random() * 5}s`;
                starsContainer.appendChild(star);
            }
        }
        
        console.log('✅ Medi AI Voice Assistant initialized with full TTS support');
    });

    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
        if (document.hidden && isListening) {
            stopListening();
            window.speechSynthesis.cancel();
        }
    });