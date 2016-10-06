/*
  state.js
  @flow
  Methods for saving and restoring state.
*/

import { AsyncStorage } from 'react-native';

class State {
  score: number;
  level: number;

  constructor() {
    this.score = 1;
    this.level = 1;
  }
  load() {
    return AsyncStorage.getItem('state').then((result) => {
      // Don't do anything if we have never saved the state
      // before.
      if(result === null) return;
      else {
        // The state exists. Load it from JSON.
        result = JSON.parse(result);
        if('score' in result) this.score = result.score;
        if('level' in result) this.level = result.level;

        if(isNaN(this.score)) this.score = 1;
        if(isNaN(this.level) || this.level == 0) this.level = 1;
      }
    });
  }
  save() {
    return AsyncStorage.setItem('state', JSON.stringify({
      score: this.score,
      level: this.level
    }));
  }
}

module.exports = State;
