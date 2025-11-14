'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Book, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface HistoryTimelineProps {
  period?: string;
  onClose: () => void;
}

interface HistoricalEvent {
  year: string;
  era: string;
  title: string;
  description: string;
  significance: string;
  location?: string;
  people?: string[];
  icon: string;
  color: string;
}

const HISTORICAL_PERIODS: Record<string, HistoricalEvent[]> = {
  '고대': [
    {
      year: '기원전 2333년',
      era: '고조선',
      title: '단군 건국',
      description: '단군왕검이 고조선을 건국하여 한반도 최초의 국가를 세웠습니다.',
      significance: '우리 민족의 시작',
      location: '평양',
      people: ['단군왕검'],
      icon: '🏛️',
      color: 'from-amber-500 to-orange-500',
    },
    {
      year: '기원전 57년',
      era: '삼국시대',
      title: '신라 건국',
      description: '박혁거세가 신라를 건국했습니다.',
      significance: '삼국 중 가장 오래 존속',
      location: '경주',
      people: ['박혁거세'],
      icon: '👑',
      color: 'from-blue-500 to-indigo-500',
    },
  ],
  '중세': [
    {
      year: '918년',
      era: '고려시대',
      title: '고려 건국',
      description: '왕건이 후삼국을 통일하고 고려를 건국했습니다.',
      significance: '민족 재통일',
      location: '개성',
      people: ['왕건'],
      icon: '⚔️',
      color: 'from-green-500 to-teal-500',
    },
    {
      year: '1392년',
      era: '조선시대',
      title: '조선 건국',
      description: '이성계가 조선을 건국하고 한양으로 천도했습니다.',
      significance: '유교 국가 수립',
      location: '한양(서울)',
      people: ['이성계', '정도전'],
      icon: '📜',
      color: 'from-purple-500 to-pink-500',
    },
  ],
  '근대': [
    {
      year: '1894년',
      era: '개화기',
      title: '갑오개혁',
      description: '조선이 근대적 개혁을 단행했습니다.',
      significance: '신분제 폐지, 근대화 시작',
      location: '한양',
      people: ['김홍집', '박영효'],
      icon: '📚',
      color: 'from-yellow-500 to-amber-500',
    },
    {
      year: '1919년',
      era: '일제강점기',
      title: '3·1 운동',
      description: '독립을 위한 전국적인 만세운동이 일어났습니다.',
      significance: '민족 독립 의지 표명',
      location: '전국',
      people: ['유관순', '손병희', '이승훈'],
      icon: '🇰🇷',
      color: 'from-red-500 to-pink-500',
    },
  ],
  '현대': [
    {
      year: '1945년',
      era: '광복',
      title: '8·15 광복',
      description: '일제 식민지배로부터 해방되었습니다.',
      significance: '독립 달성',
      location: '전국',
      people: ['김구', '이승만', '여운형'],
      icon: '🎆',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      year: '1950년',
      era: '대한민국',
      title: '6·25 전쟁',
      description: '북한의 남침으로 한국전쟁이 발발했습니다.',
      significance: '남북 분단 고착화',
      location: '한반도 전역',
      people: ['이승만', '맥아더', '백선엽'],
      icon: '⚔️',
      color: 'from-gray-500 to-slate-500',
    },
    {
      year: '1987년',
      era: '민주화',
      title: '6월 민주항쟁',
      description: '국민의 직접 선거 요구로 민주화가 이루어졌습니다.',
      significance: '민주주의 확립',
      location: '전국',
      people: ['전국 시민들'],
      icon: '✊',
      color: 'from-purple-500 to-indigo-500',
    },
  ],
};

