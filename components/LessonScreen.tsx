import React, { useState, useEffect, useRef } from 'react';
import { LessonQuestion, ImageSize } from '../types';
import { Button } from './Button';
import { ProgressBar } from './ProgressBar';
import { generateLessonImage } from '../services/geminiService';

interface LessonScreenProps {
  questions: LessonQuestion[];
  onComplete: (score: number) => void;
  onExit: () => void;
  initialLives: number;
  selectedImageSize: ImageSize;
}

export const LessonScreen: React.FC<LessonScreenProps> = ({ 
  questions, 
  onComplete, 
  onExit,
  initialLives,
  selectedImageSize
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [status, setStatus] = useState<'idle' | 'checking' | 'correct' | 'incorrect'>('idle');
  const [lives, setLives] = useState(initialLives);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isImageLoading, setIsImageLoading] = useState(false);
  
  const currentQuestion = questions[currentIdx];
  const isFinished = currentIdx >= questions.length;

  // Use a ref to prevent multiple fetches if re-renders happen
  const imageCache = useRef<Record<number, string>>({});

  useEffect(() => {
    if (!currentQuestion) return;

    const fetchImage = async () => {
      // Check cache first
      if (imageCache.current[currentIdx]) {
        setImageSrc(imageCache.current[currentIdx]);
        return;
      }

      setIsImageLoading(true);
      setImageSrc(null);
      
      try {
        const base64 = await generateLessonImage(currentQuestion.imagePrompt, selectedImageSize);
        if (base64) {
          imageCache.current[currentIdx] = base64;
          setImageSrc(base64);
        }
      } catch (e) {
        console.error("Error fetching image", e);
      } finally {
        setIsImageLoading(false);
      }
    };

    fetchImage();
    
    // reset selection
    setSelectedOption(null);
    setStatus('idle');
  }, [currentIdx, currentQuestion, selectedImageSize]);

  const handleCheck = () => {
    if (selectedOption === null) return;
    setStatus('checking');

    // Artificial delay for "processing" feel
    setTimeout(() => {
      if (selectedOption === currentQuestion.correctAnswerIndex) {
        setStatus('correct');
        // Play success sound if we had one
      } else {
        setStatus('incorrect');
        setLives(l => Math.max(0, l - 1));
      }
    }, 500);
  };

  const handleContinue = () => {
    if (lives === 0) {
      onComplete(0); // Failed
      return;
    }
    
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(currentIdx + 1);
    } else {
      onComplete(lives); // Success
    }
  };

  if (!currentQuestion) return null;

  return (
    <div className="flex flex-col h-full max-w-md mx-auto relative bg-white">
      {/* Header */}
      <div className="flex items-center gap-4 p-4">
        <button onClick={onExit} className="text-duo-grayDark hover:text-duo-gray transition">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <ProgressBar current={currentIdx} total={questions.length} />
        <div className="flex items-center text-duo-red font-bold">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mr-1">
            <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
          </svg>
          {lives}
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-4 pb-32">
        <h1 className="text-2xl font-bold text-duo-text mb-6">Select the correct meaning</h1>
        
        {/* Generated Image Area */}
        <div className="mb-6 w-full aspect-square max-w-[280px] mx-auto bg-duo-gray/20 rounded-2xl overflow-hidden border-2 border-duo-gray relative flex items-center justify-center">
          {isImageLoading ? (
             <div className="flex flex-col items-center animate-pulse">
                <svg className="w-12 h-12 text-duo-blue mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-bold text-duo-blue">AI Drawing...</span>
             </div>
          ) : imageSrc ? (
            <img src={imageSrc} alt="AI Generated Hint" className="w-full h-full object-cover" />
          ) : (
            <div className="text-duo-grayDark font-bold text-center p-4">
              <span className="block text-4xl mb-2">🎨</span>
              Image unavailable<br/>(Check API Key)
            </div>
          )}
        </div>

        <div className="mb-6">
          <div className="inline-block border-2 border-duo-gray p-4 rounded-2xl relative">
            <span className="text-lg font-bold text-duo-text">{currentQuestion.question}</span>
            {/* Speech bubble tail */}
            <div className="absolute top-1/2 -left-2 w-3 h-3 bg-white border-l-2 border-b-2 border-duo-gray transform rotate-45 -translate-y-1/2"></div>
          </div>
          {/* Character Avatar placeholder */}
          <div className="absolute left-4 top-[320px] -z-10 opacity-20">
             {/* Could add an SVG avatar here */}
          </div>
        </div>

        {/* Options */}
        <div className="grid grid-cols-1 gap-3">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = idx === currentQuestion.correctAnswerIndex;
            const showCorrect = status !== 'idle' && status !== 'checking' && isCorrect;
            const showIncorrect = status === 'incorrect' && isSelected && !isCorrect;

            let borderClass = 'border-duo-gray border-b-4';
            let bgClass = 'bg-white';
            let textClass = 'text-duo-text';

            if (isSelected && status === 'idle') {
              borderClass = 'border-duo-blueDark border-b-4';
              bgClass = 'bg-duo-blue/10';
              textClass = 'text-duo-blueDark';
            } else if (showCorrect) {
              borderClass = 'border-duo-greenDark border-b-4';
              bgClass = 'bg-duo-green/20';
              textClass = 'text-duo-greenDark';
            } else if (showIncorrect) {
              borderClass = 'border-duo-redDark border-b-4';
              bgClass = 'bg-duo-red/20';
              textClass = 'text-duo-redDark';
            }

            return (
              <button
                key={idx}
                disabled={status !== 'idle'}
                onClick={() => setSelectedOption(idx)}
                className={`w-full p-4 rounded-xl text-left font-bold text-lg border-2 transition-all active:scale-[0.98] ${borderClass} ${bgClass} ${textClass}`}
              >
                <div className="flex items-center justify-between">
                  <span>{option}</span>
                  {/* Number key hint could go here */}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer / Feedback Action Sheet */}
      <div 
        className={`fixed bottom-0 left-0 right-0 p-4 border-t-2 border-duo-gray transition-transform duration-300 z-50 ${
          status === 'correct' ? 'bg-duo-green/10 border-duo-green' : 
          status === 'incorrect' ? 'bg-duo-red/10 border-duo-red' : 'bg-white'
        }`}
      >
        <div className="max-w-md mx-auto flex flex-col gap-4">
          
          {status === 'correct' && (
            <div className="flex items-center gap-2 text-duo-greenDark font-bold text-xl mb-2">
              <div className="w-8 h-8 bg-duo-green rounded-full flex items-center justify-center text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              </div>
              Nice job!
            </div>
          )}
          
          {status === 'incorrect' && (
            <div className="flex flex-col gap-1 mb-2">
              <div className="flex items-center gap-2 text-duo-redDark font-bold text-xl">
                <div className="w-8 h-8 bg-duo-red rounded-full flex items-center justify-center text-white">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                </div>
                Correct solution:
              </div>
              <div className="text-duo-redDark ml-10">
                {currentQuestion.options[currentQuestion.correctAnswerIndex]}
              </div>
            </div>
          )}

          {status === 'idle' ? (
            <Button 
              fullWidth 
              size="lg" 
              onClick={handleCheck} 
              disabled={selectedOption === null}
              variant="primary"
            >
              Check
            </Button>
          ) : (
             <Button 
              fullWidth 
              size="lg" 
              onClick={handleContinue}
              variant={status === 'incorrect' ? 'danger' : 'primary'}
            >
              Continue
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};