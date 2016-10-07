/*
  questions.js
  @flow

  This function defines different types of problems which can be generated. A problem
  consists of a question and a correct answer, and a method of calculating a score based
  upon the given guessed answer. An example of a problem type is "What's the probability
  that you'll win?", or "What's the probability you'll win with a full house?".
*/

var Poker = require('../poker');
import type { HandResult, Result } from '../poker';

// A question is a subcomponent of a Problem. The question is the part of the problem
// which is immediately revealed to the player. The fields in this object match up with
// the fields in the Component.state of the root component (see /index.js), so you can
// look up that state for the meaning of each field.
type Question = {
  question: string,
  table: Array<Poker.Card>,
  player: Poker.Player,
  players: number,
  percent: number,
  pointsWon: number
};

// An answer is the part of the Problem which is revealed after the player provides a
// guess. It contains the correct answer, as well as a list of the different types of
// hands which won/lost.
type Answer = {
  winningHands: Array<HandResult>,
  losingHands: Array<HandResult>,
  question: string
}

// A problem is a composition of a question and an answer, as well as a method for
// calculating the score based upon an answer guess.
class Problem {
  result: Result;
  question: Question;
  answer: Answer;
  getScore(guess: number, level: number): number {
    // placeholder implementation - is overridden
    // in subclasses.
    return guess*level;
  }
}

// Here's the universal function we use to calculate the score, based upon how close
// we were to the correct answer. The tolerance decreases at higher levels, so you have
// to get closer to the right answer in order to get > 0 points.
// Basically it's just the square of the difference between estimate and answer, allowing
// for some wiggle room at the correct answer, since the monte-carlo simulation is only
// accurate to few percent anyway).
function computeScore(estimate, answer, level) {
  estimate = Math.min(Math.max(estimate, 0.01),0.99);
  var levelBonus = 200 / Math.pow(1.3, level-1);
  var result = levelBonus + (6.25 - Math.pow(100*(Math.max(Math.abs(estimate - answer), 0.025)),2))*0.5;
  return Math.max(-500, result);
}

// Example: What's the probability that you'll win?
class WinQuestion extends Problem {
  constructor() {
    super();
    var game = new Poker.Game();

    // Choose a random number of players.
    game.generate(1+Math.ceil(Math.random()*3));
    // Advance a random number of times.
    for(var i=0;i<Math.floor(Math.random()*4);i++) game.advance();

    this.question = {
      question : "What's the probability that you'll win?",
      table    : game.table,
      player   : game.players[0],
      players  : game.players.length,
      percent  : (100.00 / game.players.length),
      pointsWon: 0
    };

    // Calculate the answer.
    this.result = Poker.determineChances(game);

    this.answer = {
      winningHands: this.result.winningHands,
      losingHands : this.result.losingHands,
      question    : "There's a " + (Math.round(this.result.win*100)) + "% chance of winning.",
    };
  }

  getScore(estimate: number, level: number): number {
    return computeScore(estimate/100, this.result.win, level);
  }
}

// Example: What's the probability that you'll win or tie?
class WinOrTieQuestion extends Problem {
  constructor() {
    super();
    var game = new Poker.Game();

    // Choose a random number of players.
    game.generate(1+Math.ceil(Math.random()*3));
    // Advance a random number of times.
    for(var i=0;i<Math.floor(Math.random()*4);i++) game.advance();

    this.question = {
      question : "What's the probability that you'll win or tie?",
      table    : game.table,
      player   : game.players[0],
      players  : game.players.length,
      percent  : (100.00 / game.players.length),
      pointsWon: 0
    };

    // Calculate the answer.
    this.result = Poker.determineChances(game);

    this.answer = {
      winningHands: this.result.winningHands,
      losingHands : this.result.losingHands,
      question    : "There's a " + (Math.round((this.result.win + this.result.tie)*100)) + "% chance of a win or tie."
    };
  }

  getScore(estimate: number, level: number) {
    var realAnswer = this.result.win + this.result.tie;
    return computeScore(estimate/100, realAnswer, level);
  }
}

// Example: What's the probability that you'll lose to a straight?
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
      question : "Odds you'll lose to "+ this.method.name.toLowerCase() +"?",
      table    : game.table,
      player   : game.players[0],
      players  : game.players.length,
      percent  : 100.00 - (100.00 / game.players.length),
      pointsWon: 0
    };

    this.answer = {
      winningHands: this.result.winningHands,
      losingHands : this.result.losingHands,
      question    : "A " + (Math.round((this.method.probability)*100)) + "% chance of losing to "+this.method.name.toLowerCase()+"."
    };
  }

  getScore(estimate, level) {
    return computeScore(estimate/100, this.method.probability, level);
  }
}

// Example: What's the probability that you'll win with a full house?
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
      question : "Odds you'll win with "+ this.method.name.toLowerCase() +"?",
      table    : game.table,
      player   : game.players[0],
      players  : game.players.length,
      percent  : (100.00 / game.players.length),
      pointsWon: 0
    };

    this.answer = {
      winningHands: this.result.winningHands,
      losingHands : this.result.losingHands,
      question    : (Math.round((this.method.probability)*100)) + "% chance of winning w/ "+this.method.name.toLowerCase()+"."
    };
  }

  getScore(estimate, level) {
    return computeScore(estimate/100, this.method.probability, level);
  }
}

// Example: What's the probability that you'll lose?
class LoseQuestion extends Problem {
  constructor() {
    super();
    var game = new Poker.Game();

    // Choose a random number of players.
    game.generate(1+Math.ceil(Math.random()*3));
    // Advance a random number of times.
    for(var i=0;i<Math.floor(Math.random()*4);i++) game.advance();

    this.question = {
      question : "What's the probability that you'll lose?",
      table    : game.table,
      player   : game.players[0],
      players  : game.players.length,
      percent  : 100 - (100.00 / game.players.length),
      pointsWon: 0
    };

    // Calculate the answer.
    this.result = Poker.determineChances(game);

    this.answer = {
      winningHands: this.result.winningHands,
      losingHands : this.result.losingHands,
      question    : "There's a " + (Math.round((this.result.loss)*100)) + "% chance of losing."
    };
  }

  getScore(estimate, level) {
    return computeScore(estimate/100, this.result.loss, level);
  }
}

var QuestionRoster : Array<Class<Problem>> = [
  WinQuestion,
  LoseQuestion,
  WinOrTieQuestion,
  SpecificLoseQuestion,
  SpecificWinQuestion
];

function GenerateQuestion(level: number) {
  var availableQuestions = QuestionRoster.slice(0,level);
  return new availableQuestions[Math.floor(Math.random() * availableQuestions.length)](level);
}

module.exports = {
  GenerateQuestion,
  Problem
};
