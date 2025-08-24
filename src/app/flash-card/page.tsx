'use client';
import { useState } from 'react';

interface Flashcard {
  item: string;
  response: string;
}

interface QuizState {
  cards: Flashcard[];
  currentIndex: number;
  showAnswer: boolean;
  userAnswers: boolean[];
  quizCompleted: boolean;
}

export default function FlashcardApp() {
  const [quiz, setQuiz] = useState<QuizState>({
    cards: [],
    currentIndex: 0,
    showAnswer: false,
    userAnswers: [],
    quizCompleted: false
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/csv') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        const cards: Flashcard[] = lines.slice(1).map(line => {
          const [item, response] = line.split(',').map(cell => cell.trim());
          return { item, response };
        }).filter(card => card.item && card.response);
        
        setQuiz({
          cards,
          currentIndex: 0,
          showAnswer: false,
          userAnswers: [],
          quizCompleted: false
        });
      };
      reader.readAsText(file);
    }
  };

  const handleAnswer = (correct: boolean) => {
    const newAnswers = [...quiz.userAnswers, correct];
    if (quiz.currentIndex < quiz.cards.length - 1) {
      setQuiz({
        ...quiz,
        currentIndex: quiz.currentIndex + 1,
        showAnswer: false,
        userAnswers: newAnswers
      });
    } else {
      setQuiz({
        ...quiz,
        userAnswers: newAnswers,
        quizCompleted: true
      });
    }
  };

  const resetQuiz = () => {
    setQuiz({
      ...quiz,
      currentIndex: 0,
      showAnswer: false,
      userAnswers: [],
      quizCompleted: false
    });
  };

  const calculateScore = () => {
    const correct = quiz.userAnswers.filter(answer => answer).length;
    return Math.round((correct / quiz.userAnswers.length) * 100);
  };

  if (quiz.cards.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-center mb-6 text-gray-800">
            Flashcard Quiz App
          </h1>
          <div className="space-y-4">
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
            <div className="text-sm text-gray-600">
              <p className="font-medium mb-2">CSV Format:</p>
              <p>Column 1: Items (questions)</p>
              <p>Column 2: Responses (answers)</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (quiz.quizCompleted) {
    const score = calculateScore();
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Quiz Complete!</h2>
          <div className="text-6xl font-bold text-blue-600 mb-4">{score}%</div>
          <p className="text-gray-600 mb-6">
            You got {quiz.userAnswers.filter(a => a).length} out of {quiz.userAnswers.length} correct
          </p>
          <div className="space-y-3">
            <button
              onClick={resetQuiz}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 font-medium"
            >
              Try Again
            </button>
            <button
              onClick={() => setQuiz({ cards: [], currentIndex: 0, showAnswer: false, userAnswers: [], quizCompleted: false })}
              className="w-full bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 font-medium"
            >
              Upload New Cards
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentCard = quiz.cards[quiz.currentIndex];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full">
        <div className="text-center mb-6">
          <div className="text-sm text-gray-500 mb-2">
            Card {quiz.currentIndex + 1} of {quiz.cards.length}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all"
              style={{ width: `${((quiz.currentIndex + 1) / quiz.cards.length) * 100}%` }}
            ></div>
          </div>
        </div>

        <div className="text-center mb-8">
          <div className="text-lg font-medium text-gray-800 mb-4">
            {currentCard.item}
          </div>
          
          {quiz.showAnswer ? (
            <div className="space-y-6">
              <div className="text-xl font-bold text-blue-600 p-4 bg-blue-50 rounded-lg">
                {currentCard.response}
              </div>
              <div className="space-y-3">
                <p className="text-gray-600">Did you get it right?</p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => handleAnswer(true)}
                    className="bg-green-600 text-white py-2 px-6 rounded-lg hover:bg-green-700 font-medium"
                  >
                    Correct
                  </button>
                  <button
                    onClick={() => handleAnswer(false)}
                    className="bg-red-600 text-white py-2 px-6 rounded-lg hover:bg-red-700 font-medium"
                  >
                    Incorrect
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setQuiz({ ...quiz, showAnswer: true })}
              className="bg-blue-600 text-white py-3 px-8 rounded-lg hover:bg-blue-700 font-medium text-lg"
            >
              Show Answer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
