import React, { useEffect, useState } from 'react';
import {
  VerticalTimeline,
  VerticalTimelineElement
} from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import { format } from 'date-fns';
import VisitsAI from '../sdk/VisitsAI';
import { Typography } from 'antd';

const ICON_PATHS = {
  medical: '/icons/outpatient.png',
  heart: '/icons/ekg-monitor.png',
  brain: '/icons/mind.png',
  eye: '/icons/ophthalmology.png',
  testTube: '/icons/blood-test.png',
  xRay: '/icons/ct-scan.png'
};

const { Text } = Typography;

const LoadingIcon = ({ style }: { style?: React.CSSProperties }) => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={style}>
    <path d="M12 2V6M12 18V22M4.93 4.93L7.76 7.76M16.24 16.24L19.07 19.07M2 12H6M18 12H22M4.93 19.07L7.76 16.24M16.24 7.76L19.07 4.93" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// Icon wrapper component for PNG images
const IconWrapper = ({ src, alt, style }: { src: string; alt: string; style?: React.CSSProperties }) => (
  <img
    src={src}
    alt={alt}
    style={{
      padding: '9px',
      display: 'inline-block',
      objectFit: 'contain',
      ...style,
    }}
  />
);

type Visit = {
  visit_date: string;
  visit_type: string;
  notes: string;
};

interface Props {
  mrn: string;
}

const visitsAI = new VisitsAI();

// Function to get appropriate icon based on visit type
const getVisitIcon = (visitType: string) => {
  const type = visitType.toLowerCase();
  
  // Use the outpatient PNG icon for outpatient visits
  if (type.includes('outpatient') || type.includes('clinic') || type.includes('office')) {
    return <IconWrapper 
      src={ICON_PATHS.medical}
      alt="Medical"
      style={{
        width: '32px',
        height: '32px',
      }}
    />;
  } else if (type.includes('cardio') || type.includes('heart')) {
    return <IconWrapper src={ICON_PATHS.heart} alt="Heart" style={{ fontSize: '20px'}} />;
  } else if (type.includes('neuro') || type.includes('brain')) {
    return <IconWrapper src={ICON_PATHS.brain} alt="Brain" style={{ fontSize: '20px'}} />;
  } else if (type.includes('ophthal') || type.includes('eye') || type.includes('vision')) {
    return <IconWrapper src={ICON_PATHS.eye} alt="Eye" style={{ fontSize: '20px'}} />;
  } else if (type.includes('lab') || type.includes('blood') || type.includes('test')) {
    return <IconWrapper src={ICON_PATHS.testTube} alt="Lab" style={{ fontSize: '20px'}} />;
  } else if (type.includes('imaging') || type.includes('x-ray') || type.includes('scan') || type.includes('mri') || type.includes('ct')) {
    return <IconWrapper src={ICON_PATHS.xRay} alt="X-Ray" style={{ fontSize: '20px'}} />;
  } else {
    return <IconWrapper src={ICON_PATHS.medical} alt="Medical" style={{ fontSize: '20px'}} />;
  }
};

// Function to get appropriate colors based on visit type
const getVisitColors = (visitType: string) => {
  const type = visitType.toLowerCase();
  
  if (type.includes('outpatient') || type.includes('clinic') || type.includes('office')) {
    return {
      iconBg: '#059669',
      contentBg: '#f0fdf4',
      borderColor: '#86efac'
    };
  } else if (type.includes('cardio') || type.includes('heart')) {
    return {
      iconBg: '#ef4444',
      contentBg: '#fef2f2',
      borderColor: '#fca5a5'
    };
  } else if (type.includes('neuro') || type.includes('brain')) {
    return {
      iconBg: '#8b5cf6',
      contentBg: '#faf5ff',
      borderColor: '#c4b5fd'
    };
  } else if (type.includes('ophthal') || type.includes('eye') || type.includes('vision')) {
    return {
      iconBg: '#06b6d4',
      contentBg: '#f0fdfa',
      borderColor: '#67e8f9'
    };
  } else if (type.includes('lab') || type.includes('blood') || type.includes('test')) {
    return {
      iconBg: '#f59e0b',
      contentBg: '#fffbeb',
      borderColor: '#fde68a'
    };
  } else if (type.includes('imaging') || type.includes('x-ray') || type.includes('scan') || type.includes('mri') || type.includes('ct')) {
    return {
      iconBg: '#6366f1',
      contentBg: '#f8faff',
      borderColor: '#a5b4fc'
    };
  } else {
    return {
      iconBg: '#10b981',
      contentBg: '#f0fdf4',
      borderColor: '#86efac'
    };
  }
};

