/*
  game.js
  @flow

  This page shows questions and answers.
*/

import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  Slider,
  Dimensions
} from 'react-native';

// The machinery to save the app state.
import State from '../game/state';
// The tools for evaluating poker hands, dealing, etc.
import Poker from '../poker.js';
import type { HandResult } from '../poker.js';
// Tools for generating questions and answers.
import { GenerateQuestion, Problem } from '../game/questions';

// Visual components
import { Card, CardPlaceholder } from '../components/card';
import Header from '../components/header';

class Game extends Component {
  state: {
    table: Array<Poker.Card>,
    question: string,
    level: number,
    players: number,    // the number of players
    percent: number,    // the currently selected percent probability
    showAnswer: boolean,// whether the answer is being displayed
    points: number,
    pointsWon: number,  // number of points won in most recent question
    popOver: boolean,   // whether the popover is visible
    player: Poker.Player,
    losingHands: Array<HandResult>,
    winningHands: Array<HandResult>
  };

  question: Problem;

  constructor(props: any) {
    super(props);
    this.state = {
      question    : "",
      table       : [],
      player      : new Poker.Player([]),
      players     : 2,
      percent     : 0,
      showAnswer  : false,
      winningHands: [],
      losingHands : [],
      points      : 0,
      pointsWon   : 0,
      level       : 0,
      popOver     : false
    };
  }

  componentDidMount() {
    // Load the saved state.
    this.props.gameState.load().then(() => {
      this.setState({
        level : this.props.gameState.level,
        points: this.props.gameState.score
      });
      this.generateQuestion(this.state.level);
    });
  }

  // Generate a question based upon the current level, and display it. Also,
  // save the game state (i.e. the player's score + level) whenever a question
  // is generated so that it's always up to date.
  generateQuestion(level: number) {
    this.question = GenerateQuestion(level);
    this.setState(this.question.question);
    this.setState({
      showAnswer: false
    });
    this.props.gameState.save();
  }

  // This function is called when the user decides to submit their answer. It
  // calculates the points won, handles level changes, and displays the correct
  // answer.
  answer() {
    this.setState(this.question.answer);
    var pointsWon = this.question.getScore(Math.round(this.state.percent/5)*5, this.state.level);

    // Figure out if the person has increased by one level.
    if(this.state.points + pointsWon > 1000) {
      this.props.gameState.score += pointsWon - 1000;
      this.props.gameState.level += 1;
      this.setState({popOver: true});
    }
    else if(this.state.points + pointsWon < 0) {
      // If they lose down to zero points and continue to lose
      // they'll lose the level and go down one. Otherwise,
      // they'll just go to zero points.
      if(this.state.points > 0 || this.props.gameState.level == 1) this.props.gameState.score = 0;
      else {
        this.props.gameState.score += 1000 + pointsWon;
        this.props.gameState.level = Math.max(1, this.props.gameState.level - 1);
      }
    }
    else {
      this.props.gameState.score += pointsWon;
    }

    this.setState({
      showAnswer: true,
      pointsWon,
      points: this.props.gameState.score,
      level: this.props.gameState.level
    });
    this.props.gameState.save();
  }

  hidePopover() {
    this.setState({popOver: false});
  }

  // This function generates a new question for the user, with a difficulty
  // adjusted for the current level.
  nextQuestion() {
    this.generateQuestion(this.props.gameState.level);
  }

