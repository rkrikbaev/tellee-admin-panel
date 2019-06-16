import React, { Component } from 'react';
import './Things.scss';
import {
  Button,
  Item,
  Header,
  Modal,
  Icon
} from 'semantic-ui-react';

class Things extends Component {

  constructor() {
    super();

    this.state = {
      things: [],
      open: false,
    }
  }

  getToken = async () => {
    fetch('/api/users/login', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({email: "hero12@email.com"})
    });
  };

  getThings = async () => {
    fetch('/api/things')
      .then( res =>  res.json())
      .then( things => this.setState({things}, () => {
        console.log("fetched");
      }))
      .catch( err => {
        console.log(err);
      });
  };

  removeThing = async (id, event) => {
    console.log(event)
    fetch(`/api/things/remove/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    this.close();
  }

  show = dimmer => () => this.setState({ dimmer, open: false })
  close = () => this.setState({ open: false })

  componentDidMount() {
    this.getToken();
    this.getThings();
  }

  render() {

    const { open, dimmer } = this.state

    return (
      <div id="things">
        <h1>Things</h1>
        <hr />
        <Item.Group relaxed>
          {this.state.things.map( thing =>
            <Item key={thing.id}>

              <Item.Content verticalAlign='middle'>
                <Item.Header>{thing.name}</Item.Header>
                <Item.Description>{thing.id}</Item.Description>
                <Item.Extra>
                  <Modal trigger={
                    <Button
                      color="red"
                      floated='right'
                      icon='trash alternate outline'
                      labelPosition='right'
                      content="Remove"
                      onClick={() => this.setState({ open: true })}
                    />} basic size='small' open={open}>
                    <Header icon='archive' content='REMOVE THING?' />
                    <Modal.Content>
                      <p>
                        Do you want to remove thing: {thing.id}
                      </p>
                    </Modal.Content>
                    <Modal.Actions>
                      <Button basic color='green' inverted onClick={this.close}>
                        <Icon name='remove' /> No
                      </Button>
                      <Button color='red' inverted onClick={(event) => {this.removeThing(thing.id, event)} }>
                        <Icon name='checkmark' /> Yes
                      </Button>
                    </Modal.Actions>
                  </Modal>
                  <Button
                    color="yellow"
                    floated='right'
                    icon='edit outline'
                    labelPosition='right'
                    content="Edit"
                  />
                </Item.Extra>
              </Item.Content>

            </Item>
          )}
        </Item.Group>

        {/* <Modal dimmer={dimmer} open={open} onClose={this.close}>
          <Modal.Header>REMOVE THING</Modal.Header>
          <Modal.Content>
            <Modal.Description>
              <Header>Default Profile Image</Header>
            </Modal.Description>
          </Modal.Content>
          <Modal.Actions>
            <Button color='black' onClick={this.close}>
              No
            </Button>
            <Button
              positive
              icon='trash alternate outline'
              labelPosition='right'
              content="Yes"
              onClick={this.close}
            />
          </Modal.Actions>
        </Modal> */}
      </div>
    );
  }
}

export default Things;