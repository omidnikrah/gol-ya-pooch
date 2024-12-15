import { GitHubLink, ToastProvider } from '@gol-ya-pooch/frontend/components';

import { AppRouter } from './router';

const App = () => {
  return (
    <ToastProvider>
      <AppRouter />
      <GitHubLink />
    </ToastProvider>
  );
};

export default App;
