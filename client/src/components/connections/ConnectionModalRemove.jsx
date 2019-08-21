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
      isRemoveable: true,
    }
  }

  getChannel = async app => {
    let arr = await fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/channels`, {
      mode: 'cors',
      credentials: 'include'
    })
    .then( res => res.json())
    .then( oldChannels => {
      return oldChannels;
    })
    .catch( err => console.log(err));

    var channel = arr.filter( item => {
      return item.name === app;
    });
    return channel[0];
  }

  removeConnection = async connection => {
    fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/things/remove/${connection.mainflux_id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      mode: 'cors',
      credentials : 'include',
    });
    fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/bootstrap/remove/${connection.mainflux_id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      mode: 'cors',
      credentials : 'include',
    });
    const { sendToApp, app } = connection.content;
    if(sendToApp) {
      await fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/bootstrap/${app}`,{
        mode: 'cors',
        credentials : 'include',
      })
        .then( response => response.json())
        .then( response => {
          response.content = JSON.parse(response.content);
          const { content } = response;

          content.devices = content.devices.filter( item => {
            return item.device_id !== connection.mainflux_id;
          });

          fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/bootstrap/edit/info/${response.mainflux_id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            mode: 'cors',
            credentials : 'include',
            body: JSON.stringify({ response })
          });
        });
    }

    let arr = await this.getChannel(connection.name);
    fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/channels/remove/${arr.id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      mode: 'cors',
      credentials : 'include',
    });

    this.setState({ showModalRemove: false });
    this.props.callbackFromParent(this.state.showModalRemove, connection.mainflux_id);
  }

  componentWillReceiveProps(nextProps) {
    const { content } = nextProps.connection;
    if( content !== undefined && content.type === 'app' && content.devices.length !== 0) {
      this.setState({ isRemoveable: false });
    } else {
      this.setState({ isRemoveable: true });
    };
  };


  close = () => {
    this.setState({ showModalRemove: false, isRemoveable: true }, () => {
      this.props.callbackFromParent(this.state.showModalRemove);
    });
  }

  render() {
    const { showModalRemove, connection } = this.props;
    const { isRemoveable } = this.state;
    return (
      <Modal basic size='small' open={showModalRemove}>
        <Header icon='archive' content={isRemoveable ? 'REMOVE CONNECTION?': 'CAN NOT REMOVE CONNECTION'} />
        <Modal.Content>
          <p>
            {
              isRemoveable
              ? `Do you want to remove connection: ${connection.name}`
              : `CONNECTION '${connection.name}' HAVE CONNECTED DEVICES. FIRST REMOVE CONNECTED DEVICES.`
            }
          </p>
        </Modal.Content>
        <Modal.Actions>
          <Button basic color='green' inverted onClick={this.close}>
            <Icon name='remove' /> No
          </Button>
          <Button color='red' inverted onClick={() => {isRemoveable ? this.removeConnection(connection) : this.close()} }>
            <Icon name='checkmark' /> Yes
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }
}

export default ConnectionModalRemove;