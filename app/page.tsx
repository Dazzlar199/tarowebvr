"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/contexts/LanguageContext";
import toast from "react-hot-toast";
import type { APIResponse, CreateDilemmaResponse } from "@/types/dilemma";

export default function HomePage() {
  const { t } = useLanguage();
  const [mode, setMode] = useState<'DEFAULT' | 'AI' | 'STORY'>('DEFAULT');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [prompt, setPrompt] = useState("");
  const router = useRouter();

  // 랜덤 프롬프트만 생성
  const handleGeneratePrompt = async () => {
    setIsGeneratingPrompt(true);
    try {
      const response = await fetch("/api/generate-prompt");
      const data = await response.json();

      if (data.success && data.prompt) {
        setPrompt(data.prompt);
        toast.success("Random prompt generated!");
      } else {
        throw new Error(data.error || "Failed to generate prompt");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Failed to generate prompt:", error);
      toast.error(`Failed to generate prompt: ${errorMessage}`);
    } finally {
      setIsGeneratingPrompt(false);
    }
  };

  const handleGenerate = async () => {
    if (mode === 'STORY') {
      // Navigate to story list
      router.push('/stories');
      return;
    }

    // DEFAULT mode - Navigate to farm dilemma directly
    if (mode === 'DEFAULT') {
      // Use hardcoded farm dilemma ID (seeded in production)
      const defaultDilemmaId = 'cmgzae36r0000hbb74fb5wv25';
      router.push(`/explore/${defaultDilemmaId}`);
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch("/api/dilemma/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          useAI: mode === 'AI',
          theme: prompt || undefined,
        }),
      });

      const data: APIResponse<CreateDilemmaResponse> = await response.json();

      if (data.success && data.data?.dilemmaId) {
        toast.success("Dilemma created successfully!");
        router.push(`/explore/${data.data.dilemmaId}`);
      } else {
        throw new Error(data.error || "Failed to create dilemma");
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Failed to generate dilemma:", error);
      toast.error(`Failed to create scenario: ${errorMessage}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-12"
      >
        <h1 className="text-6xl md:text-8xl font-bold mb-6 mystical-text">
          {t('home.title')}
        </h1>
        <p className="text-xl md:text-2xl mb-4 tracking-wide" style={{ color: 'var(--foreground)' }}>
          {t('home.subtitle')}
        </p>
        <p className="text-md tracking-wider" style={{ color: 'var(--text-muted)' }}>
          {t('home.tagline')}
        </p>
      </motion.div>

      {/* Dilemma Generation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="w-full max-w-3xl"
      >
        <div className="panel p-10 border border-green-400/20">
          <div className="flex gap-3 mb-6">
            <button
              onClick={() => setMode('DEFAULT')}
              className={`flex-1 py-4 px-6 border transition-all ${
                mode === 'DEFAULT'
                  ? 'border-green-400 bg-green-400/10 text-green-400'
                  : 'border-green-400/20 bg-black/40 text-gray-600'
              }`}
            >
              <div className="font-bold tracking-wider text-sm">{t('home.mode.default')}</div>
              <div className="text-xs mt-1 opacity-60">{t('home.mode.default.desc')}</div>
            </button>

            <button
              onClick={() => setMode('AI')}
              className={`flex-1 py-4 px-6 border transition-all ${
                mode === 'AI'
                  ? 'border-green-400 bg-green-400/10 text-green-400'
                  : 'border-green-400/20 bg-black/40 text-gray-600'
              }`}
            >
              <div className="font-bold tracking-wider text-sm">{t('home.mode.ai')}</div>
              <div className="text-xs mt-1 opacity-60">{t('home.mode.ai.desc')}</div>
            </button>

            <button
              onClick={() => setMode('STORY')}
              className={`flex-1 py-4 px-6 border transition-all ${
                mode === 'STORY'
                  ? 'border-green-400 bg-green-400/10 text-green-400'
                  : 'border-green-400/20 bg-black/40 text-gray-600'
              }`}
            >
              <div className="font-bold tracking-wider text-sm">{t('home.mode.story')}</div>
              <div className="text-xs mt-1 opacity-60">{t('home.mode.story.desc')}</div>
            </button>
          </div>

          {mode === 'AI' && (
            <div className="mb-6">
              <label className="block text-xs font-bold tracking-wider text-green-400 mb-3">
                {t('home.ai.prompt.label')}
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={t('home.ai.prompt.placeholder')}
                className="w-full px-4 py-3 bg-black/60 border border-green-400/30 text-gray-300 text-sm placeholder-gray-600 focus:border-green-400 focus:outline-none resize-none"
                rows={3}
              />
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-600 tracking-wide">
                  {t('home.ai.prompt.help')}
                </p>
                <button
                  onClick={handleGeneratePrompt}
                  disabled={isGeneratingPrompt}
                  className="px-4 py-2 bg-black/60 border border-green-400/30 text-green-400 text-xs font-bold tracking-wider hover:bg-green-400/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingPrompt ? t('home.ai.button.randomGenerating') : t('home.ai.button.random')}
                </button>
              </div>
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full py-5 bg-green-400 text-black font-bold tracking-widest text-sm hover:bg-green-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <span className="flex items-center justify-center">
                <span className="divine-spinner mr-3"></span>
                {mode === 'AI' ? t('home.ai.button.generating') : t('home.button.loading')}
              </span>
            ) : (
              mode === 'AI' ? t('home.ai.button.enter') : mode === 'STORY' ? t('home.story.button') : t('home.button.enter')
            )}
          </button>
        </div>
      </motion.div>

      {/* Navigation Buttons */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        className="w-full max-w-3xl mt-8 space-y-4"
      >
        <button
          onClick={() => router.push('/analytics')}
          className="w-full py-4 bg-black/60 border border-green-400/30 text-green-400 font-bold tracking-widest text-sm hover:bg-green-400/10 transition-all"
        >
          GLOBAL STATISTICS & PERSONALITY ANALYSIS
        </button>
        <button
          onClick={() => router.push('/multiplayer')}
          className="w-full py-4 bg-black/60 border border-purple-400/30 text-purple-400 font-bold tracking-widest text-sm hover:bg-purple-400/10 transition-all"
        >
          {t('multiplayer.button')}
        </button>
      </motion.div>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-5xl mt-20"
      >
        <div className="text-center p-8 bg-black/60 border border-green-400/30 backdrop-blur-sm">
          {/* AI Neural Network Icon */}
          <svg className="w-14 h-14 mx-auto mb-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="2" stroke="#00ff41" strokeWidth="1.5" fill="none"/>
            <circle cx="6" cy="6" r="1.5" stroke="#00ff41" strokeWidth="1.5" fill="none"/>
            <circle cx="18" cy="6" r="1.5" stroke="#00ff41" strokeWidth="1.5" fill="none"/>
            <circle cx="6" cy="18" r="1.5" stroke="#00ff41" strokeWidth="1.5" fill="none"/>
            <circle cx="18" cy="18" r="1.5" stroke="#00ff41" strokeWidth="1.5" fill="none"/>
            <line x1="12" y1="10" x2="7" y2="7" stroke="#00ff41" strokeWidth="1" opacity="0.6"/>
            <line x1="12" y1="10" x2="17" y2="7" stroke="#00ff41" strokeWidth="1" opacity="0.6"/>
            <line x1="12" y1="14" x2="7" y2="17" stroke="#00ff41" strokeWidth="1" opacity="0.6"/>
            <line x1="12" y1="14" x2="17" y2="17" stroke="#00ff41" strokeWidth="1" opacity="0.6"/>
          </svg>
          <h3 className="font-bold mb-3 text-green-400 tracking-wider text-sm">{t('home.feature.ai.title')}</h3>
          <p className="text-xs text-gray-500 tracking-wide leading-relaxed">
            {t('home.feature.ai.desc')}
          </p>
        </div>

        <div className="text-center p-8 bg-black/60 border border-green-400/30 backdrop-blur-sm">
          {/* VR Headset Icon */}
          <svg className="w-14 h-14 mx-auto mb-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="8" width="16" height="8" rx="2" stroke="#00ff41" strokeWidth="1.5" fill="none"/>
            <circle cx="8.5" cy="12" r="1.5" stroke="#00ff41" strokeWidth="1.5" fill="none"/>
            <circle cx="15.5" cy="12" r="1.5" stroke="#00ff41" strokeWidth="1.5" fill="none"/>
            <path d="M4 10 L2 12 L4 14" stroke="#00ff41" strokeWidth="1.5" fill="none"/>
            <path d="M20 10 L22 12 L20 14" stroke="#00ff41" strokeWidth="1.5" fill="none"/>
            <line x1="12" y1="8" x2="12" y2="6" stroke="#00ff41" strokeWidth="1.5"/>
          </svg>
          <h3 className="font-bold mb-3 text-green-400 tracking-wider text-sm">{t('home.feature.xr.title')}</h3>
          <p className="text-xs text-gray-500 tracking-wide leading-relaxed">
            {t('home.feature.xr.desc')}
          </p>
        </div>

        <div className="text-center p-8 bg-black/60 border border-green-400/30 backdrop-blur-sm">
          {/* Analytics Chart Icon */}
          <svg className="w-14 h-14 mx-auto mb-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 17 L7 13 L11 16 L17 9 L21 13" stroke="#00ff41" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="7" cy="13" r="1.5" fill="#00ff41"/>
            <circle cx="11" cy="16" r="1.5" fill="#00ff41"/>
            <circle cx="17" cy="9" r="1.5" fill="#00ff41"/>
            <rect x="3" y="3" width="18" height="18" rx="2" stroke="#00ff41" strokeWidth="1.5" fill="none" opacity="0.3"/>
          </svg>
          <h3 className="font-bold mb-3 text-green-400 tracking-wider text-sm">{t('home.feature.analysis.title')}</h3>
          <p className="text-xs text-gray-500 tracking-wide leading-relaxed">
            {t('home.feature.analysis.desc')}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
