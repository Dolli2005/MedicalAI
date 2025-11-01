import axios from 'axios';
import Config from '../config/configure.js';

class N8NService {
  constructor() {
    this.n8nWebhookUrl = Config.N8N_WEBHOOK_URL || "https://your-n8n-instance.com/webhook";
  }
  
  async triggerWorkflow(workflowData) {
    try {
      const response = await axios.post(
        this.n8nWebhookUrl,
        workflowData,
        { headers: { "Content-Type": "application/json" } }
      );
      
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

const n8nService = new N8NService();

export async function triggerAppointmentWorkflow(aiResponse, socket = null) {
  const workflowData = {
    action: "book_appointment",
    user_query: aiResponse.text || "",
    contact_name: aiResponse.contactName || "",
    phone_number: aiResponse.phoneNumber || "",
    timestamp: "asap"
  };
  
  const result = await n8nService.triggerWorkflow(workflowData);
  
  if (socket && result.success) {
    socket.emit('workflow_result', {
      type: "workflow_result",
      action: "appointment_booking",
      status: "success",
      message: "Appointment booking process initiated"
    });
  }
  
  return result;
}

export async function triggerCallWorkflow(aiResponse, socket = null) {
  const workflowData = {
    action: "call_contact",
    contact_name: aiResponse.contactName || "",
    phone_number: aiResponse.phoneNumber || "",
    purpose: "health_consultation"
  };
  
  const result = await n8nService.triggerWorkflow(workflowData);
  
  if (socket && result.success) {
    socket.emit('workflow_result', {
      type: "workflow_result",
      action: "calling",
      status: "success",
      message: "Call process initiated"
    });
  }
  
  return result;
}

export async function triggerFindDoctorWorkflow(aiResponse, socket = null) {
  const workflowData = {
    action: "find_doctor",
    specialty: aiResponse.parameters?.specialty || "general",
    location: "user_location",
    urgency: "standard"
  };
  
  const result = await n8nService.triggerWorkflow(workflowData);
  
  if (socket && result.success) {
    socket.emit('workflow_result', {
      type: "workflow_result",
      action: "find_doctor",
      status: "success",
      message: "Searching for suitable healthcare providers"
    });
  }
  
  return result;
}

export default N8NService;