export const commonTemplate = {
  kind: 'Template',
  apiVersion: 'template.openshift.io/v1',
  metadata: {
    annotations: {
      'template.kubevirt.io/version': 'v1alpha1',
      'openshift.io/display-name': 'Red Hat Enterprise Linux 6.0+ VM',
      'openshift.io/documentation-url': 'https://github.com/kubevirt/common-templates',
      'name.os.template.kubevirt.io/rhel6.0': 'Red Hat Enterprise Linux 6.0 or higher',
      'defaults.template.kubevirt.io/disk': 'rootdisk',
      'name.os.template.kubevirt.io/rhel6.1': 'Red Hat Enterprise Linux 6.0 or higher',
      'name.os.template.kubevirt.io/rhel6.2': 'Red Hat Enterprise Linux 6.0 or higher',
      'name.os.template.kubevirt.io/rhel6.3': 'Red Hat Enterprise Linux 6.0 or higher',
      'template.kubevirt.io/editable':
        '/objects[0].spec.template.spec.domain.cpu.sockets\n/objects[0].spec.template.spec.domain.cpu.cores\n/objects[0].spec.template.spec.domain.cpu.threads\n/objects[0].spec.template.spec.domain.resources.requests.memory\n/objects[0].spec.template.spec.domain.devices.disks\n/objects[0].spec.template.spec.volumes\n/objects[0].spec.template.spec.networks\n',
      'name.os.template.kubevirt.io/rhel6.4': 'Red Hat Enterprise Linux 6.0 or higher',
      'template.openshift.io/bindable': 'false',
      'name.os.template.kubevirt.io/rhel6.5': 'Red Hat Enterprise Linux 6.0 or higher',
      'name.os.template.kubevirt.io/rhel6.6': 'Red Hat Enterprise Linux 6.0 or higher',
      'name.os.template.kubevirt.io/rhel6.7': 'Red Hat Enterprise Linux 6.0 or higher',
      tags: 'hidden,kubevirt,virtualmachine,linux,rhel',
      'name.os.template.kubevirt.io/rhel6.8': 'Red Hat Enterprise Linux 6.0 or higher',
      validations:
        '[\n  {\n    "name": "minimal-required-memory",\n    "path": "jsonpath::.spec.domain.resources.requests.memory",\n    "rule": "integer",\n    "message": "This VM requires more memory.",\n    "min": 536870912\n  }\n]\n',
      'name.os.template.kubevirt.io/rhel6.9': 'Red Hat Enterprise Linux 6.0 or higher',
      description:
        'Template for Red Hat Enterprise Linux 6 VM or newer. A PVC with the RHEL disk image must be available.',
      'name.os.template.kubevirt.io/rhel6.10': 'Red Hat Enterprise Linux 6.0 or higher',
      'openshift.io/support-url': 'https://github.com/kubevirt/common-templates/issues',
      iconClass: 'icon-rhel',
      'openshift.io/provider-display-name': 'KubeVirt',
    },
    name: 'rhel6-server-medium-v0.11.3',
    namespace: 'openshift',
    labels: {
      'template.kubevirt.io/version': 'v0.12.3',
      'template.kubevirt.io/type': 'base',
      'os.template.kubevirt.io/rhel6.0': 'true',
      'os.template.kubevirt.io/rhel6.1': 'true',
      'flavor.template.kubevirt.io/medium': 'true',
      'os.template.kubevirt.io/rhel6.2': 'true',
      'os.template.kubevirt.io/rhel6.3': 'true',
      'os.template.kubevirt.io/rhel6.4': 'true',
      'os.template.kubevirt.io/rhel6.5': 'true',
      'os.template.kubevirt.io/rhel6.6': 'true',
      'os.template.kubevirt.io/rhel6.7': 'true',
      'os.template.kubevirt.io/rhel6.10': 'true',
      'os.template.kubevirt.io/rhel6.8': 'true',
      'workload.template.kubevirt.io/server': 'true',
      'os.template.kubevirt.io/rhel6.9': 'true',
    },
  },
  objects: [
    {
      apiVersion: 'kubevirt.io/v1alpha3',
      kind: 'VirtualMachine',
      metadata: {
        labels: {
          // eslint-disable-next-line no-template-curly-in-string
          app: '${NAME}',
          'vm.kubevirt.io/template': 'rhel6-server-medium-v0.11.3',
          'vm.kubevirt.io/template.revision': '1',
          'vm.kubevirt.io/template.version': 'v0.12.3',
        },
        // eslint-disable-next-line no-template-curly-in-string
        name: '${NAME}',
      },
      spec: {
        running: false,
        template: {
          metadata: {
            labels: {
              // eslint-disable-next-line no-template-curly-in-string
              'kubevirt.io/domain': '${NAME}',
              'kubevirt.io/size': 'medium',
            },
          },
          spec: {
            domain: {
              cpu: {
                cores: 1,
                sockets: 1,
                threads: 1,
              },
              devices: {
                disks: [
                  {
                    disk: {
                      bus: 'sata',
                    },
                    name: 'rootdisk',
                  },
                  {
                    disk: {
                      bus: 'sata',
                    },
                    name: 'cloudinitdisk',
                  },
                ],
                interfaces: [
                  {
                    masquerade: {},
                    name: 'default',
                  },
                ],
                networkInterfaceMultiqueue: true,
                rng: {},
              },
              resources: {
                requests: {
                  memory: '4Gi',
                },
              },
            },
            networks: [
              {
                name: 'default',
                pod: {},
              },
            ],
            terminationGracePeriodSeconds: 180,
            volumes: [
              {
                name: 'rootdisk',
                persistentVolumeClaim: {
                  // eslint-disable-next-line no-template-curly-in-string
                  claimName: '${PVCNAME}',
                },
              },
              {
                cloudInitNoCloud: {
                  userData:
                    // eslint-disable-next-line no-template-curly-in-string
                    'user: cloud-user\npassword: ${CLOUD_USER_PASSWORD}\nchpasswd: { expire: False }',
                },
                name: 'cloudinitdisk',
              },
            ],
          },
        },
      },
    },
  ],
  parameters: [
    {
      name: 'NAME',
      description: 'VM name',
      generate: 'expression',
      from: 'rhel6-[a-z0-9]{16}',
    },
    {
      name: 'PVCNAME',
      description: 'Name of the PVC with the disk image',
      required: true,
    },
    {
      name: 'SRC_PVC_NAME',
      description: 'Name of the PVC to clone',
      value: 'rhel6',
    },
    {
      name: 'SRC_PVC_NAMESPACE',
      description: 'Namespace of the source PVC',
      value: 'kubevirt-os-images',
    },
    {
      name: 'CLOUD_USER_PASSWORD',
      description: 'Randomized password for the cloud-init user cloud-user',
      generate: 'expression',
      from: '[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}',
    },
  ],
};
