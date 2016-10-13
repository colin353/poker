## Solo

Solo is an app that quizzes you on poker odds. It shows you a board state and
asks a question such as "what's the probability of winning?" or "what is the probability of
losing to three of a kind?"

![Example screenshot](/assets/screen1.png?raw=true =200x400)
![Example result](/assets/screen1.png?raw=true =200x400)

If you guess the probability accurately, you get points, but if you're wrong, you lose them.

Once you get 1000 points, you level up. Each level gets more difficult questions and requires you
to be more accurate.

### How it works

Check out `/app/poker.js`. Basically, it does the following:

 - Deal cards to the player
 - Advance the state of the game by a random amount (deal the flop, turn, etc.)
 - Make 1000 copies of the game state. For each game, shuffle the deck, and advance the game to completion
 - Add up the number of wins, ties, and losses.
