import React, {Component} from 'react';
import styled from 'styled-components';
import {Route} from 'react-router';
import {Redirect, withRouter} from 'react-router-dom';
import NavPill from '../../views/NavPill.js';
import {ReviewsNavPillRoutes} from './ReviewsNavPillRoutes.js';
import ReviewsInvited from '../Reviews/ReviewsInvited.js';
import ReviewsOpen from '../Reviews/ReviewsOpen.js';
import Roles from '../../../../backend/schema/roles-enum.mjs';
import BecomeReviewer from '../Reviews/BecomeReviewer.js';
import ReviewsMyReviews from '../Reviews/ReviewsMyReviews.js';

const Parent = styled.div`
  display: flex;
  flex-direction: column;
`;

const CardContainer = styled.div`
  transition: all 0.5s;
  display: flex;
  max-width: 1200px;
  justify-content: center;
  margin: 0 auto;
`;

const NavPills = styled.div`
  display: flex;
  margin-bottom: 10px;
  justify-content: center;
`;

const MarginTop = styled.div`
  margin-top: 15px;
`;

const Container = styled.div``;

class ReviewsRouter extends Component {
  constructor() {
    super();
    this.state = {};
  }

  componentDidMount() {}

  render() {
    console.log(this.props);
    return (
      <Parent>
        {this.props.user.roles.includes(Roles.REVIEWER) ? (
          <Container>
            <NavPills>
              {ReviewsNavPillRoutes.map((item, index) => {
                return (
                  <NavPill
                    name={item.name}
                    base={this.props.base}
                    key={index}
                    path={item.path}
                    icon={item.icon}
                    material={item.material}
                    width={22}
                  />
                );
              })}
            </NavPills>
            <CardContainer>
              <MarginTop>
                <Route
                  exact
                  path={`${this.props.base}/invited`}
                  render={() => (
                    <ReviewsInvited
                      selectedAccount={this.props.selectedAccount}
                      platformContract={this.props.platformContract}
                      base={`${this.props.base}/invited`}
                      network={this.props.network}
                      web3={this.props.web3}
                    />
                  )}
                />
              </MarginTop>

              <MarginTop>
                <Route
                  exact
                  path={`${this.props.base}/open`}
                  render={() => (
                    <ReviewsOpen
                      selectedAccount={this.props.selectedAccount}
                      platformContract={this.props.platformContract}
                      base={`${this.props.base}/open`}
                      network={this.props.network}
                      web3={this.props.web3}
                    />
                  )}
                />
              </MarginTop>

              <MarginTop>
                <Route
                  exact
                  path={`${this.props.base}/myreviews`}
                  render={() => (
                    <ReviewsMyReviews
                      selectedAccount={this.props.selectedAccount}
                      platformContract={this.props.platformContract}
                      base={`${this.props.base}/myreviews`}
                      network={this.props.network}
                      web3={this.props.web3}
                    />
                  )}
                />
              </MarginTop>

              <Route
                exact
                path={`${this.props.base}`}
                render={() => {
                  return <Redirect to={`${this.props.base}/invited`} />;
                }}
              />
            </CardContainer>
          </Container>
        ) : (
          <BecomeReviewer
            user={this.props.user}
            updateUser={() => {
              this.props.updateUser();
            }}
          />
        )}
      </Parent>
    );
  }
}

export default withRouter(ReviewsRouter);