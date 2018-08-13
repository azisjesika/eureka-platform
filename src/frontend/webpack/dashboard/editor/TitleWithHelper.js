import React from 'react';
import styled from 'styled-components';
import EditorSectionHint from './EditorSectionHint';
import {__THIRD} from '../../../helpers/colors.js';

const Container = styled.div`
  display: flex;
  margin: 12px 0;
  align-items: flex-end;
`;

const Left = styled.div`
  flex: 1;
  margin-bottom: -3px;
`;

export const Title = styled.div`
  color: ${__THIRD};
  font-weight: bold;
  font-size: 0.65em;
`;

const RequiredStar = styled.span.attrs({
  children: '*'
})`
  color: red;
  vertical-align: top;
  margin-left: 3px;
`;

const isActive = id => {
  if (typeof window === 'undefined') {
    return false;
  }
  return id && window.location.hash === `#${id}`;
};

const TitleWithHelper = ({
  title,
  id,
  requirement,
  field,
  content,
  document
}) => {
  if (!field && requirement) {
    console.warn('Field is a mandatory prop', id);
  }
  return (
    <Container>
      <Left>
        {/*
          When permalinking this is the anchor.
          So the section title is 100px from the top.
        */}
        {id ? (
          <div style={{marginTop: -100, position: 'absolute'}} id={id} />
        ) : null}
        <Title className={isActive(id) ? 'flashing-matters-highlight' : ''}>
          {title}
          {requirement && requirement.required ? <RequiredStar /> : null}
        </Title>
      </Left>
      <EditorSectionHint
        requirement={requirement}
        field={field}
        content={content}
        document={document}
      />
    </Container>
  );
};

export default TitleWithHelper;