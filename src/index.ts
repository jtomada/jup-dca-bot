import * as path from 'node:path';
import * as process from 'node:process';
import { fileURLToPath } from 'node:url';
import Bree from 'bree';

const main = async () => {
  try {
    const bree = new Bree({
      /**
       * Always set the root option when doing any type of
       * compiling with bree. This just makes it clearer where
       * bree should resolve the jobs folder from. By default it
       * resolves to the jobs folder relative to where the program
       * is executed.
       */
      root: path.join(path.dirname(fileURLToPath(import.meta.url)), 'jobs'),
      /**
       * We only need the default extension to be "ts"
       * when we are running the app with ts-node - otherwise
       * the compiled-to-js code still needs to use JS
       */
      defaultExtension: process.env.TS_NODE ? 'ts' : 'js',
      jobs: [
        {
            name: 'job',
            interval: 'every 15 seconds'
        },
      ]
    });

    bree.start();
      
  } catch (error) {
    console.log({ error });
  }
};

main();
