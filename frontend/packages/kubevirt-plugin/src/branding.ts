export const getBrandingDetails = (): string =>
  window.SERVER_FLAGS.customProductName || window.SERVER_FLAGS.branding !== 'okd'
    ? 'CNV'
    : 'KubeVirt';
