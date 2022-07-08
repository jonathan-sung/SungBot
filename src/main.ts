import { Client, Intents, Message } from "discord.js"

export class SungBot {
    private static readonly WORDLE_REGEX = /Wordle\s\d+\s([X\d])\/6/;

    private client: Client;
    private wordleMap: PlayerScore[] = [];

    constructor(private readonly token: string) {
        this.client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
        this.client.on('ready', () => this.ready());
        this.client.on('messageCreate', message => this.messageCreate(message));
    }

    connect() {
        this.client.login(this.token)
            .then(result => console.log("Login complete " + result));
    }

    private messageCreate(message: Message<boolean>) {
        //return if message is sent by bot
        if (message.author.id == '702494433945321482') return;

        if (SungBot.WORDLE_REGEX.test(message.content)) {
            this.fetchMessages();
        }
    }

    private ready() {
        console.log(`Logged in as ${this.client.user?.tag}!`)
        //this.fetchMessages();
    }

    private fetchMessages() {
        let todaysWordleNum = 0;
        // @ts-ignore
        this.client.channels.cache.get('945629466800029736')!.messages.fetch({ limit: 100 }).then(messages => {
            messages.forEach((value: any) => {
                // console.log(value.content);
                if (SungBot.WORDLE_REGEX.test(value.content)) {
                    let todaysWordle = /\d\d\d/
                    let scoreRegEx = /(\d)\/6/g;
                    let currentWordleNum = parseInt(todaysWordle.exec(value.content)![0]);
                    let score = parseInt(scoreRegEx.exec(value.content)![1])
                    if (currentWordleNum > todaysWordleNum) {
                        this.wordleMap = [];
                        todaysWordleNum = currentWordleNum;
                        this.wordleMap.push({ playerName: value.author.username, score: score, boardScore: SungBot.getBoardScore(value.content), content: value.content, wordleNumber: currentWordleNum });
                    } else if (currentWordleNum == todaysWordleNum) {
                        this.wordleMap.push({ playerName: value.author.username, score: score, boardScore: SungBot.getBoardScore(value.content), content: value.content, wordleNumber: currentWordleNum });
                    }
                }
            });
            if (this.wordleMap.length >= 4) {
                this.calculateWinner();
            }

        })
            .catch(console.error);
    }

    private calculateWinner() {
        var sorted = this.wordleMap.sort(
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
        console.log(winningMessage);
        // @ts-ignore
        this.client.channels.cache.get('992503715820994651')!.send(winningMessage);
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

    endProgram() {
        setTimeout(() => {
            console.log("End of Program");
            process.exit(0);
        });
    }


}

interface PlayerScore {
    playerName: string;
    score: number;
    boardScore: number;
    content: string;
    wordleNumber: number;
}

const token = process.argv[2];
let sungbot = new SungBot(token);
sungbot.connect();
