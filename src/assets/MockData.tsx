import type { GitObject } from './ObjectDatabase'
import FileDeletionExample from './MockDatas/File_Deletion_Example_git_objects.json'
import FileEditExample from './MockDatas/File_Editing_Example_git_objects.json'

export interface MockData {
  repositoryName: string
  repositoryPath: string
  exportDate: string
  totalObjects: number
  description?: string
  objects: GitObject[]
}

export const mockDataList: Array<MockData> = [
  FileDeletionExample as MockData,
  FileEditExample as MockData,
]
