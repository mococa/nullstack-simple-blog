import Nullstack, { NullstackClientContext } from 'nullstack';

import Application from './src/Application';

const context = Nullstack.start(Application) as NullstackClientContext;

context.start = async function start() {
  // https://nullstack.app/pt-br/inicializacao-da-aplicacao
  // const posts = readdirSync(path.join(__dirname, "posts"));
  // console.log(posts);
};

export default context;
