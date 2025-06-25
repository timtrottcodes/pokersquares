// scenes/GameScene.ts
import { GameObjects } from 'phaser';
import { createDeck, drawCard, evaluateHand, createText, createFancyButton } from '../utils/PokerUtils';

export default class GameScene extends Phaser.Scene {
    background: GameObjects.Image;
    
    private deck: string[] = [];
    private grid: (string | null)[][] = [];
    private cardSprites: Phaser.GameObjects.Image[][] = [];
    private gridSize = 5;
    private selectedCard: string | null = null;
    private timerText!: Phaser.GameObjects.Text;
    private remainingTime = 300;
    private handInfoTexts: Phaser.GameObjects.Text[] = [];
    private nextCardImage?: Phaser.GameObjects.Image;
    private timerEvent?: Phaser.Time.TimerEvent;
    private cardBackImages: Phaser.GameObjects.Image[] = [];
    private readonly cardWidth = 146;
    private readonly cardHeight = 203;
    private readonly cardGutter = 10;
    private readonly cardScale = 0.66;


    constructor() {
        super('GameScene');
    }

    preload() {
        this.load.image('back', 'assets/cards/back_light.png');
        this.load.audio('cardsound32562-37691', 'assets/sfx/cardsound32562-37691.mp3')
        this.load.audio('shuffle-cards-46455', 'assets/sfx/shuffle-cards-46455.mp3')

        const suits = ['clubs', 'diamonds', 'hearts', 'spades'];
        const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
        for (const suit of suits) {
            for (const value of values) {
                const key = `${suit}_${value}`;
                this.load.image(key, `assets/cards/${key}.png`);
            }
        }
    }

    create() {

        this.background = this.add.image(512, 384, 'playbg');
        
        this.handInfoTexts = [];
        this.deck = createDeck();
        this.sound.play('shuffle-cards-46455');
        Phaser.Utils.Array.Shuffle(this.deck);
        this.grid = Array.from({ length: this.gridSize }, () => Array(this.gridSize).fill(null));
        this.cardSprites = Array.from({ length: this.gridSize }, () => Array(this.gridSize).fill(null as any));

        createText(this, 20, 20, 'Poker Squares by Tim Trott', { fontSize: '20px', color: '#ffffff' });
        this.timerText = createText(this, 700, 20, 'Time: 5:00', { fontSize: '20px', color: '#ffffff' });

        this.timerEvent = this.time.addEvent({
            delay: 1000,
            callback: () => {
                this.remainingTime--;
                const mins = Math.floor(this.remainingTime / 60);
                const secs = this.remainingTime % 60;
                this.timerText.setText(`Time: ${mins}:${secs.toString().padStart(2, '0')}`);
                if (this.remainingTime <= 0 && this.timerEvent) {
                    this.timerEvent.remove();
                }
            },
            loop: true
        });

        this.drawNextCard();
        this.renderGrid();
        this.renderScoreTable();
    }

drawNextCard() {
    this.selectedCard = drawCard(this.deck);

    // Clear previous cards
    if (this.nextCardImage) {
        this.nextCardImage.destroy();
    }

    if (this.cardBackImages) {
        this.cardBackImages.forEach(img => img.destroy());
    }

    this.cardBackImages = [];

    const x = 650;
    const y = 450;
    const spacing = 5; // Negative to shift left

    createText(this, x - 50, y - 90, 'Next Card', { fontSize: '18px', color: '#00ffff' });

    // Draw stacked card backs (bottom layer first)
    for (let i = 0; i < 5; i++) {
        const back = this.add.image(x + i * spacing, y, 'back')
            .setDisplaySize(this.cardWidth, this.cardHeight)
            .setOrigin(0.5)
            .setScale(this.cardScale)
            .setDepth(i); // Ensure stacking order
        this.cardBackImages.push(back);
    }

    // Draw the selected card on top
    const cardKey = this.selectedCard ? this.cardToImageKey(this.selectedCard) : 'back';
    this.nextCardImage = this.add.image(x, y, cardKey)
        .setDisplaySize(this.cardWidth, this.cardHeight)
        .setOrigin(0.5)
        .setScale(this.cardScale)
        .setDepth(10); // Ensure it's above all backs
}

