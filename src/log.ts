import {createLogger, format, transports} from "winston"
const { combine, timestamp, label, printf } = format;

export class Log {
    private static format = printf(({ level, message, label, timestamp }) => {
        return `${timestamp} [${label}] ${level}: ${message}`;
    });

    public static create() {
        return createLogger({
            transports: [
                new transports.Console(),
                new transports.File({filename: "sungbot.log", level: 'debug'})
            ],
            format: this.makeFormatter()
        });
    }

    private static makeFormatter() {
        return combine(
            label({label: 'SungBot'}),
            timestamp(),
            this.format
        )
    }
}
