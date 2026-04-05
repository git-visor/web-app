import type { JSX } from 'react'
import { Check } from 'lucide-react'
import { AppButton } from '../utils/buttons'

interface FilterObjectsProps {
  title: string
  objectCounts: Record<string, number>
  isTypeVisible: (type: string) => boolean
  toggleVisibleType: (type: string) => void
  getTypeColor: (type: string) => string
}

export function FilterObjects({ title, objectCounts, isTypeVisible, toggleVisibleType, getTypeColor }: FilterObjectsProps): JSX.Element {
  return (
    <div className="mb-2">
      <h3 className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-2">
        {title}
      </h3>
      <div className="flex flex-wrap gap-2">
        {['commit', 'tree', 'blob', 'tag'].map((type) => (
          <AppButton
            key={type}
            onClick={() => {
              toggleVisibleType(type);
            }}
            className={`flex items-center gap-1.5 px-2 py-1 text-xs rounded border transition-all ${
              isTypeVisible(type)
                ? getTypeColor(type)
                : 'bg-[#252526] border-gray-700 text-gray-500 hover:border-gray-600 opacity-60'
            }`}
          >
            {isTypeVisible(type) ? (
              <Check className="w-3 h-3" />
            ) : (
              <div className="w-3 h-3" />
            )}
            <span className="capitalize">{type}s</span>
            <span className="opacity-50 ml-1 text-[10px] bg-black/20 px-1 rounded-full">
              {objectCounts[type] || 0}
            </span>
          </AppButton>
        ))}
      </div>
    </div>
  )
}