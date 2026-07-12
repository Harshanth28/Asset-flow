import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { router } from './router';
import { JudgePanel } from './components/JudgePanel';

function App() {
  return (
    <Provider store={store}>
      <RouterProvider router={router} />
      <JudgePanel />
    </Provider>
  );
}

export default App;
