import {fetch as fetchPolyfill} from './fetchPolyfill';

export default window.fetch || fetchPolyfill
