import { TemplateKind } from '@console/internal/module/k8s';
import { ValidationObject } from '@console/shared';

export type FormState = {
  template: TemplateKind;
  name: string;
  nameValidation: ValidationObject;
  startVM: boolean;
  namespace: string;
  cloneAllowed: boolean;
  isValid: boolean;
};

export enum FORM_ACTION_TYPE {
  RESET = 'reset',
  SET_TEMPLATE = 'template',
  SET_NAME = 'name',
  NAME_VALIDATION = 'nameValidation',
  SET_NAMESPACE = 'namespace',
  START_VM = 'startVM',
  CLONE_ALLOWED = 'cloneAllowed',
}

export type FormAction =
  | { type: FORM_ACTION_TYPE.RESET }
  | { type: FORM_ACTION_TYPE.SET_TEMPLATE; payload: TemplateKind }
  | { type: FORM_ACTION_TYPE.SET_NAME; payload: string }
  | { type: FORM_ACTION_TYPE.NAME_VALIDATION; payload: ValidationObject }
  | { type: FORM_ACTION_TYPE.SET_NAMESPACE; payload: string }
  | { type: FORM_ACTION_TYPE.START_VM; payload: boolean }
  | { type: FORM_ACTION_TYPE.CLONE_ALLOWED; payload: boolean };

export const initFormState = (namespace: string): FormState => ({
  template: undefined,
  name: '',
  nameValidation: undefined,
  startVM: true,
  namespace,
  cloneAllowed: undefined,
  isValid: false,
});

export const formReducer = (state: FormState, action: FormAction): FormState => {
  if (action.type === FORM_ACTION_TYPE.RESET) {
    return initFormState(state.namespace);
  }
  const newState = { ...state, [action.type]: action.payload };
  newState.isValid =
    !!newState.name && !!newState.namespace && newState.cloneAllowed && !newState.nameValidation;
  return newState;
};
