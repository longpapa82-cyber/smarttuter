'use client';

import { useState } from 'react';
import { Mafs, Coordinates, Plot, Point, useMovablePoint, Line, Vector, Circle, Text as MafsText } from 'mafs';
import { motion } from 'framer-motion';
import { X, Info } from 'lucide-react';
import 'mafs/core.css';
import { GraphType } from '@/lib/math/graph-parser';

interface InteractiveMathGraphProps {
  type: GraphType;
  equation?: string;
  description?: string;
  onClose: () => void;
}

export default function InteractiveMathGraph({ type, equation, description, onClose }: InteractiveMathGraphProps) {
  const renderGraph = () => {
    switch (type) {
      case 'quadratic':
        return <QuadraticGraph />;
      case 'linear':
        return <LinearGraph />;
      case 'circle':
        return <CircleGraph />;
      case 'trigonometric':
        return <TrigonometricGraph />;
      case 'exponential':
        return <ExponentialGraph />;
      case 'polynomial':
        return <QuadraticGraph />; // Use quadratic as fallback for polynomial
      default:
        return <QuadraticGraph />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'quadratic':
        return '이차 함수 (Quadratic Function)';
      case 'linear':
        return '일차 함수 (Linear Function)';
      case 'circle':
        return '원 (Circle)';
      case 'trigonometric':
        return '삼각 함수 (Trigonometric Function)';
      case 'exponential':
        return '지수 함수 (Exponential Function)';
      case 'polynomial':
        return '다항 함수 (Polynomial Function)';
      default:
        return '수학 그래프';
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
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <span className="text-white text-xl">📊</span>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">{getTitle()}</h2>
              {equation && <p className="text-sm font-mono text-blue-600">{equation}</p>}
              <p className="text-sm text-gray-500">점을 드래그하여 그래프를 조작하세요</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {description && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700">{description}</p>
              </div>
            </div>
          )}
          {renderGraph()}
        </div>
      </motion.div>
    </motion.div>
  );
}

