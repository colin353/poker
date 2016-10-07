/*
  header.js
  @flow

  Header which shows the current level and score. It also does animations when
  the score changes.
*/

import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Animated,
} from 'react-native';

type Props = {
  // The progress is the amount of points that you have for the current
  // level. You need 1000 points to complete a level.
  progress: number
};

class Header extends Component {
  state: {
    progress: Animated.Value,
    progressTextAnimator: Animated.Value,
    progressText: string
  }
  animationInProgress: Animated.Timing

  constructor(props: Props) {
    super(props);
    this.state = {
      progress            : new Animated.Value(this.props.progress),
      progressTextAnimator: new Animated.Value(this.props.progress),
      progressText        : Math.ceil(this.props.progress*1000).toString()
    };

    // As the progress animation unfolds, update the text as well as
    // the length of the progress bar.
    this.state.progressTextAnimator.addListener((result) => {
      this.setState({progressText: Math.ceil(result.value*1000).toString()});
    });
  }

  // When the progress changes, we'll receive an update to the
  // props through componentWillReceiveProps.
  componentWillReceiveProps(props: Props) {
    // We'll start a new animation in response to the new progress.
    this.animationInProgress = Animated.timing(
      this.state.progress, {
        toValue: props.progress,
        duration: 150
    });
    this.animationInProgress.start();

    // We'll also run an animation of the text changes.
    var textAnimation = Animated.timing(
      this.state.progressTextAnimator, {
        toValue: props.progress,
        duration: 1000
    });
    textAnimation.start();
  }

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.labelBadge}>
          <Text style={styles.labelBadgeText}>{this.props.level}</Text>
        </View>
        <View style={styles.progressContainer}>
          <Text style={styles.textProgress}>{this.state.progressText}/1000</Text>
          <Animated.View
            style={[
              styles.progress,
              { width: this.state.progress.interpolate({
                  inputRange  : [0, 1],
                  outputRange : [0, 275]
                })
              }]
            }>
            </Animated.View>
        </View>
      </View>
    );
  }
}

Header.propTypes = {
  progress: React.PropTypes.number.isRequired
};

const styles = StyleSheet.create({
  container: {
    height: 75,
    paddingTop: 30,
    backgroundColor: '#848484',
    flexDirection: 'row',
    alignItems: 'flex-end'
  },
  labelBadge: {
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
  },
  progressContainer: {
    flexDirection: 'column',
    width: 300,
    height: 30,
    marginLeft: 10,
    marginBottom: 5,
    borderLeftWidth: 1
  },
  progress: {
    marginTop: 10,
    height: 10,
    backgroundColor: '#FDCA40'
  },
  textProgress: {
    fontWeight: 'bold',
    marginLeft: 10,
    fontSize: 12,
    marginBottom: -5
  }
});

module.exports = Header;
