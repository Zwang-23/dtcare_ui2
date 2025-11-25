import { fetchAudioToText, postResumeGraph, fetchTextToResponse } from "./service";

export default class AudioAI {
    async toText(audio: Blob, sessionId?: string, isSessionRecording: boolean = false) {
        const response = await fetchAudioToText(audio, sessionId, isSessionRecording);
        return response.data;
    }

    async textToResponse(text: string, sessionId?: string, isSessionRecording: boolean = false) {
        const response = await fetchTextToResponse(text, sessionId, isSessionRecording);
        return response.data;
    }

    async resumeGraph(sessionId: string, selected_mrn: string) {
        const response = await postResumeGraph(sessionId, selected_mrn);
        return response.data;
    }
}
