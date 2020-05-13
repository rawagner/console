import * as _ from 'lodash';
import { resourceURL } from '@console/internal/module/k8s/resource';
import { PackageManifestModel } from '../models';
import { PackageManifestKind } from '../types';

export const iconFor = (pkg: PackageManifestKind) =>
  resourceURL(PackageManifestModel, {
    ns: _.get(pkg.status, 'catalogSourceNamespace'),
    name: pkg.metadata.name,
    path: 'icon',
    queryParams: {
      resourceVersion: [
        pkg.metadata.name,
        _.get(pkg.status, 'channels[0].name'),
        _.get(pkg.status, 'channels[0].currentCSV'),
      ].join('.'),
    },
  });
