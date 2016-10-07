/*
  questions.js
  @flow

  A question is a game mode, which poses a question, and calculates the
  corresponding answer.
*/

var Poker = require('../poker');
import type { HandResult, Card, Result } from '../poker';

type Question = {
  question: string,
  table: Array<Poker.Card>,
  player: Poker.Player,
  players: number,
  percent: number,
  pointsWon: number
};

type Answer = {
  winningHands: Array<HandResult>,
  losingHands: Array<HandResult>,
  question: string
}

class Problem {
  result: Result;
  question: Question;
  answer: Answer;
  getScore(guess: number, level: number): number { return 0; };
}

function computeScoreLogarithm(estimate, answer) {
  estimate = Math.min(Math.max(estimate, 0.01),0.99);
  return 30 - 100*(answer*Math.log(estimate) + (1-answer)*Math.log(1-estimate))
}

function computeScore(estimate, answer, level) {
  console.log("Compute score: guessed ", estimate, "expected ", answer);
  estimate = Math.min(Math.max(estimate, 0.01),0.99);
  var levelBonus = 200 / Math.pow(1.3, level-1);
  var result = levelBonus + (6.25 - Math.pow(100*(Math.max(Math.abs(estimate - answer), 0.025)),2))*0.5;
  return Math.max(-500, result);
}

class WinQuestion extends Problem {
  constructor() {
    super();
    var game = new Poker.Game();

    // Choose a random number of players.
    game.generate(1+Math.ceil(Math.random()*3));
    // Advance a random number of times.
    for(var i=0;i<Math.floor(Math.random()*4);i++) game.advance();

    this.question = {
      question: "What's the probability that you'll win?",
      table: game.table,
      player: game.players[0],
      players: game.players.length,
      percent: (100.00 / game.players.length),
      pointsWon: 0
    };

    // Calculate the answer.
    this.result = Poker.determineChances(game);

    this.answer = {
      winningHands: this.result.winningHands,
      losingHands: this.result.losingHands,
      question: "There's a " + (Math.round(this.result.win*100)) + "% chance of winning.",
    }
  }
  getScore(estimate, level) {
    estimate = estimate/100;
    var realAnswer = this.result.win;
    return computeScore(estimate, realAnswer, level);
  }
}

class WinOrTieQuestion extends Problem {
  constructor() {
    super();
    var game = new Poker.Game();

    // Choose a random number of players.
    game.generate(1+Math.ceil(Math.random()*3));
    // Advance a random number of times.
    for(var i=0;i<Math.floor(Math.random()*4);i++) game.advance();

    this.question = {
      question: "What's the probability that you'll win or tie?",
      table: game.table,
      player: game.players[0],
      players: game.players.length,
      percent: (100.00 / game.players.length),
      pointsWon: 0
    };

    // Calculate the answer.
    this.result = Poker.determineChances(game);

    this.answer = {
      winningHands: this.result.winningHands,
      losingHands: this.result.losingHands,
      question: "There's a " + (Math.round((this.result.win + this.result.tie)*100)) + "% chance of a win or tie."
    }
  }

  getScore(estimate, level) {
    estimate = estimate/100;
    var realAnswer = this.result.win + this.result.tie;
    return computeScore(estimate, realAnswer, level);
  }
}

// Odds of losing to a specific play, e.g. straight.
class SpecificLoseQuestion extends Problem {
  method: HandResult;

  constructor() {
    super();

    var game = new Poker.Game();

    // Choose a random number of players.
    game.generate(1+Math.ceil(Math.random()*3));
    // Advance a random number of times.
    for(var i=0;i<Math.floor(Math.random()*4);i++) game.advance();

    // Calculate the answer.
    this.result = Poker.determineChances(game);

    // Which type shall we lose to? Choose randomly from the two most common
    // loss methods.
    var hands = this.result.losingHands.slice(0,3);
    this.method = hands[Math.floor(Math.random() * hands.length)];

    this.question = {
      question: "Odds you'll lose to "+ this.method.name.toLowerCase() +"?",
      table: game.table,
      player: game.players[0],
      players: game.players.length,
      percent: 100.00 - (100.00 / game.players.length),
      pointsWon: 0
    };

    this.answer = {
      winningHands: this.result.winningHands,
      losingHands: this.result.losingHands,
      question: "A " + (Math.round((this.method.probability)*100)) + "% chance of losing to "+this.method.name.toLowerCase()+"."
    }
  }

  getScore(estimate, level) {
    estimate = estimate/100;
    var realAnswer = this.method.probability;
    return computeScore(estimate, realAnswer, level);
  }
}

class SpecificWinQuestion extends Problem {
  method: HandResult;
  constructor() {
    super();

    var game = new Poker.Game();

    // Choose a random number of players.
    game.generate(1+Math.ceil(Math.random()*3));
    // Advance a random number of times.
    for(var i=0;i<Math.floor(Math.random()*4);i++) game.advance();

    // Calculate the answer.
    this.result = Poker.determineChances(game);

    // Which type shall we lose to? Choose randomly from the two most common
    // loss methods.
    var hands = this.result.winningHands.slice(0,3);
    this.method = hands[Math.floor(Math.random() * hands.length)];

    this.question = {
      question: "Odds you'll win with "+ this.method.name.toLowerCase() +"?",
      table: game.table,
      player: game.players[0],
      players: game.players.length,
      percent: (100.00 / game.players.length),
      pointsWon: 0
    };

    this.answer = {
      winningHands: this.result.winningHands,
      losingHands: this.result.losingHands,
      question: (Math.round((this.method.probability)*100)) + "% chance of winning w/ "+this.method.name.toLowerCase()+"."
    }
  }

  getScore(estimate, level) {
    estimate = estimate/100;
    var realAnswer = this.method.probability;
    return computeScore(estimate, realAnswer, level);
  }
}

class LoseQuestion extends Problem {
  constructor() {
    super();
    var game = new Poker.Game();

    // Choose a random number of players.
    game.generate(1+Math.ceil(Math.random()*3));
    // Advance a random number of times.
    for(var i=0;i<Math.floor(Math.random()*4);i++) game.advance();

    this.question = {
      question: "What's the probability that you'll lose?",
      table: game.table,
      player: game.players[0],
      players: game.players.length,
      percent: 100 - (100.00 / game.players.length),
      pointsWon: 0
    };

    // Calculate the answer.
    this.result = Poker.determineChances(game);

    this.answer = {
      winningHands: this.result.winningHands,
      losingHands: this.result.losingHands,
      question: "There's a " + (Math.round((this.result.loss)*100)) + "% chance of losing."
    }
  }

  getScore(estimate, level) {
    estimate = estimate/100;
    var realAnswer = this.result.loss;
    return computeScore(estimate, realAnswer, level);
  }
}

var QuestionRoster = [
  WinQuestion,
  LoseQuestion,
  WinOrTieQuestion,
  SpecificLoseQuestion,
  SpecificWinQuestion
];

function GenerateQuestion(level: number) {
  var availableQuestions = QuestionRoster.slice(0,level)
  return new availableQuestions[Math.floor(Math.random() * availableQuestions.length)](level);
}

module.exports = {
  GenerateQuestion,
  Problem
};
