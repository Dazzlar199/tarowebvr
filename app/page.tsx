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

    // DEFAULT mode is handled by direct navigation buttons below
    if (mode === 'DEFAULT') {
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
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute inset-0 animate-slow-pan"
          style={{
            backgroundImage: 'url(/mainshot.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.4)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
      </div>

      {/* Navigation - Top Left */}
      <motion.nav
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="fixed top-6 left-6 z-50 flex gap-3"
      >
        <button
          onClick={() => router.push('/archive')}
          className="px-4 py-2 bg-black/80 border border-green-400/30 text-green-400 text-xs font-bold tracking-wider hover:bg-green-400/10 hover:border-green-400 transition-all backdrop-blur-sm"
          title={t('archive.title')}
        >
          ARCHIVE
        </button>
        <button
          onClick={() => router.push('/profile')}
          className="px-4 py-2 bg-black/80 border border-green-400/30 text-green-400 text-xs font-bold tracking-wider hover:bg-green-400/10 hover:border-green-400 transition-all backdrop-blur-sm"
          title={t('profile.title')}
        >
          PROFILE
        </button>
        <button
          onClick={() => router.push('/analytics')}
          className="px-4 py-2 bg-black/80 border border-green-400/30 text-green-400 text-xs font-bold tracking-wider hover:bg-green-400/10 hover:border-green-400 transition-all backdrop-blur-sm"
          title="Analytics"
        >
          STATS
        </button>
        <button
          onClick={() => router.push('/multiplayer')}
          className="px-4 py-2 bg-black/80 border border-purple-400/30 text-purple-400 text-xs font-bold tracking-wider hover:bg-purple-400/10 hover:border-purple-400 transition-all backdrop-blur-sm"
          title={t('multiplayer.title')}
        >
          MULTI
        </button>
      </motion.nav>

      {/* Content - positioned above background */}
      <div className="relative z-10 w-full flex flex-col items-center">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center mb-8"
      >
        <h1 className="text-6xl md:text-8xl font-bold mb-6 mystical-text">
          {t('home.title')}
        </h1>
        <p className="text-sm md:text-base mb-4 tracking-widest text-green-400/70 font-bold">
          {t('home.ip.subtitle')}
        </p>
        <p className="text-xl md:text-2xl mb-4 tracking-wide" style={{ color: 'var(--foreground)' }}>
          {t('home.subtitle')}
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

          {mode === 'DEFAULT' && (
            <div className="mb-6">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-green-400 mb-2 tracking-wider">HALL OF FAME</h3>
                <p className="text-xs text-gray-500 tracking-wide">{t('home.halloffame.subtitle')}</p>
              </div>

              {/* Featured Dilemma Card */}
              <div
                onClick={() => router.push('/explore/cmh0murder001default')}
                className="group border border-green-400/30 bg-black/60 hover:bg-green-400/10 hover:border-green-400 transition-all cursor-pointer overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-bold tracking-wider text-lg text-green-400">{t('home.default.murder')}</h4>
                      </div>
                      <p className="text-xs text-gray-400 mb-3">증거인멸의 딜레마 - 당신의 형제를 보호할 것인가, 정의를 택할 것인가?</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1 text-gray-400">
                      <span>2.5K {t('home.halloffame.views')}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400">
                      <span>1.8K {t('home.halloffame.choices')}</span>
                    </div>
                    <div className="flex items-center gap-1 text-green-400">
                      <span>UNREAL ENHANCED</span>
                    </div>
                  </div>
                </div>

                <div className="bg-green-400/5 px-6 py-3 border-t border-green-400/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Community&apos;s Choice • Week 1</span>
                    <span className="text-xs text-green-400 group-hover:translate-x-1 transition-transform">EXPLORE →</span>
                  </div>
                </div>
              </div>
            </div>
          )}

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

          {mode !== 'DEFAULT' && (
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
          )}
        </div>
      </motion.div>

      </div>
    </div>
  );
}
