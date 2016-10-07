/*
  poker.js
  @flow
*/

var STRAIGHT_FLUSH = 0;
var FOUR_OF_A_KIND = 1;
var FULL_HOUSE     = 2;
var FLUSH          = 3;
var STRAIGHT       = 4;
var THREE_OF_A_KIND= 5;
var TWO_PAIRS      = 6;
var TWO_OF_A_KIND  = 7;
var ONE_OF_A_KIND  = 8;
var KICKERS        = 9;

var hierarchy = [
  "Straight flush",
  "Four of a kind",
  "Full house",
  "Flush",
  "Straight",
  "Three of a kind",
  "Two pairs",
  "Two of a kind",
  "One of a kind"
];

var ofAKind = [
  ONE_OF_A_KIND,
  TWO_OF_A_KIND,
  THREE_OF_A_KIND,
  FOUR_OF_A_KIND
]

export type Result = {
  win: number,
  tie: number,
  loss: number,
  winningHands: Array<HandResult>,
  losingHands: Array<HandResult>
}

var valueStringToInteger = {'J': 11, 'Q': 12, 'K': 13, 'A': 14};
for(var i=0;i<10;i++) {
  valueStringToInteger[String(i+1)] = i+1;
}

var suitToUnicode = {
  'H': '♥',
  'S': '♠',
  'D': '♦',
  'C': '♣'
};

function reprCardArray(array:Array<Card>) {
  var cards = [];
  for(var i=0;i<array.length;i++) cards.push(array[i].reprString());
  return "[" + cards.join(', ') + "]";
}

function containsFlush(cards) {
  if(!cards) return false;
  cards.sort((a, b) => {
    return a.value - b.value;
  })
  for(var s=0;s<4;s++) {
    var count = 0;
    var selectedCards = [];
    for(var i=0;i<cards.length;i++) if(cards[i].suit == ["H", "D", "C", "S"][s]) {
      selectedCards.push(cards[i]);
    }
    if(selectedCards.length >= 5) return selectedCards;
  }
  return false;
}

function containsStraight(cards) {
  if(!cards) return false;

  cards.sort((a, b) => {
    return a.value - b.value;
  })

  var straight = 1;
  var maxStraight = 1;
  var selectedCards = [cards[0]];
  var bestCards = [];
  for(var i=0;i<cards.length-1;i++) {
    if(cards[i+1].value == cards[i].value+1) selectedCards.push(cards[i+1]);
    else if(cards[i+1].value != cards[i].value) selectedCards = [ cards[i] ];

    if(bestCards.length <= selectedCards.length) bestCards = selectedCards;
  }

  if(bestCards.length >= 5) return bestCards;
  else return containsStraightUsingAceLow(cards);
}

function containsStraightUsingAceLow(cards) {
  if(!cards) return false;

  function mapAce(value) {
    if(value >= 14) return value - 13;
    else return value;
  }

  cards.sort((a, b) => {
      return mapAce(a.value) - mapAce(b.value);
  })

  var straight = 1;
  var maxStraight = 1;
  var selectedCards = [cards[0]];
  var bestCards = [];
  for(var i=0;i<cards.length-1;i++) {
    if(mapAce(cards[i+1].value) == mapAce(cards[i].value+1)) {
      selectedCards.push(cards[i+1]);
    }
    else if(mapAce(cards[i+1].value) != mapAce(cards[i].value)) {
      selectedCards = [ cards[i] ];
    }

    if(bestCards.length <= selectedCards.length) bestCards = selectedCards;
  }

  if(bestCards.length >= 5) return bestCards;
  else return false;
}

function containsOfAKind(cards, max=4) {
  cards.sort((a, b) => {
    return a.value - b.value;
  })
  var selectedCards = [cards[0]];
  var bestCards = selectedCards;
  for(var i=0;i<cards.length-1;i++) {
    if(cards[i+1].value == cards[i].value) selectedCards.push(cards[i+1]);
    else selectedCards = [cards[i+1]];
    if(Math.min(bestCards.length, max) <= selectedCards.length) bestCards = selectedCards;
  }
  return bestCards.slice(0,max);
}

export type EvaluationResult = {
    score: Score,
    cards: Array<Card>,
    repr: string
};

export type HandResult = {
  probability: number,
  name: string
};

class Score {
  score : Array<number>;

  constructor() {
    this.score = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
  }

  isGreaterThan(score : Score) {
    for(var i=0; i<this.score.length; i++) {
      if(this.score[i] > score.score[i]) return true;
      else if(score.score[i] > this.score[i]) return false;
    }
    return false;
  }

  isEqualTo(score : Score) {
    for(var i=0; i<this.score.length; i++) {
      if(this.score[i] != score.score[i]) return false;
    }
    return true;
  }
}

