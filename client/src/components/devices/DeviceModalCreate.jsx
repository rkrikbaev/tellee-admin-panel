import React, { Component } from 'react'
import PropTypes from 'prop-types'
import '../connections/Connections.scss'
import {
  Button,
  Form,
  Modal,
  Dropdown,
  Checkbox,
} from 'semantic-ui-react'

const alertMessagesText = {
  title: 'Turbine',
  subtitle: 'LM2500',
  assettext: 'MTU',
  assetvalue: 'operation',
}

const Console = {
  log: (text) => console.log(text),
}

class DeviceModalCreate extends Component {
  _isMounted = false

  constructor(props) {
    super(props)

    this.state = {
      deviceTypes: [],
      apps: [],
      oldThings: [],
      oldConnections: [],
      isEnabled: true,
      showModalCreateDevice: false,
      isThingMacDisabled: false,
      isConnectionNameDisabled: false,
      newThing: {
        name: '',
        metadata: {
          type: 'device',
          mac: '',
        },
      },
      config: {
        id: '',
        channel: [],
        name: '',
        cycle: '',
        sendToApp: false,
        sendToDB: false,
        deviceType: undefined,
        app: undefined,
      },
      newDevice: {
        id: '',
        title: alertMessagesText.title,
        subtitle: alertMessagesText.subtitle,
        assettext: alertMessagesText.assettext,
        assetvalue: alertMessagesText.assetvalue,
        longitude: '',
        latitude: '',
        severity: '',
        alertext: '',
        alertvalue: '',
        messagetext: '',
      },
    }

    this.oldThings = []
    this.regexpName = /^\w+$/
    this.regexpMac = /^[0-9a-z]{1,2}([.:-])(?:[0-9a-z]{1,2}\1){4}[0-9a-z]{2}$/gim
  }

