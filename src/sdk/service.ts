import axios from 'axios';

// Use environment variable for API base URL
// In production (Cloud Run), this will be the backend service URL
// In local Docker, this points to the backend container
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

console.log('Current API Base URL:', API_BASE_URL);

const api = axios.create({
    baseURL: API_BASE_URL,
});

export const fetchAudioToText = async (audio: Blob, sessionId?: string, isSessionRecording: boolean = false) => {
    const formData = new FormData();
    formData.append('audio', audio, 'recorded.wav');
    formData.append('timestamp', String(+new Date()));
    
    // Add session recording flag to help backend process differently
    formData.append('is_session_recording', String(isSessionRecording));
    
    if (sessionId) formData.append('session_id', sessionId);

    return api.post('/generate', formData);
};

export const fetchTextToResponse = async (text: string, sessionId?: string, isSessionRecording: boolean = false) => {
    const formData = new FormData();
    formData.append('text', text);
    formData.append('timestamp', String(+new Date()));
    
    // Add session recording flag to help backend process differently
    formData.append('is_session_recording', String(isSessionRecording));
    
    if (sessionId) formData.append('session_id', sessionId);

    return api.post('/text', formData);
};

export const postResumeGraph = async (session_id: string, selected_mrn: string) => {
    return api.post('/resume-session', { session_id, selected_mrn });
};

export const fetchVisitsByMrn = async (mrn: string) => {
  return api.get(`/visits/${mrn}`);
};

export const fetchPatientByMrn = async (lookup: string) => {
  return api.get(`/patient/${lookup}`);
};
