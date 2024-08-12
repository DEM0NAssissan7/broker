/* Kinds of cards: i.e 2, 3, ..., J, Q, K, A */
const TWO = 2;
const THREE = 3;
const FOUR = 4;
const FIVE = 5;
const SIX = 6;
const SEVEN = 7;
const EIGHT = 8;
const NINE = 9;
const TEN = 10;
const J = 11;
const Q = 12;
const K = 13;
const A = 14;
function kind_to_string(kind) {
    if(kind >= TWO && kind <= TEN)
        return kind + "";
    switch(kind) {
        case J:
            return "J";
        case Q:
            return "Q";
        case K:
            return "K";
        case A:
            return "A";
    }
}

/* Suits: Spades, Diamonds, Hearts, Clubs */
const HEARTS = 1;
const CLUBS = 2;
const DIAMONDS = 3;
const SPADES = 4;
function suit_to_string(suit) {
    switch(suit) {
        case HEARTS:
            return "Hearts";
        case CLUBS:
            return "Clubs";
        case DIAMONDS:
            return "Diamonds";
        case SPADES:
            return "Spades";
    }
}

/* Ranks: Types of wins */
const HIGH_CARD = 0;
const PAIR = 1;
const TWO_PAIR = 2;
const THREE_OF_A_KIND = 3;
const STRAIGHT = 4;
const FLUSH = 5;
const FULL_HOUSE = 6;
const FOUR_OF_A_KIND = 7;
const STRAIGHT_FLUSH = 8;
const ROYAL_FLUSH = 9;

function clone_card_array(array) {
    let retval = [];
    for(let i of array)
        retval.push(new Card(i.kind, i.suit));
    return retval;
}

class Card {
    constructor(kind, suit) {
        this.kind = kind;
        this.suit = suit;
    }
    toString() {
        return kind_to_string(this.kind) + " of " + suit_to_string(this.suit);
    }
}

class Hand {
    constructor(cards) {
        this.cards = cards;
        this.value = this.get_value();
    }
    clone() {
        let cards = [];
        for(let card of this.cards)
            cards.push(new Card(card.kind, card.suit));
        return new Hand(cards);
    }
    get_value() {
        let rank = HIGH_CARD;
        let score = this.highest();
        let test = (_rank, val) => {
            if (val) {
                rank = _rank;
                score = val;
            }
        }
        let old_cards = clone_card_array(this.cards);
        test(PAIR, this.pair());
        test(TWO_PAIR, this.two_pair());
        test(THREE_OF_A_KIND, this.three_of_a_kind());
        test(STRAIGHT, this.straight());
        test(FLUSH, this.flush());
        test(FULL_HOUSE, this.full_house());
        test(FOUR_OF_A_KIND, this.four_of_a_kind());
        test(STRAIGHT_FLUSH, this.straight_flush());
        test(ROYAL_FLUSH, this.royal_flush());
        this.cards = old_cards;
        return {
            rank: rank,
            score: score
        }
    }
    update() {
        this.value = this.get_value();
    }
    is_better_hand(hand) {
        this.update();
        hand.update();
        if(this.value.rank > hand.value.rank)
            return true;
        if(this.value.rank < hand.value.rank)
            return false;
        // If it reaches this point, both hands have the same value. No need for an if condition
        if(this.value.score > hand.value.score)
            return true;
        if(this.value.score < hand.value.score)
            return null;
        return false;
    }