// Quadratic Function: y = ax² + bx + c
function QuadraticGraph() {
  const a = useMovablePoint([0, 1], { color: 'red' });
  const b = useMovablePoint([1, 0], { color: 'green' });
  const c = useMovablePoint([0, -1], { color: 'blue' });

  const aVal = a.point[1];
  const bVal = b.point[1];
  const cVal = c.point[1];

  return (
    <div className="space-y-6">
      {/* Equation Display */}
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-200">
        <h3 className="font-semibold text-gray-900 mb-2">함수식</h3>
        <p className="text-lg font-mono text-gray-800">
          y = {aVal.toFixed(2)}x² {bVal >= 0 ? '+' : ''}{bVal.toFixed(2)}x {cVal >= 0 ? '+' : ''}{cVal.toFixed(2)}
        </p>
      </div>

      {/* Graph */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <Mafs
          viewBox={{ x: [-5, 5], y: [-5, 5] }}
          preserveAspectRatio={false}
        >
          <Coordinates.Cartesian />

          {/* Quadratic curve */}
          <Plot.OfX
            y={(x) => aVal * x * x + bVal * x + cVal}
            color="rgb(59, 130, 246)"
            weight={3}
          />

          {/* Movable control points */}
          {a.element}
          {b.element}
          {c.element}

          {/* Labels */}
          <MafsText x={-4.5} y={4.5} size={14} color="rgb(239, 68, 68)">
            🔴 a = {aVal.toFixed(2)}
          </MafsText>
          <MafsText x={-4.5} y={4} size={14} color="rgb(34, 197, 94)">
            🟢 b = {bVal.toFixed(2)}
          </MafsText>
          <MafsText x={-4.5} y={3.5} size={14} color="rgb(59, 130, 246)">
            🔵 c = {cVal.toFixed(2)}
          </MafsText>
        </Mafs>
      </div>

      {/* Instructions */}
      <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
        <div className="flex items-start gap-2">
          <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-amber-900">
            <p className="font-semibold mb-1">조작 방법</p>
            <ul className="space-y-1">
              <li>• <span className="text-red-600 font-semibold">빨간 점</span>: a 값 조정 (위아래로 이동)</li>
              <li>• <span className="text-green-600 font-semibold">초록 점</span>: b 값 조정 (위아래로 이동)</li>
              <li>• <span className="text-blue-600 font-semibold">파란 점</span>: c 값 조정 (위아래로 이동)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// Linear Function: y = mx + b
function LinearGraph() {
  const m = useMovablePoint([1, 1], { color: 'red' });
  const b = useMovablePoint([0, -1], { color: 'blue' });

  const mVal = m.point[1];
  const bVal = b.point[1];

  return (
    <div className="space-y-6">
      {/* Equation Display */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
        <h3 className="font-semibold text-gray-900 mb-2">함수식</h3>
        <p className="text-lg font-mono text-gray-800">
          y = {mVal.toFixed(2)}x {bVal >= 0 ? '+' : ''}{bVal.toFixed(2)}
        </p>
      </div>

      {/* Graph */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <Mafs
          viewBox={{ x: [-5, 5], y: [-5, 5] }}
          preserveAspectRatio={false}
        >
          <Coordinates.Cartesian />

          {/* Linear line */}
          <Plot.OfX
            y={(x) => mVal * x + bVal}
            color="rgb(34, 197, 94)"
            weight={3}
          />

          {/* Movable control points */}
          {m.element}
          {b.element}

          {/* Labels */}
          <MafsText x={-4.5} y={4.5} size={14} color="rgb(239, 68, 68)">
            🔴 기울기 m = {mVal.toFixed(2)}
          </MafsText>
          <MafsText x={-4.5} y={4} size={14} color="rgb(59, 130, 246)">
            🔵 y절편 b = {bVal.toFixed(2)}
          </MafsText>
        </Mafs>
      </div>

      {/* Instructions */}
      <div className="bg-green-50 rounded-xl p-4 border border-green-200">
        <div className="flex items-start gap-2">
          <Info className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-green-900">
            <p className="font-semibold mb-1">조작 방법</p>
            <ul className="space-y-1">
              <li>• <span className="text-red-600 font-semibold">빨간 점</span>: 기울기 m 조정</li>
              <li>• <span className="text-blue-600 font-semibold">파란 점</span>: y절편 b 조정</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// Circle: (x - h)² + (y - k)² = r²
function CircleGraph() {
  const center = useMovablePoint([0, 0], { color: 'red' });
  const radiusPoint = useMovablePoint([2, 0], { color: 'blue' });

  const h = center.point[0];
  const k = center.point[1];
  const r = Math.sqrt(
    Math.pow(radiusPoint.point[0] - h, 2) +
    Math.pow(radiusPoint.point[1] - k, 2)
  );

  return (
    <div className="space-y-6">
      {/* Equation Display */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-200">
        <h3 className="font-semibold text-gray-900 mb-2">원의 방정식</h3>
        <p className="text-lg font-mono text-gray-800">
          (x - {h.toFixed(2)})² + (y - {k.toFixed(2)})² = {r.toFixed(2)}²
        </p>
        <p className="text-sm text-gray-600 mt-2">
          중심: ({h.toFixed(2)}, {k.toFixed(2)}), 반지름: {r.toFixed(2)}
        </p>
      </div>

      {/* Graph */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <Mafs
          viewBox={{ x: [-5, 5], y: [-5, 5] }}
          preserveAspectRatio={false}
        >
          <Coordinates.Cartesian />

          {/* Circle */}
          <Circle center={[h, k]} radius={r} color="rgb(147, 51, 234)" weight={3} />

          {/* Center point */}
          {center.element}

          {/* Radius point */}
          {radiusPoint.element}

          {/* Radius line */}
          <Line.Segment
            point1={[h, k]}
            point2={radiusPoint.point}
            color="rgb(59, 130, 246)"
            style="dashed"
          />

          {/* Labels */}
          <MafsText x={h} y={k + 0.5} size={14} color="rgb(239, 68, 68)">
            🔴 중심
          </MafsText>
          <MafsText x={radiusPoint.point[0]} y={radiusPoint.point[1] + 0.5} size={14} color="rgb(59, 130, 246)">
            🔵 반지름
          </MafsText>
        </Mafs>
      </div>

      {/* Instructions */}
      <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
        <div className="flex items-start gap-2">
          <Info className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-purple-900">
            <p className="font-semibold mb-1">조작 방법</p>
            <ul className="space-y-1">
              <li>• <span className="text-red-600 font-semibold">빨간 점</span>: 원의 중심 위치 이동</li>
              <li>• <span className="text-blue-600 font-semibold">파란 점</span>: 반지름 크기 조정</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// Trigonometric Function: y = a·sin(bx + c)
function TrigonometricGraph() {
  const a = useMovablePoint([0, 1], { color: 'red' });
  const b = useMovablePoint([1, 1], { color: 'green' });
  const c = useMovablePoint([0, 0], { color: 'blue' });

  const aVal = a.point[1];
  const bVal = b.point[1];
  const cVal = c.point[1];

  return (
    <div className="space-y-6">
      {/* Equation Display */}
      <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-4 border border-cyan-200">
        <h3 className="font-semibold text-gray-900 mb-2">함수식</h3>
        <p className="text-lg font-mono text-gray-800">
          y = {aVal.toFixed(2)} · sin({bVal.toFixed(2)}x {cVal >= 0 ? '+' : ''}{cVal.toFixed(2)})
        </p>
      </div>

      {/* Graph */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <Mafs
          viewBox={{ x: [-5, 5], y: [-5, 5] }}
          preserveAspectRatio={false}
        >
          <Coordinates.Cartesian />

          {/* Sine wave */}
          <Plot.OfX
            y={(x) => aVal * Math.sin(bVal * x + cVal)}
            color="rgb(14, 165, 233)"
            weight={3}
          />

          {/* Movable control points */}
          {a.element}
          {b.element}
          {c.element}

          {/* Labels */}
          <MafsText x={-4.5} y={4.5} size={14} color="rgb(239, 68, 68)">
            🔴 진폭 a = {aVal.toFixed(2)}
          </MafsText>
          <MafsText x={-4.5} y={4} size={14} color="rgb(34, 197, 94)">
            🟢 주기 b = {bVal.toFixed(2)}
          </MafsText>
          <MafsText x={-4.5} y={3.5} size={14} color="rgb(59, 130, 246)">
            🔵 위상 c = {cVal.toFixed(2)}
          </MafsText>
        </Mafs>
      </div>

      {/* Instructions */}
      <div className="bg-cyan-50 rounded-xl p-4 border border-cyan-200">
        <div className="flex items-start gap-2">
          <Info className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-cyan-900">
            <p className="font-semibold mb-1">조작 방법</p>
            <ul className="space-y-1">
              <li>• <span className="text-red-600 font-semibold">빨간 점</span>: 진폭 a 조정 (파동 높이)</li>
              <li>• <span className="text-green-600 font-semibold">초록 점</span>: 주기 b 조정 (파동 빈도)</li>
              <li>• <span className="text-blue-600 font-semibold">파란 점</span>: 위상 c 조정 (좌우 이동)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

// Exponential Function: y = a·e^(bx)
function ExponentialGraph() {
  const a = useMovablePoint([0, 1], { color: 'red' });
  const b = useMovablePoint([1, 1], { color: 'blue' });

  const aVal = a.point[1];
  const bVal = b.point[1];

  return (
    <div className="space-y-6">
      {/* Equation Display */}
      <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200">
        <h3 className="font-semibold text-gray-900 mb-2">함수식</h3>
        <p className="text-lg font-mono text-gray-800">
          y = {aVal.toFixed(2)} · e^({bVal.toFixed(2)}x)
        </p>
      </div>

      {/* Graph */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <Mafs
          viewBox={{ x: [-3, 3], y: [-2, 5] }}
          preserveAspectRatio={false}
        >
          <Coordinates.Cartesian />

          {/* Exponential curve */}
          <Plot.OfX
            y={(x) => aVal * Math.exp(bVal * x)}
            color="rgb(249, 115, 22)"
            weight={3}
          />

          {/* Movable control points */}
          {a.element}
          {b.element}

          {/* Labels */}
          <MafsText x={-2.5} y={4.5} size={14} color="rgb(239, 68, 68)">
            🔴 초기값 a = {aVal.toFixed(2)}
          </MafsText>
          <MafsText x={-2.5} y={4} size={14} color="rgb(59, 130, 246)">
            🔵 증가율 b = {bVal.toFixed(2)}
          </MafsText>
        </Mafs>
      </div>

      {/* Instructions */}
      <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
        <div className="flex items-start gap-2">
          <Info className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-orange-900">
            <p className="font-semibold mb-1">조작 방법</p>
            <ul className="space-y-1">
              <li>• <span className="text-red-600 font-semibold">빨간 점</span>: 초기값 a 조정 (y절편)</li>
              <li>• <span className="text-blue-600 font-semibold">파란 점</span>: 증가/감소율 b 조정</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
