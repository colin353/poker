/*
  instructioncard.js

  Shows an instruction on how to play the game.
*/

import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text
} from 'react-native';

class InstructionCard extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.labelBadge}>
          <Text style={styles.labelBadgeText}>1</Text>
        </View>
        {this.props.children}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#C4C4C4",
    marginLeft: 20,
    marginRight: 20,
    height: 400,
    borderRadius: 5
  },
  labelBadge: {
    marginTop: 10,
    padding: 10,
    borderRadius: 5,
    backgroundColor: 'white',
    width: 50,
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
    marginLeft: 20
  },
  labelBadgeText: {
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  }
});

module.exports = InstructionCard;
