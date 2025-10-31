'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Volume2, VolumeX, Mic, Settings, X } from 'lucide-react'
import { AudioLevelMeter } from './VoiceWaveform'

export interface VoiceSettingsConfig {
  // Voice Input
  inputMode: 'push-to-talk' | 'continuous' | 'disabled'
  inputLanguage: string

  // Voice Output
  autoPlayResponses: boolean
  repeatUserInput: boolean
  outputLanguage: string
  voiceSpeed: number // 0.5 - 2.0
  voiceVolume: number // 0.0 - 1.0

  // Advanced
  noiseSuppr ession: boolean
  echoCancellation: boolean
}

export const DEFAULT_VOICE_SETTINGS: VoiceSettingsConfig = {
  inputMode: 'push-to-talk',
  inputLanguage: 'en-US',
  autoPlayResponses: true,
  repeatUserInput: false,
  outputLanguage: 'en-US',
  voiceSpeed: 1.0,
  voiceVolume: 0.8,
  noiseSuppression: true,
  echoCancellation: true,
}

interface VoiceSettingsProps {
  isOpen: boolean
  onClose: () => void
  settings: VoiceSettingsConfig
  onSettingsChange: (settings: VoiceSettingsConfig) => void
  audioLevel?: number
}

/**
 * Voice settings panel component
 *
 * Features:
 * - Input mode selection (push-to-talk, continuous, disabled)
 * - Language selection for input/output
 * - Speed and volume controls
 * - Auto-play and repeat options
 * - Audio level meter
 */
export function VoiceSettings({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
  audioLevel = 0,
}: VoiceSettingsProps) {
  const [localSettings, setLocalSettings] = useState<VoiceSettingsConfig>(settings)

  useEffect(() => {
    setLocalSettings(settings)
  }, [settings])

  const handleChange = (key: keyof VoiceSettingsConfig, value: any) => {
    const newSettings = { ...localSettings, [key]: value }
    setLocalSettings(newSettings)
    onSettingsChange(newSettings)
  }

  const handleReset = () => {
    setLocalSettings(DEFAULT_VOICE_SETTINGS)
    onSettingsChange(DEFAULT_VOICE_SETTINGS)
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 bg-black/50 z-40"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-gray-800 shadow-2xl z-50 overflow-y-auto"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="w-6 h-6 text-blue-500" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Voice Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Voice Input Section */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Mic className="w-5 h-5 text-blue-500" />
              Voice Input
            </h3>

            {/* Input Mode */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Input Mode
              </label>
              <div className="space-y-2">
                {[
                  {
                    value: 'push-to-talk',
                    label: 'Push to Talk',
                    description: 'Hold button to speak (Recommended)',
                  },
                  {
                    value: 'continuous',
                    label: 'Always On',
                    description: 'Continuously listen for speech',
                  },
                  {
                    value: 'disabled',
                    label: 'Disabled',
                    description: 'Voice input turned off',
                  },
                ].map((mode) => (
                  <label
                    key={mode.value}
                    className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <input
                      type="radio"
                      name="inputMode"
                      value={mode.value}
                      checked={localSettings.inputMode === mode.value}
                      onChange={(e) => handleChange('inputMode', e.target.value)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {mode.label}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {mode.description}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Input Language */}
            <div className="mt-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                Input Language
              </label>
              <select
                value={localSettings.inputLanguage}
                onChange={(e) => handleChange('inputLanguage', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="en-US">English (US)</option>
                <option value="en-GB">English (UK)</option>
                <option value="ko-KR">Korean</option>
                <option value="ja-JP">Japanese</option>
                <option value="zh-CN">Chinese (Simplified)</option>
                <option value="es-ES">Spanish</option>
                <option value="fr-FR">French</option>
                <option value="de-DE">German</option>
              </select>
            </div>

            {/* Audio Level Meter */}
            {localSettings.inputMode !== 'disabled' && (
              <div className="mt-4">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                  Microphone Level
                </label>
                <AudioLevelMeter level={audioLevel} />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Speak to test your microphone
                </p>
              </div>
            )}
          </section>

          {/* Voice Output Section */}
          <section>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-blue-500" />
              Voice Output
            </h3>

            {/* Options */}
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <input
                  type="checkbox"
                  checked={localSettings.autoPlayResponses}
                  onChange={(e) => handleChange('autoPlayResponses', e.target.checked)}
                  className="w-4 h-4 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">
                    Auto-play tutor responses
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Automatically read tutor messages aloud
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <input
                  type="checkbox"
                  checked={localSettings.repeatUserInput}
                  onChange={(e) => handleChange('repeatUserInput', e.target.checked)}
                  className="w-4 h-4 text-blue-500 rounded focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">
                    Repeat my input
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Confirm voice input by reading it back
                  </div>
                </div>
              </label>
            </div>

            {/* Output Language */}
            <div className="mt-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-2">
                Output Language
              </label>
              <select
                value={localSettings.outputLanguage}
                onChange={(e) => handleChange('outputLanguage', e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="en-US">English (US)</option>
                <option value="en-GB">English (UK)</option>
                <option value="ko-KR">Korean</option>
                <option value="ja-JP">Japanese</option>
                <option value="zh-CN">Chinese (Simplified)</option>
                <option value="es-ES">Spanish</option>
                <option value="fr-FR">French</option>
                <option value="de-DE">German</option>
              </select>
            </div>

            {/* Voice Speed */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Voice Speed
                </label>
                <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
                  {localSettings.voiceSpeed.toFixed(1)}x
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={localSettings.voiceSpeed}
                onChange={(e) => handleChange('voiceSpeed', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>Slower</span>
                <span>Normal</span>
                <span>Faster</span>
              </div>
            </div>

            {/* Voice Volume */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  {localSettings.voiceVolume === 0 ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                  Voice Volume
                </label>
                <span className="text-sm font-mono text-gray-600 dark:text-gray-400">
                  {Math.round(localSettings.voiceVolume * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={localSettings.voiceVolume}
                onChange={(e) => handleChange('voiceVolume', parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>
          </section>

          {/* Reset Button */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleReset}
              className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors font-medium"
            >
              Reset to Default
            </button>
          </div>
        </div>
      </motion.div>
    </>
  )
}
