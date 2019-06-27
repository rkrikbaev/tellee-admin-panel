import React, { Component } from 'react';
import './Connections.scss';
import {
  Item,
  Button,
  Icon,
} from 'semantic-ui-react';
import AppModalCreate from './AppModalCreate';
import AppModalEdit from './AppModalEdit';
import DeviceModalCreate from './DeviceModalCreate';
import DeviceModalEdit from './DeviceModalEdit';
import ConnectionModalRemove from './ConnectionModalRemove';
import ErrorModal from '../errorModal';

class Connections extends Component {

  constructor() {
    super();

    this.state = {
      connections: [],
      showModalCreateApp: false,
      showModalEditApp: false,
      showModalCreateDevice: false,
      showModalEditDevice: false,
      showModalError: false,
      edittingApp: {},
      edittingDevice: {},
      removingConnection: {},
      errorText: '',
    };
  }

  getToken = async () => {
    fetch('/api/users/login', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({email: "hero12@email.com"})
    });
  };

  getConnections = async () => {
    await fetch('/api/bootstrap', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    })
      .then( res =>  res.json())
      .then( connections => {
        const parsedConnections = connections.map( item => {
          item.content = JSON.parse(item.content);
          return item;
        });
        this.setState({connections: parsedConnections})
      })
      .catch( err => console.log(err) );
  };

  componentDidMount() {
    this.getToken();
    this.getConnections();
  }

  createAppModalCallback = (
    showModalCreateApp,
    oldConnections,
  ) => {
    this.setState({ showModalCreateApp, connections: oldConnections})
  };

  createDeviceModalCallback = (
    showModalCreateDevice,
    oldConnections,
  ) => {
    this.setState({ showModalCreateDevice, connections: oldConnections})
  };

  removeModalCallback = (showModalRemove, id) => {
    this.setState({ showModalRemove });
    if(id) {
      this.setState({ connections: this.state.connections.filter( i => i.mainflux_id !== id )
      });
    };
  };

  editAppModalCallback = showModalEditApp => {
    this.setState({ showModalEditApp });
    this.getConnections();
  };

  editDeviceModalCallback = showModalEditDevice => {
    this.setState({ showModalEditDevice });
    this.getConnections();
  };

  errorModalCallback = showModalError => {
    this.setState({ showModalError });
  };

  render() {
    const {
      connections,
      showModalCreateApp,
      showModalCreateDevice,
      showModalRemove,
      showModalEditApp,
      showModalEditDevice,
      showModalError,
      edittingApp,
      edittingDevice,
      removingConnection,
      errorText,
    } = this.state;

    return (
      <div id='connections' className="main_wrapper">
        <div className="connection_top">
          <h1>Connections</h1>
          <div className="connection_btn__wrapper">
            <Button
              icon
              labelPosition='left'
              onClick={() => this.setState({ showModalCreateApp: true })}
            >
              <Icon name='chain' />
              Create App
            </Button>
            <Button
              icon
              labelPosition='left'
              onClick={() => this.setState({ showModalCreateDevice: true })}
            >
              <Icon name='chain' />
              Create Device
            </Button>
          </div>
        </div>
        <hr />
        <Item.Group relaxed>
          {
            connections.length === 0
            ? <p>
                Unfortunately we did not find your connections.
                <span role="img" aria-label="Sad">🙁</span>
              </p>
            : connections.map( item =>
              <Item key={item.mainflux_id}>

                <Item.Content verticalAlign='middle'>
                  <Item.Header>{item.name}</Item.Header>
                  <Item.Description>{item.content.type}</Item.Description>
                  <Item.Description>{item.external_id}</Item.Description>
                  <Item.Extra>
                    <Button
                      color="red"
                      floated='right'
                      icon='trash alternate outline'
                      labelPosition='right'
                      content="Remove"
                      onClick={() => this.setState({ showModalRemove: true, removingConnection: item })}
                    />
                    <Button
                      color="yellow"
                      floated='right'
                      icon='edit outline'
                      labelPosition='right'
                      content="Edit"
                      onClick={() => item.content.type === 'app'
                        ? this.setState({ showModalEditApp: true, edittingApp: item })
                        : this.setState({ showModalEditDevice: true, edittingDevice: item })}
                    />
                  </Item.Extra>
                </Item.Content>

              </Item>
            )
          }
        </Item.Group>

        <AppModalCreate
          showModalCreateApp={showModalCreateApp}
          callbackFromParent={this.createAppModalCallback}
        />

        <DeviceModalCreate
          showModalCreateDevice={showModalCreateDevice}
          callbackFromParent={this.createDeviceModalCallback}
        />

        <ConnectionModalRemove
          showModalRemove={showModalRemove}
          connection={removingConnection}
          callbackFromParent={this.removeModalCallback}
        />

        <ErrorModal
          showModalError={showModalError}
          errorText={errorText}
          callbackFromParent={this.errorModalCallback}
        />

        <AppModalEdit
          showModalEditApp={showModalEditApp}
          connection={edittingApp}
          callbackFromParent={this.editAppModalCallback}
        />

        <DeviceModalEdit
          showModalEditDevice={showModalEditDevice}
          connection={edittingDevice}
          callbackFromParent={this.editDeviceModalCallback}
        />

      </div>
    );
  }
}

export default Connections;