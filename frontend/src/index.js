//src/index.js
import { worker } from 'msw/browser';
import { handlers } from './msw'

worker.start( { handlers });
