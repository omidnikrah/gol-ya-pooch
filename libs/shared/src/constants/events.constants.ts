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

  CHANGE_OBJECT_LOCATION: 'game:object:changeLocation',
  OBJECT_LOCATION_CHANGED: 'game:object:locationChanged',
  GUESS_OBJECT_LOCATION: 'game:object:guessLocation',
  GUESS_LOCATION_RESULT: 'game:object:guessResult',

  TEAM_READY: 'game:team:ready',
  TEAM_READY_CONFIRMED: 'game:team:readyConfirmed',

  REQUEST_EMPTY_HAND: 'game:opponent:requestEmptyHand',

  HAND_EMPTIED: 'game:player:handEmptied',
  PLAYER_JOINED: 'game:player:joined',
};
