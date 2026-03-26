import type { JSX } from 'react'

interface CustomUrlInputProps {
  title: string
  urlInput: string
  onUrlChange: (url: string) => void
  onSubmit: () => void,
  isLoading: boolean
  error: string | null
}

export function CustomUrlInput({
  title,
  urlInput,
  onUrlChange,
  onSubmit,
  isLoading,
  error
}: CustomUrlInputProps): JSX.Element {
  return (
    <div className="mb-4 space-y-3">
      <div>
        <h3 className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-2">
          {title}
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => onUrlChange(e.target.value)}
            placeholder="https://raw.githubusercontent.com/..."
            className="flex-1 bg-[#252526] border border-gray-700 text-gray-300 text-xs rounded px-2 py-1.5 focus:outline-none focus:border-blue-500/50"
            onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
          />
          <button
            onClick={onSubmit}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-1.5 rounded disabled:opacity-50"
          >
            Load
          </button>
        </div>
      </div>
      {error && (
        <div className="mt-2 text-xs text-red-400 bg-red-500/10 p-2 rounded border border-red-500/20">
          <span className="font-semibold">Error:</span> {error}
        </div>
      )}
    </div>
  )
}