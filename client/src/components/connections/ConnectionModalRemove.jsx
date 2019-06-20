import React, { Component } from 'react';
import './Connections.scss';
import {
  Button,
  Header,
  Modal,
  Icon
} from 'semantic-ui-react';

class ConnectionModalRemove extends Component {

  constructor(props) {
    super(props);

    this.state = {
      showModalRemove: false,
    }
  }

  removeConnection = async id => {
    fetch(`/api/bootstrap/remove/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    fetch(`/api/things/remove/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    this.setState({ showModalRemove: false });
    this.props.callbackFromParent(this.state.showModalRemove, id);
  }

  close = () => {
    this.setState({ showModalRemove: false });
    this.props.callbackFromParent(this.state.showModalRemove);
  }

  render() {

    const { showModalRemove, connection } = this.props;

    return (
      <Modal basic size='small' open={showModalRemove}>
        <Header icon='archive' content='REMOVE CONNECTION?' />
        <Modal.Content>
          <p>
            Do you want to remove connection: {connection.name}
          </p>
        </Modal.Content>
        <Modal.Actions>
          <Button basic color='green' inverted onClick={this.close}>
            <Icon name='remove' /> No
          </Button>
          <Button color='red' inverted onClick={() => {this.removeConnection(connection.mainflux_id)} }>
            <Icon name='checkmark' /> Yes
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }
}

export default ConnectionModalRemove;