export function HistoryTimeline({ period, onClose }: HistoryTimelineProps) {
  const [selectedPeriod, setSelectedPeriod] = useState(period || '고대');
  const [selectedEvent, setSelectedEvent] = useState<HistoricalEvent | null>(null);

  const events = HISTORICAL_PERIODS[selectedPeriod] || [];
  const periods = Object.keys(HISTORICAL_PERIODS);
  const currentIndex = periods.indexOf(selectedPeriod);

  const goToPrevPeriod = () => {
    if (currentIndex > 0) {
      setSelectedPeriod(periods[currentIndex - 1]);
      setSelectedEvent(null);
    }
  };

  const goToNextPeriod = () => {
    if (currentIndex < periods.length - 1) {
      setSelectedPeriod(periods[currentIndex + 1]);
      setSelectedEvent(null);
    }
  };

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
        className="bg-white rounded-3xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 rounded-t-3xl text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl">
              <Calendar className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold mb-1">한국사 타임라인</h2>
              <p className="text-white/90">역사의 흐름을 한눈에 파악하세요</p>
            </div>
          </div>
        </div>

        {/* Period Selector */}
        <div className="border-b border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center justify-between max-w-4xl mx-auto">
            <button
              onClick={goToPrevPeriod}
              disabled={currentIndex === 0}
              className="p-2 hover:bg-white rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div className="flex gap-2 overflow-x-auto">
              {periods.map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setSelectedPeriod(p);
                    setSelectedEvent(null);
                  }}
                  className={`px-6 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                    selectedPeriod === p
                      ? 'bg-indigo-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>

            <button
              onClick={goToNextPeriod}
              disabled={currentIndex === periods.length - 1}
              className="p-2 hover:bg-white rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Timeline */}
        <div className="p-8">
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-12 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-200 via-purple-200 to-pink-200"></div>

            {/* Events */}
            <div className="space-y-8">
              {events.map((event, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative pl-24"
                >
                  {/* Timeline Dot */}
                  <div className={`absolute left-8 top-6 w-8 h-8 rounded-full bg-gradient-to-br ${event.color} shadow-lg flex items-center justify-center text-white text-xl transform -translate-x-1/2`}>
                    {event.icon}
                  </div>

                  {/* Event Card */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="bg-white rounded-2xl shadow-lg border-2 border-gray-100 overflow-hidden cursor-pointer"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <div className={`h-2 bg-gradient-to-r ${event.color}`}></div>
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <div className="text-sm text-gray-500 font-medium">{event.era}</div>
                          <h3 className="text-2xl font-bold text-gray-900">{event.title}</h3>
                          <div className="text-lg text-indigo-600 font-semibold">{event.year}</div>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-4">{event.description}</p>

                      <div className="flex flex-wrap gap-2">
                        {event.location && (
                          <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full text-sm text-blue-700">
                            <MapPin className="w-4 h-4" />
                            {event.location}
                          </div>
                        )}
                        {event.people && event.people.length > 0 && (
                          <div className="flex items-center gap-2 px-3 py-1 bg-purple-50 rounded-full text-sm text-purple-700">
                            <Users className="w-4 h-4" />
                            {event.people.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Period Summary */}
          <div className="mt-12 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6">
            <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
              <Book className="w-5 h-5 text-indigo-600" />
              {selectedPeriod} 특징
            </h3>
            <div className="space-y-2 text-sm text-gray-700">
              {selectedPeriod === '고대' && (
                <>
                  <p>• 고조선부터 삼국시대까지 국가의 형성과 발전</p>
                  <p>• 청동기 문화와 철기 문화의 발달</p>
                  <p>• 불교와 유교의 전래</p>
                </>
              )}
              {selectedPeriod === '중세' && (
                <>
                  <p>• 고려와 조선의 건국 및 발전</p>
                  <p>• 유교 문화의 정착과 과거제도</p>
                  <p>• 인쇄술과 금속활자 발명</p>
                </>
              )}
              {selectedPeriod === '근대' && (
                <>
                  <p>• 외세의 침략과 개항</p>
                  <p>• 근대화 운동과 독립 운동</p>
                  <p>• 일제 강점기와 민족 저항</p>
                </>
              )}
              {selectedPeriod === '현대' && (
                <>
                  <p>• 광복과 남북 분단</p>
                  <p>• 한국전쟁과 산업화</p>
                  <p>• 민주화 운동과 경제 발전</p>
                </>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/70 z-60 flex items-center justify-center p-4"
          onClick={() => setSelectedEvent(null)}
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-2xl w-full p-8"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="text-4xl mb-4">{selectedEvent.icon}</div>
                <h3 className="text-3xl font-bold mb-2">{selectedEvent.title}</h3>
                <div className="text-xl text-indigo-600 font-semibold mb-1">{selectedEvent.year}</div>
                <div className="text-gray-600">{selectedEvent.era}</div>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">사건 내용</h4>
                <p className="text-gray-700">{selectedEvent.description}</p>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">역사적 의의</h4>
                <p className="text-gray-700">{selectedEvent.significance}</p>
              </div>

              {selectedEvent.location && (
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <span><strong>장소:</strong> {selectedEvent.location}</span>
                </div>
              )}

              {selectedEvent.people && selectedEvent.people.length > 0 && (
                <div className="flex items-start gap-2 text-gray-700">
                  <Users className="w-5 h-5 text-purple-600 mt-0.5" />
                  <span><strong>주요 인물:</strong> {selectedEvent.people.join(', ')}</span>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}
