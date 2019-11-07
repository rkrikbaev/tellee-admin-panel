import React, { Component } from 'react'
import PropTypes from 'prop-types'
import './Connections.scss'
import {
  Button,
  Header,
  Modal,
  Icon,
} from 'semantic-ui-react'

const Console = {
  log: (text) => console.log(text),
}

class ConnectionModalRemove extends Component {
  _isMounted = false

  constructor(props) {
    super(props)

    this.state = {
      showModalRemove: false,
      isRemoveable: true,
    }
  }

  componentDidMount() {
    this._isMounted = true
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps(nextProps) {
    const { content } = nextProps.connection
    if (
      (content !== undefined
      && content.type === 'app'
      && content.devices.length !== 0)
      && this._isMounted
    ) {
      this.setState({ isRemoveable: false })
    } else if (
      (content !== undefined
      && content.type !== 'app'
      && content.devices.length === 0)
      && this._isMounted) {
      this.setState({ isRemoveable: true })
    }
  }

  componentWillUnmount() {
    this._isMounted = false
  }

  getChannel = async (app) => {
    const arr = await fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/channels`, {
      mode: 'cors',
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((oldChannels) => oldChannels)
      .catch((err) => Console.log(err))

    const channel = arr.filter((item) => item.name === app)
    return channel[0]
  }

  removeConnection = async (connection) => {
    const { callbackFromParent } = this.props
    const { showModalRemove } = this.state
    const { sendToApp, app, type } = connection.content
    fetch(
      `${process.env.REACT_APP_EXPRESS_HOST}/api/things/remove/${connection.mainflux_id}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'include',
      },
    )
    fetch(
      `${process.env.REACT_APP_EXPRESS_HOST}/api/bootstrap/remove/${connection.mainflux_id}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'include',
      },
    )
    fetch(
      `${process.env.REACT_APP_EXPRESS_HOST}/api/device/remove/${connection.mainflux_id}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'include',
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

          content.devices = content.devices.filter((item) => (
            item.device_id !== connection.mainflux_id))

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
        })
    }
    if (type === 'app') {
      const arr = await this.getChannel(connection.name)
      fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/channels/remove/${arr.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'cors',
        credentials: 'include',
      })
    }

    if (this._isMounted) {
      this.setState({ showModalRemove: false })
    }
    callbackFromParent(showModalRemove, connection.mainflux_id)
  }

  close = () => {
    const { callbackFromParent } = this.props
    const { showModalRemove } = this.state
    if (this._isMounted) {
      this.setState({ showModalRemove: false, isRemoveable: true }, () => {
        callbackFromParent(showModalRemove)
      })
    }
  }

  render() {
    const { showModalRemove, connection } = this.props
    const { isRemoveable } = this.state
    return (
      <Modal basic size="small" open={showModalRemove}>
        <Header
          icon="archive"
          content={isRemoveable ? 'REMOVE CONNECTION?' : 'CAN NOT REMOVE CONNECTION'}
        />
        <Modal.Content>
          <p>
            {isRemoveable
              ? `Do you want to remove connection: ${connection.name}`
              : `CONNECTION '${connection.name}' HAVE CONNECTED DEVICES. FIRST REMOVE CONNECTED DEVICES.`}
          </p>
        </Modal.Content>
        <Modal.Actions>
          <Button basic color="green" inverted onClick={this.close}>
            <Icon name="remove" />
            {' '}
            No
          </Button>
          <Button
            color="red"
            inverted
            onClick={() => (isRemoveable ? this.removeConnection(connection) : this.close())}
          >
            <Icon name="checkmark" />
            {' '}
            Yes
          </Button>
        </Modal.Actions>
      </Modal>
    )
  }
}

export default ConnectionModalRemove

ConnectionModalRemove.propTypes = {
  connection: PropTypes.instanceOf(Object).isRequired,
  callbackFromParent: PropTypes.func.isRequired,
  showModalRemove: PropTypes.bool.isRequired,
}
