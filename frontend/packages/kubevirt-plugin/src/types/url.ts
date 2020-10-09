export type InitialData = {
  name?: string;
  startVM?: boolean;
  source?: BootSourceParams;
  commonTemplateName?: string;
  userTemplateName?: string;
  userTemplateNs?: string;
};

export type BootSourceParams = {
  cdRom: boolean;
  size: string;
  url?: string;
  pvcName?: string;
  pvcNamespace?: string;
  container?: string;
};
