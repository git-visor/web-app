import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { GitObject, RepositoryData } from '../../assets/ObjectTypes';

interface GraphState {
  urlInput: string;
  currentMockIndex: number;
  visibleTypes: string[];
  isLoading: boolean;
  error: string | null;
  selectedObject: GitObject | null;
  customData?: RepositoryData | null;
  availableDatasets: RepositoryData[];
}

const initialState: GraphState = {
  urlInput: '',
  currentMockIndex: 0,
  visibleTypes: ['commit', 'tree', 'blob', 'tag'],
  isLoading: false,
  error: null,
  selectedObject: null,
  customData: null,
  availableDatasets: [],
};

const graphSlice = createSlice({
  name: 'graph',
  initialState,
  reducers: {
    setUrlInput(state, action: PayloadAction<string>) {
      state.urlInput = action.payload;
    },
    setCurrentMockIndex(state, action: PayloadAction<number>) {
      state.currentMockIndex = action.payload;
    },
    setVisibleTypes(state, action: PayloadAction<string[]>) {
      state.visibleTypes = action.payload;
    },
    setIsLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    setSelectedObject(state, action: PayloadAction<GitObject | null>) {
      state.selectedObject = action.payload;
    },
    setCustomData(state, action: PayloadAction<RepositoryData>) {
      state.customData = action.payload;
    },
    setAvailableDatasets(state, action: PayloadAction<RepositoryData[]>) {
      state.availableDatasets = action.payload;
    }
  },
});

export const {
  setUrlInput,
  setCurrentMockIndex,
  setVisibleTypes,
  setIsLoading,
  setError,
  setSelectedObject,
  setCustomData,
  setAvailableDatasets
} = graphSlice.actions;

export default graphSlice.reducer;