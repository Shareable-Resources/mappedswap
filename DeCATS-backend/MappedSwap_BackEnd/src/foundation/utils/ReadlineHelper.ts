import readline from 'readline';
export default class ReadlineHelper {
  private privateKey: string;
  constructor() {
    this.privateKey = '';
  }

  ask(question: string, stdoutMuted = true): Promise<string> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    (rl as any)._writeToOutput = function _writeToOutput(stringToWrite) {
      if (stdoutMuted)
        (rl as any).output.write(
          '\x1B[2K\x1B[200D' + question + '*'.repeat(rl.line.length),
        );
      else {
        stringToWrite = stringToWrite.replace('undefined', '');
        (rl as any).output.write(question + stringToWrite);
      }
    };
    return new Promise((resolve) =>
      rl.question((rl as any).query, (ans) => {
        rl.close();
        console.info();
        resolve(ans);
      }),
    );
  }

  askNoMask(question: string): Promise<string> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    (rl as any).query = question;
    (rl as any)._writeToOutput = function _writeToOutput(stringToWrite) {
      (rl as any).output.write(stringToWrite);
    };
    return new Promise((resolve) =>
      rl.question((rl as any).query, (ans) => {
        rl.close();
        resolve(ans);
      }),
    );
  }
}
