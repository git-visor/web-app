import type { JSX } from 'react'
import { ChevronDown } from 'lucide-react'
import type { RepositoryData } from '../ObjectTypes'

interface RepositorySelectionProps {
  title: string,
  availableDatasets: RepositoryData[]
  onSelectDataset: (index: number) => void,
  currentIndex: number,
  customData?: RepositoryData | null
}

export function RepositorySelection({
  title,
  availableDatasets,
  onSelectDataset,
  currentIndex,
  customData
}: RepositorySelectionProps): JSX.Element {
  return (
    <div className="mb-4 space-y-3">
      <h3 className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-2">
        {title}
      </h3>
      <div className="relative">
        <select
          value={currentIndex}
          onChange={(e) => onSelectDataset(Number(e.target.value))}
          className="w-full bg-[#252526] border border-gray-700 text-gray-300 text-xs rounded px-2 py-1.5 appearance-none focus:outline-none focus:border-blue-500/50 pr-8"
        >
          {availableDatasets.map((data, index) => (
            <option key={index} value={index}>
              {data.repositoryName || (data as RepositoryData).repositoryName}
            </option>
          ))}
        </select>
        <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
          <ChevronDown className="w-3 h-3 text-gray-500" />
        </div>
      </div>
      {availableDatasets[currentIndex]?.description && (
        <p className="mt-1 text-[10px] text-gray-500 truncate">
          {availableDatasets[currentIndex].description}
        </p>
      )}
      {customData && currentIndex === availableDatasets.length - 1 && (
        <p className="mt-1 text-[10px] text-blue-400 truncate flex items-center gap-1">
            Loaded from URL
        </p>
      )}
    </div>
  )
}