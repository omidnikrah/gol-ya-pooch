import {
  GitHubLink,
  MobileBanner,
  ToastProvider,
} from '@gol-ya-pooch/frontend/components';

import { AppRouter } from './router';

const App = () => {
  return (
    <ToastProvider>
      <AppRouter />
      <GitHubLink />
      <MobileBanner />
    </ToastProvider>
  );
};

export default App;
