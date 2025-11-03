// components/math/InteractiveFunctionGraph.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { motion } from 'framer-motion';
import { Sliders, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import { evaluate } from 'mathjs';
import type { FunctionGraph, VariableSlider, GraphConfig, GraphPoint } from '@/types/math-visualization';

interface Props {
  title: string;
  expression: string;
  sliders: VariableSlider[];
  config?: Partial<GraphConfig>;
  onSliderChange?: (variable: string, value: number) => void;
}

export function InteractiveFunctionGraph({
  title,
  expression,
  sliders: initialSliders,
  config,
  onSliderChange,
}: Props) {
  const [sliders, setSliders] = useState<VariableSlider[]>(initialSliders);
  const [graphConfig, setGraphConfig] = useState<GraphConfig>({
    xMin: config?.xMin ?? -10,
    xMax: config?.xMax ?? 10,
    yMin: config?.yMin ?? -10,
    yMax: config?.yMax ?? 10,
    gridSize: config?.gridSize ?? 1,
    showGrid: config?.showGrid ?? true,
    showAxis: config?.showAxis ?? true,
    showLabels: config?.showLabels ?? true,
  });

  // 함수 값 계산
  const calculatePoints = useMemo(() => {
    const points: GraphPoint[] = [];
    const { xMin, xMax } = graphConfig;
    const step = (xMax - xMin) / 200; // 200 points for smooth curve

    // 슬라이더 값을 변수로 변환
    const scope: Record<string, number> = {};
    sliders.forEach((slider) => {
      scope[slider.variable] = slider.value;
    });

    for (let x = xMin; x <= xMax; x += step) {
      try {
        const y = evaluate(expression, { ...scope, x });
        if (typeof y === 'number' && isFinite(y)) {
          // y 범위 체크
          if (y >= graphConfig.yMin && y <= graphConfig.yMax) {
            points.push({ x: Number(x.toFixed(3)), y: Number(y.toFixed(3)) });
          }
        }
      } catch (error) {
        // Skip invalid points
      }
    }

    return points;
  }, [expression, sliders, graphConfig]);

  const handleSliderChange = (variable: string, value: number) => {
    setSliders((prev) =>
      prev.map((slider) =>
        slider.variable === variable ? { ...slider, value } : slider
      )
    );
    onSliderChange?.(variable, value);
  };

  const handleReset = () => {
    setSliders((prev) =>
      prev.map((slider) => ({ ...slider, value: slider.defaultValue }))
    );
  };

  const handleZoomIn = () => {
    setGraphConfig((prev) => ({
      ...prev,
      xMin: prev.xMin * 0.8,
      xMax: prev.xMax * 0.8,
      yMin: prev.yMin * 0.8,
      yMax: prev.yMax * 0.8,
    }));
  };

  const handleZoomOut = () => {
    setGraphConfig((prev) => ({
      ...prev,
      xMin: prev.xMin * 1.2,
      xMax: prev.xMax * 1.2,
      yMin: prev.yMin * 1.2,
      yMax: prev.yMax * 1.2,
    }));
  };

  // 현재 함수식 표시 (슬라이더 값 대입)
  const currentExpression = useMemo(() => {
    let expr = expression;
    sliders.forEach((slider) => {
      const regex = new RegExp(`\\b${slider.variable}\\b`, 'g');
      expr = expr.replace(regex, slider.value.toFixed(2));
    });
    return expr;
  }, [expression, sliders]);

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            함수: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">y = {currentExpression}</code>
          </p>
        </div>

        {/* 컨트롤 버튼 */}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="초기화"
          >
            <RotateCcw className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleZoomIn}
            className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="확대"
          >
            <ZoomIn className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleZoomOut}
            className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            title="축소"
          >
            <ZoomOut className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </motion.button>
        </div>
      </div>

      {/* 그래프 */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={calculatePoints}>
            {graphConfig.showGrid && (
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            )}
            <XAxis
              dataKey="x"
              type="number"
              domain={[graphConfig.xMin, graphConfig.xMax]}
              tickCount={11}
              stroke="#6b7280"
              label={graphConfig.showLabels ? { value: 'x', position: 'insideRight', offset: -10 } : undefined}
            />
            <YAxis
              dataKey="y"
              type="number"
              domain={[graphConfig.yMin, graphConfig.yMax]}
              tickCount={11}
              stroke="#6b7280"
              label={graphConfig.showLabels ? { value: 'y', angle: -90, position: 'insideTop', offset: 10 } : undefined}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(17, 24, 39, 0.9)',
                border: 'none',
                borderRadius: '0.5rem',
                color: 'white',
              }}
              formatter={(value: number) => [`y = ${value.toFixed(3)}`, '']}
              labelFormatter={(label: number) => `x = ${label.toFixed(3)}`}
            />
            {graphConfig.showAxis && (
              <>
                <ReferenceLine x={0} stroke="#9ca3af" strokeWidth={2} />
                <ReferenceLine y={0} stroke="#9ca3af" strokeWidth={2} />
              </>
            )}
            <Line
              type="monotone"
              dataKey="y"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={false}
              isAnimationActive={true}
              animationDuration={500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* 슬라이더 */}
      {sliders.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <Sliders className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              변수 조절
            </h4>
          </div>

          <div className="space-y-6">
            {sliders.map((slider) => (
              <div key={slider.variable}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {slider.label} = <span className="font-bold text-blue-600 dark:text-blue-400">{slider.value.toFixed(2)}</span>
                  </label>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    범위: [{slider.min}, {slider.max}]
                  </span>
                </div>

                <input
                  type="range"
                  min={slider.min}
                  max={slider.max}
                  step={slider.step}
                  value={slider.value}
                  onChange={(e) => handleSliderChange(slider.variable, parseFloat(e.target.value))}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((slider.value - slider.min) / (slider.max - slider.min)) * 100}%, #e5e7eb ${((slider.value - slider.min) / (slider.max - slider.min)) * 100}%, #e5e7eb 100%)`,
                  }}
                />

                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">{slider.min}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{slider.max}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 정보 패널 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <InfoCard
          label="현재 함수"
          value={`y = ${currentExpression}`}
          color="blue"
        />
        <InfoCard
          label="x 범위"
          value={`[${graphConfig.xMin}, ${graphConfig.xMax}]`}
          color="green"
        />
        <InfoCard
          label="y 범위"
          value={`[${graphConfig.yMin}, ${graphConfig.yMax}]`}
          color="purple"
        />
      </div>
    </div>
  );
}

function InfoCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: 'blue' | 'green' | 'purple';
}) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md">
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{label}</p>
      <p className={`text-sm font-bold bg-gradient-to-r ${colorClasses[color]} bg-clip-text text-transparent`}>
        {value}
      </p>
    </div>
  );
}
