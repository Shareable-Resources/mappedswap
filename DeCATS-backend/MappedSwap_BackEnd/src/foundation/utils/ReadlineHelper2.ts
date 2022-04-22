import readline from 'readline';

export const question = (
  question: string,
  options: { hidden?: boolean } = {},
) =>
  new Promise<string>((resolve, reject) => {
    const input = process.stdin;
    const output = process.stdout;

    type Rl = readline.Interface & { history: string[] };
    const rl = readline.createInterface({ input, output }) as Rl;

    if (options.hidden) {
      const onDataHandler = (charBuff: Buffer) => {
        const char = charBuff + '';
        switch (char) {
          case '\n':
          case '\r':
          case '\u0004':
            input.removeListener('data', onDataHandler);
            break;
          default:
            output.clearLine(0);
            readline.cursorTo(output, 0);
            output.write(question);
            break;
        }
      };
      input.on('data', onDataHandler);
    }

    rl.question(question, (answer) => {
      if (options.hidden) rl.history = rl.history.slice(1);
      rl.close();
      resolve(answer);
    });
  });