    renderGrid() {
        const startX = 70;
        const startY = 120;

        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const x = startX + col * (this.cardWidth * this.cardScale + this.cardGutter);
                const y = startY + row * (this.cardHeight * this.cardScale + this.cardGutter);

                const image = this.add.image(x, y, 'back')
                    .setDisplaySize(this.cardWidth, this.cardHeight)
                    .setOrigin(0.5)
                    .setScale(this.cardScale)
                    .setInteractive({ cursor: 'pointer' });

                image.on('pointerover', () => image.setTint(0xaaaaaa));
                image.on('pointerout', () => image.clearTint());
                image.on('pointerdown', () => this.placeCard(row, col));
                this.cardSprites[row][col] = image;
            }
        }
    }

    placeCard(row: number, col: number) {
        if (this.grid[row][col] || !this.selectedCard) return;

        this.grid[row][col] = this.selectedCard;
        const image = this.cardSprites[row][col];

        const cardKey = this.cardToImageKey(this.selectedCard);

        this.tweens.add({
            targets: image,
            scaleX: 0,
            duration: 150,
            ease: 'Bounce',
            onComplete: () => {
                image.setTexture(cardKey);
                this.sound.play('cardsound32562-37691');
                this.tweens.add({
                    targets: image,
                    scaleX: this.cardScale,
                    duration: 100,
                    ease: 'Bounce',
                    onComplete: () => {
                        image.disableInteractive();
                        image.clearTint();
                    }
                });
            }
        });

        this.selectedCard = null;
        if (this.nextCardImage) this.nextCardImage.setTexture('back');

        this.updateScoreTable();
        this.checkGameEnd();
        this.drawNextCard();
    }

    renderScoreTable() {
        const startX = 600;
        const startY = 90;
        createText(this, startX, 50, 'Score Table', { fontSize: '18px', color: '#00ffff' });

        for (let i = 0; i < this.gridSize * 2; i++) {
            const label = i < 5 ? `Row ${i + 1}` : `Col ${i - 4}`;
            const text = createText(this, startX, startY + i * 25, `${label}: -`, { fontSize: '16px', color: '#ffffff' });
            this.handInfoTexts.push(text);
        }
    }

    updateScoreTable() {
        for (let i = 0; i < this.gridSize; i++) {
            const row = this.grid[i].filter(c => c) as string[];
            const col = this.grid.map(r => r[i]).filter(c => c) as string[];
            const rowResult = evaluateHand(row);
            const colResult = evaluateHand(col);
            this.handInfoTexts[i].setText(`Row ${i + 1}: ${rowResult.name} (${rowResult.score})`);
            this.handInfoTexts[i + 5].setText(`Col ${i + 1}: ${colResult.name} (${colResult.score})`);
        }
    }

    checkGameEnd() {
        const filled = this.grid.flat().every(cell => cell !== null);
        if (!filled) return;

        if (this.timerEvent) {
            this.timerEvent.remove();
        }

        const results = [];
        for (let i = 0; i < this.gridSize; i++) {
            results.push(evaluateHand(this.grid[i].filter(c => c) as string[])); // row
            results.push(evaluateHand(this.grid.map(row => row[i]).filter(c => c) as string[])); // col
        }
        const totalScore = results.reduce((sum, res) => sum + res.score, 0);
        const bonus = this.remainingTime;
        const finalScore = totalScore + bonus;

        createText(this, 660, 550, `Score: ${totalScore}\nBonus: ${bonus}\nTotal: ${finalScore}`, {
            fontSize: '20px',
            color: '#00ffff'
        }).setOrigin(0.5);

        this.saveHighScore(finalScore);

        createFancyButton(this, 700, 620, 'New Game', 200, 50, () => {
            this.scene.restart();
        });
    }

    saveHighScore(score: number) {
        const key = 'pokerSquaresHighScores';
        const scores = JSON.parse(localStorage.getItem(key) || '[]') as number[];
        scores.push(score);
        scores.sort((a, b) => b - a);
        const topScores = scores.slice(0, 10);
        localStorage.setItem(key, JSON.stringify(topScores));
    }

    cardToImageKey(card: string): string {
        const suitMap: Record<string, string> = {
            '♣': 'clubs',
            '♦': 'diamonds',
            '♥': 'hearts',
            '♠': 'spades'
        };

        const value = card.slice(0, -1);       // e.g., '4' from '4♥'
        const suitSymbol = card.slice(-1);     // e.g., '♥' from '4♥'
        const suit = suitMap[suitSymbol];
        return `${suit}_${value}`;
    }
}
