'use client'

import { CheckCircle, Clock, FileText, Brain, User, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatusTimelineProps {
  currentStatus: 'submitted' | 'ai_review' | 'assessor_review' | 'completed'
  className?: string
}

const steps = [
  {
    id: 'submitted',
    name: 'Submitted',
    description: 'Claim submitted successfully',
    icon: FileText,
  },
  {
    id: 'ai_review',
    name: 'AI Review',
    description: 'AI analyzing claim data',
    icon: Brain,
  },
  {
    id: 'assessor_review',
    name: 'Assessor Review',
    description: 'Human assessor reviewing',
    icon: User,
  },
  {
    id: 'completed',
    name: 'Completed',
    description: 'Assessment completed',
    icon: CheckCircle2,
  },
]

export default function StatusTimeline({ currentStatus, className }: StatusTimelineProps) {
  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.id === currentStatus)
  }

  const currentStepIndex = getCurrentStepIndex()

  return (
    <div className={cn("w-full", className)}>
      <nav aria-label="Progress">
        <ol className="flex items-center">
          {steps.map((step, stepIdx) => {
            const isCompleted = stepIdx < currentStepIndex
            const isCurrent = stepIdx === currentStepIndex
            const isUpcoming = stepIdx > currentStepIndex
            
            return (
              <li key={step.name} className={cn(
                stepIdx !== steps.length - 1 ? 'flex-1' : '',
                'relative'
              )}>
                <div className="flex items-center">
                  <div className="relative flex items-center justify-center">
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-full border-2',
                        isCompleted
                          ? 'bg-blue-600 border-blue-600'
                          : isCurrent
                          ? 'border-blue-600 bg-white'
                          : 'border-gray-300 bg-white'
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-6 w-6 text-white" />
                      ) : isCurrent ? (
                        <Clock className="h-5 w-5 text-blue-600" />
                      ) : (
                        <step.icon className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-4 min-w-0 flex-1">
                    <div className={cn(
                      'text-sm font-medium',
                      isCompleted
                        ? 'text-blue-600'
                        : isCurrent
                        ? 'text-blue-600'
                        : 'text-gray-500'
                    )}>
                      {step.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {step.description}
                    </div>
                  </div>

                  {stepIdx !== steps.length - 1 && (
                    <div className="flex-1 ml-4">
                      <div
                        className={cn(
                          'h-0.5 w-full',
                          isCompleted ? 'bg-blue-600' : 'bg-gray-300'
                        )}
                      />
                    </div>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      </nav>
    </div>
  )
}
