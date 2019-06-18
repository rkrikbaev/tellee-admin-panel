import React, { Component } from 'react';
import './Things.scss';
import {
  Button,
  Form,
  Modal
} from 'semantic-ui-react';

class ThingModalEdit extends Component {

  constructor(props) {
    super(props);

    this.state = {
      showModalEdit: false,
    }
  }

  editThing = async thing => {
    fetch(`/api/things/edit/${thing.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({name: thing.name, metadata: thing.metadata})
    });
    this.close();
  };

  show = () => this.setState({ showModalEdit: true });
  close = () => {
    this.setState({ showModalEdit: false });
    this.props.callbackFromParent(this.state.showModalEdit);
  };

  handleChangeMac = (e) => {
    let obj = this.props.thing;
    obj.metadata.mac = e.target.value;
    this.props.callbackFromParent(true, obj);
  };

  handleChangeName = (e) => {
    let obj = this.props.thing;
    obj.name = e.target.value;
    this.props.callbackFromParent(true, obj);
  };

  componentDidUpdate() {
  }

  // handleCreateButton(evt) {
  //   evt.preventDefault()
  //   this.close();
  // };

  render() {
    const { showModalEdit, thing } = this.props;

    return (
      <Modal closeIcon dimmer="blurring" open={showModalEdit} onClose={this.close}>
          <Modal.Header>EDIT THING</Modal.Header>
          <Modal.Content>
          <Form>
            <Form.Field>
              <label>Name</label>
              <input placeholder='name' value={thing.name} onChange={e => this.handleChangeName(e)} />
            </Form.Field>
            <Form.Field>
              <label>Mac</label>
              <input placeholder='mac address' value={thing.metadata !== undefined ? thing.metadata.mac : ''} onChange={e => this.handleChangeMac(e)} />
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
              onClick={() => this.editThing(thing)}
            />
          </Modal.Actions>
        </Modal>
    );
  }
}

export default ThingModalEdit;