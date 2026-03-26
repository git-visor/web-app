import { useDispatch, useSelector } from 'react-redux'
import type { RootState, AppDispatch } from './index'
import type { TypedUseSelectorHook } from 'react-redux'

export const useAppDispatch = (): AppDispatch => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector