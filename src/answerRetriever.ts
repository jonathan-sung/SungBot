import axios from "axios";

export class AnswerRetriever {
    private url: string;

    constructor(private wordleNumber: number) {
        const date = new Date();
        const month = AnswerRetriever.getMonthString(date);
        const day = date.getDate();
        this.url = `https://www.pcgamer.com/wordle-today-${month}-${day}-${wordleNumber}-answer-hint`;
    }

    getAnswer(): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            axios.get(this.url).then(res => {
                const match = new RegExp(/<strong>\s(\w{5})<\/strong>/).exec(res.data);
                if (match) {
                    resolve(match[1]);
                } else {
                    reject("answer pattern was not matched");
                }
            })
            .catch(error => {
                console.log(error);
                reject(error);
            });
        });

    }

    private static getMonthString(date: Date): string {
        switch (date.getMonth()) {
            case 0: return "january";
            case 1: return "february";
            case 2: return "march";
            case 3: return "april";
            case 4: return "may";
            case 5: return "june";
            case 6: return "july";
            case 7: return "august";
            case 8: return "september";
            case 9: return "october";
            case 10: return "november";
            case 11: return "december";
            default: return "";
        }
    }


}