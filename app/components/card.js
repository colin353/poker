/*
  card.js
  @flow

  This component represents a playing card, or a placeholder for one
  which will eventually be revealed.
*/


import { Component } from 'react';
import {
  StyleSheet,
  View,
  Text
} from 'react-native';

// The card object represents a playing card which has been revealed.
class Card extends Component {
  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.cardText}>{this.props.card.repr().slice(0,-1)}</Text>
        <Text style={styles.cardText}>{this.props.card.repr().slice(-1)}</Text>
      </View>
    );
  }
}

// The CardPlaceholder represents a card which hasn't been dealt/revealed yet.
class CardPlaceholder extends Component {
  render() {
    return (
      <View style={styles.placeholder}></View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 5,
    width: 50,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#AAA',
    margin: 5
  },
  placeholder: {
    borderRadius: 5,
    width: 50,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderStyle: 'dotted',
    borderColor: '#A8BA9A',
    margin: 5
  },
  cardText: {
    fontSize: 24,
    width: 48,
    textAlign: 'center'
  }
});

module.exports = {
  Card,
  CardPlaceholder
};
