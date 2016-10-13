/*
  home.js
  @flow

  This page lets the user click "start" before being thrown into the quiz. Also,
  if it's the user's first time, they get a brief tutorial.
*/

import React, { Component } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  View,
  Dimensions,
  Text,
  Image
} from 'react-native';

class Home extends Component {
  state: {
    level: number,            // which level the user is
    savedGameExists: boolean  // whether the user has played before.
  }
  constructor(props: any) {
    super(props);

    this.state = {
      level: 0,
      savedGameExists: false
    };
  }

  // When the page mounts, we'll load the game state. If the user is advanced
  // beyond zero points on level 1, we'll give them the tutorial.
  componentWillMount() {
    this.props.gameState.load().then(() => {
      if(this.props.gameState.score > 0 || this.props.gameState.level > 1)
        this.setState({
          savedGameExists: true,
          level: this.props.gameState.level
        });
    });
  }

  render() {
    var {height, width} = Dimensions.get('window');
    return (
      <View style={styles.container}>
        <View style={styles.title}>
          <Text style={styles.titleText}>Solo</Text>
          <Text style={styles.subtitle}>"always tell me the odds!"</Text>
        </View>

        <TouchableOpacity style={{marginTop: height*0.5-170}} onPress={this.state.savedGameExists?this.props.startGame:this.props.startIntro}>
          {!this.state.savedGameExists?(
            <View style={styles.newGame}>
              <Text style={styles.newGameText}>Start new game</Text>
            </View>
          ):(
            <View style={styles.existingGame}>
              <View style={styles.medal}>
                <Image style={{width: 50, height: 65}} source={require('../../assets/medal.png')} />
                <Text style={styles.levelText}>{this.state.level}</Text>
              </View>
              <View>
                <Text style={styles.existingGameText}>Continue</Text>
                <Text style={styles.existingGameSubText}>Level {this.state.level}</Text>
              </View>
            </View>
          )}
        </TouchableOpacity>
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
  existingGame: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
    marginLeft: 20,
    marginRight: 20,
    borderRadius: 5,
    shadowColor: '#333',
    shadowRadius: 2,
    shadowOpacity: 1,
    shadowOffset: { height: 1, width: 1 }
  },
  existingGameText: {
    fontSize: 24,
    fontWeight: "600",
    color: 'black'
  },
  newGameText: {
    fontSize: 24,
    color: 'white'
  },
  medal: {
    marginRight: 80,
    marginTop: -10
  },
  levelText: {
    fontWeight: "600",
    textAlign: 'center',
    fontSize: 32,
    marginTop: -59,
    backgroundColor: 'transparent'
  },
  existingGameSubText: {
    fontSize: 16,
    color: "#888",
    textAlign: 'center'
  }
});

module.exports = Home;
