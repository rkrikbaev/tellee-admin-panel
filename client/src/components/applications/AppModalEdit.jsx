import React, { Component } from 'react'
import '../connections/Connections.scss'
import { Button, Form, Modal, Dropdown } from 'semantic-ui-react'

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

        for (let i = 0; i < config.mainflux_channels.length; i++) {
          selectedChannels.push(config.mainflux_channels[i].id)
        }
        if (this._isMounted) {
          this.setState({
            selectedChannels,
            config,
          })
        }
      })
      .catch((err) => console.log(err))
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
        const chan = channels.map((item, i) => {
          return { value: item.id, text: item.name }
        })
        if (this._isMounted) this.setState({ channels: chan })
      })
      .catch((err) => console.log(err))
  }

  editApp = async () => {
    const { config } = this.state
    const { mac, name } = this.state.config.content
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
      }
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
      }
    )

    this.close()
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !(nextProps === this.props && nextState === this.state)
  }

  componentDidMount() {
    this._isMounted = true
    this.getConfigById(this.props.connection.external_id)
    this.getChannels()
  }

  componentWillUnmount() {
    this._isMounted = false
  }

  close = () => {
    if (this._isMounted) this.setState({ showModalEditApp: false })
    this.props.callbackFromParent(this.state.showModalEditApp)
  }

  handleChangeName = (e) => {
    const obj = this.state.config
    obj.content.name = e.target.value
    if (this._isMounted) this.setState({ config: obj })
  }

  handleChangeChannel = (e, { value }) => {
    let obj = this.state.config
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
              <label>Thing ID</label>
              <input
                placeholder="mainflux_id"
                value={config.content !== undefined ? config.mainflux_id : ''}
                readOnly
              />
            </Form.Field>

            <Form.Field>
              <label>Thing Key</label>
              <input
                placeholder="mainflux_key"
                value={config.content !== undefined ? config.mainflux_key : ''}
                readOnly
              />
            </Form.Field>

            <Form.Field>
              <label>Name</label>
              <input
                placeholder="name"
                value={config.content !== undefined ? config.content.name : ''}
                onChange={(e) => this.handleChangeName(e)}
              />
            </Form.Field>

            <Form.Field>
              <label>Channels</label>
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
