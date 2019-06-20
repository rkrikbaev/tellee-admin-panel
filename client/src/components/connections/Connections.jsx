import React, { Component } from 'react';
import './Connections.scss';
import {
  Item,
  Button,
  Icon,
} from 'semantic-ui-react';
import AppModalCreate from './AppModalCreate';
import DeviceModalCreate from './DeviceModalCreate';
import AppModalEdit from './AppModalEdit';
import ConnectionModalRemove from './ConnectionModalRemove';
import ErrorModal from '../errorModal';

class Connections extends Component {

  constructor() {
    super();

    this.state = {
      connections: [],
      showModalCreateApp: false,
      showModalCreateDevice: false,
      showModalError: false,
      showModalEditApp: false,
      edittingApp: {},
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
    fetch('/api/bootstrap', {
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

  errorModalCallback = showModalError => {
    this.setState({ showModalError });
  };

  render() {
    const {
      connections,
      showModalCreateApp,
      showModalCreateDevice,
      showModalError,
      showModalRemove,
      showModalEditApp,
      edittingApp,
      errorText,
      removingConnection,
    } = this.state;

    return (
      <div id='connections' className="main_wrapper">
        <div className="connection_top">
          <h1>Connections</h1>
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
                      onClick={() => this.setState({ showModalEditApp: true, edittingApp: item })}
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

      </div>
    );
  }
}

export default Connections;