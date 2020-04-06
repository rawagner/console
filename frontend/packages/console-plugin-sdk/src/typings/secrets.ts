import { Extension } from './base';

namespace ExtensionProperties {
  export interface SecretHandleChangeExtenion {
    handleChange: (name: string, value: string) => void;
  }
}

export interface SecretHandleChangeExtenion
  extends Extension<ExtensionProperties.SecretHandleChangeExtenion> {
  type: 'Secret/SecretHandleChangeExtenion';
}

export const isSecretExtension = (e: Extension): e is SecretHandleChangeExtenion =>
  e.type === 'Secret/SecretHandleChangeExtenion';
