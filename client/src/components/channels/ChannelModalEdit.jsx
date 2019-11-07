import React, { Component } from 'react'
import PropTypes from 'prop-types'
import './Channels.scss'
import { Button, Form, Modal } from 'semantic-ui-react'

class ChannelModalEdit extends Component {
  constructor(props) {
    super(props)

    this.state = {
      showModalEdit: false,
    }
  }

  editChannel = async (channel) => {
    fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/channels/edit/${channel.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      credentials: 'include',
      body: JSON.stringify({ name: channel.name, metadata: channel.metadata }),
    })
    this.close()
  }

  show = () => this.setState({ showModalEdit: true })

  close = () => {
    const { callbackFromParent } = this.props
    const { showModalEdit } = this.state
    this.setState({ showModalEdit: false })
    callbackFromParent(showModalEdit)
  }

  handleChangeName = (e) => {
    const { channel, callbackFromParent } = this.props
    const obj = channel
    obj.name = e.target.value
    callbackFromParent(true, obj)
  }

  render() {
    const { showModalEdit, channel } = this.props

    return (
      <Modal closeIcon dimmer="blurring" open={showModalEdit} onClose={this.close}>
        <Modal.Header>EDIT CHANNEL</Modal.Header>
        <Modal.Content>
          <Form>
            <Form.Field>
              <label htmlFor="name">Name</label>
              <input
                placeholder="name"
                value={channel.name}
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
            onClick={() => this.editChannel(channel)}
          />
        </Modal.Actions>
      </Modal>
    )
  }
}

export default ChannelModalEdit

ChannelModalEdit.propTypes = {
  channel: PropTypes.instanceOf(Object).isRequired,
  callbackFromParent: PropTypes.func.isRequired,
  showModalEdit: PropTypes.bool.isRequired,
}
