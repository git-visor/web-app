import { ObjectDatabase } from './assets/ObjectDatabase'
import { Provider } from 'react-redux'
import { store } from './store/index'
// src/App.tsx
function App() {

  return (
    <Provider store={store}>
      <ObjectDatabase />
    </Provider>
  )
}

export default App