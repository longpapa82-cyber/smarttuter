'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Beaker, Atom, Dna, Zap, Droplet, Wind, X } from 'lucide-react';

interface ScienceConceptVisualizerProps {
  concept: string;
  onClose: () => void;
}

type ConceptType = 'chemistry' | 'physics' | 'biology' | 'earth-science' | 'unknown';

interface ConceptData {
  type: ConceptType;
  title: string;
  description: string;
  icon: React.ReactNode;
  visualization: React.ReactNode;
}

export function ScienceConceptVisualizer({ concept, onClose }: ScienceConceptVisualizerProps) {
  const conceptData = getConceptData(concept);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-teal-600 p-6 rounded-t-3xl text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              {conceptData.icon}
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1">{conceptData.title}</h2>
              <p className="text-white/90">{conceptData.description}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {conceptData.visualization}
        </div>
      </motion.div>
    </motion.div>
  );
}

function getConceptData(concept: string): ConceptData {
  const lowerConcept = concept.toLowerCase();

  // Chemistry concepts
  if (lowerConcept.includes('화학') || lowerConcept.includes('원소') || lowerConcept.includes('분자')) {
    return {
      type: 'chemistry',
      title: '화학 개념',
      description: '원자와 분자의 구조',
      icon: <Atom className="w-8 h-8" />,
      visualization: <ChemistryVisualization />,
    };
  }

  // Physics concepts
  if (lowerConcept.includes('물리') || lowerConcept.includes('힘') || lowerConcept.includes('에너지')) {
    return {
      type: 'physics',
      title: '물리 개념',
      description: '힘과 에너지의 원리',
      icon: <Zap className="w-8 h-8" />,
      visualization: <PhysicsVisualization />,
    };
  }

  // Biology concepts
  if (lowerConcept.includes('생물') || lowerConcept.includes('세포') || lowerConcept.includes('DNA')) {
    return {
      type: 'biology',
      title: '생물 개념',
      description: '생명체의 구조와 기능',
      icon: <Dna className="w-8 h-8" />,
      visualization: <BiologyVisualization />,
    };
  }

  // Earth science concepts
  if (lowerConcept.includes('지구') || lowerConcept.includes('날씨') || lowerConcept.includes('기후')) {
    return {
      type: 'earth-science',
      title: '지구과학 개념',
      description: '지구와 우주의 원리',
      icon: <Wind className="w-8 h-8" />,
      visualization: <EarthScienceVisualization />,
    };
  }

  // Default
  return {
    type: 'unknown',
    title: '과학 개념',
    description: concept,
    icon: <Beaker className="w-8 h-8" />,
    visualization: <DefaultVisualization concept={concept} />,
  };
}

function ChemistryVisualization() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Atom Structure */}
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Atom className="w-5 h-5 text-blue-600" />
            원자 구조
          </h3>
          <div className="relative w-full aspect-square flex items-center justify-center">
            {/* Nucleus */}
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full shadow-lg flex items-center justify-center"
            >
              <span className="text-white font-bold text-sm">중심핵</span>
            </motion.div>

            {/* Electron Orbits */}
            {[0, 1, 2].map((orbit) => (
              <div key={orbit} className="absolute" style={{ width: `${(orbit + 1) * 30}%`, height: `${(orbit + 1) * 30}%` }}>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3 + orbit, repeat: Infinity, ease: 'linear' }}
                  className="relative w-full h-full border-2 border-blue-300 rounded-full"
                >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-blue-600 rounded-full shadow-md" />
                </motion.div>
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-4 text-center">
            전자는 원자핵 주위를 궤도를 따라 회전합니다
          </p>
        </div>

        {/* Chemical Reaction */}
        <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Droplet className="w-5 h-5 text-green-600" />
            화학 반응
          </h3>
          <div className="flex items-center justify-center gap-4 py-8">
            <motion.div
              animate={{ x: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold"
            >
              H₂
            </motion.div>
            <span className="text-2xl font-bold text-gray-400">+</span>
            <motion.div
              animate={{ x: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white font-bold"
            >
              O₂
            </motion.div>
            <span className="text-2xl font-bold text-gray-600">→</span>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full flex items-center justify-center text-white font-bold"
            >
              H₂O
            </motion.div>
          </div>
          <p className="text-sm text-gray-600 text-center">
            수소와 산소가 결합하여 물이 생성됩니다
          </p>
        </div>
      </div>

      <div className="bg-blue-50 rounded-2xl p-6">
        <h4 className="font-semibold text-blue-900 mb-3">💡 핵심 포인트</h4>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• 원자는 양성자, 중성자, 전자로 구성됩니다</li>
          <li>• 화학 반응에서 원자는 재배열되지만 생성되거나 파괴되지 않습니다</li>
          <li>• 같은 원소의 원자는 동일한 성질을 가집니다</li>
        </ul>
      </div>
    </div>
  );
}

function PhysicsVisualization() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Force and Motion */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-purple-600" />
            힘과 운동
          </h3>
          <div className="relative h-48 bg-gray-100 rounded-xl overflow-hidden">
            <motion.div
              animate={{ x: [10, 200, 10] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute bottom-10 w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg shadow-lg flex items-center justify-center text-white font-bold"
            >
              F=ma
            </motion.div>
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gray-300"></div>
          </div>
          <p className="text-sm text-gray-600 mt-4 text-center">
            힘이 작용하면 물체가 가속됩니다 (F = ma)
          </p>
        </div>

        {/* Energy Transformation */}
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-2xl p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-600" />
            에너지 전환
          </h3>
          <div className="flex flex-col items-center gap-4 py-4">
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full flex items-center justify-center text-white font-bold shadow-lg"
            >
              위치
            </motion.div>
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-3xl"
            >
              ⬇️
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-20 h-20 bg-gradient-to-br from-red-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold shadow-lg"
            >
              운동
            </motion.div>
          </div>
          <p className="text-sm text-gray-600 text-center">
            위치 에너지가 운동 에너지로 전환됩니다
          </p>
        </div>
      </div>

      <div className="bg-purple-50 rounded-2xl p-6">
        <h4 className="font-semibold text-purple-900 mb-3">💡 핵심 포인트</h4>
        <ul className="space-y-2 text-sm text-purple-800">
          <li>• 뉴턴의 운동 법칙: F = ma (힘 = 질량 × 가속도)</li>
          <li>• 에너지 보존 법칙: 에너지는 생성되거나 소멸되지 않고 전환됩니다</li>
          <li>• 작용-반작용 법칙: 모든 작용에는 크기가 같고 방향이 반대인 반작용이 있습니다</li>
        </ul>
      </div>
    </div>
  );
}

function BiologyVisualization() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cell Structure */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Dna className="w-5 h-5 text-green-600" />
            세포 구조
          </h3>
          <div className="relative w-full aspect-square flex items-center justify-center">
            <div className="absolute w-64 h-64 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full border-4 border-green-400 flex items-center justify-center">
              <div className="absolute w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white text-xs font-bold">
                핵
              </div>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                className="absolute w-full h-full"
              >
                {[0, 60, 120, 180, 240, 300].map((angle) => (
                  <div
                    key={angle}
                    className="absolute w-8 h-8 bg-blue-400 rounded-full"
                    style={{
                      top: '50%',
                      left: '50%',
                      transform: `rotate(${angle}deg) translateY(-80px) translateX(-50%)`,
                    }}
                  />
                ))}
              </motion.div>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-4 text-center">
            세포는 생명체의 기본 단위입니다
          </p>
        </div>

        {/* DNA Structure */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Dna className="w-5 h-5 text-blue-600" />
            DNA 이중나선
          </h3>
          <div className="flex items-center justify-center h-64">
            <div className="relative w-32 h-full">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <motion.div
                  key={i}
                  animate={{ rotate: [0, 180, 360] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'linear', delay: i * 0.2 }}
                  className="absolute left-0 right-0"
                  style={{ top: `${i * 15}%` }}
                >
                  <div className="flex justify-between">
                    <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                    <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
          <p className="text-sm text-gray-600 text-center">
            DNA는 유전 정보를 저장하는 이중나선 구조입니다
          </p>
        </div>
      </div>

      <div className="bg-green-50 rounded-2xl p-6">
        <h4 className="font-semibold text-green-900 mb-3">💡 핵심 포인트</h4>
        <ul className="space-y-2 text-sm text-green-800">
          <li>• 세포는 핵, 세포막, 세포질 등으로 구성됩니다</li>
          <li>• DNA는 생명체의 유전 정보를 담고 있습니다</li>
          <li>• 세포 분열을 통해 생물은 성장하고 번식합니다</li>
        </ul>
      </div>
    </div>
  );
}

function EarthScienceVisualization() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Water Cycle */}
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Droplet className="w-5 h-5 text-cyan-600" />
            물의 순환
          </h3>
          <div className="relative h-48">
            <motion.div
              animate={{ y: [0, -20, 0], opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute top-4 right-8 text-4xl"
            >
              ☁️
            </motion.div>
            <motion.div
              animate={{ y: [0, 40, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute top-12 right-12 text-2xl"
            >
              💧
            </motion.div>
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-blue-400 to-cyan-300 rounded-lg flex items-center justify-center text-white font-bold">
              바다 🌊
            </div>
            <motion.div
              animate={{ y: [0, -60, 0], opacity: [0, 1, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute bottom-16 left-8 text-2xl"
            >
              💨
            </motion.div>
          </div>
          <p className="text-sm text-gray-600 mt-4 text-center">
            물은 증발, 응결, 강수를 통해 순환합니다
          </p>
        </div>

        {/* Weather Patterns */}
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-6">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
            <Wind className="w-5 h-5 text-orange-600" />
            날씨 패턴
          </h3>
          <div className="flex flex-col items-center gap-4 py-6">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
              className="text-6xl"
            >
              🌀
            </motion.div>
            <p className="text-center text-sm text-gray-600">
              기압차에 의해 바람이 불고<br />날씨가 변합니다
            </p>
          </div>
        </div>
      </div>

      <div className="bg-cyan-50 rounded-2xl p-6">
        <h4 className="font-semibold text-cyan-900 mb-3">💡 핵심 포인트</h4>
        <ul className="space-y-2 text-sm text-cyan-800">
          <li>• 물의 순환: 증발 → 응결 → 강수 → 유출</li>
          <li>• 기압차가 바람을 만들고 날씨를 변화시킵니다</li>
          <li>• 지구의 자전과 공전이 계절 변화를 만듭니다</li>
        </ul>
      </div>
    </div>
  );
}

function DefaultVisualization({ concept }: { concept: string }) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 text-center">
        <div className="text-6xl mb-4">🔬</div>
        <h3 className="text-xl font-bold mb-2">과학 개념 학습</h3>
        <p className="text-gray-600 mb-6">{concept}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded-xl shadow-sm">
            <Atom className="w-8 h-8 mx-auto mb-2 text-blue-600" />
            <p className="text-xs font-medium">화학</p>
          </div>
          <div className="p-4 bg-white rounded-xl shadow-sm">
            <Zap className="w-8 h-8 mx-auto mb-2 text-purple-600" />
            <p className="text-xs font-medium">물리</p>
          </div>
          <div className="p-4 bg-white rounded-xl shadow-sm">
            <Dna className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="text-xs font-medium">생물</p>
          </div>
          <div className="p-4 bg-white rounded-xl shadow-sm">
            <Wind className="w-8 h-8 mx-auto mb-2 text-cyan-600" />
            <p className="text-xs font-medium">지구과학</p>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 rounded-2xl p-6">
        <h4 className="font-semibold text-blue-900 mb-3">💡 학습 팁</h4>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• 개념을 이해하기 위해 시각화와 비유를 활용하세요</li>
          <li>• 실험을 통해 직접 경험하며 배우세요</li>
          <li>• 다른 과학 분야와의 연결고리를 찾아보세요</li>
        </ul>
      </div>
    </div>
  );
}
