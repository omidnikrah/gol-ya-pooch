export const Events = {
  CREATE_GAME_ROOM: 'game:room:create',
  GAME_ROOM_CREATED: 'game:room:created',
  JOIN_GAME_ROOM: 'game:room:join',
  GAME_ROOM_JOINED: 'game:room:joined',
  GAME_COIN_FLIP: 'game:room:coinFlip',
  GAME_COIN_FLIP_RESULT: 'game:room:coinFlipResult',
  GAME_FINISHED: 'game:room:finished',
  GET_ROOM_INFO: 'game:room:getInfo',
  ROOM_INFO_FETCHED: 'game:room:infoFetched',
  GAME_STATE_UPDATED: 'game:room:stateUpdated',

  CHANGE_OBJECT_LOCATION: 'game:object:changeLocation',
  OBJECT_LOCATION_CHANGED: 'game:object:locationChanged',
  GUESS_OBJECT_LOCATION: 'game:object:guessLocation',
  GUESS_LOCATION_RESULT: 'game:object:guessResult',

  REQUEST_EMPTY_HAND: 'game:opponent:requestEmptyHand',
  REQUEST_EMPTY_PLAY: 'game:opponent:requestEmptyPlay',

  HAND_EMPTIED: 'game:player:handEmptied',
  PLAYER_JOINED: 'game:player:joined',
  PLAYER_LEFT: 'game:player:left',
  PLAYER_READY: 'game:player:ready',
  PLAYER_READY_CONFIRMED: 'game:player:readyConfirmed',
  PLAYER_PLAYING: 'game:player:playing',
  PLAYER_RECEIVE_OBJECT: 'game:player:receiveObject',

  GAME_EXCEPTION: 'exception',
};
