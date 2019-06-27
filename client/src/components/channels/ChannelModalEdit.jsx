import React, { Component } from 'react';
import './Channels.scss';
import {
  Button,
  Form,
  Modal
} from 'semantic-ui-react';

class ChannelModalEdit extends Component {

  constructor(props) {
    super(props);

    this.state = {
      showModalEdit: false,
      name: props.channel.name
    }
  }

  editChannel = async (channel, event) => {
    fetch(`http://localhost:5000/api/channels/edit/${channel.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({name: channel.name, metadata: channel.metadata})
    });
    this.close();
  };

  show = () => this.setState({ showModalEdit: true });
  close = () => {
    this.setState({ showModalEdit: false });
    this.props.callbackFromParent(this.state.showModalEdit);
  };

  handleChangeName = (e) => {
    let obj = this.props.channel;
    obj.name = e.target.value;
    this.props.callbackFromParent(true, obj);
  };

  render() {
    const { showModalEdit, channel } = this.props;

    return (
      <Modal closeIcon dimmer="blurring" open={showModalEdit} onClose={this.close}>
          <Modal.Header>EDIT THING</Modal.Header>
          <Modal.Content>
          <Form>
            <Form.Field>
              <label>Name</label>
              <input placeholder='name' value={channel.name} onChange={e => this.handleChangeName(e)} />
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
              onClick={() => this.editChannel(channel)}
            />
          </Modal.Actions>
        </Modal>
    );
  }
}

export default ChannelModalEdit;