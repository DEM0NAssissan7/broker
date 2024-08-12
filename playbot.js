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

let win_probabilities = [];
let win_chance = 0;

let buyin = 0;
let stakes = 0;
let bet_mode = false;
let bet;

document.addEventListener("keydown", e => {
    console.log("Key:", e.key);
    switch(e.key) {

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
        
        case "Backspace":
            if(card_suit || card_kind) {
                card_suit = 0;
                card_kind = 0;
                break;
            }
            if(community_hand.cards.length > 0)
                community_hand.cards.splice(community_hand.cards.length - 1, 1);
            else if(self_player.hand.cards.length > 0)
                self_player.remove_card();
            break;
        
        // Betting
        case "b":
            if(!bet_mode)
                bet_mode = true;
            else
                bet_mode = false;
    }
    if(card_kind && card_suit) {
        let card = new Card(card_kind, card_suit);
        console.log(card.toString())
        if(self_player.hand.cards.length < 2)
            self_player.add_card(card);
        else if(community_hand.cards.length < 5)
            community_hand.cards.push(card);
        community_hand.update();
        card_kind = 0;
        card_suit = 0;
    }
});


function draw() {
    background(127)

    // Own hand
    draw_hand(self_player.hand, width / 2 - card_width, height * 0.7);

    // Community Cards
    draw_hand(community_hand, width / 2 - card_width * 2.5, height * 0.3);
}