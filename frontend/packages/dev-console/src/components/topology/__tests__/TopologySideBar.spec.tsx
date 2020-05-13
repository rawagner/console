import * as React from 'react';
import { shallow } from 'enzyme';
import SideBar, { TopologySideBarProps } from '../TopologySideBar';
import { CloseButton } from '@console/internal/components/utils/close-button';

describe('TopologySideBar:', () => {
  const props: TopologySideBarProps = {
    show: true,
    onClose: () => '',
  };

  it('renders a SideBar', () => {
    const wrapper = shallow(<SideBar {...props} />);
    expect(wrapper.exists()).toBeTruthy();
  });

  it('clicking on close button should call the onClose callback function', () => {
    const onClose = jest.fn();
    const wrapper = shallow(<SideBar show onClose={onClose} />);
    wrapper
      .find(CloseButton)
      .shallow()
      .find('button')
      .simulate('click');
    expect(onClose).toHaveBeenCalled();
  });
});
