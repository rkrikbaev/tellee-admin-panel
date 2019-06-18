import React, { Component } from 'react';
import './Channels.scss';
import {
  Button,
  Form,
  Modal
} from 'semantic-ui-react';

class ChannelModalCreate extends Component {

  constructor(props) {
    super(props);

    this.state = {
      showModalCreate: false,
      name: '',
      metadata: {},
    }
  }

  createChannel = async name => {
    const { metadata } = this.state;
    fetch('/api/channels/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({name, metadata})
    });
    this.close();
  };

  show = () => this.setState({ showModalCreate: true });
  close = () => {
    this.setState({ showModalCreate: false });
    this.props.callbackFromParent(this.state.showModalCreate);
  };

  handleChangeName = (e) => {
    this.setState({ name: e.target.value });
  };

  render() {
    const { showModalCreate } = this.props;
    const { name } = this.state;

    return (
      <Modal closeIcon dimmer="blurring" open={showModalCreate} onClose={this.close}>
        <Modal.Header>CREATE THING</Modal.Header>
        <Modal.Content>
          <Form>
            <Form.Field>
              <label>Name</label>
              <input placeholder='name' value={name} onChange={e => this.handleChangeName(e)} />
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
              onClick={() => this.createChannel(name)}
            />
          </Modal.Actions>
        </Modal>
    );
  }
}

export default ChannelModalCreate;