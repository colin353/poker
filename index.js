/**
 * Poker App
 * https://github.com/colin353/poker
 * @flow
 *
 * The purpose of this app is to help you learn how to judge poker odds more accurately,
 * by giving you different plausible situations and getting you to estimate the odds of
 * winning. Over time, you start to generate some heuristics for quickly estimating the
 * odds of winning/losing/tie, which can be a useful tool when playing actual poker.
 *
 * The game sets up a situation, for example, a early/mid/late-stage game, with between
 * two and four players. You're quizzed on the probabilities of certain outcomes, and then
 * the system runs 1000 simulations of the results of the game. You win or lose points based
 * upon how close you were to guessing the right answer.
 *
 * Color scheme for this app:
 * https://coolors.co/1a090d-4a314d-6b6570-a8ba9a-ace894
 */

import React, { Component } from 'react';
import {
  AppRegistry
} from 'react-native';

import Game from './app/pages/game.js';
import Home from './app/pages/home.js';
import Intro from './app/pages/intro.js';

class PokerApp extends Component {
  state: {
    page: string
  }

  constructor(props) {
    super(props);
    this.state = {
      page: "home"
    };
  }

  startGame() {
    this.setState({page: "intro"});
  }

  render() {
    if(this.state.page == 'home') return <Home startGame={this.startGame.bind(this)} />;
    if(this.state.page == 'intro') return <Intro startGame={this.startGame.bind(this)}/>;
    else if(this.state.page == 'game') return <Game />;
  }
}

AppRegistry.registerComponent('poker_app', () => PokerApp);
