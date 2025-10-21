"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Story {
  id: string;
  title: string;
  description: string;
  theme?: string;
  genre?: string;
  difficulty: number;
  nodes: Array<{
    id: string;
    nodeOrder: number;
    isStart: boolean;
    isEnd: boolean;
    dilemma: {
      id: string;
      title: string;
      imageUrl?: string;
    };
  }>;
  createdAt: string;
  author: {
    id: string;
    username: string;
  };
  isCompleted?: boolean; // User's completion status
}

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [createMode, setCreateMode] = useState<'DEFAULT' | 'AI'>('DEFAULT');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createPrompt, setCreatePrompt] = useState("");
  const router = useRouter();

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const response = await fetch("/api/story/create?published=true&userId=anonymous");
      const data = await response.json();
      if (data.success) {
        setStories(data.data.stories);
      }
    } catch (error) {
      console.error("Failed to fetch stories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateStory = async () => {
    setIsCreating(true);
    try {
      const response = await fetch("/api/story/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          useAI: createMode === 'AI',
          theme: createPrompt || undefined,
          numberOfNodes: 5,
        }),
      });

      const data = await response.json();

      if (data.success && data.data.storyId) {
        // Navigate to story play page
        router.push(`/stories/${data.data.storyId}`);
      } else {
        throw new Error(data.error || "Failed to create story");
      }
    } catch (error: any) {
      console.error("Failed to create story:", error);
      alert("Failed to create story: " + error.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handlePlayStory = (story: Story) => {
    router.push(`/stories/${story.id}`);
  };

  return (
    <div className="min-h-screen px-4 py-12">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto mb-12"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-5xl font-bold mb-4 mystical-text">STORIES</h1>
            <p className="text-gray-400 tracking-wide">
              Interactive branching narratives
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-8 py-4 bg-green-400 text-black font-bold tracking-widest text-sm hover:bg-green-300 transition-all"
          >
            CREATE NEW
          </button>
        </div>
      </motion.div>

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="panel max-w-2xl w-full p-8 border border-green-400/20"
          >
            <h2 className="text-2xl font-bold mb-6 text-green-400 tracking-wider">
              CREATE NEW STORY
            </h2>

            <div className="flex gap-3 mb-6">
              <button
                onClick={() => setCreateMode('DEFAULT')}
                className={`flex-1 py-4 px-6 border transition-all ${
                  createMode === 'DEFAULT'
                    ? 'border-green-400 bg-green-400/10 text-green-400'
                    : 'border-green-400/20 bg-black/40 text-gray-600'
                }`}
              >
                <div className="font-bold tracking-wider text-sm">DEFAULT</div>
                <div className="text-xs mt-1 opacity-60">Quick start</div>
              </button>

              <button
                onClick={() => setCreateMode('AI')}
                className={`flex-1 py-4 px-6 border transition-all ${
                  createMode === 'AI'
                    ? 'border-green-400 bg-green-400/10 text-green-400'
                    : 'border-green-400/20 bg-black/40 text-gray-600'
                }`}
              >
                <div className="font-bold tracking-wider text-sm">AI POWERED</div>
                <div className="text-xs mt-1 opacity-60">Custom story</div>
              </button>
            </div>

            {createMode === 'AI' && (
              <div className="mb-6">
                <label className="block text-xs font-bold tracking-wider text-green-400 mb-3">
                  STORY THEME (OPTIONAL)
                </label>
                <textarea
                  value={createPrompt}
                  onChange={(e) => setCreatePrompt(e.target.value)}
                  placeholder="e.g., A detective solving crimes in a cyberpunk city..."
                  className="w-full px-4 py-3 bg-black/60 border border-green-400/30 text-gray-300 text-sm placeholder-gray-600 focus:border-green-400 focus:outline-none resize-none"
                  rows={3}
                />
                <p className="text-xs text-gray-600 mt-2 tracking-wide">
                  Leave blank for random AI-generated story
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 py-4 bg-black/60 border border-green-400/30 text-gray-400 font-bold tracking-widest text-sm hover:border-green-400 transition-all"
              >
                CANCEL
              </button>
              <button
                onClick={handleCreateStory}
                disabled={isCreating}
                className="flex-1 py-4 bg-green-400 text-black font-bold tracking-widest text-sm hover:bg-green-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? (
                  <span className="flex items-center justify-center">
                    <span className="divine-spinner mr-3"></span>
                    CREATING...
                  </span>
                ) : (
                  "CREATE"
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Stories Grid */}
      <div className="max-w-6xl mx-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <span className="divine-spinner"></span>
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 mb-6">No stories available yet</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-8 py-4 bg-green-400 text-black font-bold tracking-widest text-sm hover:bg-green-300 transition-all"
            >
              CREATE FIRST STORY
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stories.map((story, index) => {
              // Get first node's image (or any node with an image)
              const firstImageNode = story.nodes.find(n => n.dilemma.imageUrl)
              const imageUrl = firstImageNode?.dilemma.imageUrl

              return (
                <motion.div
                  key={story.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="panel border border-green-400/20 hover:border-green-400/50 transition-all cursor-pointer group overflow-hidden"
                  onClick={() => handlePlayStory(story)}
                >
                  {/* Nano Banana Image - Tarot Card Style */}
                  {imageUrl && (
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={story.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
                      {story.genre && (
                        <span className="absolute top-4 left-4 text-xs px-3 py-1 bg-green-400/20 backdrop-blur-sm border border-green-400/50 text-green-400 tracking-wider font-bold">
                          {story.genre.toUpperCase()}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-green-400 mb-2 group-hover:text-green-300 transition-colors">
                          {story.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 10 }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-1 h-3 ${
                              i < story.difficulty
                                ? 'bg-green-400'
                                : 'bg-green-400/20'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                      {story.description}
                    </p>

                    {story.theme && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-600 uppercase tracking-wider mb-1">
                          Theme
                        </p>
                        <p className="text-sm text-gray-300">{story.theme}</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-green-400/10">
                      <div className="text-xs text-gray-600">
                        {story.nodes.length} dilemmas
                      </div>
                      <div className="text-xs text-gray-600">
                        by {story.author.username}
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-sm font-bold text-green-400 tracking-wider">
                        {story.isCompleted ? 'REPLAY STORY →' : 'PLAY STORY →'}
                      </span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Back Button */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="max-w-6xl mx-auto mt-12"
      >
        <button
          onClick={() => router.push("/")}
          className="px-6 py-3 border border-green-400/30 text-gray-400 font-bold tracking-wider text-sm hover:border-green-400 hover:text-green-400 transition-all"
        >
          ← BACK TO HOME
        </button>
      </motion.div>
    </div>
  );
}
