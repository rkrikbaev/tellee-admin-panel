import React, { Component } from 'react';
import './Connections.scss';
import {
  Button,
  Modal,
  Form,
} from 'semantic-ui-react';

class AppModalCreate extends Component {

  constructor(props) {
    super(props);

    this.state = {
      showModalCreateApp: false,
      isThingNameEnabled: false,
      isConnectionNameEnabled: false,
      oldThings: [],
      oldConnections: [],
      newThing: {
        name: '',
        metadata: {
          type: 'app',
          mac: '',
        },
      },
      connectionName: '',
    };
  };

  getThings = async () => {
    await fetch('http://localhost:5000/api/things')
      .then( res =>  res.json() )
      .then( oldThings => {
        this.setState({oldThings});
      })
      .catch( err => console.log(err) );
  };

  getConnections = async () => {
    await fetch('http://localhost:5000/api/bootstrap')
    .then( res =>  res.json() )
    .then( oldConnections => {
      this.setState({oldConnections});
      })
      .catch( err => console.log(err) );
  };

  createThing = async () => {
    await fetch('http://localhost:5000/api/things/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(this.state.newThing),
    });
  };

  createAppConnection = async () => {
    const { newThing, connectionName } = this.state;
    try {
      let arr = [];
      await this.createThing();
      await fetch('http://localhost:5000/api/things')
        .then( res =>  res.json() )
        .then( oldThings => {
          arr = oldThings;
        })
        .catch( err => console.log(err) );

      var thing = arr.filter( item => {
        return item.name === newThing.name;
      });
    } catch(err) {
      console.log(err);
    }

    const obj = {
      mac: newThing.metadata.mac,
      id: thing[0].id,
      channels: '18cafc24-4a24-4150-9e2d-a0ecdedf58a9',
      name: connectionName,
    };

    try {
      await fetch('http://localhost:5000/api/bootstrap/create/app', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(obj),
      });

      await fetch(
        `http://localhost:5000/api/connection/create/channels/18cafc24-4a24-4150-9e2d-a0ecdedf58a9/things/${thing[0].id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
        });
      await this.getConnections();

      // Close and send data to parent
      const { showModalCreateApp, oldConnections } = this.state;
      this.setState({ showModalCreateApp: false });
      this.props.callbackFromParent(showModalCreateApp, oldConnections)
    } catch(err) {
      console.log(err);
    }
  };

  close = async () => {
    const { showModalCreateApp, oldConnections } = this.state;
    this.setState({ showModalCreateApp: false });
    this.props.callbackFromParent(showModalCreateApp, oldConnections)
  };

  componentDidMount() {
    this.getThings();
    this.getConnections();
  }

  handleChangeThingName = e => {
    let str = e.target.value;
    let arr = this.state.oldThings.filter( item => {
      return item.name === str;
    });
    if(arr.length !== 0) {
      this.setState({ isThingNameEnabled: true });
    } else {
      this.setState( prevState => ({
        newThing: {
          ...prevState.newThing,
          name: str,
        },
        isThingNameEnabled: false,
      }));
    };
  };

  handleChangeThingMac = e => {
    let str = e.target.value;
    this.setState( prevState => ({
      newThing: {
        ...prevState.newThing,
        metadata: {
          ...prevState.newThing.metadata,
          mac: str,
        },
      },
    }));
  };

  handleChangeConnectionName = e => {
    let str = e.target.value;
    let arr = this.state.oldConnections.filter( item => {
      return item.name === str;
    });
    if(arr.length !== 0) {
      this.setState({ isConnectionNameEnabled: true });
    } else {
      this.setState({
        connectionName: str,
        isConnectionNameEnabled: false,
      });
    };
  };

  render() {
    const { showModalCreateApp } = this.props;
    const { isThingNameEnabled, isConnectionNameEnabled } = this.state;

    return (
      <Modal
        closeIcon
        dimmer="blurring"
        open={showModalCreateApp}
        onClose={this.close}
      >
        <Modal.Header> CREATE APP </Modal.Header>

        <Modal.Content>
          <Form>
            <Form.Field>
              <label> Thing Name </label>
              <input
                placeholder='thing name'
                onChange={e => this.handleChangeThingName(e)}
                className={isThingNameEnabled ? 'show_error' : ''}
              />
            </Form.Field>
            <Form.Field>
              <label> Thing Mac </label>
              <input
                placeholder='thing mac'
                onChange={e => this.handleChangeThingMac(e)}
              />
            </Form.Field>
            <Form.Field>
              <label> Connection Name </label>
              <input
                placeholder='connection name'
                onChange={e => this.handleChangeConnectionName(e)}
                className={isConnectionNameEnabled ? 'show_error' : ''}
              />
            </Form.Field>
          </Form>
        </Modal.Content>

        <Modal.Actions>
          <Button color='black' onClick={this.close}>
            Cancel
          </Button>
          <Button
            positive
            icon='plus'
            labelPosition='right'
            content="Create"
            disabled={isThingNameEnabled || isConnectionNameEnabled}
            onClick={this.createAppConnection}
          />
        </Modal.Actions>

      </Modal>
    )
  }

}

export default AppModalCreate;