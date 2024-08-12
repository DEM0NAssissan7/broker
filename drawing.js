const card_width = 50;
const card_height = 70;
function draw_card(card, x, y) {
    let kind = card.kind;
    let suit = card.suit;
    push();
    translate(x, y);
    scale(2, 2);
    fill(255,255,255);
    rect(0, 0, card_width, card_height);

    fill(0,0,0);
    if(suit === HEARTS || suit === DIAMONDS)
        fill(255, 0, 0);

    // Kind
    let kind_string = kind_to_string(kind);
    let kind_string_width = textWidth(kind_string);
    text(kind_string, 10 - kind_string_width / 2, 14);
    text(kind_string, card_width - 10 - kind_string_width / 2, card_height - 5);

    // Suit
    let suit_string = suit_to_string(suit);
    text(suit_string, card_width / 2 - textWidth(suit_string) / 2, card_height / 2 + 6);

    pop();
}
const hand_padding = 10;
function draw_hand(hand, x, y) {
    for(let i = 0; i < hand.cards.length; i++) {
        let card = hand.cards[i];
        draw_card(card, x + (card_width * 2 * i), y);
    }
}