  render() {
    var percent = Math.round(this.state.percent/5)*5;

    var windowHeight = Dimensions.get('window').height;
    var smallMode = windowHeight < 600;
    var verySmallMode = windowHeight < 500;

    return (
      <View style={{flexDirection: 'column', flex: 1}}>
      {verySmallMode&&!this.state.showAnswer?(<View style={{height: 40, backgroundColor: "#848484"}}></View>):(
        <Header progress={this.state.points/1000} level={this.state.level} />
      )}
      <View style={styles.container}>

      <View style={styles.question}>
        <Text style={styles.questionText}>{this.state.question}</Text>

        {this.state.pointsWon?(
          <View style={styles.points}>
            <Text style={styles.pointsText}>{Math.sign(this.state.pointsWon)==-1?"-":"+"}{Math.floor(Math.abs(this.state.pointsWon))} point{this.state.pointsWon==1?'.':'s.'}</Text>
          </View>
        ):[]}
      </View>

      <View style={styles.table}>
        <View style={styles.tableRow}>
        <View style={styles.tableVelvet}>
          {this.state.table.map((card, i) => {
            return <Card key={i} card={card} />;
          })}

          {Array(5-this.state.table.length).fill().map((_, i) => {
              return <CardPlaceholder key={i} />;
          })}
        </View>

        <View style={{height: 10}}></View>

        <View style={styles.tableVelvet}>
          {this.state.player.cards.map((card, i) => {
            return <Card key={i} card={card} />;
          })}

          <View style={styles.opponent}>
            {smallMode?[]:(<Text style={styles.opponentText}>with</Text>)}
            <Text style={styles.opponentTextNumber}>{this.state.players}</Text>
            <Text style={styles.opponentText}>player{this.state.players==1?'':'s'}</Text>
          </View>
        </View>
        </View>
      </View>

      {this.state.showAnswer?(
        <View style={{alignItems: 'center', justifyContent: 'center'}}>
        {verySmallMode?[]:(
          <View style={styles.tabularRow}>

            <View style={styles.tabularColumn}>
            <Text style={styles.winMessage}>You win/tie by:</Text>
            {this.state.winningHands.slice(0,3).map((hand, i) => {
              return (
                <View key={i} style={styles.row}>
                  <Text>{hand.name}</Text>
                  <View style={{flex: 1}}></View>
                  <Text style={{fontWeight: 'bold'}}>{Math.floor(100*hand.probability)}%</Text>
                </View>
              );
            })}
            </View>

            <View style={styles.tabularColumn}>
            <Text style={styles.winMessage}>You lose to:</Text>
            {this.state.losingHands.slice(0,3).map((hand, i) => {
              return (
                <View key={i} style={styles.row}>
                  <Text>{hand.name}</Text>
                  <View style={{flex: 1}}></View>
                  <Text style={{fontWeight: 'bold'}}>{Math.floor(100*hand.probability)}%</Text>
                </View>
              );
            })}
            </View>
            </View>
        )}
          <TouchableHighlight onPress={this.nextQuestion.bind(this)}>
            <View style={[styles.button, {width: 150}]}>
              <Text style={styles.buttonText}>Next</Text>
            </View>
          </TouchableHighlight>
        </View>
      ):(
        <View style={{}}>
          <TouchableHighlight style={{flex: 1, minWidth: 320}} onPress={this.answer.bind(this)}>
            <View style={[styles.button, {flex: 1, marginHorizontal: 5}]}>
              <Text numberOfLines={1} style={styles.buttonText}>There's a{String(percent)[0]=='8'?'n':''} <Text style={styles.boldButtonText}>{percent}% chance</Text>.</Text>
            </View>
          </TouchableHighlight>

          <View style={styles.select}>
            <Slider
              onValueChange={(percent) => this.setState({percent})}
              style={styles.slider}
              maximumTrackTintColor="#1A090D"
              minimumTrackTintColor="#ACE894"
              minimumValue={0}
              maximumValue={100}
              value={this.state.percent}
            />
          </View>
        </View>
      )}
      </View>

      {this.state.popOver?(
        <View style={styles.cover}></View>
      ):[]}

      {this.state.popOver?(
        <View style={[styles.popover, {top: 0.5*windowHeight - 150}]}>

          <Text style={{fontSize: 24, textAlign: 'center'}}>Nice work! You've reached level {this.state.level}!</Text>

          <View style={styles.levelBadge}><Text style={styles.levelBadgeText}>{this.state.level}</Text></View>

          <TouchableHighlight onPress={this.hidePopover.bind(this)}>
            <View style={[styles.button, {width: 250}]}>
              <Text style={styles.buttonText}>Awesome!</Text>
            </View>
          </TouchableHighlight>
        </View>
      ):[]}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#848484',
  },
  table: {
    padding: 10,
    marginVertical: 20,
    flexDirection: 'row',
    backgroundColor: '#4A314D'
  },
  tableRow: {
    flex: 1
  },
  tableVelvet: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  hand: {
    backgroundColor: '#1A090D',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 10
  },
  question: {
    marginHorizontal: 20,
    backgroundColor: '#A8BA9A',
    paddingHorizontal: 20,
    paddingBottom: 15,
    paddingTop: 10,
    borderRadius: 10
  },
  questionText: {
    lineHeight: 35,
    fontSize: 24,
    color: '#4A314D'
  },
  points: {
    marginTop: -28,
    backgroundColor: 'white',
    paddingVertical: 5,
    paddingHorizontal: 5,
    borderRadius: 5,
    alignSelf: 'flex-end'
  },
  pointsText: {
    fontSize: 16,
    color: '#4A314D'
  },
  opponent: {
    marginLeft: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#A8BA9A',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5
  },
  opponentText: {
    fontSize: 16,
    color: '#4A314D'
  },
  opponentTextNumber: {
    fontSize: 32,
    color: '#4A314D'
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  select: {
    flexDirection: 'row',
    marginHorizontal: 20
  },
  slider: {
    height: 50,
    flex: 1,
    marginVertical: 20
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 3,
    backgroundColor: '#4A314D',
    shadowColor: '#333',
    shadowRadius: 2,
    shadowOpacity: 1,
    shadowOffset: { height: 1, width: 1 }
  },
  buttonText: {
    fontSize: 24,
    color: 'white',
    textAlign: 'center',
    flex: 1
  },
  boldButtonText: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold'
  },
  row: {
    flex: 1,
    marginHorizontal: 20,
    flexDirection: 'row',
    width: 130
  },
  tabularRow: {
    backgroundColor: '#A8BA9A',
    flexDirection: 'row',
    padding: 10,
    marginBottom: 20,
    marginTop: -20
  },
  tabularColumn: {
    flex: 1,
    flexDirection: 'column'
  },
  winMessage: {
    marginBottom: 10,
    fontStyle: 'italic'
  },
  popover: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    position: 'absolute',
    left: 0,
    right: 0,
    top: 200,
    padding:20
  },
  cover: {
    position: 'absolute',
    backgroundColor: 'black',
    opacity: 0.3,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },
  levelBadge: {
    width: 100,
    height: 100,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
    backgroundColor: '#FDCA40'
  },
  levelBadgeText: {
    fontSize: 64,
    backgroundColor: 'transparent',
    color: 'white'
  }
});

module.exports = Game;
