# Changelog

All notable changes to this project will be documented in this file.
Please read [CONTRIBUTING.md](CONTRIBUTING.md) for commit guidelines.

# [v1.1.1](https://github.com/omidnikrah/gol-ya-pooch/compare/v1.1.0...v1.1.1) (2024-12-14)

## 🐛 Bug Fixes
- [`ceacb5e`](https://github.com/omidnikrah/gol-ya-pooch/commit/ceacb5e)  fix: disable create and join 4 and 6 players game 



## [1.1.1](https://github.com/omidnikrah/gol-ya-pooch/compare/v1.1.0...v1.1.1) (2024-12-14)

# [v1.1.0](https://github.com/omidnikrah/gol-ya-pooch/compare/v1.0.1...v1.1.0) (2024-12-13)

## ✨ New Features
- [`bdfbec5`](https://github.com/omidnikrah/gol-ya-pooch/commit/bdfbec5)  feat: add keyboard shortcuts modal to be shown in the game room page 



# [1.1.0](https://github.com/omidnikrah/gol-ya-pooch/compare/v1.0.1...v1.1.0) (2024-12-13)

# [v1.0.1](https://github.com/omidnikrah/gol-ya-pooch/compare/v1.0.0...v1.0.1) (2024-12-13)

## 🐛 Bug Fixes
- [`094f1eb`](https://github.com/omidnikrah/gol-ya-pooch/commit/094f1eb)  fix: set default hand position randomly 



## [1.0.1](https://github.com/omidnikrah/gol-ya-pooch/compare/v1.0.0...v1.0.1) (2024-12-13)

# v1.0.0 (2024-12-13)

## ✨ New Features
- [`84db18e`](https://github.com/omidnikrah/gol-ya-pooch/commit/84db18e)  feat: add socket and redis 
- [`6819c39`](https://github.com/omidnikrah/gol-ya-pooch/commit/6819c39)  feat: implement basic functionalities of create and join game room 
- [`a21b158`](https://github.com/omidnikrah/gol-ya-pooch/commit/a21b158)  feat: implement change and guess object location functionalities 
- [`395adb5`](https://github.com/omidnikrah/gol-ya-pooch/commit/395adb5)  feat: implement ready team event 
- [`b35f101`](https://github.com/omidnikrah/gol-ya-pooch/commit/b35f101)  feat: implement coin flip functionality to assign the starting turn of the game 
- [`626f9ad`](https://github.com/omidnikrah/gol-ya-pooch/commit/626f9ad)  feat: implement game scoring and finish game functionalities 
- [`b5ee63c`](https://github.com/omidnikrah/gol-ya-pooch/commit/b5ee63c)  feat: implement home page design 
- [`efd9e2a`](https://github.com/omidnikrah/gol-ya-pooch/commit/efd9e2a)  feat: implement useSocket hook 
- [`18861f2`](https://github.com/omidnikrah/gol-ya-pooch/commit/18861f2)  feat: implement join game modal design 
- [`f2106b4`](https://github.com/omidnikrah/gol-ya-pooch/commit/f2106b4)  feat: add gameSize field to game state 
- [`88dfce0`](https://github.com/omidnikrah/gol-ya-pooch/commit/88dfce0)  feat: implement create game modal &amp; integrate with backend to create a game room 
- [`e1339fa`](https://github.com/omidnikrah/gol-ya-pooch/commit/e1339fa)  feat: implement join automatically to the room that has fewest remaining players 
- [`28cd86e`](https://github.com/omidnikrah/gol-ya-pooch/commit/28cd86e)  feat: integrate join game modal with backend 
- [`a7236b2`](https://github.com/omidnikrah/gol-ya-pooch/commit/a7236b2)  feat: implement ability to join to a specific room id 
- [`2beb939`](https://github.com/omidnikrah/gol-ya-pooch/commit/2beb939)  feat: implement game room table design 
- [`4337c51`](https://github.com/omidnikrah/gol-ya-pooch/commit/4337c51)  feat: add get room info socket event 
- [`5c94ab2`](https://github.com/omidnikrah/gol-ya-pooch/commit/5c94ab2)  feat: handle socket exceptions inside useSocket hook and return errors 
- [`a5d0956`](https://github.com/omidnikrah/gol-ya-pooch/commit/a5d0956)  feat: remove players from game when they got disconnected or left the game 
- [`036ab14`](https://github.com/omidnikrah/gol-ya-pooch/commit/036ab14)  feat: add players&#x27; hands using spline 
- [`f5d9e6e`](https://github.com/omidnikrah/gol-ya-pooch/commit/f5d9e6e)  feat: add hands of teamB and handle Player component to render releavent hands 
- [`80f9dca`](https://github.com/omidnikrah/gol-ya-pooch/commit/80f9dca)  feat: add toast component 
- [`5b08298`](https://github.com/omidnikrah/gol-ya-pooch/commit/5b08298)  feat: handle showing game not found message 
- [`fbb99d6`](https://github.com/omidnikrah/gol-ya-pooch/commit/fbb99d6)  feat: add game and player stores 
- [`6690dde`](https://github.com/omidnikrah/gol-ya-pooch/commit/6690dde)  feat: handle displaying the player&#x27;s team in the bottom of the game table 
- [`f028551`](https://github.com/omidnikrah/gol-ya-pooch/commit/f028551)  feat: add useKeyPress hook 
- [`4b6021b`](https://github.com/omidnikrah/gol-ya-pooch/commit/4b6021b)  feat: set player data in the player store 
- [`9a6c4b9`](https://github.com/omidnikrah/gol-ya-pooch/commit/9a6c4b9)  feat: add ready player button &amp; fix the issue with auto join 
- [`73900ed`](https://github.com/omidnikrah/gol-ya-pooch/commit/73900ed)  feat: implement coin flip functionality to determine the starting turn of the game 
- [`1e63fe9`](https://github.com/omidnikrah/gol-ya-pooch/commit/1e63fe9)  feat: set waiting for ready phase when all players joined but not ready 
- [`ec256af`](https://github.com/omidnikrah/gol-ya-pooch/commit/ec256af)  feat: handle showing open hands for when the starting turn not selected and for the team which is not their turn 
- [`200476e`](https://github.com/omidnikrah/gol-ya-pooch/commit/200476e)  feat: handle change object location by pressing arrow keys 
- [`a43d204`](https://github.com/omidnikrah/gol-ya-pooch/commit/a43d204)  feat: handle guessing hand functionality in the frontend 
- [`0ead578`](https://github.com/omidnikrah/gol-ya-pooch/commit/0ead578)  feat: implement join game via lin 
- [`432ab23`](https://github.com/omidnikrah/gol-ya-pooch/commit/432ab23)  feat: implement room information component to show game room info 
- [`e7569e8`](https://github.com/omidnikrah/gol-ya-pooch/commit/e7569e8)  feat: handle showing game result on game finish 
- [`638bcb3`](https://github.com/omidnikrah/gol-ya-pooch/commit/638bcb3)  feat: implement share game link alert 

## 🐛 Bug Fixes
- [`ce172e2`](https://github.com/omidnikrah/gol-ya-pooch/commit/ce172e2)  fix: fix player id type 
- [`bb323d1`](https://github.com/omidnikrah/gol-ya-pooch/commit/bb323d1)  fix: fix gameSize field for joining the game 
- [`916e2e8`](https://github.com/omidnikrah/gol-ya-pooch/commit/916e2e8)  fix: return team name of the player after join the game 
- [`f0ba07e`](https://github.com/omidnikrah/gol-ya-pooch/commit/f0ba07e)  fix: change ready team to ready player 
- [`fccf1fc`](https://github.com/omidnikrah/gol-ya-pooch/commit/fccf1fc)  fix: emit game state update event when a player disconnected or joined 
- [`4da6812`](https://github.com/omidnikrah/gol-ya-pooch/commit/4da6812)  fix: fix coin flow logic &amp; fix finding room with fewest remaining players 
- [`4e57d82`](https://github.com/omidnikrah/gol-ya-pooch/commit/4e57d82)  fix: fix gamestate type 
- [`809e74b`](https://github.com/omidnikrah/gol-ya-pooch/commit/809e74b)  fix: fix type of showToast 
- [`073db03`](https://github.com/omidnikrah/gol-ya-pooch/commit/073db03)  fix: fix score handling 
- [`ea38be7`](https://github.com/omidnikrah/gol-ya-pooch/commit/ea38be7)  fix: fix calculating game score 

## 💥 Breaking Changes
- [`bb8c910`](https://github.com/omidnikrah/gol-ya-pooch/commit/bb8c910)  chore: init project 


# 1.0.0 (2024-12-13)
