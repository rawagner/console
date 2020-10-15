import * as _ from 'lodash';
import { k8sBasePath, TemplateKind } from '@console/internal/module/k8s';
import { history } from '@console/internal/components/utils/router';
import { getName, getNamespace } from '@console/shared';
import { VMWizardMode, VMWizardName, VMWizardView } from '../constants/vm';
import { VMKind } from '../types';
import { VMTabURLEnum } from '../components/vms/types';
import { isCommonTemplate } from '../selectors/vm-template/basic';

const ELLIPSIS = '…';

const ellipsizeLeft = (word) => `${ELLIPSIS}${word}`;

export const redirectToTab = (tabPath: string) => {
  const currLocation = history.location?.pathname;
  if (currLocation && currLocation.includes(tabPath)) {
    return;
  }
  history.push(tabPath);
};

export const getVMTabURL = (vm: VMKind, tabName: VMTabURLEnum) =>
  `/ns/${getNamespace(vm)}/virtualmachines/${getName(vm)}/${tabName}`;

export const getConsoleAPIBase = () => {
  // avoid the extra slash when compose the URL by VncConsole
  return k8sBasePath.startsWith('/') ? k8sBasePath.substring(1) : k8sBasePath;
};

export const isConnectionEncrypted = () => window.location.protocol === 'https:';

export const parseURL = (url: string) => {
  try {
    return new URL(url);
  } catch (e) {
    return null;
  }
};

export const resolveOrigin = ({ hostname, origin, port }, maxHostnameParts) => {
  const hostnameParts = hostname.split('.');
  if (hostnameParts.length <= maxHostnameParts) {
    return origin;
  }

  const resolvedHostname = hostnameParts.slice(hostnameParts.length - maxHostnameParts).join('.');
  const resolvedPort = port ? `:${port}` : '';

  return `${ellipsizeLeft(resolvedHostname)}${resolvedPort}`;
};

export const resolvePathname = ({ pathname }, maxPathnameParts) => {
  const pathnameParts = pathname.split('/').filter((part) => part);
  if (pathnameParts.length <= maxPathnameParts) {
    return pathname;
  }

  const resolvedPathname = pathnameParts.slice(pathnameParts.length - maxPathnameParts).join('/');
  return `/${ellipsizeLeft(`/${resolvedPathname}`)}`;
};

export const resolveURL = ({ urlObj, maxHostnameParts, maxPathnameParts }) =>
  urlObj.origin === 'null'
    ? urlObj.href
    : `${resolveOrigin(urlObj, maxHostnameParts)}${resolvePathname(urlObj, maxPathnameParts)}`;

export type BootSourceParams = {
  cdRom: boolean;
  size: string;
  url?: string;
  pvcName?: string;
  pvcNamespace?: string;
  container?: string;
};

export const getVMWizardCreateLink = ({
  namespace,
  wizardName,
  mode,
  view,
  template,
  name,
  bootSource,
  startVM,
}: {
  namespace?: string;
  wizardName: VMWizardName;
  mode?: VMWizardMode;
  view?: VMWizardView;
  template?: TemplateKind;
  name?: string;
  bootSource?: BootSourceParams;
  startVM?: boolean;
}) => {
  const params = new URLSearchParams();

  if (wizardName === VMWizardName.BASIC) {
    if (namespace) {
      params.append('namespace', namespace);
    }
    if (template && isCommonTemplate(template)) {
      params.append('common-template', template.metadata.name);
    }
    const paramsString = params.toString() ? `?${params}` : '';
    return `/k8s/virtualization/~new-from-template${paramsString}`;
  }

  const type = wizardName === VMWizardName.YAML ? '~new' : '~new-wizard';

  if (mode && mode !== VMWizardMode.VM) {
    params.append('mode', mode);
  }

  if (template) {
    if (isCommonTemplate(template)) {
      params.append('common-template', template.metadata.name);
    } else {
      params.append('template', template.metadata.name);
      params.append('template-ns', template.metadata.namespace);
    }
  }

  if (name) {
    params.append('name', name);
  }

  if (startVM) {
    params.append('startVM', `${startVM}`);
  }

  if (bootSource) {
    const source = _.pickBy(bootSource, _.identity);
    params.append('source', JSON.stringify(source));
  }

  if (mode === VMWizardMode.IMPORT && view === VMWizardView.ADVANCED) {
    // only valid combination in the wizard for now
    params.append('view', view);
  }

  const paramsString = params.toString() ? `?${params}` : '';

  return `/k8s/ns/${namespace || 'default'}/virtualization/${type}${paramsString}`;
};
