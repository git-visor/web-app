import {
  Database,
  Loader2
} from 'lucide-react'
import { ObjectDetail } from './ObjectDetail'
import { ObjectGraph } from './ObjectGraph'
import { useMemo, useEffect } from 'react'
import type { JSX } from 'react'
import { mockDataList } from './MockData'
import type { GitObject, TagObject, TreeObject, CommitObject } from './ObjectTypes'
import { GraphConfig } from './GraphConfig'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import {
  setSelectedObject,
  setAvailableDatasets
} from '../store/slices/graph';

export function ObjectDatabase(): JSX.Element {
  const dispatch = useAppDispatch();
  const currentMockIndex = useAppSelector((state) => state.graph.currentMockIndex);
  const visibleTypes = useAppSelector((state) => state.graph.visibleTypes);
  const isLoading = useAppSelector((state) => state.graph.isLoading);
  const selectedObject = useAppSelector((state) => state.graph.selectedObject);
  const customData = useAppSelector((state) => state.graph.customData);
  const availableDatasets = useAppSelector((state) => state.graph.availableDatasets);
  // Combine mock data and custom data
  useEffect(() => {
    const combinedDatasets = customData ? [...mockDataList, customData] : mockDataList
    dispatch(setAvailableDatasets(combinedDatasets))
  }, [customData, dispatch])

  // Use availableDatasets instead of mockDataList directly
  const objects = useMemo(() => {
    // Safety check in case index is out of bounds
    if (!availableDatasets || availableDatasets.length === 0) return []
    const dataset = availableDatasets[currentMockIndex] || availableDatasets[0]
    return dataset.objects as GitObject[]
  }, [currentMockIndex, availableDatasets])

  const objectCounts = objects.reduce(
    (acc, obj) => {
      acc[obj.type] = (acc[obj.type] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )
  
  const branches = useAppSelector((state) => state.graph.branches)
  const selectedBranch = useAppSelector((state) => state.graph.currentBranch)

  const branchScopedObjects = useMemo(() => {
    if (!selectedBranch) return objects

    const selected = branches.find((b) => b.name === selectedBranch)
    if (!selected) return objects

    const objectMap = new Map(objects.map((o) => [o.hash, o]))
    const included = new Set<string>()

    const includeTree = (rootTreeHash: string): void => {
      const queue: string[] = [rootTreeHash]
      let i = 0
      while (i < queue.length) {
        const hash = queue[i++]
        if (!hash || included.has(hash)) continue
        included.add(hash)

        const obj = objectMap.get(hash)
        if (obj?.type === 'tree') {
          const tree = obj as TreeObject
          for (const entry of tree.entries) {
            queue.push(entry.hash)
          }
        }
      }
    }

    // Walk commit ancestry from selected branch tip
    const stack: string[] = [selected.commitHash]
    while (stack.length > 0) {
      const hash = stack.pop()
      if (!hash || included.has(hash)) continue

      const obj = objectMap.get(hash)
      if (!obj || obj.type !== 'commit') continue

      const commit = obj as CommitObject
      included.add(commit.hash)

      if (commit.tree) includeTree(commit.tree)
      for (const parentHash of commit.parent ?? []) {
        stack.push(parentHash)
      }
    }

    // Keep tags that point to included objects
    for (const obj of objects) {
      if (obj.type === 'tag') {
        const tagObj = obj as TagObject
        if (included.has(tagObj.objectHash)) {
          included.add(tagObj.hash)
        }
      }
    }

    return objects.filter((o) => included.has(o.hash))
  }, [objects, branches, selectedBranch])

  const visibilityMap = useMemo(() => {
    const map: Map<string, boolean> = new Map()
    for (const obj of branchScopedObjects) {
      map.set(obj.hash, visibleTypes.includes(obj.type))
    }
    return map
  }, [branchScopedObjects, visibleTypes])

  // Handle loading and error states
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#1e1e1e] text-gray-400">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          <p>Loading repository data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex bg-[#1e1e1e] overflow-hidden h-full">
      <div className="flex-1 border-r border-gray-700 flex flex-col overflow-hidden relative">
        <GraphConfig
          objectCounts={objectCounts}
        />
        <div className="flex-1 relative">
          <div
            className={`absolute inset-0 overflow-hidden p-0`}
          >
            <ObjectGraph 
              objects={branchScopedObjects} 
              selectedHash={selectedObject?.hash}
              onSelectObject={(hash) => {
                const obj = objects.find((o) => o.hash === hash)
                if (obj) dispatch(setSelectedObject(obj))
              }}
              visibilityMap={visibilityMap}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 border-l border-gray-700 bg-[#1e1e1e] relative">
        <div className="absolute inset-0 overflow-auto">
          {selectedObject ? (
            <ObjectDetail
              object={selectedObject}
              allObjects={objects}
              onSelectObject={(hash) => {
                const obj = objects.find((o) => o.hash === hash)
                if (obj) dispatch(setSelectedObject(obj))
              }}
            />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <Database className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-sm text-gray-400">Select an object to view details</p>
                <p className="text-xs text-gray-500 mt-1">
                  Click on any object in the list to explore
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
