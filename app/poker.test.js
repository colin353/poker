/*
  poker.test.js
  @flow
  Tests for the poker module.
*/

var Poker = require('./poker.js');

// Flow setup for testing.
declare var test:any;
declare var expect:any;
declare var describe:any;

function assertPrimacy(cards1: string, cards2: string) {
  var result1 = Poker.evaluateCards(Poker.makeCards(cards1));
  var result2 = Poker.evaluateCards(Poker.makeCards(cards2));
  if(!result1.score.isGreaterThan(result2.score)) throw (
    "Expected that " + cards1 + " would beat " + cards2 + ", but that didn't happen."
  );
}

function assertTie(cards1: string, cards2: string) {
  var result1 = Poker.evaluateCards(Poker.makeCards(cards1));
  var result2 = Poker.evaluateCards(Poker.makeCards(cards2));
  if(!result1.score.isEqualTo(result2.score)) throw (
    "Expected that " + cards1 + " would tie with " + cards2 + ", but that didn't happen."
  );
}

test("detecting a straight", () => {
  expect(Poker.containsStraight(Poker.makeCards("2S 3H 4D 5C 6H 9C KS"))).toBeTruthy();
  expect(Poker.containsStraight(Poker.makeCards("9S 10H JD KC QH 9C KS"))).toBeTruthy();
  expect(Poker.containsStraight(Poker.makeCards("AS 2S 3H 4D 5C 6D"))).toBeTruthy();
  expect(Poker.containsStraight(Poker.makeCards("KS KS KS KS KS KS"))).toBe(false);
});

test("detecting a flush", () => {
  expect(Poker.containsFlush(Poker.makeCards("2S JS 8S 4S KS"))).toBeTruthy();
});

test("detecting X of a kind", () => {
  // When we need to get one of a kind, we should get a single ace.
  var c: Poker.Card = Poker.containsOfAKind(Poker.makeCards("AS AH 5D 5S 5H 4D"), 1)[0];
  expect(c.value).toBe(14);

  c = Poker.containsOfAKind(Poker.makeCards("AS 5D 5S 5H 4D"), 2)[0];
  expect(c.value).toBe(5);

  c = Poker.containsOfAKind(Poker.makeCards("5S 5D 4H 4D 4S"), 3)[0];
  expect(c.value).toBe(4);

  c = Poker.containsOfAKind(Poker.makeCards("JS JC JD JH QC"))[0];
  expect(c.value).toBe(11);
});

test("check score comparison code", () => {
  var s = new Poker.Score();
  expect(s.isEqualTo(new Poker.Score())).toBe(true);
  expect(s.isGreaterThan(new Poker.Score())).toBe(false);
  s.score[5] = 13;
  expect(s.isGreaterThan(new Poker.Score())).toBe(true);

  var c = new Poker.Score();
  c.score[3] = 14;
  expect(c.isGreaterThan(s)).toBe(true);
  expect(s.isGreaterThan(c)).toBe(false);
});

test("check hand generation", () => {
  expect(
    Poker.makeCards("1S 2S 3S 4C 5C").length
  ).toBe(5);
});

test("test hand evaluation", () => {
  // Straight should beat a pair.
  assertPrimacy("1S 2S 3S 4C 5C", "QS QC 1S 2S 3H");
  // Triple should beat a double.
  assertPrimacy("1S 1C 1H 2S 3H", "QS QC 1S 2S 3H");
  // Full house should beat a flush.
  assertPrimacy("1S 1C 1H QS QC", "1S 2S 5S 10S JS");
  // Four of a kind should be better than a full house.
  assertPrimacy("1S 1C 1H 1D QC AS", "AS AC AH QS QC");
  // Comparing pairs.
  assertPrimacy("AS AC QS QD 1S 1D", "QS QD JS JD 2S");
  // Two pairs are better than one pair.
  assertPrimacy("QS QD 1S 1D 2S", "AS AD 1S 2S 3H");
  // Pair tiebreaker test.
  assertPrimacy("QS QD 5S 5D 4H", "QS QD 1S 1D 4H");
  // Top card should win.
  assertPrimacy("AS QS 5D 2D 1S", "QS JD 2D 1S 5D");
  // The bottom card should tiebreak.
  assertPrimacy("AS AD AH AC QS", "AS AD AH AC JS");
  // Check for the straight starting with ace.
  assertPrimacy("AS 2D 3H 4C 5S", "2S 2D 2H AC JS");
  // Check which straight wins
  assertPrimacy("2D 3H 4C 5S 6H", "AS 2D 3H 4C 5S");
  // Check for a near-tie situation, where the tiebreaker
  // is several one-high cards.
  assertPrimacy("QD 9H 7C 5D 3S", "2S 4D 6C 8H QD");
  assertPrimacy("AS AD JS 5S 4D", "AS AD JS 5S 2D");
  assertPrimacy("6S 6D 6H KD KS", "AS AD 3S 3D 3H");
});

