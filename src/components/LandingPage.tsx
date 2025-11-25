import React from 'react';
import { Brain, Activity, Cpu, Target, Zap, Shield, Lightbulb, Stethoscope, FileImage, ArrowRight, Star, Users, TrendingUp, Award } from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-gray-50 to-white">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 brand-mesh-bg opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <Brain className="w-10 h-10 text-brand-primary glow-lime" />
            <Stethoscope className="w-8 h-8 text-brand-secondary glow-teal" />
            <Cpu className="w-9 h-9 text-brand-primary glow-lime" />
          </div>
          
          <h1 className="text-6xl md:text-7xl font-display font-black mb-6">
            <span className="brand-gradient-text">DTcare</span>
            <br />
            <span className="text-brand-dark">AI Medical Platform</span>
          </h1>
          
          <p className="text-xl text-brand-dark/80 mb-12 max-w-4xl mx-auto leading-relaxed">
            Advanced artificial intelligence platform featuring two powerful medical applications. 
            Doctor Assistant for patient management and Radiology AI for medical imaging interpretation.
          </p>

          <div className="flex items-center justify-center space-x-6 mb-16 flex-wrap gap-4">




          </div>
        </div>
      </section>

      {/* Products Section */}
      <section className="py-20 bg-white/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-black text-brand-dark mb-4">
              DTcare Solutions
            </h2>
            <p className="text-lg text-brand-dark/70 max-w-3xl mx-auto">
              Two powerful AI applications designed to revolutionize medical practice and enhance patient care
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Doctor Assistant Card */}
            <div className="card-light rounded-3xl p-8 relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-secondary to-brand-primary"></div>
              
              {/* Floating background elements */}
              <div className="absolute top-4 right-4 w-20 h-20 bg-brand-primary/10 rounded-full blur-2xl float-animation"></div>
              <div className="absolute bottom-8 left-4 w-16 h-16 bg-brand-secondary/10 rounded-full blur-xl float-animation" style={{ animationDelay: '2s' }}></div>

              <div className="relative z-10">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-brand-secondary to-brand-primary rounded-2xl flex items-center justify-center glow-brand">
                    <Stethoscope className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-display font-bold text-brand-dark">Doctor Assistant</h3>
                    <p className="text-brand-dark/60 font-medium">AI Patient Management</p>
                  </div>
                </div>

                <p className="text-brand-dark/80 mb-8 leading-relaxed">
                  Revolutionary voice-powered AI assistant for patient conversations, medical documentation, 
                  and comprehensive healthcare management. Transform spoken interactions into structured medical records.
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center space-x-3">
                    <Activity className="w-5 h-5 text-brand-secondary" />
                    <span className="text-brand-dark/80">Real-time conversation analysis</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-brand-secondary" />
                    <span className="text-brand-dark/80">Patient timeline visualization</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <TrendingUp className="w-5 h-5 text-brand-secondary" />
                    <span className="text-brand-dark/80">Automated medical reporting</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Brain className="w-5 h-5 text-brand-secondary" />
                    <span className="text-brand-dark/80">AI-powered insights</span>
                  </div>
                </div>

                <div className="bg-brand-gray-50 rounded-2xl p-6 mb-6">
                  <h4 className="font-semibold text-brand-dark mb-3 flex items-center">
                    <Star className="w-4 h-4 text-brand-primary mr-2" />
                    Key Features
                  </h4>
                  <ul className="space-y-2 text-sm text-brand-dark/70">
                    <li>• Voice recording and transcription</li>
                    <li>• Automatic patient identification</li>
                    <li>• Medical conversation analysis</li>
                    <li>• Visit timeline tracking</li>
                    <li>• Report generation and export</li>
                  </ul>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-brand-dark/60">
                    <span className="font-medium">Specialty:</span> Patient Management
                  </div>
                  <ArrowRight className="w-5 h-5 text-brand-secondary group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Radiology AI Card */}
            <div className="card-light rounded-3xl p-8 relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-brand-primary to-brand-secondary"></div>
              
              {/* Floating background elements */}
              <div className="absolute top-4 right-4 w-20 h-20 bg-brand-secondary/10 rounded-full blur-2xl float-animation"></div>
              <div className="absolute bottom-8 left-4 w-16 h-16 bg-brand-primary/10 rounded-full blur-xl float-animation" style={{ animationDelay: '3s' }}></div>

              <div className="relative z-10">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-2xl flex items-center justify-center glow-brand">
                    <Brain className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-display font-bold text-brand-dark">Radiology AI</h3>
                    <p className="text-brand-dark/60 font-medium">Medical Imaging Analysis</p>
                  </div>
                </div>

                <p className="text-brand-dark/80 mb-8 leading-relaxed">
                  Advanced AI-powered medical imaging analysis providing rapid, accurate radiological interpretations. 
                  Supporting JPEG, PNG, and DICOM formats with comprehensive diagnostic insights.
                </p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center space-x-3">
                    <FileImage className="w-5 h-5 text-brand-primary" />
                    <span className="text-brand-dark/80">Multi-format image support</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Zap className="w-5 h-5 text-brand-primary" />
                    <span className="text-brand-dark/80">Lightning-fast analysis</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Award className="w-5 h-5 text-brand-primary" />
                    <span className="text-brand-dark/80">Clinical-grade accuracy</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Lightbulb className="w-5 h-5 text-brand-primary" />
                    <span className="text-brand-dark/80">AI reasoning transparency</span>
                  </div>
                </div>

                <div className="bg-brand-gray-50 rounded-2xl p-6 mb-6">
                  <h4 className="font-semibold text-brand-dark mb-3 flex items-center">
                    <Star className="w-4 h-4 text-brand-primary mr-2" />
                    Key Features
                  </h4>
                  <ul className="space-y-2 text-sm text-brand-dark/70">
                    <li>• Drag & drop image upload</li>
                    <li>• AI-powered interpretation</li>
                    <li>• Detailed medical reports</li>
                    <li>• Critical findings detection</li>
                    <li>• Export and download reports</li>
                  </ul>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-brand-dark/60">
                    <span className="font-medium">Specialty:</span> Medical Imaging
                  </div>
                  <ArrowRight className="w-5 h-5 text-brand-primary group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-black text-brand-dark mb-4">
              Powered by Advanced AI
            </h2>
            <p className="text-lg text-brand-dark/70 max-w-3xl mx-auto">
              Built on cutting-edge artificial intelligence and machine learning technologies
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-brand-primary" />
              </div>
              <h3 className="text-xl font-semibold text-brand-dark mb-3">Machine Learning</h3>
              <p className="text-brand-dark/70">
                Advanced neural networks trained on vast medical datasets for accurate analysis and predictions.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-brand-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-brand-secondary" />
              </div>
              <h3 className="text-xl font-semibold text-brand-dark mb-3">Security & Privacy</h3>
              <p className="text-brand-dark/70">
                HIPAA-compliant architecture ensuring patient data privacy and regulatory compliance.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Cpu className="w-8 h-8 text-brand-primary" />
              </div>
              <h3 className="text-xl font-semibold text-brand-dark mb-3">Real-time Processing</h3>
              <p className="text-brand-dark/70">
                High-performance computing infrastructure delivering instant results and seamless user experience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-brand-primary/5 to-brand-secondary/5">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-4xl font-display font-black text-brand-dark mb-6">
            Ready to Transform Your Practice?
          </h2>
          <p className="text-lg text-brand-dark/70 mb-8">
            Experience the future of medical AI with the DTcare platform. 
            Start using Doctor Assistant and Radiology AI today.
          </p>
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center space-x-2 bg-white px-6 py-3 rounded-xl shadow-lg">
              <Target className="w-5 h-5 text-brand-primary" />
              <span className="font-medium text-brand-dark">Select a tab above to get started</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;



