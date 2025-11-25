import { Button, Spin, Space, Typography, Switch, message } from 'antd';
import { AudioOutlined } from '@ant-design/icons';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import AudioRTC from "../sdk/AudioRTC";
import AudioAI from '../sdk/AudioAI';

const { Text } = Typography;

export type Result = {
    text: string;
    url?: string;
    transcribe_time?: number;
    question?: string;
    detailed?: any;
    response_type?: any;
    speaker_segments?: any;
    session_id?: string;
    onSelect?: (mrn: string) => void;
    query?: string;
    rag_answer?: string;
    selected_mrn?: string;
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

const sessionLabelMapper = {
    [Status.IDLE]: 'Start Session',
    [Status.RECORDING]: 'End Session',
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
    const [isSessionMode, setIsSessionMode] = useState(false);
    const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
    const [sessionDuration, setSessionDuration] = useState(0);
    
    const sessionIntervalRef = useRef<number | null>(null);

    // Update session duration timer
    useEffect(() => {
        if (isSessionMode && status === Status.RECORDING && sessionStartTime) {
            sessionIntervalRef.current = setInterval(() => {
                setSessionDuration(Math.floor((Date.now() - sessionStartTime.getTime()) / 1000));
            }, 1000);
        } else {
            if (sessionIntervalRef.current) {
                clearInterval(sessionIntervalRef.current);
                sessionIntervalRef.current = null;
            }
        }

        return () => {
            if (sessionIntervalRef.current) {
                clearInterval(sessionIntervalRef.current);
            }
        };
    }, [isSessionMode, status, sessionStartTime]);

    // Format duration for display
    const formatDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleRecording = useCallback(async () => {
        if (status === Status.IDLE) {
            // Starting recording
            audioRTC.startRecording();
            if (isSessionMode) {
                setSessionStartTime(new Date());
                setSessionDuration(0);
            }
        } else {
            // Stopping recording - stop the timer immediately
            if (sessionIntervalRef.current) {
                clearInterval(sessionIntervalRef.current);
                sessionIntervalRef.current = null;
            }
            
            const finalDuration = sessionDuration; // Capture current duration
            
            await audioRTC.stopRecording();
            const waveBlob = await audioRTC.getWaveBlob();
            try {
                setLoading(true);
                const response = await audioAI.toText(waveBlob, sessionId, isSessionMode);

                const result: Result = {
                    ...response,
                    // Enhanced question field for session mode
                    question: isSessionMode 
                        ? `${response.question || 'Session Recording'} (${formatDuration(finalDuration)})`
                        : response.question,
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

                // Reset session timing after successful processing
                if (isSessionMode) {
                    setSessionStartTime(null);
                    setSessionDuration(0);
                    message.success(`Session recording completed (${formatDuration(finalDuration)})`);
                }
            } catch (error) {
                onResult?.({ text: `${error}` });
                // Reset session timing on error too
                if (isSessionMode) {
                    setSessionStartTime(null);
                    setSessionDuration(0);
                }
            } finally {
                setLoading(false);
            }
        }

        setStatus(processStatusMapper[status]);
    }, [status, sessionId, onResult, onPatientSelect, isSessionMode, sessionDuration]);

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

        // Only add keyboard listener in push-to-talk mode
        if (!isSessionMode) {
            document.addEventListener('keydown', handleKeyDown);
        }
        
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleRecording, loading, isSessionMode]);

    const handleModeToggle = (checked: boolean) => {
        // Stop any ongoing recording when switching modes
        if (status === Status.RECORDING) {
            audioRTC.stopRecording().then(() => {
                setStatus(Status.IDLE);
                if (sessionIntervalRef.current) {
                    clearInterval(sessionIntervalRef.current);
                    sessionIntervalRef.current = null;
                }
                setSessionStartTime(null);
                setSessionDuration(0);
            });
        }
        
        setIsSessionMode(checked);
        message.info(checked ? 'Switched to Session Recording mode' : 'Switched to Push-to-Talk mode');
    };

    const getButtonStyle = () => {
        const baseStyle = {
            height: '48px',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            border: 'none',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            alignItems: 'center',
            gap: '6px',
            padding: '0 20px'
        };

        if (status === Status.RECORDING) {
            return {
                ...baseStyle,
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                color: '#ffffff',
                animation: 'pulse 1.5s infinite'
            };
        }

        // Different color for session mode when idle
        if (isSessionMode) {
            return {
                ...baseStyle,
                background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                color: '#ffffff'
            };
        }

        return {
            ...baseStyle,
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#ffffff'
        };
    };

    const getCurrentLabel = () => {
        return isSessionMode ? sessionLabelMapper[status] : labelMapper[status];
    };

    const getHelpText = () => {
        if (loading) return null;
        
        if (isSessionMode) {
            if (status === Status.RECORDING) {
                return 'Recording session... Click to stop';
            }
            return 'Click to start session recording';
        } else {
            if (status === Status.RECORDING) {
                return 'Recording...';
            }
            return 'Press spacebar or click to start';
        }
    };

    return (
        <div style={{ 
            textAlign: 'center',
            padding: '16px',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            margin: '0',
            maxWidth: '400px',
            border: '1px solid #e2e8f0'
        }}>
            <style>{`
                @keyframes pulse {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                .record-button:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
                }
                @keyframes spin {
                    to { transform: rotate(360deg); }
                }
            `}</style>

            {/* Mode Toggle - Compact */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                marginBottom: '12px',
                padding: '8px 12px',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
            }}>
                <Text style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>
                    Recording Mode
                </Text>
                <Switch
                    checked={isSessionMode}
                    onChange={handleModeToggle}
                    disabled={status === Status.RECORDING || loading}
                    checkedChildren="Push"
                    unCheckedChildren="Push"
                    size="small"
                    style={{
                        backgroundColor: isSessionMode ? '#3b82f6' : undefined
                    }}
                />
                <Text style={{ fontSize: '11px', color: '#94a3b8' }}>
                    {isSessionMode ? 'Session' : 'Push-to-Talk'}
                </Text>
            </div>

            {/* Session Timer - Only show when recording in session mode */}
            {isSessionMode && status === Status.RECORDING && (
                <div style={{
                    marginBottom: '12px',
                    padding: '6px 12px',
                    background: 'linear-gradient(135deg, #fef3c7, #fde68a)',
                    border: '1px solid #f59e0b',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                }}>
                    <div style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        backgroundColor: '#ef4444',
                        animation: 'pulse 1s infinite'
                    }} />
                    <Text style={{ fontSize: '14px', fontWeight: '600', color: '#92400e' }}>
                        {formatDuration(sessionDuration)}
                    </Text>
                </div>
            )}
            
            <Button 
                className="record-button"
                icon={status === Status.RECORDING ? <div style={{ 
                    width: '10px', 
                    height: '10px', 
                    backgroundColor: '#ffffff', 
                    borderRadius: '2px',
                    animation: 'pulse 1s infinite'
                }} /> : icon || <AudioOutlined />}
                onClick={handleRecording}
                disabled={loading}
                style={getButtonStyle()}
            >
                {getCurrentLabel()}
            </Button>
            
            <div style={{ marginTop: '8px', minHeight: '16px' }}>
                {loading ? (
                    <Space direction="vertical" size="small">
                        <Spin 
                            size="small"
                            indicator={<div style={{ 
                                width: '14px', 
                                height: '14px', 
                                border: '2px solid #3b82f6', 
                                borderTopColor: 'transparent', 
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                            }} />} 
                        />
                        <Text style={{ 
                            color: '#3b82f6',
                            fontSize: '11px',
                            fontWeight: '500'
                        }}>
                            Processing audio...
                        </Text>
                    </Space>
                ) : (
                    <Text style={{ 
                        color: '#64748b',
                        fontSize: '11px'
                    }}>
                        {getHelpText()}
                    </Text>
                )}
            </div>
        </div>
    );
}