test("test tie handling capability", () => {
  // Only the best 5 cards should be chosen, so these should tie.
  assertTie("AS AD AH AC 5S 3D", "AS AD AH AC 5S 4D");
  assertTie("5S 9D 9H AD AS AH QS", "5S 9D 9H AD AS AH 4D");
});

function checkOdds(table: string, player: string, stage: number, numberOfPlayers: number, winProbability: number, tieProbability: number) {
  var g = new Poker.Game();
  g.generate(numberOfPlayers);
  g.players[0].cards = Poker.makeCards(player);
  g.stage = stage;
  g.table = Poker.makeCards(table);
  g.iterations = 1000;

  // Since we set the cards, we need to delete the deck and
  // rebuild it, excluding dealt cards.
  g.deck = new Poker.Deck();
  g.deck.generate();
  g.deck.shuffle();

  expect(g.deck.cards.length).toBe(52);
  g.deck.cards = g.deck.cards.filter((c) => {
    return !c.matchesCards(Poker.makeCards(table + " " + player));
  });

  var result = Poker.determineChances(g);

  // Determine the acceptable range using 2-sigma error tolerance.
  expect(result.win).toBeLessThan(   winProbability + (3 * Math.sqrt(g.iterations * winProbability) / g.iterations));
  expect(result.win).toBeGreaterThan(winProbability - (3 * Math.sqrt(g.iterations * winProbability) / g.iterations));

  expect(result.tie).toBeLessThan(   tieProbability + (3 * Math.sqrt(g.iterations * tieProbability) / g.iterations));
  expect(result.tie).toBeGreaterThan(tieProbability - (3 * Math.sqrt(g.iterations * tieProbability) / g.iterations));

}

test("test a definite tie situation", () => {
  var g = new Poker.Game();
  g.generate(2);
  g.stage = 3;
  g.table = Poker.makeCards("AS AD AH AC KS");
  g.players[0].cards = Poker.makeCards("3S 4H");
  g.players[1].cards = Poker.makeCards("5S 6H");

  var result = Poker.determineChances(g);

  expect(result.win).toBe(0);
  expect(result.loss).toBe(0);
  expect(result.tie).toBeCloseTo(1.0);
});

test("test pocket aces odds", () => {
  var g = new Poker.Game();
  g.generate(4);
  g.players[0].cards = Poker.makeCards("AS AH");

  // Remove the two aces from the deck (important for the calculation
  // to accurately represent the number of ties).
  g.deck.cards = g.deck.cards.filter((c) => {
    return !c.matchesCards(Poker.makeCards("AS AH"));
  });

  var result = Poker.determineChances(g);

  expect(result.win).toBeGreaterThan(0.589);
  expect(result.win).toBeLessThan(0.69);
  expect(result.tie).toBeLessThan(0.009);
});

test("that the match function works correctly", () => {
  var c = Poker.makeCards("KH 10C 7S")[0];
  expect(c.matchesCards(Poker.makeCards("JS KH 5C"))).toBeTruthy();
});

test("calculating odds for known hands", () => {
  checkOdds("KH 10C 7S", "9C 5C", 1, 3, 0.1455, 0.033);
  checkOdds("10S 10H 2H", "QH 5D", 1, 4, 0.1429, 0.035);
  checkOdds("10S 10H QC", "QH 5D", 1, 4, 0.4327, 0.102);
  checkOdds("10S 10H KS KH", "QH 5D", 2, 4, 0.1266, 0.1692);
});
