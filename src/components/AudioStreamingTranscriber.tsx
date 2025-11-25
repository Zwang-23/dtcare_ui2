import { useState, useRef, useEffect } from "react";

export const AudioStreamingTranscriber = () => {
  const [transcript, setTranscript] = useState("");
  const ws = useRef<WebSocket | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);

  useEffect(() => {
    ws.current = new WebSocket("ws://localhost:8001/api/ws/transcribe");
    ws.current.binaryType = "arraybuffer";

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.transcript) {
        setTranscript((prev) => prev + data.transcript);
      }
    };

    ws.current.onclose = () => {
      console.log("WebSocket closed");
    };

    return () => {
      ws.current?.close();
    };
  }, []);

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const options = { mimeType: "audio/webm;codecs=opus" };
    mediaRecorder.current = new MediaRecorder(stream, options);

    mediaRecorder.current.ondataavailable = (event) => {
      if (event.data.size > 0 && ws.current?.readyState === WebSocket.OPEN) {
        event.data.arrayBuffer().then((buffer) => {
          ws.current?.send(buffer);
        });
      }
    };

    mediaRecorder.current.start(800); // timeslice 800ms to chunk audio
  };

  const stopRecording = () => {
    mediaRecorder.current?.stop();
  };

  return (
    <div>
      <button onClick={startRecording}>Start Live Transcription</button>
      <button onClick={stopRecording}>Stop</button>
      <textarea value={transcript} readOnly rows={10} style={{ width: "100%" }} />
    </div>
  );
};
