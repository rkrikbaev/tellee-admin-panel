import React, { Component } from 'react';
import './Connections.scss';
import {
  Item,
  Button,
  Icon,
  Popup,
  Loader,
} from 'semantic-ui-react';
import AppModalCreate from '../applications/AppModalCreate';
import AppModalEdit from '../applications/AppModalEdit';
import DeviceModalCreate from '../devices/DeviceModalCreate';
import DeviceModalEdit from '../devices/DeviceModalEdit';
import ConnectionModalRemove from './ConnectionModalRemove';
import ErrorModal from '../errorModal';

class Connections extends Component {
  _isMounted = false;

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
      loader: true,
    };
  }

  getToken = async () => {
    fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/users/login`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      mode: 'cors',
      credentials : 'include',
      body: JSON.stringify({email: `${process.env.REACT_APP_MAINFLUX_USER}`})
    });
  };

  getConnections = async () => {
    await fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/bootstrap`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      mode: 'cors',
      credentials : 'include',
    })
      .then( res =>  res.json())
      .then( connections => {
        const parsedConnections = connections.map( item => {
          item.content = JSON.parse(item.content);
          return item;
        });
        if(this._isMounted) this.setState({connections: parsedConnections, loader: false})
      })
      .catch( err => console.log(err) );
  };

  componentDidMount() {
    this._isMounted = true;
    this.getToken();
    this.getConnections();
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  componentWillReceiveProps(nextProps) {
    if( nextProps !== this.props ) {
      this.getConnections();
    };
  };

  createAppModalCallback = (
    showModalCreateApp,
    oldConnections,
  ) => {
    if(this._isMounted) this.setState({ showModalCreateApp, connections: oldConnections})
    this.getConnections();
  };

  createDeviceModalCallback = (
    showModalCreateDevice,
    oldConnections,
  ) => {
    if(this._isMounted) this.setState({ showModalCreateDevice, connections: oldConnections})
    this.getConnections();
  };

  removeModalCallback = (showModalRemove, id) => {
    if(this._isMounted) this.setState({ showModalRemove });
    if(id) {
      // FIXME:
      const connections = this.state.connections
      let connection = connections.filter( i => i.mainflux_id === id );
      const { type, app } = connection[0].content;
      if( type === 'device' && app !== undefined ) {
        let connectedApp = connections.filter( i => i.external_id === app );
        const edittedApp = connectedApp[0].content.devices.filter(i => i.device_id !== id );
        connections[connections.indexOf(connectedApp[0])].content.devices = edittedApp;
        if(this._isMounted) this.setState({ connections });
      };
      if(this._isMounted) {
        this.setState({
          connections: this.state.connections.filter( i => i.mainflux_id !== id )
        });
      }
    };
  };

  editAppModalCallback = showModalEditApp => {
    if(this._isMounted) this.setState({ showModalEditApp });
    this.getConnections();
  };

  editDeviceModalCallback = showModalEditDevice => {
    if(this._isMounted) this.setState({ showModalEditDevice });
    this.getConnections();
  };

  errorModalCallback = showModalError => {
    if(this._isMounted) this.setState({ showModalError });
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
      loader,
    } = this.state;

    return (
      <div id='connections' className="main_wrapper">
        <div className="connection_top">
          <h1> Connections </h1>
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
            <Loader active={loader} content='Loading' />
          }
          {
            connections.length === 0
            ? <p>
                Unfortunately we did not find your connections. It will be great to create some.
                <span role="img" aria-label="Sad">🙁</span>
              </p>
            : connections.map( item =>
              <Item key={item.mainflux_id}>

                <Item.Content verticalAlign='middle'>
                  <Popup
                    content={
                      <div>
                        <p>id: {item.mainflux_id}</p>
                        <p>key: {item.mainflux_key}</p>
                      </div>
                    }
                    trigger={
                      <Item.Header>{item.name}</Item.Header>
                    }
                  />
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

        {
          this.state.showModalCreateApp
          ? <AppModalCreate
            showModalCreateApp={showModalCreateApp}
            callbackFromParent={this.createAppModalCallback}
          />
          : null
        }

        {
          this.state.showModalCreateDevice
          ? <DeviceModalCreate
            showModalCreateDevice={showModalCreateDevice}
            callbackFromParent={this.createDeviceModalCallback}
          />
          : null
        }

        {
          this.state.showModalRemove
          ? <ConnectionModalRemove
            showModalRemove={showModalRemove}
            connection={removingConnection}
            callbackFromParent={this.removeModalCallback}
          />
          : null
        }

        {
          this.state.showModalError
          ? <ErrorModal
              showModalError={showModalError}
              errorText={errorText}
              callbackFromParent={this.errorModalCallback}
            />
          : null
        }

        {
          this.state.showModalEditApp
          ? <AppModalEdit
              showModalEditApp={showModalEditApp}
              connection={edittingApp}
              callbackFromParent={this.editAppModalCallback}
            />
          : null
        }

        {
          this.state.showModalEditDevice
          ? <DeviceModalEdit
              showModalEditDevice={showModalEditDevice}
              connection={edittingDevice}
              callbackFromParent={this.editDeviceModalCallback}
            />
          : null
        }
      </div>
    );
  }
}

export default Connections;