function evaluateCards(cards: Array<Card>) : EvaluationResult {
  var score = new Score();
  var selectedCards: Array<Card> = [];

  // Check for a straight flush.
  var straightFlush = containsStraight(containsFlush(cards));
  if(straightFlush) {
    score.score[STRAIGHT_FLUSH] = straightFlush.slice(-1)[0].value;
    cards = straightFlush.slice(-5);
  }
  // Check for a flush.
  var flush = containsFlush(cards);
  if(flush) {
    score.score[FLUSH] = flush.slice(-1)[0].value;
    cards = flush.slice(-5);
  }
  // Check for a straight.
  var straight = containsStraight(cards);
  if(straight) {
    score.score[STRAIGHT] = straight.slice(-1)[0].value;
    cards = straight.slice(-5);
  }

  // Optimize the remainder of the unselected cards.
  while(selectedCards.length < 5) {
    var newCards = containsOfAKind(cards, 5 - selectedCards.length);

    if(newCards.length == 0) break;

    // Check if the two pair condition has been met.
    if(newCards.length == 2 && score.score[ofAKind[1]] > 0) {
      score.score[TWO_PAIRS] =
        Math.max(newCards[0].value, score.score[ofAKind[1]]) +
        0.01 * Math.min(newCards[0].value, score.score[ofAKind[1]])
    }

    if(score.score[ofAKind[newCards.length-1]] == 0)
      score.score[ofAKind[newCards.length-1]] = newCards[0].value;

    selectedCards = selectedCards.concat(newCards);
    cards = cards.filter((c) => {
      return c.value != newCards[0].value;
    });
  }

  // Check if a full house condition has been met.
  if(score.score[ofAKind[2]] > 0 && score.score[ofAKind[1]] > 0) score.score[FULL_HOUSE] = score.score[ofAKind[2]];

  // Add in tiebreaking "kickers". First, sort the selected cards
  // so that the best value cards are at the top.
  selectedCards.sort((a, b) => {
    return b.value - a.value;
  });
  // Then throw those into the kickers part of the score array.
  for(var i=0; i<5; i++) {
    score.score[KICKERS+i] = selectedCards[i].value;
  }

  var repr = "";
  for(var i=0;i<9;i++) {
    repr = hierarchy[i];
    if(score.score[i] != 0) break;
  }

  // Compactify the score.
  return {
    score: score,
    cards: selectedCards,
    repr: repr
  }
}

function makeCards(string:string) {
  var cards = [];
  var cardReps = string.split(' ');
  for(var i=0;i<cardReps.length;i++) {
    cards.push(new Card(cardReps[i].slice(-1), valueStringToInteger[cardReps[i].slice(0,-1)]));
  }
  return cards;
}

class Card {
  suit: string;
  value: number;

  constructor(suit:string, value:number) {
    this.suit = suit;
    this.value = value;
  }

  valueString() {
    if(this.value < 11) return String(this.value);
    else return ["J", "Q", "K", "A"][this.value - 11];
  }

  matchesCard(card:Card) {
    return card.value == this.value && card.suit == this.suit;
  }

  matchesCards(cards : Array<Card>) {
    for(var c of cards)
      if(this.matchesCard(c)) return true;
    return false;
  }

  reprString() {
    return this.valueString() + this.suit;
  }

  repr() {
    return this.valueString() + suitToUnicode[this.suit];
  }
}

class Deck {
  cards: Array<Card>;
  constructor() {
    this.cards = [];
  }

  generate() {
    var types = ['H', 'D', 'C', 'S'];
    for(var i=2;i<=14;i++)
      for(var j=0;j<4;j++)
        this.cards.push(new Card(types[j], i));
  }

  copy() {
    var d = new Deck();
    d.cards = this.cards.slice();
    return d;
  }

  deal(number:number) {
    var cards : Array<Card> = [];
    for(var i=0;i<number;i++)
      cards.push(this.cards.pop())
    return cards;
  }

  shuffle() {
    let counter = this.cards.length;

    // While there are elements in the array
    while (counter > 0) {
        // Pick a random index
        let index = Math.floor(Math.random() * counter);

        // Decrease counter by 1
        counter--;

        // And swap the last element with it
        let temp = this.cards[counter];
        this.cards[counter] = this.cards[index];
        this.cards[index] = temp;
    }
  }

  repr() {
    return reprCardArray(this.cards);
  }
}


class Player {
  cards: Array<Card>;
  constructor(cards: Array<Card>) {
    this.cards = cards;
  }
  repr() {
    return reprCardArray(this.cards);
  }
}

class Game {
  deck: Deck;
  table: Array<Card>;
  players: Array<Player>;
  stage: number;
  iterations: number;

  constructor() {
    this.table = [];
    this.players = [];
    this.stage = 0;
    this.iterations = 1000;
  }

