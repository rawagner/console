import * as React from 'react';
import * as _ from 'lodash';
import { Provider } from 'react-redux';
import { Router } from 'react-router-dom';

import store from '@console/internal/redux';
import {
  Firehose,
  AccessDenied,
  history,
  MsgBox,
  Box,
  FirehoseResource,
  FirehoseResult,
} from '@console/internal/components/utils';
import { ModalErrorContent } from '@console/internal/components/modals/error-modal';
import { createModal, GetModalContainer } from '@console/internal/components/factory';

const NotFound: React.FC<NotFoundProps> = ({ message }) => (
  <Box className="text-center">
    <MsgBox title="Not Found" detail="Requested resource not found." />
    {_.isString(message) && (
      <div className="alert alert-danger text-left">
        <span className="pficon pficon-error-circle-o" />
        {message}
      </div>
    )}
  </Box>
);

const ModalComponentWrapper: React.FC<ModalComponentWrapperProps> = ({
  Component,
  onClose,
  resourcesToProps,
  loadError,
  loaded,
  resources = {},
  modalProps = {},
}) => {
  if (loadError) {
    const status = _.get(loadError, 'response.status');
    let errorContent;
    if (status === 404) {
      errorContent = <NotFound message={loadError.message} />;
    }
    if (status === 403) {
      errorContent = <AccessDenied message={loadError.message} />;
    }

    if (!loaded) {
      return <ModalErrorContent cancel={onClose} error={errorContent} />;
    }
  }

  return (
    <Component
      onClose={onClose}
      onCancel={onClose}
      onHide={onClose}
      {...modalProps}
      {...resourcesToProps({ ...resources })}
    />
  );
};

export const createModalResourceLauncher: CreateModalResourceLauncher = (
  Component,
  resources,
  resourcesToProps,
) => (props) => {
  const getModalContainer: GetModalContainer = (onClose) => (
    <Provider store={store}>
      <Router {...{ history, basename: window.SERVER_FLAGS.basePath }}>
        <Firehose resources={resources}>
          <ModalComponentWrapper
            Component={Component}
            onClose={onClose}
            resourcesToProps={resourcesToProps}
            modalProps={props}
          />
        </Firehose>
      </Router>
    </Provider>
  );
  return createModal(getModalContainer);
};

type NotFoundProps = {
  message: string;
};

type CreateModalResourceLauncher = (
  Component: React.ComponentType<any>,
  resources: FirehoseResource[],
  resourcesToProps: (res: { [key: string]: FirehoseResult }) => { [key: string]: any },
) => (props: any) => { result: Promise<any> };

type ModalComponentWrapperProps = {
  loadError?: any;
  loaded?: boolean;
  Component: React.ComponentType<any>;
  onClose: (e?: React.SyntheticEvent) => void;
  resourcesToProps: (res: { [key: string]: FirehoseResult }) => any;
  modalProps?: { [key: string]: any };
  resources?: { [key: string]: FirehoseResult };
};
