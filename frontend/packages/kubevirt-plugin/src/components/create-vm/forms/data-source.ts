import { ObjectEnum } from '@console/shared/src/constants/object-enum';
import {
  SelectDropdownObjectEnum,
  SelectDropdownData,
} from '../../../constants/select-dropdown-object-enum';

export class DataSource extends SelectDropdownObjectEnum<string> {
  static readonly UPLOAD = new DataSource('upload', 'upload', {
    label: 'Upload local file (creates PVC)',
    description: 'Upload file from your local device (supported types - gz, xz, tar, qcow2).',
    order: 1,
  });

  static readonly URL = new DataSource('url', 'import', {
    label: 'Import via URL (creates PVC)',
    description: 'Import content via URL (HTTP or S3 endpoint).',
    order: 2,
  });

  static readonly REGISTRY = new DataSource('registry', 'import', {
    label: 'Import via Registry (creates PVC)',
    description: 'Import content via container registry.',
    order: 3,
  });

  static readonly CLONE = new DataSource('clone', 'clone', {
    label: 'Clone existing PVC',
    description: 'Clone a persistent volume claim already available on the cluster and clone it.',
    order: 4,
  });

  private readonly action: string;

  protected constructor(value: string, action: string, selectData: SelectDropdownData = {}) {
    super(value, selectData);
    this.action = action;
  }

  getAction = () => this.action;

  private static readonly ALL = Object.freeze(
    ObjectEnum.getAllClassEnumProperties<DataSource>(DataSource),
  );

  private static readonly stringMapper = DataSource.ALL.reduce(
    (accumulator, dataSource: DataSource) => ({
      ...accumulator,
      [dataSource.value]: DataSource,
    }),
    {},
  );

  static getAll = () => DataSource.ALL;

  static fromString = (source: string): DataSource => DataSource.stringMapper[source];
}
