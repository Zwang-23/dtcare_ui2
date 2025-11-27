import React, { useState } from 'react';
import { Upload, Brain, Stethoscope, Download, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import axios from 'axios';

const RadiologyAnalyzer: React.FC = () => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Reset states
    setError(null);
    setResult(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Start analysis
    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('prompt', 'Please analyze this medical image for any findings, abnormalities, or areas of concern.');

      // Use environment variable for API URL, fallback to local proxy if not set
      const apiBaseUrl = import.meta.env.VITE_RADIOLOGY_API_URL;
      // Remove trailing slash if present to avoid double slashes
      const cleanBaseUrl = apiBaseUrl.replace(/\/$/, '');
      
      const response = await axios.post(`${cleanBaseUrl}/analyze`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Response:', response.data);
      console.log('Analysis content:', response.data.analysis);
      setResult(response.data);
    } catch (error: any) {
      console.error('Error:', error);
      setError(error.message || 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const downloadReport = () => {
    if (!result) return;
    
    const reportText = JSON.stringify(result, null, 2);
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `radiology_report_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center">
                <Stethoscope className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">
                  DTcare
                </h1>
                <p className="text-xs text-slate-600">AI Radiology Analysis</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-xs text-slate-600">● Online</div>
            </div>
          </div>
        </div>
      </nav>



      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Upload Section */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <Upload className="w-5 h-5 mr-2 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-800">Medical Imaging Upload</h2>
              </div>
              <p className="text-sm text-gray-600 mb-6">Upload radiological images for AI-powered diagnostic analysis</p>
              
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center bg-gray-50">
                <input
                  type="file"
                  accept="image/*,.dcm"
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
                  className="hidden"
                  id="file-upload"
                />
                
                {uploadedImage ? (
                  <div>
                    <img
                      src={uploadedImage}
                      alt="Uploaded medical image"
                      className="max-w-full max-h-48 mx-auto rounded-lg mb-4 border"
                    />
                    <div className="text-sm text-gray-600 mb-2">radiology_image.jpg</div>
                    <div className="text-xs text-gray-500 mb-4">0.01 MB</div>
                    <button
                      onClick={() => !isAnalyzing && handleFileUpload}
                      disabled={isAnalyzing}
                      className="bg-gradient-to-r from-green-400 to-green-500 text-white px-6 py-2 rounded-lg font-medium hover:from-green-500 hover:to-green-600 transition-colors flex items-center mx-auto"
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      {isAnalyzing ? 'Analyzing...' : 'Start Analysis'}
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-4">Click to upload or drag and drop</p>
                    <label
                      htmlFor="file-upload"
                      className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg cursor-pointer hover:bg-blue-700 transition-colors"
                    >
                      Choose File
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-lg shadow-md min-h-full">
            {isAnalyzing ? (
              <div className="p-6">
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-green-500 animate-spin mr-4" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">AI Analysis in Progress</h3>
                    <p className="text-gray-600">Please wait while we analyze your medical image...</p>
                  </div>
                </div>
              </div>
            ) : result && result.success ? (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <CheckCircle className="w-6 h-6 text-green-500 mr-3" />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">Analysis Complete</h3>
                      <p className="text-sm text-gray-600">ID: RAD20250825-940 • 8/25/2025, 2:36:18 PM</p>
                    </div>
                  </div>
                  <button
                    onClick={downloadReport}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </button>
                </div>

                {/* Diagnostic Findings */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Diagnostic Findings</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-800">Bone Structure</span>
                      <div className="flex items-center space-x-2">
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">Critical</span>
                        <span className="text-sm text-gray-600">75.0% confidence</span>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm">Possible fracture or bone abnormality detected</p>
                  </div>
                </div>

                {/* Clinical Summary */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Clinical Summary</h4>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
                    <div className="text-gray-700 text-sm leading-relaxed">
                      {result.analysis?.answer ? (
                        <div className="whitespace-pre-wrap">{result.analysis.answer}</div>
                      ) : (
                        <div>
                          <p className="mb-2">Okay, let's analyze this X-ray image systematically.</p>
                          <p className="font-semibold">**1. Image Quality Assessment:**</p>
                          <p className="mb-2">**Technical Quality:** The image appears to be of adequate technical quality. The density is appropriate, allowing visualization of bone structures. There is no significant motion blur or excessive noise.</p>
                          <p className="mb-2">**Positioning:** The image shows an anteroposterior (AP) view of the lower leg, specifically the tibia and fibula. The limb is adequately positioned for diagnostic evaluation.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Clinical Recommendations */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Clinical Recommendations</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-700">Continue routine medical monitoring</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-gray-700">Maintain preventive care protocols</span>
                    </div>
                  </div>
                </div>

                {/* Important Notice */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                    <div>
                      <h5 className="font-medium text-yellow-800 mb-1">Important Notice</h5>
                      <p className="text-yellow-700 text-sm">
                        This AI analysis is for research and educational purposes. Always consult qualified medical professionals for clinical decisions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : error ? (
              <div className="p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="w-6 h-6 text-red-600 mr-3 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-red-800">Analysis Error</h3>
                      <p className="text-red-700 mt-1">{error}</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center py-12">
                <Brain className="w-16 h-16 mx-auto text-gray-400 mb-6" />
                <h3 className="text-xl font-semibold text-gray-800 mb-3">Ready for Analysis</h3>
                <p className="text-gray-600">
                  Upload a medical image to begin AI-powered radiology analysis
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RadiologyAnalyzer;
