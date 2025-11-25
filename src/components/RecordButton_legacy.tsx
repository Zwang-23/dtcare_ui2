import { Button, Spin, Space, Typography } from 'antd';
import { AudioOutlined } from '@ant-design/icons';
import React, { useState, useEffect, useCallback } from 'react';
import AudioRTC from "../sdk/AudioRTC";
import AudioAI from '../sdk/AudioAI';

const { Text } = Typography;

export type Result = {
    text: string;
    url?: string;
    transcribe_time?: number;
    question?: string;
    detailed?: any;
    session_id?: string;
    onSelect?: (mrn: string) => void;
};

type Props = {
    onResult?: (result: Result) => void;
    icon?: React.ReactNode;
    sessionId?: string;
    onPatientSelect?: (mrn: string) => void;
};

enum Status {
    IDLE = 'idle',
    RECORDING = 'recording',
}

const labelMapper = {
    [Status.IDLE]: 'Start Talking',
    [Status.RECORDING]: 'Stop Talking',
};

const processStatusMapper = {
    [Status.IDLE]: Status.RECORDING,
    [Status.RECORDING]: Status.IDLE,
};

const audioAI = new AudioAI();
const audioRTC = new AudioRTC();

export default function RecordButton({ onResult, icon, sessionId, onPatientSelect }: Props) {
    const [status, setStatus] = useState(Status.IDLE);
    const [loading, setLoading] = useState(false);

    const handleRecording = useCallback(async () => {
        if (status === Status.IDLE) {
            audioRTC.startRecording();
        } else {
            await audioRTC.stopRecording();
            const waveBlob = await audioRTC.getWaveBlob();
            try {
                setLoading(true);
                const response = await audioAI.toText(waveBlob, sessionId);

                const result: Result = {
                    ...response,
                    onSelect: async (mrn: string) => {
                        onPatientSelect?.(mrn);
                        const followup = await audioAI.resumeGraph(response.session_id, mrn);
                        onResult?.({ ...followup, session_id: response.session_id });
                    }
                };

                // parse detailed if it's JSON string
                try {
                    result.detailed = JSON.parse(result.detailed);
                } catch {}

                onResult?.(result);
            } catch (error) {
                onResult?.({ text: `${error}` });
            } finally {
                setLoading(false);
            }
        }

        setStatus(processStatusMapper[status]);
    }, [status, sessionId, onResult, onPatientSelect]);

    // Spacebar event handler
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            // Only trigger if spacebar is pressed and not in an input field
            if (event.code === 'Space' && 
                event.target instanceof HTMLElement && 
                !['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName) &&
                !loading) {
                event.preventDefault();
                handleRecording();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleRecording, loading]);

    const getButtonStyle = () => {
        const baseStyle = {
            height: '60px',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            border: 'none',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0 24px'
        };

        if (status === Status.RECORDING) {
            return {
                ...baseStyle,
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: '#ffffff',
                animation: 'pulse 1.5s infinite'
            };
        }

        return {
            ...baseStyle,
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#ffffff'
        };
    };

    return (
        <div style={{ textAlign: 'center' }}>
            <style>{`
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                .record-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(0,0,0,0.2) !important;
                }
            `}</style>
            
            <Button 
                className="record-button"
                icon={status === Status.RECORDING ? <div style={{ 
                    width: '12px', 
                    height: '12px', 
                    backgroundColor: '#ffffff', 
                    borderRadius: '2px',
                    animation: 'pulse 1s infinite'
                }} /> : icon || <AudioOutlined />}
                onClick={handleRecording}
                disabled={loading}
                style={getButtonStyle()}
            >
                {labelMapper[status]}
            </Button>
            
            <div style={{ marginTop: '12px', minHeight: '20px' }}>
                {loading ? (
                    <Space direction="vertical" size="small">
                        <Spin 
                            indicator={<div style={{ 
                                width: '16px', 
                                height: '16px', 
                                border: '2px solid #3b82f6', 
                                borderTopColor: 'transparent', 
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                            }} />} 
                        />
                        <Text style={{ 
                            color: '#3b82f6',
                            fontSize: '12px',
                            fontWeight: '500'
                        }}>
                            Processing audio...
                        </Text>
                    </Space>
                ) : (
                    <Text style={{ 
                        color: '#64748b',
                        fontSize: '12px'
                    }}>
                        {status === Status.IDLE ? 'Press spacebar or click to start' : 'Recording in progress...'}
                    </Text>
                )}
            </div>
            
            <style>{`
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}