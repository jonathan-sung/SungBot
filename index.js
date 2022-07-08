const TOKEN = "token";

const { Client, Intents } = require('discord.js');

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

wordleMap = [];
WordleRegEx = /Wordle\s[0-9]+\s([0-9])\/6/;

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  //WordleWinner();
})

async function endProgram() {
  await new Promise(r => setTimeout(r, 2000));
  console.log('End of Program');
  process.exit();
}

function getBoardScore(board) {
  //129001 🟩
  //129000 🟨
  //11035 ⬛
  //11036 ⬜
  totalScore = 0;
  numOfSquares = 0;
  yellowSquares = 0;
  greenSquares = 0;
  for (var i = 0; i < board.length; i++) {
    currentChar = board.codePointAt(i)
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
  totalScore = (greenSquares / numOfSquares) + (yellowSquares / (numOfSquares * 2));
  console.log(totalScore, greenSquares, yellowSquares, numOfSquares);
  return Math.round(totalScore * 100);
}

async function WordleWinner() {
  todaysWordleNum = 0;
  channel = client.channels.cache.get('945629466800029736').messages.fetch({ limit: 100 }).then(messages => {
    messages.forEach((value, key) => {
      //console.log(value.content);
      
      if (WordleRegEx.test(value.content)) {
        todaysWordle = /\d\d\d/
        scoreRegEx = /(\d)\/6/g;
        currentWordleNum = parseInt(todaysWordle.exec(value.content)[0]);
        score = parseInt(scoreRegEx.exec(value.content)[1])
        if (currentWordleNum > todaysWordleNum) {
          wordleMap = [];
          todaysWordleNum = currentWordleNum;
          wordleMap.push([value.author.username, score, getBoardScore(value.content), value.content, currentWordleNum]);
        } else if (currentWordleNum == todaysWordleNum) {
          wordleMap.push([value.author.username, score, getBoardScore(value.content), value.content, currentWordleNum]);
          //console.log(wordleMap);
        }

      }

    })
    var sorted = wordleMap.sort(
      function (a, b) {
        // compare score
        if (a[1] < b[1])
          return -1;
        else if (a[1] > b[1])
          return 1;

        // score were equal, try squares-score
        if (a[2] < b[2])
          return 1;
        else if (a[2] > b[2])
          return -1;

        return 0;
      }
    );
    sorted.forEach((x, i) => console.log(x));
    winningMessage = "Wordle " + sorted[0][4] + " winner is " + sorted[0][0] + "! Who scored " + sorted[0][1] + "/6 (" + sorted[0][2] + "%).";
    console.log(winningMessage);
    winner = sorted[0][0];
    if (sorted.length >= 4) {
      client.channels.cache.get('992503715820994651').send(winningMessage);
    }
    
    //console.log(document.documentElement.innerHTML);
    //endProgram();
    //992503715820994651
    //604218744029446149
    //console.log(testArr);
  })
    .catch(console.error);

}

client.on("messageCreate", (message) => {
  //my id
  //if (message.author.id == 248825525441658880) return;
  //bot id
  if (message.author.id == 702494433945321482) return;

  if (WordleRegEx.test(message.content)) {
    WordleWinner();
  }

  if (message.content == ('lol')) {
    //cheese();
    //message.channel.send('hamish is gay');
  }
});

client.login(TOKEN);