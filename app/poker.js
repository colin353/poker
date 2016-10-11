/*
  poker.js
  @flow

  This file contains the implementation of the poker board state evaluation program,
  plus the tools for running monte-carlo simulations of different poker outcomes.
*/

// These are some constants that help us remember the priority order of
// the different possible hands.
const STRAIGHT_FLUSH = 0;
const FOUR_OF_A_KIND = 1;
const FULL_HOUSE     = 2;
const FLUSH          = 3;
const STRAIGHT       = 4;
const THREE_OF_A_KIND= 5;
const TWO_PAIRS      = 6;
const TWO_OF_A_KIND  = 7;
const ONE_OF_A_KIND  = 8;
const KICKERS        = 9;

// This is an array which converts a hand priority (which is just a plain number)
// into a human-readable format.
const hierarchy = [
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

// An array of "of a kind" type of hands.
const ofAKind = [
  ONE_OF_A_KIND,
  TWO_OF_A_KIND,
  THREE_OF_A_KIND,
  FOUR_OF_A_KIND
];

// This is a dictionary which is used to convert string representations
// of cards into the integer values. So, for example, K -> 13.
var valueStringToInteger : { [ x: string ] : number } = {'J': 11, 'Q': 12, 'K': 13, 'A': 14};
for(var i=0;i<10;i++) {
  valueStringToInteger[String(i+1)] = i+1;
}

// Internally, the suits are stored as single chars like H, S, D and C.
// This dictionary converts those to unicode for display purposes.
const suitToUnicode = {
  'H': '♥',
  'S': '♠',
  'D': '♦',
  'C': '♣'
};

// A HandResult is a pairing between the name of a human-readable hand type
// (e.g. "Straight flush") and a probability of that type occurring.
export type HandResult = {
  name: string,
  probability: number
};

// The result type is used by the monte carlo engine to report the statistics
// of a run. Contains win, tie and loss percentages, as well as a breakdown
// of the most common winning and losing hands.
export type Result = {
  win: number,
  tie: number,
  loss: number,
  winningHands: Array<HandResult>, // <-- this group also includes ties, by the way.
  losingHands: Array<HandResult>   // <-- this group excludes ties.
}

// When an individual monte-carlo run completes, it will return an EvaluationResult,
// which summarizes the score of the hand, which five cards were selected to be included
// in the hand, and a string representation (to simplify debugging).
export type EvaluationResult = {
    score: Score,
    cards: Array<Card>,
    repr: string
};

// Here are a few debugging functions. This one takes a card array (such as a hand, or the
// current table state) and turns it into a human-readable string.
function reprCardArray(array: Array<Card>) {
  var cards = [];
  for(var i=0;i<array.length;i++) cards.push(array[i].reprString());
  return "[" + cards.join(', ') + "]";
}

// This reverses the action of the previous function, and turns a string into a card array.
// Used for debugging and testing purposes. An example input might be something like:
// "KS 3H" --> Array<Card>
function makeCards(string: string): Array<Card> {
  var cards: Array<Card> = [];
  var cardReps: Array<string> = string.split(' ');
  for(var i=0;i<cardReps.length;i++) {
    cards.push(new Card(cardReps[i].slice(-1), valueStringToInteger[cardReps[i].slice(0,-1)]));
  }
  return cards;
}


// The score class requires a bit of explaining. Because there are so many ways to
// win in poker, and each method has degrees of winning (i.e. a pair of twos loses to
// a pair of fives), computing a single numerical score for a hand is pretty hard to
// do in a reasonable number of digits. So the alternative is to use an array of
// possible win types, in hierarchical order, where at each index of the array,
// the value represents the degree of the win type present. A zero indicates that
// that win condition was not satisfied.
//
// For example, a straight flush might be represented as [14, 0, 0, ... ], because
// the zeroth index (representing straight flush, the best possible hand) was present
// with degree 14 (because a straight flush contains an ace). Or, another example might be
// a hand with four 9s and a K. That might be represented as [ 0 9 0 0 ... 13 ], where
// four of a kind is the second best hand (hence array index 1, degree 9) and the king
// is a one of a kind, which is much lower in the hierarchy. The 13 represents the degree
// of the one of a kind, which is the numerical value for K.
//
// To compare two scores, simply start with the zeroth index in the score array and compare
// by degree. If one score has a higher degree at any point starting from the left, the total
// score is higher. The scores are equal only if all degrees are precisely equal.
//
// This class maintains and compares scores.
class Score {
  score: Array<number>;

  constructor() {
    // There are 14 degrees in this score array because there are 9 named win
    // types (straight flush, four of a kind, ..., one of a kind) plus we must also
    // include each selected card (of which there are 5), sorted by degree, individually
    // at the bottom of the array so that ties can be broken by these kicker cards.
    this.score = [ 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ];
  }

  isGreaterThan(score: Score) {
    for(var i=0; i<this.score.length; i++) {
      if(this.score[i] > score.score[i]) return true;
      else if(score.score[i] > this.score[i]) return false;
    }
    return false;
  }

  isEqualTo(score: Score) {
    for(var i=0; i<this.score.length; i++) {
      if(this.score[i] != score.score[i]) return false;
    }
    return true;
  }
}

// The Card class represents a single card, with a suit
// and a value. The value is a numerical representation of
// the degree of the card (e.g. K -> 13, 9 -> 9, A -> 14).
class Card {
  suit: string;
  value: number;

  constructor(suit: string, value: number) {
    this.suit = suit;
    this.value = value;
  }

  // Return the value of the card (which is stored numerically)
  // as a human-readable string.
  valueString() {
    if(this.value < 11) return String(this.value);
    else return ["J", "Q", "K", "A"][this.value - 11];
  }

  // Checks if another card and this card are equal.
  matchesCard(card: Card) {
    return card.value == this.value && card.suit == this.suit;
  }

  // Checks if this card is present in a given array of cards.
  matchesCards(cards: Array<Card>) {
    for(var c of cards)
      if(this.matchesCard(c)) return true;
    return false;
  }

  // Return a human readable string that can be used to display
  // the card.
  reprString() {
    return this.valueString() + this.suit;
  }

  // Returns a human-readable string which includes the unicode
  // suit characters.
  repr() {
    return this.valueString() + suitToUnicode[this.suit];
  }
}

// A deck is basically an array of cards, which can be shuffled, dealt, etc.
// By default, when a deck is created, it contains no cards. They must be generated
// by running Deck.generate(). You can also copy a deck (which is used extensively
// by the monte carlo simulation) if you want to generate a new deck from an existing one.
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


  // This function emits a number of cards, and removes them
  // from the deck.
  deal(number: number) {
    var cards : Array<Card> = [];
    for(var i=0;i<number;i++)
      cards.push(this.cards.pop());
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

  // Returns a human-readable representation of the deck.
  repr() {
    return reprCardArray(this.cards);
  }
}

// The player is basically just an array of cards.
class Player {
  cards: Array<Card>;

  constructor(cards: Array<Card>) {
    this.cards = cards;
  }

  // Returns a human-readable representation of the cards
  // in the player's hand.
  repr() {
    return reprCardArray(this.cards);
  }
}

// A game is an entire setup of a poker match, including a table state,
// players, phase of the game, previously dealt hands, etc. This game object
// can advance through the different phases, and eventually calculate the final
// outcome (i.e. winner) of the game.
//
// The critical part of this game object is the fact that it can be copied. That
// means that the state of the game is totally duplicated, and then the deck
// shuffled. The copy can then be manipulated to get a single realization of the
// monte carlo simulation.
class Game {
  deck: Deck;
  table: Array<Card>;     // An array of cards visible on the table.
  players: Array<Player>; // an array of players. The zeroth index is you.
  stage: number;          // the current phase. 0 -> pre-flop, 1 -> flop, etc.
  iterations: number;     // how many iterations to complete when simulating odds

  constructor() {
    this.table      = [];
    this.players    = [];
    this.stage      = 0;
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

  // This function creates a new game, deep copies the state of the current game into
  // the new object, and returns the new game. One critical thing that the copy function
  // does is that it realizes the hands of any unrealized enemy players. In an individual
  // relization of a game, every player has a hand. But in the "setup" game, we may wish
  // to reason about players whose hands we don't yet know. So in the parent version of
  // the game there may be some players who have not yet been dealt hands, but in the child
  // (copy) version of the game, every player has a defined hand.
  copy(): Game {
    var g = new Game();

    g.deck       = this.deck.copy();
    g.deck.shuffle();

    g.table      = this.table.slice();
    g.stage      = this.stage;
    g.players    = this.players.slice();
    g.iterations = this.iterations;

    // Since we're in a "copy" of the game, it's a unique
    // realization of the world, where the players are dealt
    // a hand. So we'll deal any players without hands in.
    for(var i=0; i<g.players.length; i++)
      if(g.players[i].cards.length == 0) g.players[i] = new Player(g.deck.deal(2));

    return g;
  }

  // Return a human-readable string representing the current game state. Shows the
  // table and the hand of each player.
  repr() {
    var players = [];
    for(var i=0;i<this.players.length;i++)
      players.push("Player" + (i+1) + "=" + ((!this.players[i])?"??":this.players[i].repr()));

    return "[ stage="+this.stage+" table="+reprCardArray(this.table)+", " + players.join(' ,') + " ]";
  }

  // Advances by one phase, laying out the necessary number of cards onto the table.
  advance() {
    const numberOfCardsToDeal = [ 3, 1, 1 ];
    if(this.stage == 3) return;
    this.table = this.table.concat(this.deck.deal(numberOfCardsToDeal[this.stage]));
    this.stage += 1;
  }

  getFinalResult() {
    // Finish the game.
    for(var i=0;i<3;i++) this.advance();

    // Check who won.
    var bestResult: EvaluationResult = {score: new Score(), cards: [], repr: ""};
    var myResult: EvaluationResult   = {score: new Score(), cards: [], repr: ""};
    for(i=0;i<this.players.length;i++) {
      if(i == 0) myResult = evaluateCards(this.players[i].cards.concat(this.table));
      else {
        var result = evaluateCards(this.players[i].cards.concat(this.table));
        if(result.score.isGreaterThan(bestResult.score)) bestResult = result;
      }
    }

    var winningHand: EvaluationResult = myResult;

    // Compute the score differential. Positive score differential implies
    // that the player won, zero is a tie, and negative is a loss.
    var scoreDifferential = 0;
    if(myResult.score.isEqualTo(bestResult.score)) {
      winningHand = bestResult;
      scoreDifferential = 0;
    } else if(myResult.score.isGreaterThan(bestResult.score)) {
      scoreDifferential = 1;
    } else {
      scoreDifferential = -1;
    }

    return {
      score: scoreDifferential,
      repr: winningHand.repr + " " + reprCardArray(winningHand.cards),
      hand: winningHand.repr,
      cards: winningHand.cards
    };
  }
}

function containsFlush(cards: Array<Card>) {
  if(!cards) return false;
  cards.sort((a, b) => {
    return a.value - b.value;
  });
  for(var s=0;s<4;s++) {
    var selectedCards: Array<Card> = [];
    for(var i=0;i<cards.length;i++) if(cards[i].suit == ["H", "D", "C", "S"][s]) {
      selectedCards.push(cards[i]);
    }
    if(selectedCards.length >= 5) return selectedCards;
  }
  return false;
}

function containsStraight(cards: any) {
  if(!cards) return false;

  cards.sort((a, b) => {
    return a.value - b.value;
  });
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

function containsStraightUsingAceLow(cards: Array<Card>) {
  if(!cards) return false;

  function mapAce(value) {
    if(value >= 14) return value - 13;
    else return value;
  }

  cards.sort((a, b) => {
      return mapAce(a.value) - mapAce(b.value);
  });

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

function containsOfAKind(cards: Array<Card>, max: number=4) {
  cards.sort((a, b) => {
    return a.value - b.value;
  });
  var selectedCards = [cards[0]];
  var bestCards = selectedCards;
  for(var i=0;i<cards.length-1;i++) {
    if(cards[i+1].value == cards[i].value) selectedCards.push(cards[i+1]);
    else selectedCards = [cards[i+1]];
    if(Math.min(bestCards.length, max) <= selectedCards.length) bestCards = selectedCards;
  }
  return bestCards.slice(0,max);
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
        0.01 * Math.min(newCards[0].value, score.score[ofAKind[1]]);
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
  for(i=0;i<9;i++) {
    repr = hierarchy[i];
    if(score.score[i] != 0) break;
  }

  // Compactify the score.
  return {
    score: score,
    cards: selectedCards,
    repr: repr
  };
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
    var g      = game.copy();
    var result = g.getFinalResult();

    if(result.score > 0) wins += 1;
    else if(result.score == 0) ties += 1;
    else loss += 1;

    if(result.score > 0) {
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
  for(key in losingHands)  lHand.push({name: key, probability: losingHands[key]  / game.iterations});

  wHand.sort((a,b) => {
    return b.probability - a.probability;
  });
  lHand.sort((a,b) => {
    return b.probability - a.probability;
  });

  return {
    win: (wins / game.iterations),
    tie: (ties / game.iterations),
    loss: (loss / game.iterations),
    winningHands: wHand,
    losingHands: lHand
  };
}

module.exports = {
  determineChances,
  evaluateCards,
  containsStraight,
  containsFlush,
  containsOfAKind,
  Game,
  Player,
  Card,
  Score,
  makeCards,
  Deck,
  reprCardArray
};
