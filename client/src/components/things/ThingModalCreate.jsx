import React, { Component } from 'react';
import './Things.scss';
import {
  Button,
  Form,
  Modal
} from 'semantic-ui-react';

class ThingModalCreate extends Component {

  constructor(props) {
    super(props);

    this.state = {
      showModalCreate: false,
      name: '',
      metadata: {
        mac : '',
      },
    }
  }

  createThing = async (name, metadata) => {
    fetch('/api/things/create', {
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

  handleChangeMac = (e) => {
    let obj = { mac: e.target.value };
    this.setState({ metadata: obj });
  };

  render() {
    const { showModalCreate } = this.props;
    const { name, metadata } = this.state;

    return (
      <Modal closeIcon dimmer="blurring" open={showModalCreate} onClose={this.close}>
        <Modal.Header>CREATE THING</Modal.Header>
        <Modal.Content>
          <Form>
            <Form.Field>
              <label>Name</label>
              <input placeholder='name' value={name} onChange={e => this.handleChangeName(e)} />
            </Form.Field>
            <Form.Field>
              <label>Mac</label>
              <input placeholder='mac address' value={metadata.mac} onChange={e => this.handleChangeMac(e)} />
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
              onClick={() => this.createThing(name, metadata)}
            />
          </Modal.Actions>
        </Modal>
    );
  }
}

export default ThingModalCreate;