import { RouterProvider } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { router } from './router';
import { JudgePanel } from './components/JudgePanel';
import { SocketProvider } from './context/SocketContext';

function App() {
  return (
    <Provider store={store}>
      <SocketProvider>
        <RouterProvider router={router} />
        <JudgePanel />
      </SocketProvider>
    </Provider>
  );
}

export default App;
