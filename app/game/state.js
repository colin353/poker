/*
  state.js
  @flow

  Methods for saving and restoring the game state.
*/

import { AsyncStorage } from 'react-native';

class State {
  score: number;
  level: number;

  constructor() {
    this.score = 1;
    this.level = 1;
  }

  // Returns a promise which is fulfilled when the state is loaded.
  // The game state is loaded onto the State object: it isn't the
  // value resolved by the promise.
  load() {
    return AsyncStorage.getItem('state').then((result) => {
      // Don't do anything if we have never saved the state
      // before. Just keep the default values.
      if(result === null) return;

      // The state exists. Load it from JSON.
      result = JSON.parse(result);
      if('score' in result) this.score = result.score;
      if('level' in result) this.level = result.level;

      // If we don't have a score or level, just set them
      // to the initial values. This means something pretty
      // weird happened... maybe the state got corrupted, or
      // the device was running an old version of the code with
      // an incompatible saved state.
      if(isNaN(this.score)) this.score = 1;
      if(isNaN(this.level) || this.level == 0) this.level = 1;
    });
  }

  // Save the current game state back to the store. Returns a promise
  // which is fulfilled when the save is done.
  save() {
    return AsyncStorage.setItem('state', JSON.stringify({
      score: this.score,
      level: this.level
    }));
  }
}

module.exports = State;
