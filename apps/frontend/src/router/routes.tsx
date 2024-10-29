import GameRoomPage from '@gol-ya-pooch/frontend/pages/GameRoom';
import HomePage from '@gol-ya-pooch/frontend/pages/Home';
import { Route, Router } from 'wouter';

export const AppRouter = () => {
  return (
    <Router>
      <Route path="/" component={HomePage} />
      <Route path="/game/:roomId" component={GameRoomPage} />
    </Router>
  );
};
