import { WinnerTracker } from '../src/winnerTracker'; // this will be your custom import
import { expect } from 'chai';

describe('Winner tracker tests', () => {
    it('checking optimistic flow', () => {
        let winningMessage = null;
        const winnerTracker = new WinnerTracker(message => winningMessage = message);

        winnerTracker.addScore("hamish", 3,
            "⬜⬜🟨⬜⬜\n" +
            "🟩⬜🟩⬜🟨\n" +
            "🟩🟩🟩🟩🟩"
            , 1);

        winnerTracker.addScore("jonathan", 4,
            "⬜⬜🟨⬜⬜\n" +
            "⬜⬜🟨🟨⬜\n" +
            "🟩⬜🟩⬜🟨\n" +
            "🟩🟩🟩🟩🟩"
            , 1);

        winnerTracker.addScore("grzes", 5,
            "⬜⬜⬜⬜⬜\n" +
            "⬜⬜🟨⬜⬜\n" +
            "⬜🟨🟨🟨🟨\n" +
            "🟩⬜🟩⬜🟨\n" +
            "🟩🟩🟩🟩🟩"
            , 1);

        winnerTracker.addScore("jason", 10,
            "⬜⬜⬜⬜⬜\n" +
            "⬜⬜⬜⬜⬜\n" +
            "⬜⬜⬜⬜⬜\n" +
            "⬜⬜⬜⬜⬜\n" +
            "⬜⬜⬜⬜⬜\n" +
            "⬜⬜⬜⬜⬜\n"
            , 1);

        expect(winningMessage).to.be.equal("Wordle 1 winner is hamish! Who scored 3/6 (53%).");
    });

    it("checking not enough scores", () => {
        let winningMessage = null;
        const winnerTracker = new WinnerTracker(message => winningMessage = message);

        winnerTracker.addScore("hamish", 5, "", 2 );
        winnerTracker.addScore("jonathan", 5, "", 2 );
        winnerTracker.addScore("grzes", 5, "", 2 );

        expect(winningMessage).to.be.null;
    });

    it( "checking duplicates", () => {
        let winningMessage = null;
        const winnerTracker = new WinnerTracker(message => winningMessage = message);

        winnerTracker.addScore("hamish", 4, "", 3 );
        winnerTracker.addScore("jonathan", 5, "", 3 );
        winnerTracker.addScore("jonathan", 3, "", 3 );
        winnerTracker.addScore("grzes", 2, "", 3 );

        expect(winningMessage).to.be.null;
    });
})

// ⬛
// ⬜
// 🟨
// 🟩