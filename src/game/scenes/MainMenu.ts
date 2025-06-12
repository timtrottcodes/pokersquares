import { Scene, GameObjects } from 'phaser';
import { createText, createFancyButton } from '../utils/PokerUtils';

export class MainMenu extends Scene {
    background: GameObjects.Image;

    constructor() {
        super('MainMenu');
    }

    create() {
        this.background = this.add.image(512, 384, 'background');

        this.add.rectangle(0, 0, this.scale.width, this.scale.height, 0x000000, 0.5)
            .setOrigin(0)
            .setDepth(1); // Make sure it's in front of the background

        createText(this, 512, 30, 'Poker Squares', {
            fontSize: '40px',
            color: '#ffff00'
        }).setOrigin(0.5).setDepth(2);

        createText(this, 10, 740, '© Tim Trott - github.com/timtrottcodes', {
            fontSize: '16px',
            color: '#ffffff'
        }).setOrigin(0).setDepth(2);

        createText(this, 512, 65, 'By Tim Trott', {
            fontSize: '18px'
        }).setOrigin(0.5).setDepth(2);

        // Left column: High Scores
        const leftX = 200;
        createText(this, leftX, 100, 'Top 10 Highscores', {
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5, 0).setDepth(2);

        const scores = JSON.parse(localStorage.getItem('pokerSquaresHighScores') || '[]') as number[];

        scores.slice(0, 10).forEach((score, index) => {
            createText(this, leftX, 140 + index * 24, `${index + 1}. ${score}`, {
                fontSize: '20px',
                color: '#ffffff'
            }).setOrigin(0.5, 0).setDepth(2);
        });

        // Right column: How to Play + Scoring
        const rightX = 700;
        let offsetY = 100;

        createText(this, rightX, offsetY, 'How to Play', {
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5, 0).setDepth(2);
        offsetY += 30;

        const howToPlay = [
            'Place cards in a 5x5 grid.',
            'Each row and column forms a poker hand.',
            'Try to make the highest scoring hands.',
            'You have 25 cards total.'
        ];

        howToPlay.forEach(line => {
            createText(this, rightX, offsetY, line, {
                fontSize: '16px',
                color: '#cccccc',
                wordWrap: { width: 400 }
            }).setOrigin(0.5, 0).setDepth(2);
            offsetY += 22;
        });

        offsetY += 20;

        createText(this, rightX, offsetY, 'Scoring', {
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5, 0).setDepth(2);
        offsetY += 30;

        const scoringGuide = [
            ['Royal Flush', 100],
            ['Straight Flush', 75],
            ['Four of a Kind', 50],
            ['Full House', 25],
            ['Flush', 20],
            ['Straight', 15],
            ['Three of a Kind', 10],
            ['Two Pair', 5],
            ['One Pair', 2],
            ['High Card', 0]
        ];

        scoringGuide.forEach(([hand, score]) => {
            createText(this, rightX, offsetY, `${hand}: ${score}`, {
                fontSize: '18px',
                color: '#dddddd'
            }).setOrigin(0.5, 0).setDepth(2);
            offsetY += 20;
        });

        // New Game button centered at bottom
        createFancyButton(this, 512, 700, 'New Game', 200, 50, () => {
            this.scene.start('GameScene');
        });
    }
}
