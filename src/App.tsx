import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import './App.css';
import RecordButton, { Result } from './components/RecordButton';
// import { AudioStreamingTranscriber } from "./components/AudioStreamingTranscriber";
import VisitTimeline from './components/VisitTimeline';
import RadiologyAnalyzer from './components/RadiologyAnalyzer';
import LandingPage from './components/LandingPage';
import VisitsAI from './sdk/VisitsAI';
import AudioAI from './sdk/AudioAI';
import { Divider, List, Typography, Layout, Card, Tag, Space, Switch, Tabs, Input, Button, message } from 'antd';

// Import SVG icons from assets
import MicIcon from './assets/icons/mic-01-stroke-rounded.svg';
import RobotIcon from './assets/icons/robotic-stroke-rounded.svg';
import UserIcon from './assets/icons/user-02-stroke-rounded.svg';
import CalendarIcon from './assets/icons/calendar-03-stroke-rounded.svg';
import PhoneIcon from './assets/icons/call-02-stroke-rounded.svg';
import EmailIcon from './assets/icons/mail-01-stroke-rounded.svg';
import StethoscopeIcon from './assets/icons/stethoscope-02-stroke-rounded.svg';

// Ant Design icons for tabs
import { MedicineBoxOutlined, RadarChartOutlined, HomeOutlined, SendOutlined } from '@ant-design/icons';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const TimeIcon = ({ style }: { style?: React.CSSProperties }) => (
    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
        <path d="M12 7V12L15 15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
);

const IconWrapper = ({ src, alt, style }: { src: string; alt: string; style?: React.CSSProperties }) => (
    <img 
        src={src} 
        alt={alt} 
        style={{ 
            width: '1em', 
            height: '1em', 
            display: 'inline-block',
            ...style 
        }} 
    />
);

const { Header, Content, Sider } = Layout;
const { Text } = Typography;

