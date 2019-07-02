import React, { Component } from 'react';
import './Things.scss';
import {
  Button,
  Header,
  Modal,
  Icon
} from 'semantic-ui-react';

class ThingModalRemove extends Component {

  constructor(props) {
    super(props);

    this.state = {
      showModalRemove: false,
    }
  }

  removeThing = async (id, event) => {
    fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/things/remove/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      mode: 'cors',
      credentials : 'include',
    });
    this.setState({ showModalRemove: false });
    this.props.callbackFromParent(this.state.showModalRemove, id);
  }

  close = () => {
    this.setState({ showModalRemove: false });
    this.props.callbackFromParent(this.state.showModalRemove);
  }

  render() {

    const { showModalRemove, thing } = this.props

    return (
      <Modal basic size='small' open={showModalRemove}>
        <Header icon='archive' content='REMOVE THING?' />
        <Modal.Content>
          <p>
            Do you want to remove thing: {thing.name}
          </p>
        </Modal.Content>
        <Modal.Actions>
          <Button basic color='green' inverted onClick={this.close}>
            <Icon name='remove' /> No
          </Button>
          <Button color='red' inverted onClick={(event) => {this.removeThing(thing.id, event)} }>
            <Icon name='checkmark' /> Yes
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }
}

export default ThingModalRemove;