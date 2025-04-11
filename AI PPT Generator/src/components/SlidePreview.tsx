import { motion } from 'framer-motion';
import { Slide } from '../types';
import { Download, ChevronLeft, ChevronRight, Maximize2, FileType2, Image, Presentation as FilePresentation } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import pptxgen from 'pptxgenjs';
import { useState } from 'react';

interface Props {
  slides: Slide[];
}

export const SlidePreview = ({ slides }: Props) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);

  const downloadPDF = async () => {
    const pdf = new jsPDF('landscape');
    const slideElements = document.querySelectorAll('.slide');
    
    for (let i = 0; i < slideElements.length; i++) {
      const canvas = await html2canvas(slideElements[i] as HTMLElement);
      const imgData = canvas.toDataURL('image/png');
      
      if (i > 0) pdf.addPage();
      pdf.addImage(imgData, 'PNG', 10, 10, 280, 150);
    }
    
    pdf.save('presentation.pdf');
    setShowDownloadOptions(false);
  };

  const downloadPNG = async () => {
    const slideElements = document.querySelectorAll('.slide');
    
    for (let i = 0; i < slideElements.length; i++) {
      const canvas = await html2canvas(slideElements[i] as HTMLElement);
      const link = document.createElement('a');
      link.download = `slide-${i + 1}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
    setShowDownloadOptions(false);
  };

  const downloadTXT = () => {
    const content = slides.map((slide, index) => {
      return `Slide ${index + 1}: ${slide.title}\n\n${slide.content.join('\n')}\n\n`;
    }).join('\n---\n\n');
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'presentation.txt';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
    setShowDownloadOptions(false);
  };

  const downloadPPTX = async () => {
    const pptx = new pptxgen();
    
    slides.forEach((slide) => {
      const pptxSlide = pptx.addSlide();
      
      // Add title
      pptxSlide.addText(slide.title, {
        x: 0.5,
        y: 0.5,
        w: '90%',
        fontSize: 36,
        bold: true,
        color: '0066CC',
      });

      // Add bullet points
      slide.content.forEach((point, idx) => {
        pptxSlide.addText(point, {
          x: 0.5,
          y: 1.5 + (idx * 0.5),
          w: '90%',
          fontSize: 18,
          bullet: true,
        });
      });
    });

    await pptx.writeFile('presentation.pptx');
    setShowDownloadOptions(false);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800">
          Preview Slides ({currentSlide + 1}/{slides.length})
        </h2>
        <div className="flex gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleFullscreen}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors"
          >
            <Maximize2 size={20} />
            {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </motion.button>
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowDownloadOptions(!showDownloadOptions)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Download size={20} />
              Download
            </motion.button>
            
            {showDownloadOptions && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl py-2 z-50"
              >
                <motion.button
                  whileHover={{ backgroundColor: '#f3f4f6' }}
                  onClick={downloadPPTX}
                  className="flex items-center gap-3 w-full px-4 py-2 text-gray-700 hover:text-blue-600"
                >
                  <FilePresentation size={18} />
                  Download as PPTX
                </motion.button>
                <motion.button
                  whileHover={{ backgroundColor: '#f3f4f6' }}
                  onClick={downloadPDF}
                  className="flex items-center gap-3 w-full px-4 py-2 text-gray-700 hover:text-blue-600"
                >
                  <FileType2 size={18} />
                  Download as PDF
                </motion.button>
                <motion.button
                  whileHover={{ backgroundColor: '#f3f4f6' }}
                  onClick={downloadPNG}
                  className="flex items-center gap-3 w-full px-4 py-2 text-gray-700 hover:text-blue-600"
                >
                  <Image size={18} />
                  Download as PNG
                </motion.button>
                <motion.button
                  whileHover={{ backgroundColor: '#f3f4f6' }}
                  onClick={downloadTXT}
                  className="flex items-center gap-3 w-full px-4 py-2 text-gray-700 hover:text-blue-600"
                >
                  <FileType2 size={18} />
                  Download as Text
                </motion.button>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Preview */}
      {isFullscreen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-8"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="relative w-full max-w-5xl aspect-video bg-white rounded-xl shadow-2xl overflow-hidden"
          >
            <button
              onClick={toggleFullscreen}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
            >
              <Maximize2 size={24} />
            </button>
            <div className="p-12">
              <h2 className="text-4xl font-bold mb-8 text-blue-600">
                {slides[currentSlide].title}
              </h2>
              <ul className="space-y-4 text-xl">
                {slides[currentSlide].content.map((point, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <span className="text-blue-500 mt-2">•</span>
                    <span>{point}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-blue-400 transition-colors"
          >
            <ChevronLeft size={48} />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-blue-400 transition-colors"
          >
            <ChevronRight size={48} />
          </button>
        </motion.div>
      )}
      
      {/* Grid Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {slides.map((slide, index) => (
          <motion.div
            key={index}
            className="slide bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => {
              setCurrentSlide(index);
              setIsFullscreen(true);
            }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="absolute top-4 right-4 text-gray-400 font-mono">
              {String(index + 1).padStart(2, '0')}/{String(slides.length).padStart(2, '0')}
            </div>
            <h2 className="text-2xl font-bold mb-6 text-blue-600">{slide.title}</h2>
            <ul className="space-y-3">
              {slide.content.map((point, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-2"
                >
                  <span className="text-blue-500 mt-1">•</span>
                  <span className="text-gray-700">{point}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </div>
  );
};