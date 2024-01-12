import {Client, Intents, Message, TextChannel} from "discord.js"
import {WinnerTracker} from "./winnerTracker";
import {AnswerRetriever} from "./answerRetriever";
import {Log} from "./log";

export class SungBot {
    private static readonly WORDLE_REGEX = /Wordle\s(\d+)\s([X\d])\/6/;

    private readonly log = Log.create();
    private readonly client: Client;
    private readonly winnerTracker: WinnerTracker;

    private spoilerChannel: TextChannel | null = null;
    private winnerChannel: TextChannel | null = null;

    constructor(private readonly token: string) {
        this.client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
        this.client.on('ready', () => this.ready());
        this.client.on('messageCreate', message => this.messageCreate(message));
        this.winnerTracker = new WinnerTracker((message, day) => this.winner(message, day));
    }

    connect() {
        this.log.debug("Connecting to discord...");
        this.client.login(this.token)
            .then(result => this.log.info(`Login complete: ${result}`));
    }

    readyForAnswer(number: number) {
        this.log.debug(`getAnswer(number: ${number})`);
        const date = new Date();
        const dateHours = date.getHours();
        if ( dateHours < 11 ) {
            const timeout = (11 - dateHours) * 60 * 60 * 1000;
            this.log.info(`Time is only ${dateHours}, waiting ${timeout}ms to send answer`);
            setTimeout( () => this.getAnswer(number), timeout );
        }
        else {
            this.log.info(`Sending answer now...`);
            this.getAnswer(number);
        }
    }

    private getAnswer(number: number) {
        const answerRetriever = new AnswerRetriever(number);
        answerRetriever.getAnswer().then(answer => {
            this.log.debug(`Got answer for ${number}: ${answer}`);
            this.winnerChannel!.send(`Todays answer was ${answer}`);
        });
    }

    private messageCreate(message: Message) {
        //return if message is sent by bot
        if (message.author.id == '702494433945321482') return;

        this.log.debug(`Received message`);
        if (SungBot.WORDLE_REGEX.test(message.content)) {
            this.fetchMessages();
        }
    }

    private ready() {
        this.log.info(`Logged in as ${this.client.user?.tag}!`)
        this.spoilerChannel = (<TextChannel>this.client.channels.cache.get('945629466800029736'));
        this.winnerChannel = (<TextChannel>this.client.channels.cache.get('992503715820994651'));
        this.fetchMessages();
    }

    //awful, awful code...some of the worst code i've ever seen *smh* 
    private fetchMessages() {
        this.log.debug(`Fetching messages... `);
        this.winnerTracker.reset();
        let todaysWordleNum = 0;
        this.spoilerChannel!.messages.fetch({ limit: 100 }).
        then(messages => {
            this.log.debug(`Fetched ${messages.size} messages...`);
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

    private winner(message: string, day: number) {
        this.log.debug(`winner(message: ${message}, day: ${day})`);
        this.winnerChannel!.send(message)
            .then(resp => {
                this.log.info(`Sent message with response ${resp}`);
                this.readyForAnswer(day);
            });
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
