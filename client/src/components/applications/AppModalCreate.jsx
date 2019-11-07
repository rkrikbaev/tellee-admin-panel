/* eslint-disable no-var */
/* eslint-disable vars-on-top */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import '../connections/Connections.scss'
import { Button, Modal, Form } from 'semantic-ui-react'

const Console = {
  log: (text) => console.log(text),
}
class AppModalCreate extends Component {
  _isMounted = false

  constructor(props) {
    super(props)

    this.state = {
      showModalCreateApp: false,
      isThingMacEnabled: false,
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
      channel: {
        name: '',
        metadata: {},
      },
      connectionName: '',
    }

    this.regexpName = /^\w+$/
    this.regexpMac = /^[0-9a-z]{1,2}([.:-])(?:[0-9a-z]{1,2}\1){4}[0-9a-z]{2}$/gim
  }

  componentDidMount() {
    this._isMounted = true
    this.getThings()
    this.getConnections()
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !(this.props === nextProps && this.state === nextState)
  }

  componentWillUnmount() {
    this._isMounted = false
  }

  getThings = async () => {
    await fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/things`, {
      mode: 'cors',
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((oldThings) => {
        if (this._isMounted) {
          this.setState({ oldThings })
        }
      })
      .catch((err) => Console.log(err))
  }

  getConnections = async () => {
    await fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/bootstrap`, {
      mode: 'cors',
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((oldConnections) => {
        if (this._isMounted) {
          this.setState({ oldConnections })
        }
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

  createChannel = async () => {
    const { channel } = this.state
    await fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/channels/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      credentials: 'include',
      body: JSON.stringify({ channel }),
    })
  }

  createAppConnection = async () => {
    const { newThing, connectionName } = this.state
    const { callbackFromParent } = this.props
    let channel
    let thing
    try {
      let arr = []
      await this.createChannel()
      arr = await fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/channels`, {
        mode: 'cors',
        credentials: 'include',
      })
        .then((res) => res.json())
        .then((oldChannels) => oldChannels)
        .catch((err) => Console.log(err))
      channel = arr.filter((item) => item.name === `zsse/${newThing.name}`)
      await this.createThing()
      arr = await fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/things`, {
        mode: 'cors',
        credentials: 'include',
      })
        .then((res) => res.json())
        .then((oldThings) => oldThings)
        .catch((err) => Console.log(err))

      thing = arr.filter((item) => item.name === `zsse/${newThing.name}`)
    } catch (err) {
      Console.log(err)
    }

    const obj = {
      mac: newThing.metadata.mac,
      id: thing[0].id,
      channels: `${channel[0].id}`,
      name: connectionName,
    }

    try {
      await fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/bootstrap/create/app`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'include',
        body: JSON.stringify(obj),
      })

      await fetch(
        `${process.env.REACT_APP_EXPRESS_HOST}/api/connection/create/channels/${channel[0].id}/things/${thing[0].id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          mode: 'cors',
          credentials: 'include',
        },
      )
      await this.getConnections()

      // Close and send data to parent
      const { showModalCreateApp, oldConnections } = this.state
      if (this._isMounted) {
        this.setState({ showModalCreateApp: false })
      }
      callbackFromParent(showModalCreateApp, oldConnections)
    } catch (err) {
      Console.log(err)
    }
  }

  close = async () => {
    const { showModalCreateApp, oldConnections } = this.state
    const { callbackFromParent } = this.props
    if (this._isMounted) this.setState({ showModalCreateApp: false })
    callbackFromParent(showModalCreateApp, oldConnections)
  }

  handleChangeConnectionName = (e) => {
    const { oldConnections } = this.state
    const str = e.target.value
    const arr = oldConnections.filter((item) => item.name === str)
    if ((arr.length !== 0 || !this.regexpName.test(str)) && this._isMounted) {
      this.setState({ isConnectionNameEnabled: true })
    } else if ((arr.length === 0 || this.regexpName.test(str)) && this._isMounted) {
      this.setState((prevState) => ({
        newThing: {
          ...prevState.newThing,
          name: str,
        },
        channel: {
          ...prevState.channel,
          name: str,
        },
        connectionName: str,
        isConnectionNameEnabled: false,
      }))
    }
  }

  handleChangeThingMac = (e) => {
    const { oldThings } = this.state
    const str = e.target.value
    const arr = oldThings.filter((item) => item.metadata.mac === str)
    if ((arr.length !== 0 || !this.regexpMac.test(str)) && this._isMounted) {
      this.setState({ isThingMacEnabled: true })
    } else if ((arr.length === 0 || this.regexpMac.test(str)) && this._isMounted) {
      this.setState((prevState) => ({
        newThing: {
          ...prevState.newThing,
          metadata: {
            ...prevState.newThing.metadata,
            mac: str,
          },
        },
        isThingMacEnabled: false,
      }))
    }
  }

  render() {
    const { showModalCreateApp } = this.props
    const { isThingMacEnabled, isConnectionNameEnabled } = this.state

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
              <label htmlFor="name"> Name </label>
              <input
                placeholder="name"
                onChange={(e) => this.handleChangeConnectionName(e)}
                className={isConnectionNameEnabled ? 'show_error' : ''}
              />
            </Form.Field>
            <Form.Field>
              <label htmlFor="mac"> Mac </label>
              <input
                placeholder="mac"
                onChange={(e) => this.handleChangeThingMac(e)}
                className={isThingMacEnabled ? 'show_error' : ''}
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
            disabled={isThingMacEnabled || isConnectionNameEnabled}
            onClick={this.createAppConnection}
          />
        </Modal.Actions>
      </Modal>
    )
  }
}

export default AppModalCreate

AppModalCreate.propTypes = {
  callbackFromParent: PropTypes.func.isRequired,
  showModalCreateApp: PropTypes.bool.isRequired,
}
