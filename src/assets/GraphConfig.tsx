import { useCallback, useEffect, type JSX } from 'react'
import { Check } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setUrlInput, setCurrentMockIndex, setVisibleTypes, setIsLoading, setError, setSelectedObject, setCustomData } from '../store/slices/graph';
import { CustomUrlInput } from './GraphConfigs/CustomUrlInput';
import { RepositorySelection } from './GraphConfigs/RepositorySelection';

function getRawGithubUrl(url: string): string {
  try {
    const parsedUrl = new URL(url)
    if (parsedUrl.hostname === 'github.com') {
      const pathParts = parsedUrl.pathname.split('/').filter(Boolean)
      // Remove blob/ or tree/ if present
      const filteredParts = pathParts.filter(part => part !== 'blob' && part !== 'tree')
      return `https://raw.githubusercontent.com/${filteredParts.join('/')}`
    }
    return url
  } catch (e) {
    console.error('Invalid URL provided:', url, e)
    return url
  }
}

interface GraphConfigProps {
  objectCounts: Record<string, number>
}

export function GraphConfig({ objectCounts }: GraphConfigProps): JSX.Element {
  const dispatch = useAppDispatch();
  const urlInput = useAppSelector((state) => state.graph.urlInput);
  const currentMockIndex = useAppSelector((state) => state.graph.currentMockIndex);
  const visibleTypes = useAppSelector((state) => state.graph.visibleTypes);
  const isLoading = useAppSelector((state) => state.graph.isLoading);
  const customData = useAppSelector((state) => state.graph.customData);
  const error = useAppSelector((state) => state.graph.error);
  const availableDatasets = useAppSelector((state) => state.graph.availableDatasets);
  

  // Extract fetch logic to reusable function
  const loadFromUrl = useCallback(async (url: string) => {
    if (!url) return

    dispatch(setIsLoading(true));
    dispatch(setError(null));

    try {
      const rawUrl = getRawGithubUrl(url)
      const res = await fetch(rawUrl)
      if (!res.ok) throw new Error(`Failed to load: ${res.statusText}`)
      
      const data = await res.json()
      // Basic validation
      if (!data.objects || !Array.isArray(data.objects)) {
        throw new Error('Invalid JSON format: missing "objects" array')
      }
      
      dispatch(setCustomData({
        ...data,
        name: data.repositoryName || 'External Repository'
      }))
      // Automatically select the new custom dataset (last index after mocked data)
      dispatch(setCurrentMockIndex(availableDatasets.length - 1))
    } catch (err: Error | unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred')
      console.error('Error fetching git objects:', err)
    } finally {
      setIsLoading(false)
    }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const url = params.get('url')
    if (url) {
      setUrlInput(url)
      loadFromUrl(url)
    }
  }, [loadFromUrl])

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) return;

    dispatch(setIsLoading(true));
    dispatch(setError(null));

    // Simulate loading logic
    setTimeout(() => {
      dispatch(setIsLoading(false));
      dispatch(setUrlInput(urlInput));
    }, 1000);
  };

  const handleDatasetChange = (index: number) => {
    dispatch(setCurrentMockIndex(index));
    setSelectedObject(null); // Clear selection when changing dataset
  };

  const toggleVisibleType = (type: string) => {
    dispatch(
      setVisibleTypes(
        visibleTypes.includes(type)
          ? visibleTypes.filter((t) => t !== type)
          : [...visibleTypes, type]
      )
    );
  };
   // Helper just for checking inclusion in local rendering
  const isTypeVisible = (type: string): boolean => visibleTypes.includes(type)

  const getTypeColor = (type: string): string => {
    switch (type) {
      case 'commit':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      case 'tree':
        return 'bg-green-500/20 text-green-300 border-green-500/30'
      case 'blob':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      case 'tag':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30'
      default:
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
  }
  
  return (
    <div className="p-4 border-b border-gray-700 flex-shrink-0 max-h-[50vh] overflow-y-auto">  
      <div className="mb-4">
        <CustomUrlInput
          title="Load External JSON"
          urlInput={urlInput}
          onUrlChange={(url) => dispatch(setUrlInput(url))}
          onSubmit={handleUrlSubmit}
          isLoading={isLoading}
          error={error}
        />
        <RepositorySelection
          title="Select Repository"
          availableDatasets={availableDatasets}
          currentIndex={currentMockIndex}
          onSelectDataset={handleDatasetChange}
          customData={customData}
        />
      </div>

      <div className="mb-2">
        <h3 className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold mb-2">
          Filter Objects
        </h3>
        <div className="flex flex-wrap gap-2">
          {['commit', 'tree', 'blob', 'tag'].map((type) => (
            <button
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
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}