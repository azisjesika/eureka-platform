import React from 'react';
import styled from 'styled-components';
import {Card} from '../../views/Card.js';
import {InputField} from '../../design-components/Inputs.js';
import {__FIFTH, __GRAY_300, __THIRD} from '../../../helpers/colors.js';
import Icon from '../../views/icons/Icon.js';
import Modal from '../../design-components/Modal.js';
import {createContact, getContacts, updateContact} from './AddressBookMethods.js';
import CircleSpinner from '../../views/spinners/CircleSpinner.js';
import AddressBookTable from './AddressBookTable.js';

const Container = styled.div`
  display: flex;
  justify-content: center;
`;

const AddContact = styled.div`
  display: flex;
  margin: 50px 20px 0;
  position: relative;
  width: 100%;
  justify-content: space-around;
  align-items: center;
`;

const Circle = styled.div`
  &:hover {
    transform: translateY(3px);
    cursor: pointer;
  }
  opacity: ${props => (props.valid ? '1' : '0.5')};
  pointer-events: ${props => (props.valid ? 'auto' : 'none')};
  background-color: ${props => (props.valid ? __THIRD : __GRAY_300)};
  border-radius: 50%;
  padding: 0.4rem;
  transition: 0.3s all;
  color: #fff;
  background-color: ${__FIFTH};
  box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);
`;
class AddressBook extends React.Component {
  constructor() {
    super();
    this.state = {
      contacts: [],
      address: null,
      firstName: null,
      lastName: null,
      comment: null,
      showModal: false,

      fetchingContactsLoading: false,
      contactToEdit: null
    };
  }

  validate() {
    return (
      this.props.web3.utils.isAddress(this.state.address) &&
      this.state.firstName &&
      this.state.lastName
    );
  }

  handleInput(stateKey, e) {
    if (stateKey === 'address') {
      if (this.props.web3.utils.isAddress(e.target.value)) {
        this.setState({addressStatus: 'valid'});
      } else {
        this.setState({addressStatus: 'error'});
      }
    }
    this.setState({[stateKey]: e.target.value});
  }

  renderModals() {
    return (
      <Modal
        type={'notification'}
        action={'Add contact'}
        callback={() => this.addContact()}
        toggle={showModal => {
          this.setState({showModal});
        }}
        show={this.state.showModal}
        title={'Add contact'}
      >
        Do you want to add this contact to your list?
        <ul>
          <li>First Name: {this.state.firstName}</li>
          <li>Last Name: {this.state.lastName}</li>
          <li>Address: {this.state.address}</li>
          <li>Comment: {this.state.comment}</li>
        </ul>
      </Modal>
    );
  }

  addContact() {
    createContact(this.state.address, this.state.firstName, this.state.lastName, this.state.comment)
      .then((res) => {
        this.setState({showModal: false});
        this.fetchContacts();
      });
  }

  fetchContacts() {
    getContacts()
      .then(response => response.json())
      .then(response => {
        console.log(response);
        if (response.success) {
          this.setState({contacts: response.data});
        } else {
          this.setState({
            errorMessage: response.error,
            fetchingContactsLoading: false
          });
        }
      })
      .catch(err => {
        console.log(err);
        this.setState({
          errorMessage: 'Ouh. Something went wrong.',
          fetchingContactsLoading: false
        });
      });
  }

  componentDidMount() {
    this.fetchContacts();
  }

  render() {
    return (
      <Container>
        {this.renderModals()}
        <Card width={1000} title={'My Ethereum Address Book'}>
          <AddContact>

            <InputField
              width={'50%'}
              placeholder={'Ethereum Address'}
              status={this.state.address ? this.state.addressStatus : null}
              onChange={e => this.handleInput('address', e)}
            />

            <InputField
              width={'17%'}
              placeholder={'First Name'}
              onChange={e => this.handleInput('firstName', e)}
            />

            <InputField
              width={'17%'}
              placeholder={'Last Name'}
              onChange={e => this.handleInput('lastName', e)}
            />

            <InputField
              width={'17%'}
              placeholder={'Comment'}
              onChange={e => this.handleInput('comment', e)}
            />

            <Circle
              valid={this.validate()}
              onClick={() => this.setState({showModal: true})}
            >
              <Icon icon={'material'} material={'add'} width={25} noMove />
            </Circle>
          </AddContact>
          {this.state.contacts ? (
            <AddressBookTable
              contacts={this.state.contacts}
              contactToEdit={this.state.contactToEdit}
              onEdit={contactAddress => this.setState({contactToEdit: contactAddress})}
              onSave={contact => this.updateContact(contact)}
              onDelete={contactAddress => {
                this.setState({
                  showDeleteModal: true,
                  contactToDelete: contactAddress
                });
              }}
            />
          ) : (
            <div style={{marginTop: 25}}>
              <CircleSpinner />
            </div>
          )}
        </Card>
      </Container>
    );
  }
}
export default AddressBook;
