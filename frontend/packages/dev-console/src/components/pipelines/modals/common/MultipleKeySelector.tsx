import * as React from 'react';
import { FieldArray, useFormikContext, FormikValues } from 'formik';
import * as _ from 'lodash';
import cx from 'classnames';
import { PlusCircleIcon, MinusCircleIcon } from '@patternfly/react-icons';
import { TextInputTypes, Button, FormGroup } from '@patternfly/react-core';
import { useFormikValidationFix } from '@console/shared/src/hooks/formik-validation-fix';
import { getFieldId } from '@console/shared/src/components/formik-fields/field-utils';
import DropdownField from '@console/shared/src/components/formik-fields/DropdownField';
import InputField from '@console/shared/src/components/formik-fields/InputField';
import './MultipleKeySelector.scss';

interface MultipleKeySelectorProps {
  name: string;
  keys: { [key: string]: string };
}

const MultipleKeySelector: React.FC<MultipleKeySelectorProps> = ({ name, keys }) => {
  const { values } = useFormikContext<FormikValues>();
  const items = _.get(values, name, [{ key: '', path: '' }]);
  useFormikValidationFix(items);
  return (
    <FieldArray
      name={name}
      key="multiple-key-selector"
      render={({ push, remove }) => {
        return (
          <FormGroup
            fieldId={getFieldId(name, 'multiple-key-selector')}
            label="Items"
            className="odc-multiple-key-selector"
          >
            {items.length > 0 &&
              items.map((item, index) => {
                const fieldKey = `${name}.${index}.${item.key}`;
                return (
                  <div className="form-group odc-multiple-key-selector__item" key={fieldKey}>
                    <DropdownField
                      name={`${name}.${index}.key`}
                      title="Select a key"
                      items={keys}
                      fullWidth
                    />
                    <InputField
                      name={`${name}.${index}.path`}
                      type={TextInputTypes.text}
                      placeholder="Enter a path"
                      isDisabled={!item.key}
                    />
                    <div
                      className={cx('odc-multiple-key-selector__deleteButton', {
                        '--disabled': items.length <= 1,
                      })}
                    >
                      <MinusCircleIcon aria-hidden="true" onClick={() => remove(index)} />
                    </div>
                  </div>
                );
              })}
            <Button
              variant="link"
              onClick={() => push({ key: '', path: '' })}
              icon={<PlusCircleIcon />}
              isInline
            >
              Add items
            </Button>
          </FormGroup>
        );
      }}
    />
  );
};

export default MultipleKeySelector;
