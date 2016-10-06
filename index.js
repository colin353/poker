"use strict";
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var react_1 = require('react');
var react_native_1 = require('react-native');
var State = require('./app/game/state');
var Poker = require('./app/poker.ts');
var GenerateQuestion = require('./app/game/questions');
var card_1 = require('./app/components/card');
var Header = require('./app/components/header');
var poker_app = (function (_super) {
    __extends(poker_app, _super);
    function poker_app(props) {
        _super.call(this, props);
        this.state = {
            question: "",
            table: [],
            player: { cards: [] },
            players: 2,
            percent: 0,
            showAnswer: false,
            winningHands: [],
            losingHands: [],
            points: 0,
            level: 0,
            popOver: false
        };
        this.question = null;
        this.gameState = null;
    }
    poker_app.prototype.componentDidMount = function () {
        var _this = this;
        this.gameState = new State();
        this.gameState.load().then(function () {
            console.log("game state:", _this.gameState);
            _this.setState({
                level: _this.gameState.level,
                points: _this.gameState.score
            });
            _this.generateQuestion();
        });
    };
    poker_app.prototype.generateQuestion = function (level) {
        if (level === void 0) { level = this.state.level; }
        this.question = GenerateQuestion(level);
        this.setState(this.question.question);
        this.setState({
            showAnswer: false,
        });
        this.gameState.save();
    };
    poker_app.prototype.answer = function () {
        this.setState(this.question.answer);
        var pointsWon = this.question.getScore(Math.round(this.state.percent / 5) * 5, this.state.level);
        if (this.state.points + pointsWon > 1000) {
            this.gameState.score += pointsWon - 1000;
            this.gameState.level += 1;
            this.setState({ popOver: true });
        }
        else if (this.state.points + pointsWon < 0) {
            if (this.state.points > 0 || this.gameState.level == 1)
                this.gameState.score = 0;
            else {
                this.gameState.score += 1000 + pointsWon;
                this.gameState.level = Math.max(1, this.gameState.level - 1);
            }
        }
        else {
            this.gameState.score += pointsWon;
        }
        this.setState({
            showAnswer: true,
            pointsWon: pointsWon,
            points: this.gameState.score,
            level: this.gameState.level
        });
        this.gameState.save();
    };
    poker_app.prototype.hidePopover = function () {
        this.setState({ popOver: false });
    };
    poker_app.prototype.nextQuestion = function () {
        this.generateQuestion(this.gameState.level);
    };
    poker_app.prototype.render = function () {
        var _this = this;
        var percent = Math.round(this.state.percent / 5) * 5;
        return (react_1.default.createElement(react_native_1.View, {style: { flexDirection: 'column', flex: 1 }}, 
            react_1.default.createElement(Header, {progress: this.state.points / 1000, level: this.state.level}), 
            react_1.default.createElement(react_native_1.View, {style: styles.container}, 
                react_1.default.createElement(react_native_1.View, {style: styles.question}, 
                    react_1.default.createElement(react_native_1.Text, {style: styles.questionText}, this.state.question), 
                    this.state.pointsWon ? (react_1.default.createElement(react_native_1.View, {style: styles.points}, 
                        react_1.default.createElement(react_native_1.Text, {style: styles.pointsText}, 
                            Math.sign(this.state.pointsWon) == -1 ? "-" : "+", 
                            Math.floor(Math.abs(this.state.pointsWon)), 
                            " point", 
                            this.state.pointsWon == 1 ? '.' : 's.')
                    )) : []), 
                react_1.default.createElement(react_native_1.View, {style: styles.table}, 
                    react_1.default.createElement(react_native_1.View, {style: styles.tableRow}, 
                        react_1.default.createElement(react_native_1.View, {style: styles.tableVelvet}, 
                            this.state.table.map(function (card, i) {
                                return react_1.default.createElement(card_1.Card, {key: i, card: card});
                            }), 
                            Array(5 - this.state.table.length).fill().map(function (_, i) {
                                return react_1.default.createElement(card_1.CardPlaceholder, {key: i});
                            })), 
                        react_1.default.createElement(react_native_1.View, {style: { height: 10 }}), 
                        react_1.default.createElement(react_native_1.View, {style: styles.tableVelvet}, 
                            this.state.player.cards.map(function (card, i) {
                                return react_1.default.createElement(card_1.Card, {key: i, card: card});
                            }), 
                            react_1.default.createElement(react_native_1.View, {style: styles.opponent}, 
                                react_1.default.createElement(react_native_1.Text, {style: styles.opponentText}, "with"), 
                                react_1.default.createElement(react_native_1.Text, {style: styles.opponentTextNumber}, this.state.players), 
                                react_1.default.createElement(react_native_1.Text, {style: styles.opponentText}, 
                                    "player", 
                                    this.state.players == 1 ? '' : 's'))))
                ), 
                this.state.showAnswer ? (react_1.default.createElement(react_native_1.View, {style: { alignItems: 'center', justifyContent: 'center' }}, 
                    react_1.default.createElement(react_native_1.View, {style: styles.tabularRow}, 
                        react_1.default.createElement(react_native_1.View, {style: styles.tabularColumn}, 
                            react_1.default.createElement(react_native_1.Text, {style: styles.winMessage}, "You win/tie by:"), 
                            this.state.winningHands.slice(0, 3).map(function (hand, i) {
                                return (react_1.default.createElement(react_native_1.View, {key: i, style: styles.row}, 
                                    react_1.default.createElement(react_native_1.Text, null, hand.name), 
                                    react_1.default.createElement(react_native_1.View, {style: { flex: 1 }}), 
                                    react_1.default.createElement(react_native_1.Text, {style: { fontWeight: 'bold' }}, 
                                        Math.floor(100 * hand.probability), 
                                        "%")));
                            })), 
                        react_1.default.createElement(react_native_1.View, {style: styles.tabularColumn}, 
                            react_1.default.createElement(react_native_1.Text, {style: styles.winMessage}, "You lose to:"), 
                            this.state.losingHands.slice(0, 3).map(function (hand, i) {
                                return (react_1.default.createElement(react_native_1.View, {key: i, style: styles.row}, 
                                    react_1.default.createElement(react_native_1.Text, null, hand.name), 
                                    react_1.default.createElement(react_native_1.View, {style: { flex: 1 }}), 
                                    react_1.default.createElement(react_native_1.Text, {style: { fontWeight: 'bold' }}, 
                                        Math.floor(100 * hand.probability), 
                                        "%")));
                            }))), 
                    react_1.default.createElement(react_native_1.TouchableHighlight, {onPress: this.nextQuestion.bind(this)}, 
                        react_1.default.createElement(react_native_1.View, {style: [styles.button, { width: 150 }]}, 
                            react_1.default.createElement(react_native_1.Text, {style: styles.buttonText}, "Next")
                        )
                    ))) : (react_1.default.createElement(react_native_1.View, null, 
                    react_1.default.createElement(react_native_1.TouchableHighlight, {onPress: this.answer.bind(this)}, 
                        react_1.default.createElement(react_native_1.View, {style: [styles.button, { width: 320 }]}, 
                            react_1.default.createElement(react_native_1.Text, {style: styles.buttonText}, 
                                "There's a", 
                                String(percent)[0] == '8' ? 'n' : '', 
                                " ", 
                                react_1.default.createElement(react_native_1.Text, {style: styles.boldButtonText}, 
                                    percent, 
                                    "% chance"), 
                                ".")
                        )
                    ), 
                    react_1.default.createElement(react_native_1.View, {style: styles.select}, 
                        react_1.default.createElement(react_native_1.Slider, {onValueChange: function (percent) { return _this.setState({ percent: percent }); }, style: styles.slider, maximumTrackTintColor: "#1A090D", minimumTrackTintColor: "#ACE894", minimumValue: 0, maximumValue: 100, value: this.state.percent})
                    )))), 
            this.state.popOver ? (react_1.default.createElement(react_native_1.View, {style: styles.cover})) : [], 
            this.state.popOver ? (react_1.default.createElement(react_native_1.View, {style: styles.popover}, 
                react_1.default.createElement(react_native_1.Text, {style: { fontSize: 24, textAlign: 'center' }}, 
                    "Nice work! You've reached level ", 
                    this.state.level, 
                    "!"), 
                react_1.default.createElement(react_native_1.View, {style: styles.levelBadge}, 
                    react_1.default.createElement(react_native_1.Text, {style: styles.levelBadgeText}, this.state.level)
                ), 
                react_1.default.createElement(react_native_1.TouchableHighlight, {onPress: this.hidePopover.bind(this)}, 
                    react_1.default.createElement(react_native_1.View, {style: [styles.button, { width: 250 }]}, 
                        react_1.default.createElement(react_native_1.Text, {style: styles.buttonText}, "Awesome!")
                    )
                ))) : []));
    };
    return poker_app;
}(react_1.Component));
var styles = react_native_1.StyleSheet.create({
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
        textAlign: 'center'
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
        padding: 20
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
react_native_1.AppRegistry.registerComponent('poker_app', function () { return poker_app; });
