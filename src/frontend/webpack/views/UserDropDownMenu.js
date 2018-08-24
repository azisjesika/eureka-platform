import React from 'react';
import styled from 'styled-components';
import Icon from './icons/Icon.js';
import {__THIRD} from '../../helpers/colors.js';
import {fadeIn} from '../../helpers/fadeIn.js';
const Parent = styled.div`
  position: absolute;
  top: 40px;
  right: 20px;
  padding-top: 10px;
  transition: 0.5s ease-in-out;
  z-index: 1000;
  cursor: pointer;
  pointer-events: ${props => (props.visible ? 'auto' : 'none')};
  opacity: ${props => (props.visible ? 1 : 0)};
`;
const Navigation = styled.div`
  background: rgb(255, 255, 255);
  width: 300px;
  height: 200px;
  padding: 1rem 2rem;
  box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);
  border-radius: 5px;
  // animation: ${fadeIn} 0.5s;
`;

const Tabs = styled.div`
  display: flex;
  flex-direction: column;
`;

const TabContainer = styled.div`
  display: flex;
`;

const Text = styled.div``;

const Tab = props => {
  return (
    <TabContainer>
      <Icon
        icon={props.icon}
        material={props.material}
        width={props.width}
        height={props.height}
        color={__THIRD}
      />
      <Text>{props.text}</Text>
    </TabContainer>
  );
};
const DropDown = () => {
  return (
    <Navigation>
      <Tabs>
        <Tab
          icon={'material'}
          material={'exit_to_app'}
          width={30}
          height={30}
          text={'Sign Out'}
        />
      </Tabs>
    </Navigation>
  );
};

const UserDropDownMenu = props => {
  return (
    <Parent visible={props.visible}>
      <DropDown />
    </Parent>
  );
};

export default UserDropDownMenu;
