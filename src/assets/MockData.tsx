import FileDeletionExample from './MockDatas/File_Deletion_Example_git_objects.json'
import FileEditExample from './MockDatas/File_Editing_Example_git_objects.json'
import BranchExample from './MockDatas/branch-sample_git_objects.json'
import type { RepositoryData } from './ObjectTypes'


export const mockDataList: Array<RepositoryData> = [
  FileDeletionExample as RepositoryData,
  FileEditExample as RepositoryData,
  BranchExample as RepositoryData,
]