const VisitTimeline: React.FC<Props> = ({ mrn }) => {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!mrn) return;

    setLoading(true);
    visitsAI.getVisits(mrn)
      .then(data => {
        setVisits(data);
      })
      .catch(error => {
        console.error("Failed to load visits:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [mrn]);

  if (loading) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '60px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px'
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'spin 1s linear infinite'
        }}>
          <LoadingIcon style={{ color: '#ffffff', fontSize: '24px' }} />
        </div>
        <Text style={{ 
          fontSize: '16px', 
          color: '#64748b',
          fontWeight: '500'
        }}>
          Loading patient timeline...
        </Text>
        <style>
          {`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  if (visits.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '60px 20px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '16px'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #f3f4f6, #e5e7eb)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <IconWrapper 
            src={ICON_PATHS.medical} 
            alt="Medical" 
            style={{ width: '32px', height: '32px' }} 
          />
        </div>
        <Text style={{ 
          fontSize: '18px', 
          color: '#6b7280',
          fontWeight: '500'
        }}>
          Visits timeline will be shown here...
        </Text>
        <Text style={{ 
          fontSize: '14px', 
          color: '#9ca3af'
        }}>
          Medical history will appear here once visits are recorded
        </Text>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <VerticalTimeline lineColor="#e2e8f0">
        {visits.map((visit, idx) => {
          const colors = getVisitColors(visit.visit_type);
          const icon = getVisitIcon(visit.visit_type);
          
          return (
            <VerticalTimelineElement
              key={idx}
              date={format(new Date(visit.visit_date), 'MMM dd, yyyy')}
              dateClassName="timeline-date"
              icon={icon}
              iconStyle={{ 
                background: colors.iconBg, 
                color: '#fff',
                boxShadow: `0 4px 16px ${colors.iconBg}40`,
                border: `3px solid #ffffff`,
                width: '60px',
                height: '60px',
                display: 'flex'
              }}
              contentStyle={{ 
                background: colors.contentBg,
                border: `2px solid ${colors.borderColor}`,
                borderRadius: '16px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
                padding: '14px',
                position: 'relative',
                overflow: 'hidden'
              }}
              contentArrowStyle={{ 
                borderRight: `10px solid ${colors.borderColor}` 
              }}
            >
              {/* Decorative gradient overlay */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: `linear-gradient(90deg, ${colors.iconBg}, ${colors.iconBg}80)`,
                borderRadius: '16px 16px 0 0'
              }} />
              
              <div style={{ position: 'relative', zIndex: 1 }}>
                <h4 style={{ 
                  margin: '0 0 12px 0',
                  fontWeight: '700',
                  color: '#1f2937',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {visit.visit_type}
                </h4>
                
                <div style={{
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.6)',
                  borderRadius: '12px',
                  border: `1px solid ${colors.borderColor}60`
                }}>
                  <p style={{ 
                    margin: 0, 
                    color: '#374151',
                    fontSize: '12px',
                    lineHeight: '1.6',
                    fontWeight: '400'
                  }}>
                    {visit.notes}
                  </p>
                </div>
                
                <div style={{
                  marginTop: '16px',
                  padding: '8px 12px',
                  background: 'rgba(255, 255, 255, 0.8)',
                  borderRadius: '8px',
                  border: `1px solid ${colors.borderColor}40`,
                  display: 'inline-block'
                }}>
                  <Text style={{ 
                    fontSize: '12px',
                    color: '#6b7280',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Visit #{visits.length - idx}
                  </Text>
                </div>
              </div>
            </VerticalTimelineElement>
          );
        })}
      </VerticalTimeline>
      
      <style>
        {`
          .timeline-date {
            color: #6b7280 !important;
            font-weight: 600 !important;
            font-size: 14px !important;
            text-shadow: none !important;
          }
          
          .vertical-timeline::before {
            background: linear-gradient(to bottom, #e2e8f0, #cbd5e1) !important;
            width: 4px !important;
          }
          
          .vertical-timeline-element-content {
            transition: all 0.3s ease !important;
          }
          
          .vertical-timeline-element-content:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 12px 40px rgba(0,0,0,0.12) !important;
          }
        `}
      </style>
    </div>
  );
};

export default VisitTimeline;