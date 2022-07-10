export class WinnerTracker {
    private scores: PlayerScore[];

    constructor(private winCallback: (message: string, day: number) => void) {
        this.scores = [];
    }

    reset() {
        this.scores = [];
    }

    addScore(username: string, score: number, content: string, currentWordleNum: number) {
        this.scores.push({ playerName: username, score: score, boardScore: WinnerTracker.getBoardScore(content), content: content, wordleNumber: currentWordleNum });
        if (new Set(this.scores.map((score: PlayerScore) => score.playerName)).size >= 4) {
            this.calculateWinner();
        }
    }

    private calculateWinner() {
        const sorted = this.scores.sort(
            (a, b) => {
                // compare score
                if (a.score < b.score)
                    return -1;
                else if (a.score > b.score)
                    return 1;

                // score were equal, try squares-score
                if (a.boardScore < b.boardScore)
                    return 1;
                else if (a.boardScore > b.boardScore)
                    return -1;
                return 0;
            }
        );
        // sorted.forEach((x, i) => console.log(x));
        let winningMessage = "Wordle " + sorted[0].wordleNumber + " winner is " + sorted[0].playerName + "! Who scored " + sorted[0].score + "/6 (" + sorted[0].boardScore + "%).";
        this.winCallback(winningMessage, sorted[0].wordleNumber);
        //this.endProgram();
        //the call wordle - 992503715820994651
        //Jonathan's discord server - 604218744029446149
    }

    private static getBoardScore(board: string): number {
        //129001 🟩
        //129000 🟨
        //11035 ⬛
        //11036 ⬜
        let numOfSquares = 0;
        let yellowSquares = 0;
        let greenSquares = 0;
        for (let i = 0; i < board.length; i++) {
            const currentChar = board.codePointAt(i)
            //console.log(currentChar, board.charAt(i))
            if (currentChar == 129001 || currentChar == 129000 || currentChar == 11035 || currentChar == 11036) {
                numOfSquares++;
            }
            if (currentChar == 129001) {
                greenSquares++;
            } else if (currentChar == 129000) {
                yellowSquares++;
            }
        }
        //f(x) = g/s + (y/s) * (1/2)
        const totalScore = (greenSquares / numOfSquares) + (yellowSquares / (numOfSquares * 2));
        console.log(totalScore, greenSquares, yellowSquares, numOfSquares);
        return Math.round(totalScore * 100);
    }
}

interface PlayerScore {
    playerName: string;
    score: number;
    boardScore: number;
    content: string;
    wordleNumber: number;
}