  componentDidMount() {
    this._isMounted = true
    this.getThings()
    this.getConnections()
    this.getDeviceTypes()
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps !== this.props) {
      this.getConnections()
      this.getThings()
    }
  }

  componentWillUnmount() {
    this._isMounted = false
  }

  getConnections = async () => {
    await fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/bootstrap`, {
      mode: 'cors',
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((oldConnections) => {
        this.setState({ oldConnections })
        const connections = oldConnections.filter((item) => {
          item.content = JSON.parse(item.content)
          return item.content.type === 'app'
        })
        const apps = connections.map((item) => ({
          key: item.external_id,
          text: item.name,
          value: item.external_id,
        }))
        if (this._isMounted) this.setState({ apps })
      })
      .catch((err) => Console.log(err))
  }

  getDeviceTypes = async () => {
    fetch('http://134.209.240.215:8300/devices')
      .then((res) => res.json())
      .then((types) => {
        const formattedTypes = types.map((type) => ({
          text: type,
          value: type,
        }))
        if (this._isMounted) {
          this.setState({ deviceTypes: formattedTypes })
        }
      })
      .catch((err) => Console.log(err))
  }

  getThings = async () => {
    await fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/things`, {
      mode: 'cors',
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((oldThings) => {
        this.oldThings = oldThings
        if (this._isMounted) this.setState({ oldThings })
      })
      .catch((err) => Console.log(err))
  }

  createThing = async () => {
    const { newThing } = this.state
    await fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/things/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      credentials: 'include',
      body: JSON.stringify(newThing),
    })
  }

  getChannel = async (appMac) => {
    const { oldConnections } = this.state
    let channel = []
    const app = oldConnections.filter((item) => (
      item.external_id === appMac
    ))
    const arr = await fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/channels`, {
      mode: 'cors',
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((oldChannels) => oldChannels)
      .catch((err) => Console.log(err))

    channel = arr.filter((item) => (
      item.name === app[0].name
    ))
    return channel[0]
  }

  getGlobalChannel = async (channelName) => {
    const arr = await fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/channels`, {
      mode: 'cors',
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((oldChannels) => oldChannels)
      .catch((err) => Console.log(err))
    const globalChannel = arr.filter((item) => (
      item.name === `zsse/${channelName}`
    ))
    return globalChannel[0]
  }

  // -- Start of creating device --
  createDeviceConnection = async () => {
    const { callbackFromParent } = this.props
    const {
      newThing,
      connectionName,
      config,
      newDevice,
    } = this.state
    const {
      cycle,
      sendToApp,
      sendToDB,
      deviceType,
      app,
    } = config
    let createdThing = []

    try {
      await this.createThing()
      await this.getThings()

      createdThing = this.oldThings.filter((item) => (
        item.name === `zsse/${newThing.name}`
      ))
    } catch (err) {
      Console.log(err)
    }

    let obj = {}
    let channel = {}
    if (sendToApp) {
      channel = await this.getChannel(app)
      obj = {
        mac: newThing.metadata.mac,
        id: createdThing[0].id,
        channel: channel.id,
        name: connectionName,
        cycle,
        sendToApp,
        sendToDB,
        deviceType,
        app,
      }
    } else {
      channel = await this.getGlobalChannel(process.env.REACT_APP_CHANNEL_NAME)
      obj = {
        mac: newThing.metadata.mac,
        id: createdThing[0].id,
        channel: channel.id,
        name: connectionName,
        cycle,
        deviceType,
        sendToApp,
        sendToDB,
      }
    }

    try {
      await fetch(
        `${process.env.REACT_APP_EXPRESS_HOST}/api/bootstrap/create/device`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          mode: 'cors',
          credentials: 'include',
          body: JSON.stringify(obj),
        },
      )

      if (sendToApp) {
        await fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/bootstrap/${app}`, {
          mode: 'cors',
          credentials: 'include',
        })
          .then((response) => response.json())
          .then((response) => {
            response.content = JSON.parse(response.content)
            const { content } = response
            content.devices.push({
              device_name: `zsse/${connectionName}`,
              device_id: createdThing[0].id,
              device_key: createdThing[0].key,
              deviceType: obj.deviceType,
            })
            fetch(
              `${process.env.REACT_APP_EXPRESS_HOST}/api/bootstrap/edit/info/${response.mainflux_id}`,
              {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                mode: 'cors',
                credentials: 'include',
                body: JSON.stringify({ response }),
              },
            )
            // - Connecting to App's channel - //
            fetch(
              `${process.env.REACT_APP_EXPRESS_HOST}/api/connection/create/channels/${response.mainflux_channels[0].id}/things/${createdThing[0].id}`,
              {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                },
                mode: 'cors',
                credentials: 'include',
              },
            )
          })
      } else {
        await fetch(
          `${process.env.REACT_APP_EXPRESS_HOST}/api/connection/create/channels/${channel.id}/things/${createdThing[0].id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            mode: 'cors',
            credentials: 'include',
          },
        )
      }
      if (sendToDB) {
        const {
          title,
          subtitle,
          severity,
          alerttext,
          alertvalue,
          assettext,
          assetvalue,
          messagetext,
          longitude,
          latitude,
        } = newDevice
        const createdDevice = {
          id: newThing.name,
          title,
          subtitle,
          severity,
          alerttext,
          alertvalue,
          assettext,
          assetvalue,
          messagetext,
          longitude,
          latitude,
        }

        await fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/device/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          mode: 'cors',
          credentials: 'include',
          body: JSON.stringify(createdDevice),
        })
      }
      await this.getConnections()

      // Close and send data to parent
      const { showModalCreateDevice, oldConnections } = this.state
      if (this._isMounted) this.setState({ showModalCreateDevice: false })
      callbackFromParent(showModalCreateDevice, oldConnections)
      if (this._isMounted) {
        this.setState((prevState) => ({
          config: {
            ...prevState.config,
            sendToApp: false,
          },
        }))
      }
    } catch (err) {
      Console.log(err)
    }
  }
  // -- End of creating device --

  close = async () => {
    const { callbackFromParent } = this.props
    const { showModalCreateDevice, oldConnections } = this.state
    this.setState({ showModalCreateDevice: false })
    this.setState((prevState) => ({
      config: {
        ...prevState.config,
        sendToApp: false,
      },
    }))
    callbackFromParent(showModalCreateDevice, oldConnections)
  }

  handleChangeConnectionName = (e) => {
    const { oldConnections } = this.state
    const str = e.target.value
    const arr = oldConnections.filter((item) => (
      item.name === `zsse/${str}`
    ))
    if ((arr.length !== 0 || !this.regexpName.test(str)) && this._isMounted) {
      if (this._isMounted) this.setState({ isConnectionNameDisabled: true })
    } else if ((arr.length === 0 || this.regexpName.test(str)) && this._isMounted) {
      this.setState((prevState) => ({
        newThing: {
          ...prevState.newThing,
          name: str,
        },
        connectionName: str,
        isConnectionNameDisabled: false,
      }))
    }
  }

  handleChangeThingMac = (e) => {
    const { oldThings } = this.state
    const str = e.target.value
    const arr = oldThings.filter((item) => (
      item.metadata.mac === str
    ))
    if ((arr.length !== 0 || !this.regexpMac.test(str)) && this._isMounted) {
      this.setState({ isThingMacDisabled: true })
    } else if ((arr.length === 0 || this.regexpMac.test(str)) && this._isMounted) {
      this.setState((prevState) => ({
        newThing: {
          ...prevState.newThing,
          metadata: {
            ...prevState.newThing.metadata,
            mac: str,
          },
        },
        isThingMacDisabled: false,
      }))
    }
  }

  // TODO:
  // handleChangeConfig = e => {
  //   if(this._isMounted) {
  //     var config = {...this.state.config};
  //     config[Object.keys(e)[0]] = e[Object.keys(e)[0]];
  //     this.setState({config});
  //   }
  // };

  handleChangeCycle = (e) => {
    const str = e.target.value
    if (this._isMounted) {
      this.setState((prevState) => ({
        config: {
          ...prevState.config,
          cycle: str,
        },
        isEnabled:
          prevState.config.cycle.length <= 4 && /^\d+$/.test(prevState.config.cycle),
      }))
    }
  }

  handleChangeSendToApp = (e, { checked }) => {
    if (this._isMounted) {
      this.setState((prevState) => ({
        config: {
          ...prevState.config,
          sendToApp: checked,
        },
      }))
    }
    this.getConnections()
  }

  handleChangeSendToDB = (e, { checked }) => {
    if (this._isMounted) {
      this.setState((prevState) => ({
        config: {
          ...prevState.config,
          sendToDB: checked,
        },
      }))
    }
  }

  handleChangeDeviceType = (e, { value }) => {
    if (this._isMounted) {
      this.setState((prevState) => ({
        config: {
          ...prevState.config,
          deviceType: value,
        },
      }))
    }
  }

  handleChangeApp = (e, { value }) => {
    if (this._isMounted) {
      this.setState((prevState) => ({
        config: {
          ...prevState.config,
          app: value,
        },
      }))
    }
  }

  handleChangeNewDevice = (e) => {
    const { newDevice } = this.state
    if (this._isMounted) {
      const createdDevice = { ...newDevice }
      createdDevice[Object.keys(e)[0]] = e[Object.keys(e)[0]]
      this.setState({ newDevice: createdDevice })
    }
  }

  render() {
    const { showModalCreateDevice } = this.props
    const {
      isThingMacDisabled,
      isConnectionNameDisabled,
      isEnabled,
      deviceTypes,
      apps,
      config,
      newDevice,
    } = this.state

    return (
      <Modal
        closeIcon
        dimmer="blurring"
        open={showModalCreateDevice}
        onClose={this.close}
      >
        <Modal.Header> CREATE DEVICE </Modal.Header>

        <Modal.Content>
          <Form>
            <Form.Field>
              <label htmlFor="mainflux_key">Name</label>
              <input
                placeholder="name"
                onChange={(e) => this.handleChangeConnectionName(e)}
                className={isConnectionNameDisabled ? 'show_error' : ''}
              />
            </Form.Field>
            <Form.Field>
              <label htmlFor="mainflux_key">Mac</label>
              <input
                placeholder="mac"
                onChange={(e) => this.handleChangeThingMac(e)}
                className={isThingMacDisabled ? 'show_error' : ''}
              />
            </Form.Field>
            <Form.Field>
              <label htmlFor="mainflux_key">Device type</label>
              <Dropdown
                placeholder="type"
                fluid
                selection
                options={deviceTypes}
                onChange={this.handleChangeDeviceType}
              />
            </Form.Field>
            <Form.Field>
              <label htmlFor="mainflux_key">Cycle</label>
              <input
                placeholder="cycle"
                className={!isEnabled ? 'showError' : 'showSuccess'}
                onChange={(e) => this.handleChangeCycle(e)}
              />
            </Form.Field>
            <Form.Field>
              <Checkbox
                label={
                  config.sendToApp
                    ? 'This device will be sent to App'
                    : 'Click checkbox for send this config to App'
                }
                onChange={this.handleChangeSendToApp}
              />
              <Checkbox
                label={
                  config.sendToDB
                    ? 'This device have additional info'
                    : 'Click checkbox for additional info'
                }
                onChange={this.handleChangeSendToDB}
              />
            </Form.Field>
            <Form.Field className={config.sendToApp ? '' : 'hide'}>
              <label htmlFor="mainflux_key">Apps</label>
              <Dropdown
                placeholder="apps"
                fluid
                selection
                options={apps}
                onChange={this.handleChangeApp}
              />
            </Form.Field>
            <Form.Field className={config.sendToDB ? '' : 'hide'}>
              <label htmlFor="mainflux_key">Title</label>
              <input
                placeholder="Device title"
                onChange={(e) => this.handleChangeNewDevice({ title: e.target.value })}
                value={newDevice.title}
              />
            </Form.Field>
            <Form.Field className={config.sendToDB ? '' : 'hide'}>
              <label htmlFor="mainflux_key">Subtitle</label>
              <input
                placeholder="Device subtitle"
                onChange={(e) => this.handleChangeNewDevice({ subtitle: e.target.value })}
                value={newDevice.subtitle}
              />
            </Form.Field>
            <Form.Field className={config.sendToDB ? '' : 'hide'}>
              <label htmlFor="mainflux_key">Latitude</label>
              <input
                placeholder="Device latitude"
                onChange={(e) => this.handleChangeNewDevice({ latitude: e.target.value })}
              />
            </Form.Field>
            <Form.Field className={config.sendToDB ? '' : 'hide'}>
              <label htmlFor="mainflux_key">Longitude</label>
              <input
                placeholder="Device longitude"
                onChange={(e) => this.handleChangeNewDevice({ longitude: e.target.value })}
              />
            </Form.Field>
            <Form.Field className={config.sendToDB ? '' : 'hide'}>
              <label htmlFor="mainflux_key">Asset text</label>
              <input
                placeholder="Asset text"
                onChange={(e) => this.handleChangeNewDevice({ assettext: e.target.value })}
                value={newDevice.assettext}
              />
            </Form.Field>
            <Form.Field className={config.sendToDB ? '' : 'hide'}>
              <label htmlFor="mainflux_key">Asset value</label>
              <input
                placeholder="Asset value"
                onChange={(e) => this.handleChangeNewDevice({ assetvalue: e.target.value })}
                value={newDevice.assetvalue}
              />
            </Form.Field>
          </Form>
        </Modal.Content>

        <Modal.Actions>
          <Button color="black" onClick={this.close}>
            Cancel
          </Button>
          <Button
            positive
            icon="plus"
            labelPosition="right"
            content="Create"
            disabled={isThingMacDisabled || isConnectionNameDisabled || !isEnabled}
            onClick={this.createDeviceConnection}
          />
        </Modal.Actions>
      </Modal>
    )
  }
}

export default DeviceModalCreate

DeviceModalCreate.propTypes = {
  callbackFromParent: PropTypes.func.isRequired,
  showModalCreateDevice: PropTypes.bool.isRequired,
}
