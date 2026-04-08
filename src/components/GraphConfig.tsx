import { useCallback, useEffect, useRef, type JSX } from 'react'
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setUrlInput, setCurrentMockIndex, setVisibleTypes, setIsLoading, setError, setSelectedObject, setCustomData, setCurrentBranch, setBranches } from '../store/slices/graph';
import { CustomUrlInput } from './GraphConfigs/CustomUrlInput';
import { RepositorySelection } from './GraphConfigs/RepositorySelection';
import { BranchSelection } from './GraphConfigs/BranchSelection';
import { FilterObjects } from './GraphConfigs/FilterObjects';
import { ReportBug } from './ReportBug';

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
  const currentBranch = useAppSelector((state) => state.graph.currentBranch);
  const branches = useAppSelector((state) => state.graph.branches);
  const isFirstLoad = useRef(true);
  
  const handleBranchChange = (branchName: string) => {
    dispatch(setCurrentBranch(branchName));
    dispatch(setSelectedObject(null));
  };
  const loadFromUrl = useCallback(
    async (url: string) => {
      if (!url) return;

      dispatch(setIsLoading(true));
      dispatch(setError(null));

      try {
        const rawUrl = getRawGithubUrl(url);
        const res = await fetch(rawUrl);
        if (!res.ok) throw new Error(`Failed to load: ${res.statusText}`);

        const data = await res.json();
        if (!data.objects || !Array.isArray(data.objects)) {
          throw new Error('Invalid JSON format: missing "objects" array');
        }
        dispatch(
          setCustomData({
            ...data,
            name: data.repositoryName || 'External Repository',
          })
        );
      } catch (err: Error | unknown) {
        dispatch(setError(err instanceof Error ? err.message : 'An unknown error occurred'));
        console.error('Error fetching git objects:', err);
      } finally {
        dispatch(setIsLoading(false));
      }
    },
    [dispatch]
  );

  const handleUrlSubmit = useCallback(
    (inputUrl: string) => {
      const trimmedUrl = inputUrl.trim();
      if (!trimmedUrl) {
        dispatch(setError('Please provide a URL to load data from'));
        return;
      }
      dispatch(setUrlInput(trimmedUrl));
      try {
        const params = new URLSearchParams(window.location.search);
        params.set('url', trimmedUrl);
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.pushState(null, '', newUrl);
      } catch {
        // If URL manipulation fails (e.g., non-browser env), ignore
      }
      loadFromUrl(trimmedUrl);
    },
    [dispatch, loadFromUrl]
  );


  const handleDatasetChange = (index: number) => {
    dispatch(setCurrentMockIndex(index));
    dispatch(setSelectedObject(null));
    const selectedRepo = availableDatasets[index];
    if (selectedRepo.branches) {
      dispatch(setBranches(selectedRepo.branches));
      // Set current branch to the one marked as current in the data, or default to first branch
      const currentBranch = selectedRepo.branches.find(branch => branch.current)?.name || selectedRepo.branches[0]?.name || '';
      dispatch(setCurrentBranch(currentBranch));
    } else {
      dispatch(setBranches([]));
      dispatch(setCurrentBranch(''));
    }
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
  
  useEffect(() => {
    if (!customData) return;
    if (availableDatasets.length === 0) return;
    const customDataIndex = availableDatasets.indexOf(customData);
    if (customDataIndex === -1) return;
    if (currentMockIndex === customDataIndex) return;
    dispatch(setCurrentMockIndex(customDataIndex));
  }, [customData, availableDatasets, currentMockIndex, dispatch]);

  // handle initialisation
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const url = params.get('url');

    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      if (url && url !== urlInput) {
        dispatch(setUrlInput(url));
        loadFromUrl(url);
      }
    }
  }, [dispatch, loadFromUrl, urlInput]);

  // handle change in currentMockIndex
  useEffect(() => {
    dispatch(setSelectedObject(null));
    if (availableDatasets.length === 0) return;
    const safeIndex =
      currentMockIndex >= 0 && currentMockIndex < availableDatasets.length
        ? currentMockIndex
        : 0;
    const selectedRepo = availableDatasets[safeIndex];
    if (selectedRepo && selectedRepo.branches) {
      dispatch(setBranches(selectedRepo.branches));
      const currentBranch =
        selectedRepo.branches.find(branch => branch.current)?.name ||
        selectedRepo.branches[0]?.name ||
        '';
      dispatch(setCurrentBranch(currentBranch));
    } else {
      dispatch(setBranches([]));
      dispatch(setCurrentBranch(''));
    }
  }, [currentMockIndex, availableDatasets, dispatch]);

  return (
    <div className="p-4 border-b border-gray-700 flex-shrink-0 max-h-[50vh] overflow-y-auto relative">  
      <div className="mb-4">
        <CustomUrlInput
          title="Load External JSON"
          urlInput={urlInput}
          onUrlChange={(url) => dispatch(setUrlInput(url))}
          onSubmit={
            () => handleUrlSubmit(urlInput)
          }
          isLoading={isLoading}
          error={error}
        />
      </div>
      <div className="flex-1 flex gap-x-6">
        <div className="flex-1">
          <RepositorySelection
            title="Select Repository"
            availableDatasets={availableDatasets}
            currentIndex={currentMockIndex}
            onSelectDataset={handleDatasetChange}
            customData={customData}
          />
        </div>
        <div className="flex-1">
          <BranchSelection
            title="Select Branch"
            branches={branches}
            currentBranch={currentBranch}
            onSelectBranch={handleBranchChange}
          />
        </div>
      </div>
      <div className="flex-1 flex">
        <FilterObjects
          title="Filter Object Types"
          objectCounts={objectCounts}
          isTypeVisible={isTypeVisible}
          toggleVisibleType={toggleVisibleType}
          getTypeColor={getTypeColor}
        />
      </div>
      <div className="absolute bottom-6 right-6">
        <ReportBug />
      </div>
    </div>
  )
}