/*
  poker.test.js
  @flow
  Tests for the poker module.
*/

var Poker = require('./poker.js');

// Flow setup for testing.
declare var test:any;
declare var expect:any;

function assertPrimacy(cards1:string, cards2:string) {
  var result1 = Poker.evaluateCards(Poker.makeCards(cards1));
  var result2 = Poker.evaluateCards(Poker.makeCards(cards2));
  if(result1.score <= result2.score) throw (
    "Expected that " + cards1 + " would beat " + cards2 + ", but that didn't happen."
  );
}

function assertTie(cards1:string, cards2:string) {
  var result1 = Poker.evaluateCards(Poker.makeCards(cards1));
  var result2 = Poker.evaluateCards(Poker.makeCards(cards2));
  if(result1.score != result2.score) throw (
    "Expected that " + cards1 + " would tie with " + cards2 + ", but that didn't happen."
  );
}


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
  assertPrimacy("1S 1C 1H 1D QC AS", "AS AC AH QS QC")
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
