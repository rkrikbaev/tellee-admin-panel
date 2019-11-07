import React, { Component } from 'react'
import PropTypes from 'prop-types'
import '../connections/Connections.scss'
import {
  Button,
  Form,
  Modal,
  Dropdown,
} from 'semantic-ui-react'

const Console = {
  log: (text) => console.log(text),
}

class AppModalEdit extends Component {
  _isMounted = false

  constructor(props) {
    super(props)

    this.state = {
      config: {},
      channels: [],
      selectedChannels: [],
      showModalEditApp: false,
    }
  }

  componentDidMount() {
    const { connection } = this.props
    this._isMounted = true
    this.getConfigById(connection.external_id)
    this.getChannels()
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !(nextProps === this.props && nextState === this.state)
  }

  componentWillUnmount() {
    this._isMounted = false
  }

  getConfigById = async (id) => {
    await fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/bootstrap/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((config) => {
        const selectedChannels = []

        config.content = JSON.parse(config.content)

        for (let i = 0; i < config.mainflux_channels.length; i += 1) {
          selectedChannels.push(config.mainflux_channels[i].id)
        }
        if (this._isMounted) {
          this.setState({
            selectedChannels,
            config,
          })
        }
      })
      .catch((err) => Console.log(err))
  }

  getChannels = async () => {
    fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/channels`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((channels) => {
        const chan = channels.map((item) => ({ value: item.id, text: item.name }))
        if (this._isMounted) this.setState({ channels: chan })
      })
      .catch((err) => Console.log(err))
  }

  editApp = async () => {
    const { config } = this.state
    const { mac, name } = config.content
    const obj = {
      mac,
      id: config.mainflux_id,
      channels: config.mainflux_channels,
      name,
      type: 'app',
      content: config.content,
    }
    await fetch(
      `${process.env.REACT_APP_EXPRESS_HOST}/api/bootstrap/edit/info/${config.mainflux_id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'include',
        body: JSON.stringify({ obj }),
      },
    )
    await fetch(
      `${process.env.REACT_APP_EXPRESS_HOST}/api/channels/edit/${obj.channels[0].id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'include',
        body: JSON.stringify({ name: obj.name, metadata: {} }),
      },
    )

    this.close()
  }

  close = () => {
    const { callbackFromParent } = this.props
    const { showModalEditApp } = this.state
    if (this._isMounted) this.setState({ showModalEditApp: false })
    callbackFromParent(showModalEditApp)
  }

  handleChangeName = (e) => {
    const { config } = this.state
    const obj = config
    obj.content.name = e.target.value
    if (this._isMounted) this.setState({ config: obj })
  }

  handleChangeChannel = (e, { value }) => {
    const { config } = this.state
    const obj = config
    obj.mainflux_channels = value
    if (this._isMounted) this.setState({ config: obj })
  }

  render() {
    const { showModalEditApp } = this.props
    const { config, channels, selectedChannels } = this.state

    return (
      <Modal
        closeIcon
        dimmer="blurring"
        open={showModalEditApp}
        onClose={this.close}
      >
        <Modal.Header>EDIT APPLICATION</Modal.Header>
        <Modal.Content>
          <Form>
            <Form.Field>
              <label htmlFor="mainflux_id">Thing ID</label>
              <input
                placeholder="mainflux_id"
                value={config.content !== undefined ? config.mainflux_id : ''}
                readOnly
              />
            </Form.Field>

            <Form.Field>
              <label htmlFor="mainflux_key">Thing Key</label>
              <input
                placeholder="mainflux_key"
                value={config.content !== undefined ? config.mainflux_key : ''}
                readOnly
              />
            </Form.Field>

            <Form.Field>
              <label htmlFor="name">Name</label>
              <input
                placeholder="name"
                value={config.content !== undefined ? config.content.name : ''}
                onChange={(e) => this.handleChangeName(e)}
              />
            </Form.Field>

            <Form.Field>
              <label htmlFor="channels">Channels</label>
              <Dropdown
                placeholder="channels"
                multiple
                fluid
                selection
                options={channels}
                onChange={this.handleChangeChannel}
                value={selectedChannels}
              />
            </Form.Field>
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button color="black" onClick={this.close}>
            No
          </Button>
          <Button
            positive
            icon="edit outline"
            labelPosition="right"
            content="Yes"
            onClick={this.editApp}
          />
        </Modal.Actions>
      </Modal>
    )
  }
}

export default AppModalEdit

AppModalEdit.propTypes = {
  connection: PropTypes.instanceOf(Object).isRequired,
  callbackFromParent: PropTypes.func.isRequired,
  showModalEditApp: PropTypes.bool.isRequired,
}
