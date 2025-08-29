'use client';
import { useState } from 'react';

interface ExamData {
  studentId: string;
  itemResponses: number[];
}

interface PsychometricResults {
  cronbachAlpha: number;
  itemDifficulty: number[];
  itemDiscrimination: number[];
  meanScore: number;
  standardDeviation: number;
  reliability: number;
  sem: number;
  kuderRichardson20?: number;
}

interface AnalysisState {
  data: ExamData[];
  results: PsychometricResults | null;
  loading: boolean;
  error: string | null;
}

export default function PsychometricAnalysis() {
  const [analysis, setAnalysis] = useState<AnalysisState>({
    data: [],
    results: null,
    loading: false,
    error: null
  });

  const calculateCronbachAlpha = (data: number[][]): number => {
    const n = data.length; // number of students
    const k = data[0].length; // number of items
    
    // Calculate item variances
    const itemVariances = [];
    for (let j = 0; j < k; j++) {
      const itemScores = data.map(student => student[j]);
      const itemMean = itemScores.reduce((sum, score) => sum + score, 0) / n;
      const itemVariance = itemScores.reduce((sum, score) => sum + Math.pow(score - itemMean, 2), 0) / (n - 1);
      itemVariances.push(itemVariance);
    }
    
    // Calculate total scores and total variance
    const totalScores = data.map(student => student.reduce((sum, score) => sum + score, 0));
    const totalMean = totalScores.reduce((sum, score) => sum + score, 0) / n;
    const totalVariance = totalScores.reduce((sum, score) => sum + Math.pow(score - totalMean, 2), 0) / (n - 1);
    
    // Cronbach's alpha formula
    const sumItemVariances = itemVariances.reduce((sum, variance) => sum + variance, 0);
    const alpha = (k / (k - 1)) * (1 - (sumItemVariances / totalVariance));
    
    return Math.max(0, Math.min(1, alpha)); // Ensure alpha is between 0 and 1
  };

  const calculateItemDifficulty = (data: number[][]): number[] => {
    const k = data[0].length;
    const difficulties = [];
    
    for (let j = 0; j < k; j++) {
      const itemScores = data.map(student => student[j]);
      const difficulty = itemScores.reduce((sum, score) => sum + score, 0) / itemScores.length;
      difficulties.push(difficulty);
    }
    
    return difficulties;
  };

  const calculateItemDiscrimination = (data: number[][], itemDifficulties: number[]): number[] => {
    const n = data.length;
    const k = data[0].length;
    const discriminations = [];
    
    // Calculate total scores for each student
    const totalScores = data.map(student => student.reduce((sum, score) => sum + score, 0));
    
    for (let j = 0; j < k; j++) {
      const itemScores = data.map(student => student[j]);
      
      // Point-biserial correlation
      let numerator = 0;
      let denominator = 0;
      const totalMean = totalScores.reduce((sum, score) => sum + score, 0) / n;
      const totalVariance = totalScores.reduce((sum, score) => sum + Math.pow(score - totalMean, 2), 0) / n;
      
      for (let i = 0; i < n; i++) {
        numerator += (itemScores[i] - itemDifficulties[j]) * (totalScores[i] - totalMean);
      }
      
      denominator = Math.sqrt(itemDifficulties[j] * (1 - itemDifficulties[j]) * totalVariance * n);
      
      const discrimination = denominator !== 0 ? numerator / denominator : 0;
      discriminations.push(discrimination);
    }
    
    return discriminations;
  };

  const calculateDescriptiveStats = (data: number[][]) => {
    const totalScores = data.map(student => student.reduce((sum, score) => sum + score, 0));
    const n = totalScores.length;
    const mean = totalScores.reduce((sum, score) => sum + score, 0) / n;
    const variance = totalScores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / (n - 1);
    const standardDeviation = Math.sqrt(variance);
    
    return { mean, standardDeviation, variance };
  };

  const analyzeData = (examData: ExamData[]) => {
    setAnalysis(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const responseMatrix = examData.map(student => student.itemResponses);
      
      const cronbachAlpha = calculateCronbachAlpha(responseMatrix);
      const itemDifficulty = calculateItemDifficulty(responseMatrix);
      const itemDiscrimination = calculateItemDiscrimination(responseMatrix, itemDifficulty);
      const { mean: meanScore, standardDeviation } = calculateDescriptiveStats(responseMatrix);
      
      // Standard Error of Measurement
      const sem = standardDeviation * Math.sqrt(1 - cronbachAlpha);
      
      const results: PsychometricResults = {
        cronbachAlpha,
        itemDifficulty,
        itemDiscrimination,
        meanScore,
        standardDeviation,
        reliability: cronbachAlpha,
        sem
      };
      
      setAnalysis(prev => ({ ...prev, results, loading: false }));
    } catch (error) {
      setAnalysis(prev => ({ 
        ...prev, 
        loading: false, 
        error: 'Error analyzing data. Please check your CSV format.' 
      }));
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split('\n').filter(line => line.trim());
          
          if (lines.length < 2) {
            throw new Error('CSV must contain header and at least one data row');
          }
          
          // Skip header row and parse data
          const examData: ExamData[] = lines.slice(1).map((line, index) => {
            const cells = line.split(',').map(cell => cell.trim());
            const studentId = cells[0] || `Student_${index + 1}`;
            const itemResponses = cells.slice(1).map(cell => {
              const num = parseFloat(cell);
              if (isNaN(num)) throw new Error(`Invalid number: ${cell}`);
              return num;
            });
            
            if (itemResponses.length === 0) {
              throw new Error('No item responses found');
            }
            
            return { studentId, itemResponses };
          }).filter(student => student.itemResponses.length > 0);
          
          if (examData.length < 3) {
            throw new Error('Need at least 3 students for reliable analysis');
          }
          
          setAnalysis(prev => ({ ...prev, data: examData, error: null }));
          analyzeData(examData);
        } catch (error) {
          setAnalysis(prev => ({ 
            ...prev, 
            error: error instanceof Error ? error.message : 'Error parsing CSV file' 
          }));
        }
      };
      reader.readAsText(file);
    }
  };

  const resetAnalysis = () => {
    setAnalysis({
      data: [],
      results: null,
      loading: false,
      error: null
    });
  };

  if (analysis.data.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl w-full">
          <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
            Psychometric Analysis Tool
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Upload exam data to analyze item reliability, difficulty, and discrimination using Cronbach's Alpha and other psychometric statistics.
          </p>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload CSV File
              </label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">CSV Format Requirements:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Column 1: Student ID (optional)</li>
                <li>• Columns 2+: Item responses (0/1 for dichotomous, or numeric scores)</li>
                <li>• Header row required</li>
                <li>• Minimum 3 students and 2 items</li>
                <li>• Missing values not supported</li>
              </ul>
            </div>
            
            <div className="text-center">
              <a 
                href="/exam-data-template.csv" 
                download 
                className="inline-block bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 font-medium"
              >
                Download CSV Template
              </a>
            </div>
          </div>
          
          {analysis.error && (
            <div className="mt-4 bg-red-50 p-4 rounded-lg">
              <p className="text-red-800 text-sm">{analysis.error}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (analysis.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing your data...</p>
        </div>
      </div>
    );
  }

  const { results } = analysis;
  if (!results) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Psychometric Analysis Results</h1>
          <button
            onClick={resetAnalysis}
            className="bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 font-medium"
          >
            Upload New Data
          </button>
        </div>
        
        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Cronbach's Alpha</h3>
            <div className="text-3xl font-bold text-blue-600">{results.cronbachAlpha.toFixed(3)}</div>
            <p className="text-sm text-gray-600 mt-2">
              {results.cronbachAlpha >= 0.9 ? 'Excellent' : 
               results.cronbachAlpha >= 0.8 ? 'Good' : 
               results.cronbachAlpha >= 0.7 ? 'Acceptable' : 
               results.cronbachAlpha >= 0.6 ? 'Questionable' : 'Poor'} reliability
            </p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Mean Score</h3>
            <div className="text-3xl font-bold text-green-600">{results.meanScore.toFixed(2)}</div>
            <p className="text-sm text-gray-600 mt-2">Average total score</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Standard Deviation</h3>
            <div className="text-3xl font-bold text-orange-600">{results.standardDeviation.toFixed(2)}</div>
            <p className="text-sm text-gray-600 mt-2">Score variability</p>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">SEM</h3>
            <div className="text-3xl font-bold text-purple-600">{results.sem.toFixed(2)}</div>
            <p className="text-sm text-gray-600 mt-2">Standard Error of Measurement</p>
          </div>
        </div>
        
        {/* Item Analysis Table */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Item Analysis</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Difficulty</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discrimination</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quality</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {results.itemDifficulty.map((difficulty, index) => {
                  const discrimination = results.itemDiscrimination[index];
                  const difficultyLevel = difficulty >= 0.8 ? 'Easy' : difficulty >= 0.6 ? 'Moderate' : difficulty >= 0.4 ? 'Moderate' : 'Hard';
                  const discriminationLevel = discrimination >= 0.4 ? 'Excellent' : discrimination >= 0.3 ? 'Good' : discrimination >= 0.2 ? 'Fair' : 'Poor';
                  
                  return (
                    <tr key={index}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        Item {index + 1}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        {difficulty.toFixed(3)} ({difficultyLevel})
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                        {discrimination.toFixed(3)} ({discriminationLevel})
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap">
                        <span className={`inline-flex px-2 text-xs font-semibold rounded-full ${
                          discrimination >= 0.3 && difficulty >= 0.3 && difficulty <= 0.8 ? 'bg-green-100 text-green-800' :
                          discrimination >= 0.2 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {discrimination >= 0.3 && difficulty >= 0.3 && difficulty <= 0.8 ? 'Good' :
                           discrimination >= 0.2 ? 'Review' : 'Revise'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Recommendations */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Recommendations</h3>
          <div className="space-y-4">
            {results.cronbachAlpha < 0.7 && (
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-800">Reliability Concern</h4>
                <p className="text-yellow-700 text-sm mt-1">
                  Cronbach's alpha is below 0.7, indicating questionable reliability. Consider revising items with poor discrimination or removing problematic items.
                </p>
              </div>
            )}
            
            {results.itemDiscrimination.some(disc => disc < 0.2) && (
              <div className="bg-red-50 p-4 rounded-lg">
                <h4 className="font-medium text-red-800">Items Need Revision</h4>
                <p className="text-red-700 text-sm mt-1">
                  Some items have discrimination indices below 0.2. These items may be confusing or have incorrect answer keys.
                </p>
              </div>
            )}
            
            {results.itemDifficulty.some(diff => diff > 0.9 || diff < 0.1) && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800">Difficulty Balance</h4>
                <p className="text-blue-700 text-sm mt-1">
                  Some items are too easy (&gt;0.9) or too hard (&lt;0.1). Consider adjusting item difficulty for better measurement precision.
                </p>
              </div>
            )}
            
            {results.cronbachAlpha >= 0.8 && (
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-medium text-green-800">Good Test Quality</h4>
                <p className="text-green-700 text-sm mt-1">
                  Your test shows good internal consistency. Most items are functioning well for measuring the intended construct.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}