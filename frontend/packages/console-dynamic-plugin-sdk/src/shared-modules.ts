import { RemoteEntryModule } from './types';

/**
 * Vendor modules shared between Console application and its dynamic plugins.
 */
export const sharedVendorModules = ['react', '@openshift-console/dynamic-plugin-sdk'];

/**
 * At runtime, Console will override (i.e. enforce Console-bundled implementation of) shared
 * modules for each dynamic plugin, before loading any of the modules exposed by that plugin.
 *
 * This way, a single version of React etc. is used by the Console application.
 */
export const overrideSharedModules = (entryModule: RemoteEntryModule) => {
  entryModule.override({
    // eslint-disable-next-line
    react: async () => () => require('react'),
    '@openshift-console/dynamic-plugin-sdk': async () => () =>
      // eslint-disable-next-line
      require('@console/dynamic-plugin-sdk/src/index-lib'),
  });
};
