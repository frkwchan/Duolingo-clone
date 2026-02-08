import React, { useState, useEffect } from 'react';
import { AppScreen, LessonQuestion, ImageSize } from './types';
import { generateLessonPlan, checkApiKey, promptApiKeySelection } from './services/geminiService';
import { LanguageCard } from './components/LanguageCard';
import { LessonScreen } from './components/LessonScreen';
import { Button } from './components/Button';

// Initial languages to learn
const LANGUAGES = [
  { id: 'es', name: 'Spanish', flag: '🇪🇸' },
  { id: 'fr', name: 'French', flag: '🇫🇷' },
  { id: 'jp', name: 'Japanese', flag: '🇯🇵' },
  { id: 'de', name: 'German', flag: '🇩🇪' },
  { id: 'it', name: 'Italian', flag: '🇮🇹' },
  { id: 'kr', name: 'Korean', flag: '🇰🇷' },
];

export default function App() {
  const [screen, setScreen] = useState<AppScreen>(AppScreen.HOME);
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [lessonData, setLessonData] = useState<LessonQuestion[]>([]);
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [imageSize, setImageSize] = useState<ImageSize>('1K');
  const [lessonResult, setLessonResult] = useState<{score: number, lives: number} | null>(null);

  useEffect(() => {
    // Initial check for API key
    checkApiKey().then(setHasApiKey);
  }, []);

  const handleStartLesson = async (languageName: string) => {
    if (!hasApiKey) {
      await promptApiKeySelection();
      // Assume successful selection if we proceed, but good to re-check in real app
      // For this flow, we will proceed to attempt generation.
      setHasApiKey(true);
    }

    setSelectedLanguage(languageName);
    setScreen(AppScreen.LESSON_LOADING);

    try {
      const questions = await generateLessonPlan(languageName);
      setLessonData(questions);
      setScreen(AppScreen.LESSON_ACTIVE);
    } catch (error) {
      console.error("Error starting lesson:", error);
      setScreen(AppScreen.HOME);
      alert("Failed to generate lesson. Please check your connection and API key.");
    }
  };

  const handleLessonComplete = (remainingLives: number) => {
    setLessonResult({
      score: 100, // Placeholder
      lives: remainingLives
    });
    setScreen(AppScreen.LESSON_COMPLETE);
  };

  const handleExit = () => {
    setScreen(AppScreen.HOME);
    setLessonData([]);
    setSelectedLanguage(null);
  };

  const handleApiKeyClick = async () => {
    await promptApiKeySelection();
    const result = await checkApiKey();
    setHasApiKey(result);
  };

  return (
    <div className="min-h-screen bg-white md:bg-gray-50 text-duo-text font-sans">
      <div className="max-w-md mx-auto h-screen bg-white shadow-xl overflow-hidden relative">
        
        {screen === AppScreen.HOME && (
          <div className="flex flex-col h-full p-6">
            <header className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-bold text-duo-green">DuoGen AI</h1>
              <button 
                onClick={handleApiKeyClick}
                className={`text-sm font-bold px-3 py-1 rounded-full border-2 ${hasApiKey ? 'border-duo-green text-duo-green' : 'border-duo-gray text-duo-grayDark'}`}
              >
                {hasApiKey ? 'KEY ACTIVE' : 'SET KEY'}
              </button>
            </header>

            <div className="flex-1">
              <h2 className="text-xl font-bold mb-4 text-center">I want to learn...</h2>
              
              <div className="mb-6 flex justify-center gap-4 bg-gray-50 p-4 rounded-xl border-2 border-duo-gray">
                 <div className="flex flex-col items-center">
                    <span className="text-xs font-bold text-duo-text mb-1 uppercase">Image Quality</span>
                    <div className="flex gap-2">
                      {(['1K', '2K', '4K'] as ImageSize[]).map((size) => (
                        <button
                          key={size}
                          onClick={() => setImageSize(size)}
                          className={`px-2 py-1 text-xs font-bold rounded ${imageSize === size ? 'bg-duo-blue text-white' : 'bg-duo-gray text-duo-text'}`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {LANGUAGES.map(lang => (
                  <LanguageCard 
                    key={lang.id}
                    language={lang.name}
                    flag={lang.flag}
                    onClick={() => handleStartLesson(lang.name)}
                  />
                ))}
              </div>
            </div>

            <div className="mt-8 text-center text-duo-grayDark text-sm">
              <p>Powered by Gemini 2.5 Flash Lite & 3 Pro Image</p>
            </div>
          </div>
        )}

        {screen === AppScreen.LESSON_LOADING && (
          <div className="flex flex-col items-center justify-center h-full p-6">
            <div className="w-24 h-24 mb-8 relative animate-bounce">
              <svg viewBox="0 0 100 100" className="w-full h-full text-duo-green fill-current">
                 <path d="M50 10 C30 10 10 30 10 50 C10 70 30 90 50 90 C70 90 90 70 90 50 C90 30 70 10 50 10 Z" opacity="0.2" />
                 <path d="M30 40 Q50 60 70 40" stroke="currentColor" strokeWidth="8" fill="none" strokeLinecap="round" />
                 <circle cx="35" cy="35" r="5" />
                 <circle cx="65" cy="35" r="5" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-duo-text mb-2">Creating your lesson...</h2>
            <p className="text-duo-grayDark text-center">
              Gemini is crafting questions and custom illustrations just for you.
            </p>
          </div>
        )}

        {screen === AppScreen.LESSON_ACTIVE && (
          <LessonScreen 
            questions={lessonData}
            onComplete={handleLessonComplete}
            onExit={handleExit}
            initialLives={3}
            selectedImageSize={imageSize}
          />
        )}

        {screen === AppScreen.LESSON_COMPLETE && lessonResult && (
          <div className="flex flex-col items-center justify-center h-full p-6 bg-duo-yellow">
            <h2 className="text-4xl font-extrabold text-white mb-6">Lesson Complete!</h2>
            
            <div className="grid grid-cols-2 gap-4 w-full mb-8">
              <div className="bg-duo-yellowDark p-4 rounded-2xl border-2 border-white/20 text-center text-white">
                <div className="text-xs font-bold uppercase mb-1">Total XP</div>
                <div className="text-3xl font-bold">15</div>
              </div>
              <div className="bg-duo-yellowDark p-4 rounded-2xl border-2 border-white/20 text-center text-white">
                <div className="text-xs font-bold uppercase mb-1">Lives Left</div>
                <div className="text-3xl font-bold">{lessonResult.lives}</div>
              </div>
            </div>

            <div className="w-full mt-auto mb-4">
              <Button fullWidth onClick={handleExit} variant="primary" className="bg-white text-duo-yellowDark border-b-4 border-black/10 hover:bg-gray-50">
                Continue
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}