  generate(numberOfPlayers: number) {
    this.deck = new Deck();
    this.deck.generate();
    this.deck.shuffle();
    this.players = [ new Player(this.deck.deal(2)) ];

    // There's a bit of a subtle point here. Why not deal in the NPCs before
    // calculating the score? The answer is that if you deal them in first, and
    // then run the monte carlo, you'll end up with hidden variables which strongly
    // influence the outcome of the game. You need to consider all possible universes
    // where the NPCs get dealt different hands, so this must be done inside the
    // getFinalResult() funciton instead of now. We'll create placeholder characters
    // with empty hands instead.
    for(var i=0;i<numberOfPlayers-1;i++)
      this.players.push(new Player([]));
  }

  copy() {
    var g = new Game();
    g.deck = this.deck.copy();
    g.deck.shuffle();
    g.table = this.table.slice();
    g.stage = this.stage;
    g.players = this.players.slice();

    // Since we're in a "copy" of the game, it's a unique
    // realization of the world, where the players are dealt
    // a hand. So we'll deal any players without hands in.
    for(var i=0; i<g.players.length; i++)
      if(g.players[i].cards.length == 0) g.players[i] = new Player(g.deck.deal(2));

    return g;
  }

  repr() {
    var players = [];
    for(var i=0;i<this.players.length;i++)
      players.push("Player" + (i+1) + "=" + ((!this.players[i])?"??":this.players[i].repr()));

    return "[ table="+reprCardArray(this.table)+", " + players.join(' ,') + " ]";
  }

  advance() {
    if(this.stage == 3) return;
    var numberOfCardsToDeal = [ 3, 1, 1 ];
    this.table = this.table.concat(this.deck.deal(numberOfCardsToDeal[this.stage]));
    this.stage += 1;
  }

  getFinalResult() {
    // Finish the game.
    for(var i=0;i<3;i++) this.advance();

    // Check who won.
    var scores : Array<Score> = [];
    var bestResult : EvaluationResult = {score: new Score(), cards: [], repr: ""};
    var myResult = {score: new Score(), cards: [], repr: ""};
    for(var i=0;i<this.players.length;i++) {
      var result = evaluateCards(this.players[i].cards.concat(this.table));
      scores.push(result.score);
      if(i != 0 && result.score.isGreaterThan(bestResult.score)) bestResult = result;
      if(i == 0) myResult = result;
    }

    var winningHand: EvaluationResult = bestResult;
    if(myResult.score.isGreaterThan(bestResult.score))
      winningHand = myResult;

    // Compute the score differential. Positive score differential implies
    // that the player won, zero is a tie, and negative is a loss.
    var scoreDifferential = 0;
    if(scores[0].isEqualTo(bestResult.score)) {
      scoreDifferential = 0;
    } else if(scores[0].isGreaterThan(bestResult.score)) {
      scoreDifferential = 1;
    } else {
      scoreDifferential = -1;
    }

    return {
      score: scoreDifferential,
      repr: winningHand.repr + " " + reprCardArray(winningHand.cards),
      hand: winningHand.repr,
      cards: winningHand.cards
    }
  }
}

function determineChances(game: Game) : Result {
  var wins = 0;
  var ties = 0;
  var loss = 0;

  type HandLikelihoodDictionary = {
    [t: string]: number
  }

  var winningHands: HandLikelihoodDictionary = {};
  var losingHands:  HandLikelihoodDictionary = {};
  for(var i=0;i<game.iterations;i++) {
    var g = game.copy();
    var result = g.getFinalResult();
    if(result.score > 0) wins += 1;
    else if(result.score == 0) ties += 1;
    else loss += 1;

    if(result.score >= 0) {
      if(result.hand in winningHands) {
        winningHands[result.hand] += 1;
      } else winningHands[result.hand] = 1;
    } else {
      if(result.hand in losingHands) {
        losingHands[result.hand] += 1;
      } else losingHands[result.hand] = 1;
    }
  }

  var wHand: Array<HandResult> = [];
  var lHand: Array<HandResult> = [];
  for(var key in winningHands) wHand.push({name: key, probability: winningHands[key] / game.iterations});
  for(var key in losingHands)  lHand.push({name: key, probability: losingHands[key]  / game.iterations});

  wHand.sort((a,b) => {
    return b.probability - a.probability;
  })
  lHand.sort((a,b) => {
    return b.probability - a.probability;
  })

  return {
    win: (wins / game.iterations),
    tie: (ties / game.iterations),
    loss: (loss / game.iterations),
    winningHands: wHand,
    losingHands: lHand
  }
}

module.exports = {
  determineChances,
  evaluateCards,
  Game,
  Player,
  Card,
  Score,
  makeCards,
  Deck,
  reprCardArray
};
