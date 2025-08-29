'use client';
import { useEffect } from 'react';

export default function PsychometricAnalysisRedirect() {
  useEffect(() => {
    window.location.href = 'https://psychometric-analysis.simple-ed.com';
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to Psychometric Analysis Tool...</p>
        <p className="text-sm text-gray-500 mt-2">
          If you're not redirected automatically, 
          <a href="https://psychometric-analysis.simple-ed.com" className="text-blue-600 hover:underline ml-1">
            click here
          </a>
        </p>
      </div>
    </div>
  );
}