'use client'

import { useState } from 'react'
import { Bug, X, Car, Zap } from 'lucide-react'
import QuickCarAnalysis from './QuickCarAnalysis'

export default function FloatingDebugButton() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Floating Debug Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 bg-red-600 hover:bg-red-700 text-white p-4 rounded-full shadow-lg transition-all duration-200 transform hover:scale-110"
        title="DEBUG: Car Analysis"
      >
        <Bug className="h-6 w-6" />
      </button>

      {/* Debug Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setIsOpen(false)}
            ></div>

            {/* Modal content */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              {/* Header */}
              <div className="bg-red-600 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Car className="h-6 w-6 text-white mr-2" />
                    <h3 className="text-lg font-medium text-white">
                      DEBUG: Car Damage Analysis
                    </h3>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="bg-white px-6 py-6">
                <QuickCarAnalysis />
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-600">
                    <Zap className="h-4 w-4 mr-1" />
                    <span>Debug Mode Active</span>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
