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
      channel: {
        name: '',
        metadata: {},
      },
    }
  }

  createChannel = async name => {
    const { channel } = this.state;
    fetch('https://zsse.zeinetsse.com:5000/api/channels/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({channel})
    });
    this.close();
  };

  close = () => {
    this.setState({ showModalCreate: false });
    this.props.callbackFromParent(this.state.showModalCreate);
  };

  handleChangeName = e => {
    let str = e.target.value;
    this.setState( prevState => ({
      channel: {
        ...prevState.channel,
        name: str,
      },
    }));
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