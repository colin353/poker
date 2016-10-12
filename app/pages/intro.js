/*
  intro.js

  Intro page, which gives a brief tutorial on the app.
*/

import React, { Component } from 'react';
import {
  TouchableHighlight,
  StyleSheet,
  View,
  Text
} from 'react-native';

import InstructionCard from '../components/instructioncard';

class Intro extends Component {
  state: {
    page: number
  };

  constructor(props) {
    super(props);
    this.state = {
      page: 0
    };
  }

  render() {
    return (
      <View style={styles.container}>
        <InstructionCard />

        <TouchableHighlight onPress={this.props.startGame}>
          <View style={[styles.button, {width: 150}]}>
            <Text style={styles.buttonText}>Next</Text>
          </View>
        </TouchableHighlight>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#6B6570",
    paddingTop: 100,
    flex: 1,
    justifyContent: 'center'
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
    textAlign: 'center'
  }
});

module.exports = Intro;