function App() {
    const [list, setList] = useState<Result[]>([]);
    const [sessionId, setSessionId] = useState<string | undefined>();
    const [selectedMrn, setSelectedMrn] = useState<string | undefined>();
    const [patient, setPatient] = useState<any>(null);
    const [lastResponseType, setLastResponseType] = useState<string>('');
    const listRef = useRef<HTMLDivElement>(null);
    const [activeTab, setActiveTab] = useState('home');
    const audioRefs = useRef<(HTMLAudioElement | null)[]>([]);
    const [shouldAutoPlay, setShouldAutoPlay] = useState(false);
    const [textInput, setTextInput] = useState('');
    const [isSendingText, setIsSendingText] = useState(false);

    const [showConversation, setShowConversation] = useState<Record<number, boolean>>({});

    const handleTabChange = (key: string) => {
        // Stop all playing audio when switching tabs
        audioRefs.current.forEach(audio => {
            if (audio && !audio.paused) {
                audio.pause();
            }
        });
        setShouldAutoPlay(false);
        setActiveTab(key);
    };

    const toggleConversation = (index: number) => {
    setShowConversation(prev => ({
        ...prev,
        [index]: !prev[index]
    }));
    };

    const formatTime = (timeStr: string) => {
    // Convert MM:SS format to readable format
    return timeStr;
    };

    const getSpeakerColor = (speaker: string) => {
    const colors: Record<string, string> = {
        'SPEAKER_00': '#3b82f6',
        'SPEAKER_01': '#10b981', 
        'SPEAKER_02': '#f59e0b',
        'SPEAKER_03': '#ef4444',
        'SPEAKER_04': '#8b5cf6'
    };
    return colors[speaker] || '#64748b';
    };

    const onResult = (result: Result) => {
        if (result.session_id) {
            setSessionId(result.session_id);
            // Only set MRN if query returned SQL results (not RAG)
            if (result.query && result.query.trim() && result.selected_mrn) {
                setSelectedMrn(result.selected_mrn);
                setLastResponseType('sql');
            } else if (result.rag_answer) {
                setLastResponseType('rag');
                setSelectedMrn(undefined); // Clear MRN for RAG queries
            } else if (result.response_type === 'report') {
                setLastResponseType('report');
                setSelectedMrn(undefined);
            }
        }
        
        // Stop all currently playing audio
        audioRefs.current.forEach(audio => {
            if (audio && !audio.paused) {
                audio.pause();
                audio.currentTime = 0;
            }
        });
        
        setList((prev) => [...prev, result]);
        // Only set autoplay if we're on the doctor assistant tab
        if (activeTab === 'doctor-assistant') {
            setShouldAutoPlay(true);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            if (selectedMrn) {
                const visitsAI = new VisitsAI();
                const patientData = await visitsAI.getPatient(selectedMrn);
                setPatient(patientData);
            }
        };
        fetchData();
    }, [selectedMrn]);

    // Auto-scroll to bottom when new item is added
    useEffect(() => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, [list]);

    const handlePatientSelect = useCallback((mrn: string) => {
        setSelectedMrn(mrn);
    }, []);

    const handleTextSubmit = useCallback(async () => {
        if (!textInput.trim()) return;
        
        setIsSendingText(true);
        try {
            const audioAI = new AudioAI();
            const result = await audioAI.textToResponse(textInput, sessionId, false);
            onResult(result);
            setTextInput('');
        } catch (error) {
            console.error('Error sending text:', error);
            message.error('Failed to send message');
        } finally {
            setIsSendingText(false);
        }
    }, [textInput, sessionId]);

    const handleTextInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setTextInput(e.target.value);
    }, []);

    // DTcare content component - memoized to prevent unnecessary re-renders
    const dtcareContent = useMemo(() => (
        <Layout style={{ backgroundColor: '#f8fafc' }}>
            <Sider 
                width="50%" 
                theme="light" 
                style={{ 
                    backgroundColor: '#ffffff',
                    borderRight: '1px solid #e2e8f0',
                    boxShadow: '4px 0 20px rgba(0,0,0,0.05)'
                }}
            >
                <div style={{ padding: '24px' }}>
                    <Divider 
                        orientation="left" 
                        style={{ 
                            borderColor: '#3b82f6',
                            fontSize: '18px',
                            fontWeight: '700',
                            color: '#1e40af',
                            margin: '0 0 12px 0'
                        }}
                    >
                        <Space size="middle">
                            <IconWrapper src={RobotIcon} alt="Robot" style={{ fontSize: '25px' }} />
                            Doctor Assistant
                        </Space>
                    </Divider>

                    <div style={{ 
                        display: 'flex', 
                        justifyContent: 'center', 
                        marginBottom: '12px',
                        padding: '10px',
                        color: '#fffff'
                    }}>
                        <RecordButton 
                            icon={<IconWrapper src={MicIcon} alt="Microphone" style={{ fontSize: '20px', color: '#fffff' }} />} 
                            onResult={onResult} 
                            sessionId={sessionId}
                            onPatientSelect={handlePatientSelect}
                        />
                    </div>

                    <div style={{ marginBottom: '16px', padding: '0 10px' }}>
                        <Input.Group compact style={{ display: 'flex' }}>
                            <Input
                                placeholder="Type your question here..."
                                value={textInput}
                                onChange={handleTextInputChange}
                                onPressEnter={handleTextSubmit}
                                disabled={isSendingText}
                                size="large"
                                style={{
                                    flex: 1,
                                    borderRadius: '12px 0 0 12px',
                                    border: '2px solid #e2e8f0',
                                    fontSize: '14px'
                                }}
                            />
                            <Button
                                type="primary"
                                onClick={handleTextSubmit}
                                loading={isSendingText}
                                disabled={!textInput.trim()}
                                size="large"
                                icon={<SendOutlined />}
                                style={{
                                    borderRadius: '0 12px 12px 0',
                                    background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                                    border: 'none',
                                    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
                                    fontWeight: '600'
                                }}
                            >
                                Send
                            </Button>
                        </Input.Group>
                    </div>

                    <div 
                        ref={listRef}
                        style={{ 
                            maxHeight: 'calc(100vh - 340px)',
                            overflowY: 'auto',
                            paddingRight: '8px',
                            scrollbarWidth: 'thin',
                            scrollbarColor: '#cbd5e1 #f1f5f9',
                            border: '1px solid rgb(226, 232, 240)',
                            borderRadius: '16px',
                            padding: '10px'
                        }}
                        className="custom-scrollbar"
                    >
                        <List
                            style={{ backgroundColor: 'transparent' }}
                            dataSource={list}
                            renderItem={(item, index) => (
                                <List.Item style={{
                                    padding: '0 0 20px 0',
                                    border: 'none'
                                }}>
                                    {item.response_type === 'report' ? (
                                        // Report visualization as markdown
                                        <Card
                                            size="small"
                                            style={{
                                                width: '100%',
                                                borderRadius: '16px',
                                                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                                                border: '1px solid #e2e8f0',
                                                backgroundColor: '#ffffff',
                                                transition: 'all 0.3s ease',
                                                position: 'relative',
                                                overflow: 'hidden',
                                                padding: '12px'
                                            }}
                                        >
                                            {/* Report gradient accent */}
                                            <div style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                height: '4px',
                                                background: 'linear-gradient(90deg, #10b981, #059669)',
                                                borderRadius: '16px 16px 0 0'
                                            }} />

                                            <div style={{ marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <div>
                                                    <Tag
                                                        style={{
                                                            borderRadius: '8px',
                                                            fontWeight: '600',
                                                            fontSize: '12px',
                                                            padding: '4px 12px',
                                                            background: 'linear-gradient(135deg, #10b981, #047857)',
                                                            color: '#ffffff',
                                                            border: 'none',
                                                            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                                                        }}
                                                    >
                                                        REPORT #{index + 1}
                                                    </Tag>
                                                    <Text strong style={{
                                                        color: '#065f46',
                                                        fontSize: '15px',
                                                        marginLeft: '12px',
                                                        fontWeight: '600'
                                                    }}>
                                                        {item.question}
                                                    </Text>
                                                </div>

                                                {/* Toggle Switch for Report/Conversation */}
                                                {item.speaker_segments && Array.isArray(item.speaker_segments) && (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                        <Text style={{ fontSize: '12px', color: '#64748b' }}>Report</Text>
                                                        <Switch
                                                            size="small"
                                                            checked={showConversation[index]}
                                                            onChange={() => toggleConversation(index)}
                                                            style={{
                                                                backgroundColor: showConversation[index] ? '#10b981' : '#d1d5db'
                                                            }}
                                                        />
                                                        <Text style={{ fontSize: '12px', color: '#64748b' }}>Conversation</Text>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Conditional Content Display */}
                                            {showConversation[index] && item.speaker_segments ? (
                                                // Conversation View
                                                <div style={{
                                                    margin: '12px 0',
                                                    padding: '16px',
                                                    background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                                                    borderRadius: '12px',
                                                    border: '1px solid #d1fae5',
                                                    maxHeight: '400px',
                                                    overflowY: 'auto'
                                                }}>
                                                    <div style={{ marginBottom: '16px' }}>
                                                        <Text strong style={{ color: '#065f46', fontSize: '16px' }}>
                                                            Conversation Transcript
                                                        </Text>
                                                    </div>

                                                    {item.speaker_segments.map((segment: any, segIndex: number) => (
                                                        <div
                                                            key={segIndex}
                                                            style={{
                                                                marginBottom: '12px',
                                                                padding: '12px',
                                                                backgroundColor: '#ffffff',
                                                                borderRadius: '8px',
                                                                border: '1px solid #d1fae5',
                                                                borderLeft: `4px solid ${getSpeakerColor(segment.speaker)}`
                                                            }}
                                                        >
                                                            <div style={{
                                                                display: 'flex',
                                                                justifyContent: 'space-between',
                                                                alignItems: 'center',
                                                                marginBottom: '8px'
                                                            }}>
                                                                <Tag
                                                                    color={getSpeakerColor(segment.speaker)}
                                                                    style={{
                                                                        borderRadius: '6px',
                                                                        fontSize: '10px',
                                                                        fontWeight: '600',
                                                                        padding: '2px 8px'
                                                                    }}
                                                                >
                                                                    {segment.speaker}
                                                                </Tag>
                                                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                                    <Text style={{
                                                                        fontSize: '11px',
                                                                        color: '#64748b',
                                                                        fontFamily: 'monospace'
                                                                    }}>
                                                                        {formatTime(segment.start_time)} - {formatTime(segment.end_time)}
                                                                    </Text>
                                                                    <Text style={{
                                                                        fontSize: '11px',
                                                                        color: '#64748b',
                                                                        backgroundColor: '#f3f4f6',
                                                                        padding: '2px 6px',
                                                                        borderRadius: '4px'
                                                                    }}>
                                                                        {segment.duration}s
                                                                    </Text>
                                                                </div>
                                                            </div>

                                                            <Text style={{
                                                                color: '#374151',
                                                                fontSize: '14px',
                                                                lineHeight: '1.5',
                                                                display: 'block',
                                                                textAlign: 'right', // For Arabic text
                                                                direction: 'rtl' // For Arabic text
                                                            }}>
                                                                {segment.text}
                                                            </Text>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                // Report/Markdown Content (existing)
                                                <div style={{
                                                    margin: '12px 0',
                                                    padding: '16px',
                                                    background: 'linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)',
                                                    borderRadius: '12px',
                                                    border: '1px solid #d1fae5'
                                                }}>
                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkGfm]}
                                                        components={{
                                                            // Headers for medical sections
                                                            h1: ({ node, ...props }) => (
                                                                <h1 style={{
                                                                    color: '#065f46',
                                                                    fontSize: '20px',
                                                                    fontWeight: '700',
                                                                    marginBottom: '12px',
                                                                    marginTop: '0',
                                                                    borderBottom: '2px solid #d1fae5',
                                                                    paddingBottom: '6px'
                                                                }} {...props} />
                                                            ),
                                                            h2: ({ node, ...props }) => (
                                                                <h2 style={{
                                                                    color: '#047857',
                                                                    fontSize: '18px',
                                                                    fontWeight: '600',
                                                                    marginBottom: '10px',
                                                                    marginTop: '16px'
                                                                }} {...props} />
                                                            ),
                                                            h3: ({ node, ...props }) => (
                                                                <h3 style={{
                                                                    color: '#059669',
                                                                    fontSize: '16px',
                                                                    fontWeight: '600',
                                                                    marginBottom: '8px',
                                                                    marginTop: '12px'
                                                                }} {...props} />
                                                            ),
                                                            // Paragraphs - main content
                                                            p: ({ node, ...props }) => (
                                                                <p style={{
                                                                    color: '#374151',
                                                                    fontSize: '14px',
                                                                    lineHeight: '1.6',
                                                                    marginBottom: '10px',
                                                                    marginTop: '0',
                                                                    textAlign: 'justify'
                                                                }} {...props} />
                                                            ),
                                                        }}
                                                    >
                                                        {item.text}
                                                    </ReactMarkdown>
                                                </div>
                                            )}

                                            {item.detailed && Array.isArray(item.detailed) && (
                                                <div style={{
                                                    display: 'flex',
                                                    gap: '12px',
                                                    flexWrap: 'wrap',
                                                    marginTop: '16px'
                                                }}>
                                                    {item.detailed.map((opt: any) => (
                                                        <Card
                                                            key={opt.mrn}
                                                            size="small"
                                                            hoverable
                                                            onClick={() => item.onSelect?.(opt.mrn)}
                                                            style={{
                                                                borderRadius: '16px',
                                                                border: '2px solid #d1fae5',
                                                                cursor: 'pointer',
                                                                transition: 'all 0.3s ease',
                                                                backgroundColor: '#ffffff',
                                                                minWidth: '200px',
                                                                padding: '16px',
                                                                position: 'relative',
                                                                overflow: 'hidden',
                                                                boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                                                            }}
                                                            className="patient-card-report"
                                                        >
                                                            {/* Green gradient accent bar for report */}
                                                            <div style={{
                                                                position: 'absolute',
                                                                top: 0,
                                                                left: 0,
                                                                right: 0,
                                                                height: '3px',
                                                                background: 'linear-gradient(90deg, #10b981, #059669)',
                                                                borderRadius: '16px 16px 0 0'
                                                            }} />

                                                            <div style={{
                                                                display: 'flex',
                                                                alignItems: 'flex-start',
                                                                gap: '12px'
                                                            }}>
                                                                {/* Avatar with green theme */}
                                                                <div style={{
                                                                    width: '40px',
                                                                    height: '40px',
                                                                    borderRadius: '12px',
                                                                    background: 'linear-gradient(135deg, #10b981, #047857)',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    flexShrink: 0,
                                                                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                                                                }}>
                                                                    <IconWrapper
                                                                        src={UserIcon}
                                                                        alt="User"
                                                                        style={{
                                                                            filter: 'brightness(0) invert(1)',
                                                                            width: '20px',
                                                                            height: '20px'
                                                                        }}
                                                                    />
                                                                </div>

                                                                {/* Patient info */}
                                                                <div style={{
                                                                    minWidth: 0,
                                                                    flex: 1,
                                                                    display: 'flex',
                                                                    flexDirection: 'column',
                                                                    gap: '6px'
                                                                }}>
                                                                    {/* Name */}
                                                                    <div style={{
                                                                        fontWeight: '700',
                                                                        fontSize: '14px',
                                                                        color: '#1e293b',
                                                                        lineHeight: '1.2',
                                                                        overflow: 'hidden',
                                                                        textOverflow: 'ellipsis',
                                                                        whiteSpace: 'nowrap'
                                                                    }}>
                                                                        {opt.name}
                                                                    </div>

                                                                    {/* MRN with green theme */}
                                                                    <div style={{
                                                                        fontSize: '11px',
                                                                        color: '#065f46',
                                                                        fontWeight: '600',
                                                                        backgroundColor: '#f0fdf4',
                                                                        padding: '2px 8px',
                                                                        borderRadius: '6px',
                                                                        width: 'fit-content',
                                                                        border: '1px solid #d1fae5'
                                                                    }}>
                                                                        MRN: {opt.mrn}
                                                                    </div>

                                                                    {/* Date of birth */}
                                                                    <div style={{
                                                                        fontSize: '12px',
                                                                        color: '#64748b',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '6px',
                                                                        fontWeight: '500'
                                                                    }}>
                                                                        <IconWrapper
                                                                            src={CalendarIcon}
                                                                            alt="Calendar"
                                                                            style={{
                                                                                width: '12px',
                                                                                height: '12px',
                                                                                opacity: 0.7
                                                                            }}
                                                                        />
                                                                        <span>DOB: {opt.dob}</span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Hover effect styles for report cards */}
                                                            <style>
                                                                {`.patient-card-report:hover {transform: translateY(-2px) !important; box-shadow: 0 8px 25px rgba(16, 185, 129, 0.15) !important; border-color: #86efac !important;}`}
                                                            </style>
                                                        </Card>
                                                    ))}
                                                </div>
                                            )}

                                            {/* No audio for report type */}
                                        </Card>
                                    ) : (
                                        // Main type handling (existing code - truncated for brevity)
                                        <Card
                                            size="small"
                                            style={{
                                                width: '100%',
                                                borderRadius: '16px',
                                                boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                                                border: '1px solid #e2e8f0',
                                                backgroundColor: '#ffffff',
                                                transition: 'all 0.3s ease',
                                                position: 'relative',
                                                overflow: 'hidden',
                                                padding: '12px'
                                            }}
                                            hoverable
                                        >
                                            {/* Card gradient accent */}
                                            <div style={{
                                                position: 'absolute',
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                height: '4px',
                                                background: 'linear-gradient(90deg, #3b82f6, #06b6d4)',
                                                borderRadius: '16px 16px 0 0'
                                            }} />

                                            <div style={{ marginBottom: '12px' }}>
                                                <Tag
                                                    style={{
                                                        borderRadius: '8px',
                                                        fontWeight: '600',
                                                        fontSize: '12px',
                                                        padding: '4px 12px',
                                                        background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                                        color: '#ffffff',
                                                        border: 'none',
                                                        boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
                                                    }}
                                                >
                                                    #{index + 1}
                                                </Tag>
                                                <Text strong style={{
                                                    color: '#1e40af',
                                                    fontSize: '15px',
                                                    marginLeft: '12px',
                                                    fontWeight: '600'
                                                }}>
                                                    {item.question}
                                                </Text>
                                            </div>

                                            <div style={{
                                                margin: '12px 0',
                                                padding: '12px',
                                                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
                                                borderRadius: '12px',
                                                border: '1px solid #e2e8f0'
                                            }}>
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '8px',
                                                    marginBottom: '8px'
                                                }}>
                                                    <TimeIcon style={{ fontSize: '14px', color: '#64748b' }} />
                                                    <Text style={{
                                                        color: '#64748b',
                                                        fontSize: '12px',
                                                        fontWeight: '500'
                                                    }}>
                                                        {item.transcribe_time} ms
                                                    </Text>
                                                </div>
                                                <div style={{
                                                    color: '#374151',
                                                    fontSize: '14px',
                                                    lineHeight: '1.5',
                                                    fontWeight: '400'
                                                }}>
                                                    {item.text}
                                                </div>
                                            </div>

                                            {item.url && (
                                                <div style={{ marginTop: '16px' }}>
                                                    <audio
                                                        ref={(el) => { 
                                                            audioRefs.current[index] = el;
                                                        }}
                                                        src={item.url}
                                                        controls
                                                        autoPlay={shouldAutoPlay && index === list.length - 1 && activeTab === 'doctor-assistant'}
                                                        style={{
                                                            width: '100%',
                                                            borderRadius: '8px',
                                                            outline: 'none'
                                                        }}
                                                    />
                                                </div>
                                            )}
                                        </Card>
                                    )}
                                </List.Item>
                            )}
                        />

                    </div>
                </div>
            </Sider>

            <Content style={{ 
                padding: '24px', 
                backgroundColor: '#f8fafc',
                minHeight: 'calc(100vh - 64px)'
            }}>
                {patient && (
                    <Card
                        style={{
                            marginBottom: '24px',
                            borderRadius: '16px',
                            background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
                            border: '2px solid #a7f3d0',
                            boxShadow: '0 4px 16px rgba(16, 185, 129, 0.1)' }}
                    >
                        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '12px',
                                    background: 'linear-gradient(135deg, #059669, #047857)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <IconWrapper 
                                        src={UserIcon} 
                                        alt="User" 
                                        style={{ 
                                            filter: 'brightness(0) invert(1)', 
                                            fontSize: '24px',
                                            width: '24px',
                                            height: '24px'
                                        }} 
                                    />
                                </div>
                                <div>
                                    <Text strong style={{ 
                                        fontSize: '18px', 
                                        color: '#065f46',
                                        display: 'block',
                                        marginBottom: '4px'
                                    }}>
                                        {patient.name}
                                    </Text>
                                    <Text style={{ 
                                        fontSize: '14px',
                                        color: '#047857',
                                        fontWeight: '500'
                                    }}>
                                        MRN: {patient.mrn}
                                    </Text>
                                </div>
                            </div>
                            
                            <div style={{ 
                                display: 'grid', 
                                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                                gap: '16px',
                                paddingTop: '8px'
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <IconWrapper 
                                        src={CalendarIcon} 
                                        alt="Calendar" 
                                        style={{ fontSize: '16px', color: '#047857' }} 
                                    />
                                    <Text style={{ fontSize: '14px', color: '#065f46' }}>
                                        DOB: {patient.dob}
                                    </Text>
                                </div>
                                {patient.phone && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <IconWrapper 
                                            src={PhoneIcon} 
                                            alt="Phone" 
                                            style={{ fontSize: '16px', color: '#047857' }} 
                                        />
                                        <Text style={{ fontSize: '14px', color: '#065f46' }}>
                                            {patient.phone}
                                        </Text>
                                    </div>
                                )}
                                {patient.email && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <IconWrapper 
                                            src={EmailIcon} 
                                            alt="Email" 
                                            style={{ fontSize: '16px', color: '#047857' }} 
                                        />
                                        <Text style={{ fontSize: '14px', color: '#065f46' }}>
                                            {patient.email}
                                        </Text>
                                    </div>
                                )}
                                {patient.current_status && (
                                    <Tag 
                                        style={{
                                            background: 'linear-gradient(135deg, #06b6d4, #0891b2)',
                                            color: '#ffffff',
                                            border: 'none',
                                            borderRadius: '8px',
                                            padding: '4px 12px',
                                            fontWeight: '600',
                                            fontSize: '12px',
                                            width: 'fit-content'
                                        }}
                                    >
                                        {patient.current_status}
                                    </Tag>
                                )}
                            </div>
                        </Space>
                    </Card>
                )}
                
                <Divider 
                    orientation="left" 
                    style={{ 
                        borderColor: '#059669',
                        fontSize: '18px',
                        fontWeight: '700',
                        color: '#047857',
                        margin: '0 0 24px 0'
                    }}
                >
                    <Space size="middle">
                        <IconWrapper src={StethoscopeIcon} alt="Stethoscope" style={{ fontSize: '25px' }} />
                        Patient Timeline
                    </Space>
                </Divider>
                
                <Card
                    style={{
                        borderRadius: '16px',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                        border: '1px solid #e2e8f0',
                        backgroundColor: '#ffffff',
                        minHeight: '500px',
                        maxHeight: 'calc(100vh - 280px)',
                        overflowY: 'auto'
                    }}
                >
                    {selectedMrn && lastResponseType === 'sql' ? (
                        <VisitTimeline mrn={selectedMrn} />
                    ) : (
                        <div style={{ 
                            textAlign: 'center', 
                            padding: '60px 20px',
                            color: '#94a3b8'
                        }}>
                            <IconWrapper 
                                src={UserIcon} 
                                alt="User" 
                                style={{ fontSize: '48px', marginBottom: '16px', width: '48px', height: '48px' }} 
                            />
                            <Text style={{ 
                                fontSize: '18px', 
                                color: '#94a3b8',
                                display: 'block',
                                fontWeight: '500'
                            }}>
                                {lastResponseType === 'rag' 
                                    ? 'Patient timeline shows for patient history queries only'
                                    : 'Ask about a patient\'s history to view their timeline'}
                            </Text>
                        </div>
                    )}
                </Card>
            </Content>
        </Layout>
    ), [textInput, isSendingText, sessionId, handlePatientSelect, handleTextInputChange, handleTextSubmit, onResult, list, listRef, patient, selectedMrn, lastResponseType, showConversation, toggleConversation, audioRefs, shouldAutoPlay, activeTab]);

    const tabItems = [
        {
            key: 'home',
            label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <HomeOutlined />
                    Home
                </span>
            ),
            children: <LandingPage />
        },
        {
            key: 'doctor-assistant',
            label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MedicineBoxOutlined />
                    Doctor Assistant
                </span>
            ),
            children: dtcareContent
        },
        {
            key: 'radiology',
            label: (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <RadarChartOutlined />
                    Radiology AI
                </span>
            ),
            children: <RadiologyAnalyzer />
        }
    ];

    return (
        <Layout style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            <Header
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #06b6d4 100%)',
                    boxShadow: '0 4px 20px rgba(59, 130, 246, 0.25)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    padding: '0 32px',
                    position: 'relative',
                    overflow: 'hidden',
                    height: '72px'
                }}
            >
                {/* Background decoration */}
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'radial-gradient(circle at 20% 50%, rgba(255, 255, 255, 0.1) 0%, transparent 50%)',
                        pointerEvents: 'none'
                    }}
                />

                {/* Left Section */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', zIndex: 1 }}>
                    <IconWrapper
                        src={StethoscopeIcon}
                        alt="Stethoscope"
                        style={{
                            fontSize: '32px',
                            filter: 'brightness(0) invert(1) drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
                            width: '32px',
                            height: '32px'
                        }}
                    />
                    <div>
                        <h1 className="text-xl font-display font-black text-white">
                            DTcare Platform
                        </h1>
                        <p className="text-xs text-white/70 font-medium">AI Medical Assistant</p>
                    </div>
                </div>

                {/* Right Section – Inline SVG */}
                <span style={{ zIndex: 1 }}>
                    {/*<svg/> /*Logo SVG content here*/}
                </span>
            </Header>

            <div style={{ flex: 1 }}>
                <Tabs
                    activeKey={activeTab}
                    onChange={handleTabChange}
                    items={tabItems}
                    style={{
                        backgroundColor: '#ffffff',
                        padding: '0'
                    }}
                    size="large"
                    tabBarStyle={{
                        backgroundColor: '#ffffff',
                        borderBottom: '2px solid #e2e8f0',
                        margin: '0',
                        padding: '0 32px',
                        fontSize: '16px',
                        fontWeight: '600'
                    }}
                />
            </div>
        </Layout>
    );
}

export default App;

