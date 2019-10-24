import { Reducer } from 'redux';
import { Extension } from './extension';

namespace ExtensionProperties {
  export interface PluginReducer {
    namespace: string;
    reducer: Reducer;
    required?: string | string[];
  }
}

export interface PluginReducer extends Extension<ExtensionProperties.PluginReducer> {
  type: 'PluginReducer';
}

export const isPluginReducer = (e: Extension): e is PluginReducer => {
  return e.type === 'PluginReducer';
};
