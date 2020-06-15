import deepDiff from 'deep-diff';
import resolveSecret from './tools/resolveSecret';
import SimpleEvent from './tools/SimpleEvent';

import InstantRemixing from './InstantRemixing';
import FeedSdk from './FeedSdk';
import Keystore from './Keystore';

import VccMiddleware from './VccMiddleware';

function deprecationNotice(method, isBreaking = false) {
  if (isBreaking) {
    console.warn(
      `[@withkoji/vcc] ${method} is deprecated and no longer available.`,
    );
  } else {
    console.warn(
      `[@withkoji/vcc] ${method} is deprecated and no longer needs to be called.\nYou can safely remove this call from your project!`,
    );
  }
}

const configDidChange = new SimpleEvent();
let config = require('./res/config.json');

export default {
  config,
  configDidChange,
  enableConfigDidChange: () => {
    if (module.hot) {
      module.hot.accept('./res/config.json', () => {
        const previousValue = { ...config };
        // eslint-disable-next-line global-require
        config = require('./res/config.json');

        const originalDiff = deepDiff(previousValue, config);
        console.log(originalDiff);

        const changes = originalDiff.map((diff) => {
          if (diff.kind === 'A') {
            return {
              previousValue: diff.item.lhs,
              newValue: diff.item.rhs,
              path: [...diff.path, diff.index],
            };
          }

          return {
            previousValue: diff.lhs,
            newValue: diff.rhs,
            path: diff.path,
          };
        });

        configDidChange.emit({
          newValue: config,
          previousValue,
          changes,
        });
      });
    }
  },
  resolveSecret,

  // Deprecated
  pageLoad: () => deprecationNotice('Koji.pageLoad()'),
  on: () => deprecationNotice('Koji.on()'),
  request: () => deprecationNotice('Koji.request()', true),
  pwaPrompt: () => deprecationNotice('Koji.pwaPrompt()', true),
};

export {
  InstantRemixing,
  FeedSdk,
  Keystore,
  VccMiddleware,
};
