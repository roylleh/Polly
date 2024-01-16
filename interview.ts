import * as fs from "fs";
import * as readline from "readline";

const API = "https://polly-hangman.herokuapp.com/hangman";
const FILE = "words.txt";

const main = async () => {
  let req = await fetch(API, { method: "POST" });
  let json = await req.json();

  let hangman = (json.hangman as string).toLowerCase();
  let token = json.token;

  const fileStream = fs.createReadStream(FILE);
  const rl = readline.createInterface({
    input: fileStream,
  });

  const FREQ: { [key: string]: number } = {};
  for await (const line of rl) {
    if (line.length === hangman.length) {
      for (let c of line) {
        c = c.toLowerCase();

        if (!(c in FREQ)) {
          FREQ[c] = 0;
        }

        FREQ[c]++;
      }
    }
  }

  const FREQ_ARRAY = Object.entries(FREQ).sort((left, right) =>
    left[1] > right[1] ? -1 : 1,
  );

  for (const freq of FREQ_ARRAY) {
    const letter = freq[0];
    const body = new URLSearchParams({
      token: token,
      letter: letter,
    });

    req = await fetch(API, {
      method: "PUT",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    });
    json = await req.json();

    hangman = (json.hangman as string).toLowerCase();
    token = json.token;

    console.log(hangman);
    if (!hangman.includes("_")) {
      return;
    }
  }
};

void main();
