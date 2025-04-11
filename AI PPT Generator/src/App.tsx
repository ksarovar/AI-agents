import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wand2, Presentation as PresentationScreen, Sparkles } from 'lucide-react';
import { Loader } from './components/Loader';
import { SlidePreview } from './components/SlidePreview';
import type { PPTResponse, FormData } from './types';

function App() {
  const [loading, setLoading] = useState(false);
  const [slides, setSlides] = useState<PPTResponse | null>(null);
  const [formData, setFormData] = useState<FormData>({
    requirements: '',
    slideCount: 6,
    tone: 'professional',
    audience: 'general public'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSlides(null);
    
    try {
      const response = await fetch('http://localhost:5001/preview-ppt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      setSlides(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-6xl mx-auto"
      >
        <motion.div 
          className="flex items-center justify-center gap-4 mb-12"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 10 }}
        >
          <div className="relative">
            <PresentationScreen className="w-16 h-16 text-blue-600" />
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 360],
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -top-2 -right-2"
            >
              <Sparkles className="w-6 h-6 text-yellow-400" />
            </motion.div>
          </div>
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
            AI PowerPoint Generator
          </h1>
        </motion.div>

        <motion.div
          className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2">
                What would you like to present about?
              </label>
              <textarea
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                className="w-full h-32 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow"
                placeholder="Describe your presentation topic and requirements..."
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div whileHover={{ scale: 1.02 }}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Slides
                </label>
                <select
                  value={formData.slideCount}
                  onChange={(e) => setFormData({ ...formData, slideCount: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={4}>4 Slides</option>
                  <option value={6}>6 Slides</option>
                  <option value={8}>8 Slides</option>
                </select>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Presentation Tone
                </label>
                <select
                  value={formData.tone}
                  onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="persuasive">Persuasive</option>
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                </select>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target Audience
                </label>
                <select
                  value={formData.audience}
                  onChange={(e) => setFormData({ ...formData, audience: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="general public">General Public</option>
                  <option value="executives">Executives</option>
                  <option value="students">Students</option>
                </select>
              </motion.div>
            </div>

            <div className="flex justify-center pt-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                disabled={loading}
              >
                <Wand2 size={24} />
                <span className="text-lg font-semibold">Generate Presentation</span>
              </motion.button>
            </div>
          </form>
        </motion.div>

        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center gap-6 my-12"
            >
              <Loader />
              <motion.p
                className="text-xl text-gray-600"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                Crafting your presentation with AI magic...
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {slides && !loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <SlidePreview slides={slides.slides} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default App;