    highest() {
        let score = 0;
        for (let card of this.cards)
            if (card.kind > score)
                score = card.kind;
        return score;
    }
    get_matches() {
        let kinds = [];
        let matches = [];
        for (let i = 0; i < A; i++)
            matches[i] = 0;

        for (let card of this.cards) {
            for (let kind of kinds) {
                if (kind === card.kind)
                    matches[kind] = matches[kind] + 1;
            }
            if (!matches[card.kind])
                kinds.push(card.kind); // The card has a match in the table, so we put it in the kinds array
        }
        return matches;
    }
    common_kinds(count) {
        let score = 0;
        let matches = this.get_matches();
        // Find the score
        for (let kind = TWO; kind < matches.length; kind++) {
            let match_count = matches[kind];
            if (match_count >= count)
                score = kind;
        }
        return score;
    }
    pair() {
        return this.common_kinds(1);
    }
    two_pair() {
        let score = 0;
        let matches = this.get_matches();

        for (let i = 0; i < matches.length; i++) {
            let kind = i;
            let match_count = matches[i];
            if (match_count >= 1)
                score += kind;
        }
        return score;
    }
    three_of_a_kind() {
        return this.common_kinds(2);
    }
    straight() {
        let sorted_cards = this.cards.sort((a, b) => a.kind - b.kind);
        let val = 0;
        for (let card of sorted_cards) {
            if (!val) {
                val = card.kind;
                continue;
            }
            val++;
            if (card.kind !== val)
                return 0;
        }
        return this.highest();
    }
    flush() {
        let suit = 0;
        for (let card of this.cards) {
            if (!suit) {
                suit = card.suit;
                continue;
            }
            if (suit !== card.suit)
                return 0;
        }
        return this.highest();
    }
    full_house() {
        let score = 0;
        let matches = this.get_matches();
        let threshold = 1;

        for (let i = 0; i < matches.length; i++) {
            let kind = i;
            let match_count = matches[i];
            if (match_count === threshold) {
                score += kind;
                threshold++;
                break;
            }
        }
        if(!score)
            return 0;

        let success = false;
        for (let i = 0; i < matches.length; i++) {
            let kind = i;
            let match_count = matches[i];
            if (match_count === threshold) {
                score += kind;
                success = true;
            }
        }
        if(success)
            return score;
        return 0;
    }
    four_of_a_kind() {
        return this.common_kinds(3);
    }
    straight_flush() {
        if (this.straight() && this.flush())
            return this.highest();
        return 0;
    }
    royal_flush() {
        if (this.straight_flush())
            if (this.highest() === A)
                return 1;
        return 0;
    }
}

/* RNG Shuffle Algorithm */
function shuffle(array) {
    let currentIndex = array.length;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {

        // Pick a remaining element...
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }
}

/* Deck */
let deck = [];
function create_deck() {
    deck = [];
    for (let suit = HEARTS; suit <= SPADES; suit++) {
        for (let kind = TWO; kind <= A; kind++) {
            deck.push(new Card(kind, suit));
        }
    }
    shuffle(deck); // Shuffle the deck after creation
    return deck;
}
function _draw() {
    if(deck.length === 0) {
        throw new Error("Deck is completely empty.");
    }
    let card = deck[0];
    deck.splice(0, 1);
    return card;
}

/* Players */
class Player {
    constructor(skip_draw) {
        if(!skip_draw) {
            this.card1 = _draw();
            this.card2 = _draw();
            this.hand = new Hand([this.card1, this.card2]);
        } else {
            this.card1 = null;
            this.card2 = null;
            this.hand = new Hand([]);
        }
        this.bet = 0;
        this.id = players.length;
    }
    add_card(card) {
        if(this.hand.cards.length === 2) return;
        if(!this.card1)
            this.card1 = card;
        else
            this.card2 = card;
        this.hand.cards.push(card);
        this.hand.update();
    }
    remove_card() {
        if(this.hand.cards.length === 0) return;
        if(this.card2)
            this.card2 = null;
        else
            this.card1 = null;
        this.hand.cards.splice(this.hand.cards.length - 1, 1);
        this.hand.update();
    }
    test_hand(_hand_) {
        let _hand = _hand_.clone();
        for(let i = 0; i < _hand.cards.length; i++) {
            for(let j = 0; j < _hand.cards.length; j++) {
                let hand = _hand_.clone();
                hand.cards[i] = this.card1;
                hand.cards[j] = this.card2;
                hand.update();
                if(hand.is_better_hand(_hand))
                    _hand = hand;
            }
        }
        return _hand;
    }
    best_hand() {
        let hand = community_hand.clone();
        // Normalize input to 5
        if(hand.cards.length < 5)
            for(let i = 0; i < 5 - hand.cards.length; i++)
                hand.cards.push(deck[i]);
        hand.update();
        let best_hand = this.test_hand(hand);
        return best_hand;
    }
}

/* Game manager */
let community_hand = new Hand([]);
let players = [];
let stage = 0;

function start_game(num_of_players) {
    for(let i = 0; i < num_of_players; i++) {
        players.push(new Player());
    }
}
function finish_game() {

}
function find_best_player() {
    let player = players[0];
    for(let i = 1; i < players.length; i++) {
        let next_player = players[i];
        if(next_player.hand.is_better_hand(player.hand))
            player = next_player;
    }
    return player;
}
function next_round() {
    stage++;
    switch (stage) {
        case 1:
            community_hand.cards = [_draw(), _draw(), _draw()];
            break;
        case 2:
        case 3:
            community_hand.cards.push(_draw());
            break;
        case 4:
            finish_game();
            break;
    }
    community_hand.update();
}