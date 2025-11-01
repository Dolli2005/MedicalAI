// API base URL - when backend serves frontend, use relative path
const API_BASE = '/api';

// Generic API call helper
async function apiCall(endpoint, method = 'GET', data = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        },
    };
    
    // Attach JWT if available
    try {
        const token = localStorage.getItem('mv_token');
        if (token) options.headers['Authorization'] = `Bearer ${token}`;
    } catch (e) {
        // localStorage may be unavailable in some contexts
    }

    if (data) {
        options.body = JSON.stringify(data);
    }
    
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    if (!response.ok) {
        // If unauthorized, clear token and redirect to login (caller may handle)
        if (response.status === 401) {
            try { localStorage.removeItem('mv_token'); } catch (e) {}
            throw new Error('Unauthorized. Please login again.');
        }
        const text = await response.text();
        let msg = response.statusText;
        try {
            const json = JSON.parse(text);
            msg = json.error || json.message || msg;
        } catch (e) {}
        throw new Error(`API call failed: ${msg}`);
    }
    return response.json();
}

// Appointments API
const appointmentsApi = {
    list: () => apiCall('/appointments'),
    get: (id) => apiCall(`/appointments/${id}`),
    create: (data) => apiCall('/appointments', 'POST', data),
    update: (id, data) => apiCall(`/appointments/${id}`, 'PUT', data),
    delete: (id) => apiCall(`/appointments/${id}`, 'DELETE'),
};

// Auth API
const authApi = {
    login: (data) => apiCall('/auth/login', 'POST', data),
    register: (data) => apiCall('/auth/register', 'POST', data),
    me: () => apiCall('/auth/me')
};

// Prescriptions API
const prescriptionsApi = {
    list: () => apiCall('/prescriptions'),
    get: (id) => apiCall(`/prescriptions/${id}`),
    create: (data) => apiCall('/prescriptions', 'POST', data),
    update: (id, data) => apiCall(`/prescriptions/${id}`, 'PUT', data),
    delete: (id) => apiCall(`/prescriptions/${id}`, 'DELETE'),
};

// Diagnostics API
const diagnosticsApi = {
    list: () => apiCall('/diagnostics'),
    get: (id) => apiCall(`/diagnostics/${id}`),
    create: (data) => apiCall('/diagnostics', 'POST', data),
    update: (id, data) => apiCall(`/diagnostics/${id}`, 'PUT', data),
    delete: (id) => apiCall(`/diagnostics/${id}`, 'DELETE'),
};

// Shared UI helpers
function showMessage(message, isError = false) {
    // You can replace this with your preferred notification method
    alert(isError ? `Error: ${message}` : message);
}

function formatDate(isoString) {
    return new Date(isoString).toLocaleString();
}