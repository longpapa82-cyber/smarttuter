'use client'

import { Calculator, MessageSquare, Home } from 'lucide-react'

interface QuickSwitchProps {
  currentSubject: 'math' | 'english' | null
  onSubjectSelect: (subject: 'math' | 'english') => void
  onSelectSubject: () => void
}

export function QuickSwitch({
  currentSubject,
  onSubjectSelect,
  onSelectSubject,
}: QuickSwitchProps) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-30 bg-black/10 backdrop-blur-sm animate-fade-in"
        data-quick-switch-backdrop="true"
      />

      {/* Quick Switch Menu */}
      <div
        data-quick-switch="true"
        className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-56 bg-white rounded-2xl shadow-xl border border-gray-200 p-2 animate-slide-up"
      >
        {/* Math Tutor */}
        <button
          onClick={() => onSubjectSelect('math')}
          className={`
            w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150
            ${
              currentSubject === 'math'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }
          `}
        >
          <Calculator
            className={`w-5 h-5 ${currentSubject === 'math' ? 'text-white' : 'text-purple-600'}`}
          />
          <div className="flex-1 text-left">
            <p className="font-semibold text-sm">Math Tutor</p>
            {currentSubject === 'math' && (
              <p className="text-xs opacity-90">Current session</p>
            )}
          </div>
          {currentSubject === 'math' && (
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          )}
        </button>

        {/* English Tutor */}
        <button
          onClick={() => onSubjectSelect('english')}
          className={`
            w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-150 mt-1
            ${
              currentSubject === 'english'
                ? 'bg-purple-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }
          `}
        >
          <MessageSquare
            className={`w-5 h-5 ${currentSubject === 'english' ? 'text-white' : 'text-blue-600'}`}
          />
          <div className="flex-1 text-left">
            <p className="font-semibold text-sm">English Tutor</p>
            {currentSubject === 'english' && (
              <p className="text-xs opacity-90">Current session</p>
            )}
          </div>
          {currentSubject === 'english' && (
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          )}
        </button>

        {/* Divider */}
        <div className="my-2 border-t border-gray-200" />

        {/* Select Subject (Return to Home) */}
        <button
          onClick={onSelectSubject}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 text-gray-700 hover:bg-gray-100 transition-all duration-150"
        >
          <Home className="w-5 h-5 text-gray-600" />
          <div className="flex-1 text-left">
            <p className="font-medium text-sm">Select Subject</p>
          </div>
        </button>
      </div>

      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translate(-50%, 20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }

        .animate-fade-in {
          animation: fade-in 200ms ease-out;
        }

        .animate-slide-up {
          animation: slide-up 250ms cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>
    </>
  )
}
