/* The reason i created this project: this is a program that, when you plug in the numbers, attempts to create the highest probability of consistently
winning in poker (or not depending on what you want)

You can adjust how safely it plays
You start by configuring the program with your buy-in, stakes, and player count
You can add and remove players on the fly as the game changes



Controls:

> Kinds
2-9: Two -> Nine
0: Ten
j: Jack
q: Queen
k: King
a: Ace

> Suits
h: Hearts
c: Clubs
d: Diamonds
s: Spades

> General
Backspace: reset current command OR undo last created card
b: Bet mode - input the current bet

p: Remove player
P: add player

*/

let card_suit = 0;
let card_kind = 0;

let self_player = new Player(true);
self_player.is_self = true;

let win_probabilities = [];
let win_chance = 0;

let player_count = 0;

let buyin = 0;
let stakes = 0;
let bet_mode = false;
let bet;

function remove_from_deck(_card) {
    for (let i = 0; i < deck.length; i++) {
        let card = deck[i];
        if (card.suit === _card.suit && card.kind === _card.kind) {
            deck.splice(i, 1);
        }
    }
}
function add_to_deck(card) {
    deck.push(card);
}

document.addEventListener("keydown", e => {
    console.log("Key:", e.key);
    switch (e.key) {

        // Kinds
        case "2":
        case "@":
            card_kind = TWO;
            break;
        case "3":
        case "#":
            card_kind = THREE;
            break;
        case "4":
        case "$":
            card_kind = FOUR;
            break;
        case "4":
        case "$":
            card_kind = FOUR;
            break;
        case "5":
        case "%":
            card_kind = FIVE;
            break;
        case "6":
        case "^":
            card_kind = SIX;
            break;
        case "7":
        case "&":
            card_kind = SEVEN;
            break;
        case "8":
        case "*":
            card_kind = EIGHT;
            break;
        case "9":
        case "(":
            card_kind = NINE;
            break;
        case "0":
        case ")":
            card_kind = TEN;
            break;
        case "j":
        case "J":
            card_kind = J;
            break;
        case "q":
        case "Q":
            card_kind = Q;
            break;
        case "k":
        case "K":
            card_kind = K;
            break;
        case "a":
        case "A":
            card_kind = A;
            break;

        // Suits
        case "h":
        case "H":
            card_suit = HEARTS;
            break;
        case "c":
        case "C":
            card_suit = CLUBS;
            break;
        case "d":
        case "D":
            card_suit = DIAMONDS;
            break;
        case "s":
        case "S":
            card_suit = SPADES;
            break;

        // Players
        case "P":
        case "=":
            player_count++;
            players.push(new Player(true));
            break;
        case "p":
        case "-":
            player_count--;
            if (player_count < 0)
                player_count = 0;
            else
                players.splice(0, 1);
            break;

        case "Backspace":
            if (card_suit || card_kind) {
                card_suit = 0;
                card_kind = 0;
                break;
            }
            let card;
            if (community_hand.cards.length > 0) {
                card = community_hand.cards[community_hand.cards.length - 1];
                community_hand.cards.splice(community_hand.cards.length - 1, 1);
            } else if (self_player.hand.cards.length > 0) {
                card = self_player.remove_card();
            }
            remove_from_deck(card)
            add_to_deck(card);
            break;
        
        case "Enter":
            update_success_score();
            break;

        // Betting
        case "b":
            if (!bet_mode)
                bet_mode = true;
            else
                bet_mode = false;
    }
    if (card_kind && card_suit) {
        let card = new Card(card_kind, card_suit);
        console.log(card.toString())
        if (self_player.hand.cards.length < 2)
            self_player.add_card(card);
        else if (community_hand.cards.length < 5)
            community_hand.cards.push(card);
        remove_from_deck(card);
        community_hand.update();
        card_kind = 0;
        card_suit = 0;
    }
});


function draw() {
    background(127)
    textSize(12);

    // Own hand
    draw_hand(self_player.hand, width / 2 - card_width, height * 0.7);

    // Community Cards
    draw_hand(community_hand, width / 2 - card_width * 2.5, height * 0.3);

    fill(0);
    textSize(22);
    text("Players: " + player_count, width - 140, 40)
    text("Success Probability: " + Math.round(success_score * 10) / 10, width - 300, height - 40)
}

