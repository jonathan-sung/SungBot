import {Client, Intents, Message, TextChannel} from "discord.js"
import {WinnerTracker} from "./winnerTracker";

export class SungBot {
    private static readonly WORDLE_REGEX = /Wordle\s(\d+)\s([X\d])\/6/;

    private readonly client: Client;
    private readonly winnerTracker: WinnerTracker;

    private spoilerChannel: TextChannel | null = null;
    private winnerChannel: TextChannel | null = null;

    constructor(private readonly token: string) {
        this.client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
        this.client.on('ready', () => this.ready());
        this.client.on('messageCreate', message => this.messageCreate(message));
        this.winnerTracker = new WinnerTracker( (message) => this.winner(message));
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
        this.spoilerChannel = (<TextChannel>this.client.channels.cache.get('945629466800029736'));
        this.winnerChannel = (<TextChannel>this.client.channels.cache.get('992503715820994651'));
        this.fetchMessages();
    }

    private fetchMessages() {
        this.winnerTracker.reset();
        let todaysWordleNum = 0;
        this.spoilerChannel!.messages.fetch({ limit: 100 }).then(messages => {
            messages.forEach((value: any) => {
                // console.log(value.content);
                let match = SungBot.WORDLE_REGEX.exec(value.content);
                if (match) {
                    let currentWordleNum = parseInt(match[1]);
                    let scoreString = match[2];
                    let score = scoreString === "X" ? 10 : parseInt(scoreString);
                    if (currentWordleNum > todaysWordleNum) {
                        this.winnerTracker.reset();
                        todaysWordleNum = currentWordleNum;
                        this.winnerTracker.addScore( value.author.username, score, value.content, currentWordleNum );
                    } else if (currentWordleNum == todaysWordleNum) {
                        this.winnerTracker.addScore( value.author.username, score, value.content, currentWordleNum );
                    }
                }
            });

        })
            .catch(console.error);
    }

    private winner(message: string) {
        console.log(message);
        this.winnerChannel!.send(message)
            .then(resp => console.log("Sent message with response " + resp));
    }

    endProgram() {
        setTimeout(() => {
            console.log("End of Program");
            process.exit(0);
        });
    }
}

const token = process.argv[2];
let sungbot = new SungBot(token);
sungbot.connect();
