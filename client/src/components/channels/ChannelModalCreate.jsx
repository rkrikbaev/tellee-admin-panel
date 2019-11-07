import React, { Component } from 'react'
import PropTypes from 'prop-types'
import './Channels.scss'
import { Button, Form, Modal } from 'semantic-ui-react'

class ChannelModalCreate extends Component {
  constructor(props) {
    super(props)

    this.state = {
      showModalCreate: false,
      channel: {
        name: '',
        metadata: {},
      },
    }
  }

  createChannel = async () => {
    const { channel } = this.state
    fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/channels/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      credentials: 'include',
      body: JSON.stringify({ channel }),
    })
    this.close()
  }

  close = () => {
    const { callbackFromParent } = this.props
    const { showModalCreate } = this.state
    this.setState({ showModalCreate: false })
    callbackFromParent(showModalCreate)
  }

  handleChangeName = (e) => {
    const str = e.target.value
    this.setState((prevState) => ({
      channel: {
        ...prevState.channel,
        name: str,
      },
    }))
  }

  render() {
    const { showModalCreate } = this.props
    const { name } = this.state

    return (
      <Modal closeIcon dimmer="blurring" open={showModalCreate} onClose={this.close}>
        <Modal.Header>CREATE THING</Modal.Header>
        <Modal.Content>
          <Form>
            <Form.Field>
              <label htmlFor="name">Name</label>
              <input
                placeholder="name"
                value={name}
                onChange={(e) => this.handleChangeName(e)}
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
            onClick={() => this.createChannel(name)}
          />
        </Modal.Actions>
      </Modal>
    )
  }
}

export default ChannelModalCreate

ChannelModalCreate.propTypes = {
  callbackFromParent: PropTypes.func.isRequired,
  showModalCreate: PropTypes.bool.isRequired,
}
