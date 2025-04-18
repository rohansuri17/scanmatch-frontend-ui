
import React from 'react';

const PricingFAQ = () => {
  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold mb-8 text-center">Frequently Asked Questions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <div>
          <h3 className="font-semibold text-lg mb-2">How accurate is the resume matching?</h3>
          <p className="text-gray-600">
            Our AI-powered system analyzes both your resume and the job description using natural language processing to identify matching keywords, skills, and qualifications with high accuracy.
          </p>
        </div>
        
        <div>
          <h3 className="font-semibold text-lg mb-2">What is a professional resume rewrite?</h3>
          <p className="text-gray-600">
            A professional rewrite includes a complete restructuring of your resume tailored specifically to the job description, enhancing your strengths and addressing any gaps.
          </p>
        </div>
        
        <div>
          <h3 className="font-semibold text-lg mb-2">Can I cancel my subscription?</h3>
          <p className="text-gray-600">
            Yes, you can cancel your subscription at any time. You'll continue to have access to your plan features until the end of your billing period.
          </p>
        </div>
        
        <div>
          <h3 className="font-semibold text-lg mb-2">How does the AI Resume Coach work?</h3>
          <p className="text-gray-600">
            The AI Resume Coach is an interactive chat interface that provides personalized advice on improving your resume based on your specific questions and the job requirements.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricingFAQ;
