import React, {Fragment} from 'react';
import styled, {keyframes} from 'styled-components';
import {PANEL_LEFT_NORMAL_WIDTH} from '../../../helpers/layout.js';
import {__GRAY_300, __GRAY_400} from '../../../helpers/colors.js';
import Transactions from './Transactions.js';

const Parent = styled.div`
  position: fixed;
  z-index: 1050;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  overflow-x: hidden;
  overflow-y: auto;
  background-color: rgba(99, 114, 130, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
`;
const modalFade = keyframes`
 from {transform: translateY(-70%);opacity: 0;}
  to {transform: translateY(0);opacity: 1;}
`;

const MyModal = styled.div`
  margin-left: ${PANEL_LEFT_NORMAL_WIDTH / 2}px;
  position: fixed;
  animation: ${modalFade};
  animation-duration: 0.5s;
  transition: 0.3s linear ease-in-out;
  max-width: 100%;
  max-height: 100%;
  z-index: 12;
  width: 50%;
`;

const FooterContainer = styled.div`
  min-height: 50px;
  background: ${__GRAY_300};
  margin-top: auto;
  border-top: 1px solid ${__GRAY_400};
  border-bottom-right-radius: 4px;
  border-bottom-left-radius: 4px;
`;
const PoolModal = ({show, ...otherProps}) => {
  return (
    <Fragment>
      {show ? (
        <Parent>
          <MyModal>
            <Transactions />
            <FooterContainer>
            </FooterContainer>
          </MyModal>
        </Parent>
      ) : null}
    </Fragment>
  );
};

export default PoolModal;