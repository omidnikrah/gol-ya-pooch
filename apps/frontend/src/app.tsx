import { ToastProvider } from '@gol-ya-pooch/frontend/components';

import { AppRouter } from './router';

const App = () => {
  return (
    <ToastProvider>
      <AppRouter />
    </ToastProvider>
  );
};

export default App;
