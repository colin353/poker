/*
  intro.js
  @flow

  Intro page, which gives a brief tutorial on the app.
*/

import React, { Component } from 'react';
import {
  TouchableHighlight,
  StyleSheet,
  View,
  Slider,
  Text,
  Dimensions
} from 'react-native';

import InstructionCard from '../components/instructioncard';
import { Card } from '../components/card';
import Poker from '../poker';

class Intro extends Component {
  state: {
    page: number,
    percent: number
  };
  cards: Array<Poker.Card>;

  constructor(props: any) {
    super(props);
    this.state = {
      page: 0,
      percent: 30
    };
    this.cards = Poker.makeCards("AS JD");
  }

  renderCard(index: number) {
    var smallMode = Dimensions.get('window').height < 600;

    return [(
      <InstructionCard level={1}>
        <View style={styles.cards}>
          {this.cards.map((c, i) => {
            return <Card key={i} card={c} />;
          })}
        </View>
        <Text style={[styles.instructionText, smallMode?{fontSize: 20}:{}]}>
          Train yourself to evaluate the strength
          of a poker hand.
        </Text>
      </InstructionCard>
    ),(
      <InstructionCard level={2}>
        <View style={styles.question}>
          <Text style={styles.questionText}>
            What's the probability that you'll win?
          </Text>
        </View>
        <Text style={[styles.instructionText, smallMode?{fontSize: 20}:{}]}>
          You'll be asked a question about probabilities.
        </Text>
      </InstructionCard>
    ),(
      <InstructionCard level={3}>
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
        <Text style={[styles.instructionText, smallMode?{marginTop: -20,fontSize: 20}:{}]}>
          Use the slider to enter your answer.
        </Text>
      </InstructionCard>
    )][index];
  }

  pressNext() {
    if(this.state.page == 2) this.props.startGame();
    else this.setState({page: this.state.page+1});
  }

  render() {
    return (
      <View style={styles.container}>
        {this.renderCard(this.state.page)}

        <View style={styles.buttonContainer}>
        <TouchableHighlight onPress={this.pressNext.bind(this)} style={{flex: 1, marginHorizontal: 20}}>
          <View style={styles.button}>
            <Text style={styles.buttonText}>{this.state.page==2?"Let's go!":"Next"}</Text>
          </View>
        </TouchableHighlight>
        </View>
      </View>
    );
  }
}

Intro.propTypes = {
  startGame: React.PropTypes.func.isRequired
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#6B6570",
    flex: 1,
    justifyContent: 'center'
  },
  cards: {
    marginTop: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20
  },
  instructionText: {
    fontSize: 30,
    marginTop: 20
  },
  buttonContainer: {
    marginTop: 60,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  button: {
    flex: 1,
    justifyContent: 'center',
    flexDirection: 'row',
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
    textAlign: 'center'
  },
  question: {
    marginTop: 40,
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
  select: {
    marginTop: 50,
    marginBottom: 50,
    flexDirection: 'row',
    marginHorizontal: 20
  },
  slider: {
    height: 50,
    flex: 1,
    marginVertical: 20
  }
});

module.exports = Intro;