/* This is where the magic happens:

    I need to figure out some way to determine the most likely course of
    events based on the known cards. Then, the program assigns a success
    score that acts as a scale where 0 is absolutely no possibility of success
    and 100 is a guaranteed win. Obviously, poker will not allow either of those
    to happen becuase there is always an element of uncertainty.

    In the future, I want to use my AI library to figure out the best move based
    on the actions of other players, but that would certainly be a much larger and
    more complicated project than this. But this is a good place to start.

    The program will go through *literally* every single possibile future play and see what
    percentage of them end up in the player succeeding. This is a very solid way to
    figure out the advantage that the player holds.

    Here is the method:
    1. Give the other players some cards from the deck
    2. Fill the rest of the community cards with some of what is left
    3. Determine if the player wins or loses
    4. Swap exactly one card with another card
    5. Repeat until the entire deck has been tested
*/

let success_score;
function update_success_score() {
    success_score = get_success_score();
}

function get_success_score() {

    // To help make the performance not total garbage, the
    // deck will be normalized to whatever is needed on the draw
    let _deck = clone_card_array(deck);
    let remaining_cards = 5 - community_hand.cards.length;
    let needed_cards = (players.length * 2) + remaining_cards;
    _deck = _deck.slice(0, needed_cards);

    let wins = 0;
    let runs = 0;
    const deck_limit = 13000;
    
    // Add own player
    players.push(self_player)

    let deck_index = needed_cards;
    let get_card = () => {
        deck_index++;
        if(deck_index >= deck.length) {
            deck_index = 1;
        }
        return deck[deck_index - 1];
    }

    // Create all possible future decks
    let decks = [];
    for(let i = 0; i < 10004; i++) {
        let array = clone_card_array(_deck);
        for(let j = 0; j < needed_cards; j++)
            array[j] = get_card();
        decks.push(array);
    }
    console.log(decks)

    for (let i = 0; i < decks.length; i++) {
        if (is_win(decks[i], remaining_cards))
            wins++;
    }

    players.splice(players.length - 1, 1);

    return (wins / decks.length) * 100;
}

/* Here is how we test the probability of a win:

1. For a high card, we calculate the probability that another player has a higher card than the player.
    a. ([num of higher cards] / [size of deck]) * 
*/

function get_win_percentage(rank) {
    let chance = 0;
    let cards_drawn = 0;
    let losing_cards = 0;
    let score = self_player.rank_score(rank);;
    // This function assumes the community cards and self cards are populated
    switch(rank) {
        case HIGH_CARD:
            for(let card of deck)
                if(card.kind > score)
                    losing_cards++;
            
            // Find the probability that a higher card will be drawn by a player
            if(!score) return 0;
            for(let i = 0; i < players.length; i++) {
                for(let j = 0; j < 2; j++) { // Drawing two cards
                    cards_drawn++;
                    chance += (deck.length - cards_drawn);
                }
            }
            if(chance) chance = (losing_cards * players.length * 2) / chance;
            return Math.max(1 - chance, 0);

        case PAIR:
            let possible_cards = [];
            for(let card of community_hand.cards) {
                if(card.kind > score)
                    possible_cards.push(card);
            }
            for(let card of deck) {
                for(let _card of possible_cards) {
                    if(card.kind === _card.kind) {
                        losing_cards++;
                    }
                }
            }
            console.log("Losing cards: ", losing_cards);

            if(!score) return 0;
            for(let i = 0; i < players.length; i++) {
                for(let j = 0; j < 2; j++) { // Drawing two cards
                    cards_drawn++;
                    chance += (deck.length - cards_drawn);
                }
            }
            if(chance) chance = (losing_cards * players.length * 2) / chance;
            return Math.max(1 - chance, 0);
    }
}

function is_win(deck, remaining_cards) {
    let deck_index = 0;
    let take_card = count => {
        let cards = [];
        for (let i = 0; i < count; i++) {
            cards.push(deck[deck_index]);
            deck_index++;
        }
        return cards;
    }
    // Populate the other players' hands except our own
    for (let i = 0; i < players.length - 1; i++)
        players[i].replace_cards(take_card(2));


    // Fill the rest of the community cards
    let _community_hand = community_hand.clone();
    community_hand.cards.push(...take_card(remaining_cards));

    let winner = find_best_player();
    community_hand = _community_hand;
    if (winner.is_self)
        return true;
    return false;
}