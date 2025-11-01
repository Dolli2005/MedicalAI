export function parseCommandFromText(transcript) {
  const transcriptLower = transcript.toLowerCase();
  const command = {
    action: "",
    parameters: {},
    confidence: 0.8
  };
  
  // Health symptoms and concerns
  const healthKeywords = {
    'headache': 'headache',
    'fever': 'fever', 
    'pain': 'pain',
    'cough': 'cough',
    'cold': 'cold',
    'flu': 'flu',
    'nausea': 'nausea',
    'dizziness': 'dizziness',
    'chest pain': 'chest_pain',
    'shortness of breath': 'breathing_difficulty'
  };
  
  // Appointment related
  const appointmentKeywords = ['appointment', 'schedule', 'book', 'see doctor'];
  if (appointmentKeywords.some(word => transcriptLower.includes(word))) {
    command.action = "book_appointment";
    // Extract date/time if mentioned
    if (transcriptLower.includes('tomorrow')) {
      command.parameters.when = "tomorrow";
    } else if (transcriptLower.includes('today')) {
      command.parameters.when = "today";
    } else if (transcriptLower.includes('next week')) {
      command.parameters.when = "next_week";
    }
  }
  // Find doctor
  else if (['find doctor', 'looking for', 'need a', 'recommend'].some(word => transcriptLower.includes(word))) {
    command.action = "find_doctor";
    // Extract specialty if mentioned
    const specialties = ['cardiologist', 'dentist', 'dermatologist', 'psychiatrist', 'therapist'];
    for (const specialty of specialties) {
      if (transcriptLower.includes(specialty)) {
        command.parameters.specialty = specialty;
        break;
      }
    }
  }
  // Emergency
  else if (['emergency', 'urgent', '911', 'help'].some(word => transcriptLower.includes(word))) {
    command.action = "emergency";
  }
  // Medication
  else if (['medicine', 'prescription', 'pharmacy'].some(word => transcriptLower.includes(word))) {
    command.action = "medication";
  }
  // General health advice
  else {
    command.action = "health_advice";
    // Extract symptoms
    const symptoms = [];
    for (const [symptom, code] of Object.entries(healthKeywords)) {
      if (transcriptLower.includes(symptom)) {
        symptoms.push(code);
      }
    }
    if (symptoms.length > 0) {
      command.parameters.symptoms = symptoms;
    }
  }
  
  return command;
}