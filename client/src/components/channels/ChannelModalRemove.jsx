import React, { Component } from 'react';
import './Channels.scss';
import {
  Button,
  Header,
  Modal,
  Icon
} from 'semantic-ui-react';

class ChannelModalRemove extends Component {

  constructor(props) {
    super(props);

    this.state = {
      showModalRemove: false,
    }
  }

  removeChannel = async (id, event) => {
    fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/channels/remove/${id}`, {
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

    const { showModalRemove, channel } = this.props;

    return (
      <Modal basic size='small' open={showModalRemove}>
        <Header icon='archive' content='REMOVE CHANNEL?' />
        <Modal.Content>
          <p>
            Do you want to remove channel: {channel.name}
          </p>
        </Modal.Content>
        <Modal.Actions>
          <Button basic color='green' inverted onClick={this.close}>
            <Icon name='remove' /> No
          </Button>
          <Button color='red' inverted onClick={(event) => {this.removeChannel(channel.id, event)} }>
            <Icon name='checkmark' /> Yes
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }
}

export default ChannelModalRemove;