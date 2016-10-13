/*
  instructioncard.js
  @flow

  Shows an instruction on how to play the game.
*/

import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions
} from 'react-native';

class InstructionCard extends Component {
  constructor(props: any) {
    super(props);
  }

  render() {
    var smallMode = Dimensions.get('window').height < 600;
    return (
      <View style={[styles.container, smallMode?{height: 300}:{}]}>
        <View style={styles.labelBadge}>
          <Text style={styles.labelBadgeText}>{this.props.level}</Text>
        </View>
        {this.props.children}
      </View>
    );
  }
}

InstructionCard.propTypes = {
  level: React.PropTypes.number.isRequired
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#C4C4C4",
    marginLeft: 20,
    marginRight: 20,
    height: 400,
    borderRadius: 5,
    paddingHorizontal: 20,
    shadowColor: '#333',
    shadowRadius: 2,
    shadowOpacity: 1,
    shadowOffset: { height: 1, width: 1 }
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
    marginLeft: 0
  },
  labelBadgeText: {
    fontSize: 18,
    textAlign: 'center',
    fontWeight: 'bold',
  }
});

module.exports = InstructionCard;
