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

  removeConnection = async connection => {
    fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/things/remove/${connection.mainflux_id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials : 'include', mode: 'cors',
    });
    const { sendToApp, app } = connection.content;
    if(sendToApp) {
      await fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/bootstrap/${app}`,{
        credentials : 'include', mode: 'cors',
      })
        .then( response => response.json())
        .then( response => {
          response.content = JSON.parse(response.content);
          const { content } = response;

          content.things_list = content.things_list.filter( item => {
            return item.thing_id !== connection.mainflux_id;
          });

          content.models_list = content.models_list.filter( item => {
            return item.name.split(".")[1] !== connection.mainflux_id;
          });

          fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/bootstrap/edit/info/${response.mainflux_id}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            credentials : 'include', mode: 'cors',
            body: JSON.stringify({ response })
          });
        });
    }
    this.setState({ showModalRemove: false });
    this.props.callbackFromParent(this.state.showModalRemove, connection.mainflux_id);
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
          <Button color='red' inverted onClick={() => {this.removeConnection(connection)} }>
            <Icon name='checkmark' /> Yes
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }
}

export default ConnectionModalRemove;