import * as _ from 'lodash';
import { MachineSetKind } from '@console/internal/module/k8s/types';
import { getUID } from '@console/shared/src/selectors/common';

export const findMachineSet = (machineSets: MachineSetKind[], uid: string) =>
  uid && machineSets ? machineSets.find((machineSet) => getUID(machineSet) === uid) : null;

export const getReplicas = (machineSet: MachineSetKind, defaultValue: number = 0) =>
  _.has(machineSet, 'spec') ? machineSet.spec.replicas : defaultValue;
