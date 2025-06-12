export function createDeck(): string[] {
    const suits = ['♠', '♥', '♦', '♣'];
    const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    return suits.flatMap(suit => ranks.map(rank => `${rank}${suit}`));
}

export function drawCard(deck: string[]): string | null {
    return deck.pop() ?? null;
}

function getRankValue(rank: string): number {
    const order = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
    return order.indexOf(rank);
}

export function evaluateHand(cards: string[]): { name: string, score: number } {
    if (cards.length !== 5) return { name: 'Incomplete', score: 0 };

    const ranks = cards.map(c => c.slice(0, -1));
    const suits = cards.map(c => c.slice(-1));

    const rankCounts: Record<string, number> = {};
    ranks.forEach(r => rankCounts[r] = (rankCounts[r] || 0) + 1);
    const counts = Object.values(rankCounts).sort((a, b) => b - a);

    const isFlush = suits.every(s => s === suits[0]);
    const sortedRankValues = ranks.map(getRankValue).sort((a, b) => a - b);
    const isStraight = sortedRankValues.every((v, i, arr) => i === 0 || v === arr[i - 1] + 1);
    const isLowAceStraight = JSON.stringify(sortedRankValues) === JSON.stringify([0, 1, 2, 3, 12]);

    if (isFlush && isStraight && ranks.includes('A') && ranks.includes('10')) return { name: 'Royal Flush', score: 100 };
    if (isFlush && (isStraight || isLowAceStraight)) return { name: 'Straight Flush', score: 75 };
    if (counts[0] === 4) return { name: 'Four of a Kind', score: 50 };
    if (counts[0] === 3 && counts[1] === 2) return { name: 'Full House', score: 25 };
    if (isFlush) return { name: 'Flush', score: 20 };
    if (isStraight || isLowAceStraight) return { name: 'Straight', score: 15 };
    if (counts[0] === 3) return { name: 'Three of a Kind', score: 10 };
    if (counts[0] === 2 && counts[1] === 2) return { name: 'Two Pair', score: 5 };
    if (counts[0] === 2) return { name: 'One Pair', score: 2 };

    return { name: 'High Card', score: 0 };
}

export function createText(scene: Phaser.Scene, x: number, y: number, text: string, overrides = {}) {
    const style = {
        fontFamily: 'Segoe UI, Arial, sans-serif',
        color: '#ffffff',
        fontSize: '16px',
        ...overrides
    };
    return scene.add.text(x, y, text, style);
}

export function createFancyButton(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    width: number,
    height: number,
    onClick: () => void
): Phaser.GameObjects.Container {

    const bg = scene.add.graphics();
    
    const drawBackground = (fillTop: number, fillBottom: number, strokeColor: number) => {
        bg.clear();
        bg.fillGradientStyle(fillTop, fillBottom, fillTop, fillBottom, 1);
        bg.fillRoundedRect(-width / 2, -height / 2, width, height, 10);
        bg.lineStyle(2, strokeColor, 1);
        bg.strokeRoundedRect(-width / 2, -height / 2, width, height, 10);
    };

    // Initial background
    drawBackground(0x003366, 0x0066cc, 0x00ccff);

    const label = scene.add.text(0, 0, text, {
        fontSize: '28px',
        fontFamily: 'Segoe UI, Arial, sans-serif',
        color: '#ffffff'
    }).setOrigin(0.5);

    const button = scene.add.container(x, y, [bg, label])
        .setSize(width, height)
        .setDepth(2)
        .setInteractive(new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height), Phaser.Geom.Rectangle.Contains);

    // Hover effect
    button.on('pointerover', () => {
        drawBackground(0x0055aa, 0x0099ff, 0xffffff); // brighter + yellow border
    });

    button.on('pointerout', () => {
        drawBackground(0x003366, 0x0066cc, 0x00ccff); // reset
    });

    button.on('pointerdown', () => {
        onClick();
    });

    return button;
}