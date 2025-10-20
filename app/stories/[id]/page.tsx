"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter, useParams } from "next/navigation";

interface StoryNode {
  id: string;
  dilemmaId: string;
  nodeOrder: number;
  isStart: boolean;
  isEnd: boolean;
  contextBefore?: string;
  contextAfter?: string;
  dilemma: {
    id: string;
    title: string;
    description: string;
    optionA: string;
    optionB: string;
    situation?: string;
  };
  pathsFrom: Array<{
    id: string;
    choice: string;
    transitionText?: string;
    toNodeId: string;
  }>;
}

interface StoryData {
  id: string;
  title: string;
  description: string;
  theme?: string;
  genre?: string;
}

interface Progress {
  id: string;
  userId: string;
  storyId: string;
  currentNodeId: string | null;
  choicesMade: string;
  isCompleted: boolean;
}

export default function StoryPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const storyId = params.id as string;

  const [story, setStory] = useState<StoryData | null>(null);
  const [currentNode, setCurrentNode] = useState<StoryNode | null>(null);
  const [progress, setProgress] = useState<Progress | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTransition, setShowTransition] = useState(false);
  const [transitionText, setTransitionText] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    fetchStoryProgress();
  }, [storyId]);

  const fetchStoryProgress = async () => {
    try {
      const response = await fetch(`/api/story/${storyId}/play?userId=anonymous`);
      const data = await response.json();

      if (data.success) {
        setStory(data.data.story);
        setCurrentNode(data.data.currentNode);
        setProgress(data.data.progress);
        setIsCompleted(data.data.isCompleted || false);
      } else {
        throw new Error(data.error || "Failed to load story");
      }
    } catch (error: any) {
      console.error("Failed to fetch story:", error);
      alert("Failed to load story: " + error.message);
      router.push("/stories");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChoice = async (choice: "A" | "B") => {
    if (!currentNode || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/story/${storyId}/play`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "anonymous",
          nodeId: currentNode.id,
          choice,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Show transition
        if (data.data.transitionText) {
          setTransitionText(data.data.transitionText);
          setShowTransition(true);

          // Wait for transition
          await new Promise((resolve) => setTimeout(resolve, 3000));
          setShowTransition(false);
        }

        // Update to next node or complete
        if (data.data.isCompleted) {
          setIsCompleted(true);
          setCurrentNode(null);
        } else {
          setCurrentNode(data.data.nextNode);
        }
      } else {
        throw new Error(data.error || "Failed to make choice");
      }
    } catch (error: any) {
      console.error("Failed to make choice:", error);
      alert("Failed to make choice: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="divine-spinner"></span>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full text-center"
        >
          <div className="panel p-12 border border-green-400/20">
            <h1 className="text-4xl font-bold mb-6 mystical-text">
              STORY COMPLETED
            </h1>
            <p className="text-gray-400 mb-8 text-lg">
              You have reached the end of this narrative
            </p>

            {story && (
              <div className="mb-8 p-6 bg-black/60 border border-green-400/10">
                <h2 className="text-2xl font-bold text-green-400 mb-2">
                  {story.title}
                </h2>
                <p className="text-gray-500 text-sm">{story.description}</p>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => router.push("/stories")}
                className="flex-1 py-4 bg-black/60 border border-green-400/30 text-gray-400 font-bold tracking-widest text-sm hover:border-green-400 hover:text-green-400 transition-all"
              >
                BROWSE STORIES
              </button>
              <button
                onClick={() => router.push("/")}
                className="flex-1 py-4 bg-green-400 text-black font-bold tracking-widest text-sm hover:bg-green-300 transition-all"
              >
                RETURN HOME
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-12">
      <AnimatePresence mode="wait">
        {showTransition && (
          <motion.div
            key="transition"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <div className="max-w-3xl px-8 text-center">
              <p className="text-2xl text-green-400 leading-relaxed tracking-wide">
                {transitionText}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Story Header */}
      {story && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto mb-8"
        >
          <button
            onClick={() => router.push("/stories")}
            className="mb-6 px-4 py-2 border border-green-400/30 text-gray-400 font-bold tracking-wider text-xs hover:border-green-400 hover:text-green-400 transition-all"
          >
            ← BACK TO STORIES
          </button>

          <div className="panel p-6 border border-green-400/20">
            <h1 className="text-3xl font-bold mb-2 text-green-400">
              {story.title}
            </h1>
            {story.genre && (
              <span className="text-xs px-2 py-1 bg-green-400/10 border border-green-400/30 text-green-400 tracking-wider">
                {story.genre.toUpperCase()}
              </span>
            )}
          </div>
        </motion.div>
      )}

      {/* Current Node */}
      {currentNode && (
        <motion.div
          key={currentNode.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          {/* Context Before */}
          {currentNode.contextBefore && (
            <div className="mb-8 panel p-8 border border-green-400/20">
              <p className="text-lg text-gray-300 leading-relaxed whitespace-pre-line">
                {currentNode.contextBefore}
              </p>
            </div>
          )}

          {/* Dilemma */}
          <div className="panel p-10 border border-green-400/30 mb-8">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-4 text-green-400">
                {currentNode.dilemma.title}
              </h2>
              <p className="text-xl text-gray-300 leading-relaxed mb-6">
                {currentNode.dilemma.description}
              </p>
              {currentNode.dilemma.situation && (
                <div className="p-6 bg-black/60 border border-green-400/10">
                  <p className="text-gray-400 leading-relaxed">
                    {currentNode.dilemma.situation}
                  </p>
                </div>
              )}
            </div>

            {/* Choices */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <button
                onClick={() => handleChoice("A")}
                disabled={isSubmitting}
                className="group relative p-8 border border-green-400/30 bg-black/40 hover:border-green-400 hover:bg-green-400/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left"
              >
                <div className="absolute top-4 left-4 text-xs font-bold tracking-wider text-green-400/50 group-hover:text-green-400">
                  PATH A
                </div>
                <div className="mt-8 text-lg text-gray-300 group-hover:text-green-400 transition-colors leading-relaxed">
                  {currentNode.dilemma.optionA}
                </div>
              </button>

              <button
                onClick={() => handleChoice("B")}
                disabled={isSubmitting}
                className="group relative p-8 border border-green-400/30 bg-black/40 hover:border-green-400 hover:bg-green-400/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left"
              >
                <div className="absolute top-4 left-4 text-xs font-bold tracking-wider text-green-400/50 group-hover:text-green-400">
                  PATH B
                </div>
                <div className="mt-8 text-lg text-gray-300 group-hover:text-green-400 transition-colors leading-relaxed">
                  {currentNode.dilemma.optionB}
                </div>
              </button>
            </div>

            {isSubmitting && (
              <div className="mt-6 flex items-center justify-center">
                <span className="divine-spinner mr-3"></span>
                <span className="text-green-400 text-sm tracking-wider">
                  PROCESSING CHOICE...
                </span>
              </div>
            )}
          </div>

          {/* Context After */}
          {currentNode.contextAfter && (
            <div className="panel p-8 border border-green-400/20">
              <p className="text-lg text-gray-300 leading-relaxed whitespace-pre-line">
                {currentNode.contextAfter}
              </p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
