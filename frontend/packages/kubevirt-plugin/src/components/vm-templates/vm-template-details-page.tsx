import * as React from 'react';
import { navFactory } from '@console/internal/components/utils';
import { DetailsPage } from '@console/internal/components/factory';
import {
  K8sResourceKindReference,
  PersistentVolumeClaimKind,
  PodKind,
  TemplateKind,
} from '@console/internal/module/k8s';
import { PersistentVolumeClaimModel, PodModel, TemplateModel } from '@console/internal/models';
import { VMDisksFirehose } from '../vm-disks';
import { VMNics } from '../vm-nics';
import { VMTemplateDetails } from './vm-template-details';
import { match as routerMatch } from 'react-router';
import { menuActionsCreator } from './menu-actions';
import { useSupportModal } from '../../hooks/use-support-modal';
import { useK8sWatchResource } from '@console/internal/components/utils/k8s-watch-hook';
import { V1alpha1DataVolume } from '../../types/vm/disk/V1alpha1DataVolume';
import { useBaseImages } from '../../hooks/use-base-images';
import { DataVolumeModel } from '../../models';
import { isCommonTemplate } from '../../selectors/vm-template/basic';
import { getTemplateSourceStatus } from '../../statuses/template/template-source-status';

export const breadcrumbsForVMTemplatePage = (match: VMTemplateMatch) => () => [
  {
    name: 'Virtualization',
    path: `/k8s/ns/${match.params.ns || 'default'}/virtualization`,
  },
  {
    name: 'Virtual Machine Templates',
    path: `/k8s/ns/${match.params.ns || 'default'}/virtualization/templates`,
  },
  { name: `${match.params.name} Details`, path: `${match.url}` },
];

const nicsPage = {
  href: 'nics',
  name: 'Network Interfaces',
  component: VMNics,
};

const disksPage = {
  href: 'disks',
  name: 'Disks',
  component: VMDisksFirehose,
};

const pages = [navFactory.details(VMTemplateDetails), navFactory.editYaml(), nicsPage, disksPage];

export const VMTemplateDetailsPage: React.FC<VMTemplateDetailsPageProps> = (props) => {
  const { name } = props.match.params;
  const namespace = props.match.params.ns;
  const [dataVolumes, dvLoaded, dvError] = useK8sWatchResource<V1alpha1DataVolume[]>({
    kind: DataVolumeModel.kind,
    isList: true,
    namespace,
  });
  const [pods, podsLoaded, podsError] = useK8sWatchResource<PodKind[]>({
    kind: PodModel.kind,
    isList: true,
    namespace,
  });
  const [pvcs, pvcsLoaded, pvcsError] = useK8sWatchResource<PersistentVolumeClaimKind[]>({
    kind: PersistentVolumeClaimModel.kind,
    isList: true,
    namespace,
  });
  const [template, templateLoaded, templateError] = useK8sWatchResource<TemplateKind>({
    kind: TemplateModel.kind,
    namespace,
    name,
  });
  const isCommon = isCommonTemplate(template);
  const [baseImages, imagesLoaded, error, baseImageDVs, baseImagePods] = useBaseImages(
    isCommon ? [template] : [],
    isCommon,
  );
  const sourceStatus =
    templateLoaded && !templateError
      ? getTemplateSourceStatus({
          template,
          pvcs: [...baseImages, ...pvcs],
          dataVolumes: [...dataVolumes, ...baseImageDVs],
          pods: [...pods, ...baseImagePods],
        })
      : null;

  const withSupportModal = useSupportModal();
  const sourceLoaded = dvLoaded && podsLoaded && pvcsLoaded && templateLoaded && imagesLoaded;
  const sourceLoadError = dvError || podsError || pvcsError || templateError || error;

  return (
    <DetailsPage
      {...props}
      kind={TemplateModel.kind}
      kindObj={TemplateModel}
      name={name}
      namespace={namespace}
      menuActions={menuActionsCreator}
      pages={pages}
      breadcrumbsFor={breadcrumbsForVMTemplatePage(props.match)}
      customData={{
        withSupportModal,
        sourceStatus,
        sourceLoaded,
        sourceLoadError,
        withCreate: true,
      }}
    />
  );
};

type VMTemplateMatch = routerMatch<{ ns?: string; name?: string }>;

type VMTemplateDetailsPageProps = {
  name: string;
  namespace: string;
  kind: K8sResourceKindReference;
  match: VMTemplateMatch;
};
