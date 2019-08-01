import React, { Component } from 'react';
import './Connections.scss';
import {
  Button,
  Modal,
  Form,
  Dropdown,
} from 'semantic-ui-react';

class DeviceModalEdit extends Component {
  constructor(props) {
    super(props);

    this.state = {
      showModalEditDevice: false,
      isEnabled: true,
      deviceTypes: [],
      apps: [],
      config: {},
      selectedDeviceType: [],
      selectedApp: [],
    };
  };

  getConfigById = async id => {
    fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/bootstrap/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      mode: 'cors',
      credentials : 'include',
    })
      .then( res =>  res.json())
      .then( config => {
        config.content = JSON.parse(config.content);
        let selectedApp = config.content.app;
        let selectedDeviceType = config.content.deviceType;
        this.setState({ selectedApp, selectedDeviceType, config });
      })
      .catch( err => console.log(err) );
  };

  getThings = async () => {
    await fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/things`, {
      mode: 'cors',
      credentials : 'include',
    })
      .then( res =>  res.json() )
      .then( oldThings => {
        const currentThing = oldThings.filter( item => {
          return item.id === this.props.connection.mainflux_id;
        });
        this.setState({currentThing: currentThing[0]});
      })
      .catch( err => console.log(err) );
  };

  getConnections = async () => {
    await fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/bootstrap`, {
      mode: 'cors',
      credentials : 'include',
    })
    .then( res =>  res.json() )
    .then( oldConnections => {
      const connections = oldConnections.filter( item => {
        item.content = JSON.parse(item.content);
        return item.content.type === 'app';
      });
      const apps = connections.map( item => {
        return { value: item.external_id, text: item.name.split(".")[0] }
      })
      this.setState({ apps });
    })
    .catch( err => console.log(err) );
  };

  getDeviceTypes = async () => {
    // fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/other/types`)
    // .then( res => res.json())
    // .then( types => {
    //   const formattedTypes = types.map( item => {
    //     return { text: item.split(".")[0], value: item.split(".")[0]}
    //   });
    //   this.setState({ types: formattedTypes });
    // })
    // .catch( err => console.log(err) );
    const arr = ['pump0', 'pump1', 'pump2', 'pump3'];
    this.setState({ deviceTypes:
      arr.map( item => {
        return { text: item, value: item };
      })
    });
  };

  componentWillReceiveProps(nextProps) {
    if(nextProps.connection !== this.props.connection){
      this.getConfigById(nextProps.connection.external_id);
      this.getThings().then( () => {
        this.forceUpdate();
      });
    };
    this.getConnections();
  };

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps === this.props || nextState !== this.state;
  };

  componentDidMount() {
    this.getDeviceTypes();
    this.getConnections();
  };

  close = () => {
    this.setState({ showModalEditDevice: false });
    this.props.callbackFromParent(this.state.showModalEditDevice);
  };

  editDevice = async () => {
    const { config } = this.state;
    const { name, cycle, deviceType, app, sendToApp, mac } = this.state.config.content;
    let obj = {};

    if(sendToApp) {
      obj = {
        type: "device",
        id: config.mainflux_id,
        mac,
        sendToApp,
        name,
        cycle,
        deviceType,
        app,
      };
    } else {
      obj = {
        type: "device",
        id: config.mainflux_id,
        mac,
        sendToApp,
        name,
        cycle,
      };
    };
    await fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/bootstrap/edit/info/${config.mainflux_id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      mode: 'cors',
      credentials : 'include',
      body: JSON.stringify({ obj })
    });

    if(sendToApp) {
      await fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/bootstrap/${app}`, {
        mode: 'cors',
        credentials : 'include',
      })
        .then( response => response.json())
        .then( response => {
          response.content = JSON.parse(response.content);
          const { content } = response;
          const editThing = content.things_list.filter( item => {
            return item.thing_id === config.mainflux_id;
          });
          const editThingIndex = content.things_list.indexOf(editThing[0]);
          content.things_list[editThingIndex] = {
            deviceType: `${deviceType}:${config.mainflux_id}`,
            thing_id: config.mainflux_id,
            thing_key: config.mainflux_key,
          };

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
    };

    this.close();
  };

  handleChangeConnectionName = e => {
    const currentValue = e.target.value;
    this.setState( prevState => ({
      config: {
        ...prevState.config,
        content: {
          ...prevState.config.content,
          name: currentValue,
        },
      },
    }));
  };

  handleChangeCycle = e => {
    const currentValue = e.target.value;
    this.setState( prevState => ({
      config: {
        ...prevState.config,
        content: {
          ...prevState.config.content,
          cycle: currentValue,
        }
      },
      isEnabled: prevState.config.content.cycle.length <= 4 && /^\d+$/.test(prevState.config.content.cycle)
    }));
  };

  handleChangeDeviceType = (e, { value }) => {
    const currentValue = value;
    this.setState( prevState => ({
      config: {
        ...prevState.config,
        content: {
          ...prevState.config.content,
          deviceType: currentValue,
        },
      },
      selectedDeviceType: value,
    }));
  };

  handleChangeApp = (e, { value }) => {
    const currentValue = value;
    this.setState( prevState => ({
      config: {
        ...prevState.config,
        content: {
          ...prevState.config.content,
          app: currentValue,
        },
      },
      selectedApp: value,
    }));
  };

  render() {
    const { showModalEditDevice } = this.props;
    const {
      config,
      isEnabled,
      deviceTypes,
      apps,
      selectedDeviceType,
      selectedApp,
    } = this.state;

    return (
      <Modal
        closeIcon
        dimmer="blurring"
        open={showModalEditDevice}
        onClose={this.close}
      >
        <Modal.Header>EDIT DEVICE</Modal.Header>
        <Modal.Content>
          <Form>
            <Form.Field>
              <label> Connection Name </label>
              <input
                placeholder='connection name'
                onChange={e => this.handleChangeConnectionName(e)}
                value={config.content !== undefined ? config.content.name : ''}
              />
            </Form.Field>
            <Form.Field>
              <label> Cycle </label>
              <input
                placeholder='cycle'
                value={config.content !== undefined ? config.content.cycle : ''}
                className={
                  !isEnabled ? 'showError' : 'showSuccess'
                  }
                onChange={e => this.handleChangeCycle(e)}
              />
            </Form.Field>
            <Form.Field className={config.content ? config.content.sendToApp ? '' : 'hide' : ''}>
              <label>Model</label>
              <Dropdown
                placeholder='model'
                fluid
                selection
                options={deviceTypes}
                value={selectedDeviceType}
                onChange={this.handleChangeDeviceType}
              />
            </Form.Field>
            <Form.Field className={config.content ? config.content.sendToApp ? '' : 'hide' : ''}>
              <label>Apps</label>
              <Dropdown
                placeholder='apps'
                fluid
                selection
                options={apps}
                onChange={this.handleChangeApp}
                value={selectedApp}
              />
            </Form.Field>
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button color='black' onClick={this.close}>
            No
          </Button>
          <Button
            positive
            icon='edit outline'
            labelPosition='right'
            content="Yes"
            onClick={this.editDevice}
            disabled={!isEnabled}
          />
        </Modal.Actions>
      </Modal>
    );
  }
};

export default DeviceModalEdit;