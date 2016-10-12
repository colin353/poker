/*
  home.js

  @flow
*/

import React, { Component } from 'react';
import {
  TouchableHighlight,
  StyleSheet,
  View,
  Text
} from 'react-native';

class Home extends Component {
  render() {
    return (
      <View style={styles.container}>
        <View style={styles.title}>
          <Text style={styles.titleText}>Solo</Text>
          <Text style={styles.subtitle}>"always tell me the odds!"</Text>
        </View>

        <TouchableHighlight onPress={this.props.startGame}>
          <View style={styles.newGame}>
            <Text style={styles.newGameText}>Start new game</Text>
          </View>
        </TouchableHighlight>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#6B6570",
    flex: 1
  },
  title: {
    flexDirection: 'column',
    backgroundColor: '#4A314D',
    alignItems: 'center',
    justifyContent: 'center',
    height: 150,
    marginTop: 50
  },
  titleText: {
    color: 'white',
    fontSize: 64,
    fontWeight: "600"
  },
  subtitle: {
    fontSize: 20,
    marginTop: 5,
    color: '#AAA',
    fontStyle: 'italic'
  },
  newGame: {
    marginTop: 200,
    alignItems: 'center',
    justifyContent: 'center',
    height: 100,
    marginLeft: 20,
    marginRight: 20,
    borderWidth: 3,
    borderRadius: 5,
    borderColor: '#AAA',
    borderStyle: 'dashed'
  },
  newGameText: {
    fontSize: 24,
    color: 'white'
  }
});

module.exports = Home;
