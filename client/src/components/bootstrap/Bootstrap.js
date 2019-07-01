import React, { Component } from 'react';
import './Bootstrap.scss';
import {
  Button,
  Item,
} from 'semantic-ui-react';

import ConnectionModalRemove from './ConnectionModalRemove';
import ConnectionModalEdit from './ConnectionModalEdit';
class Bootstrap extends Component {

  constructor() {
    super();

    this.state = {
      connections: [],
      showModalRemove: false,
      showModalEdit: false,
      removingConnection: {},
      edittingConnection: {},
    };
  }

  getToken = async () => {
    fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/users/login`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      credentials : 'include', mode: 'cors',
      body: JSON.stringify({email: "hero12@email.com"})
    });
  };

  getConnections = async () => {
    fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/bootstrap`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials : 'include', mode: 'cors',
    })
      .then( res =>  res.json())
      .then( connections => this.setState({connections}, () => {
        console.log('fetched');
      }))
      .catch( err => console.log(err) );
  };

  removeModalCallback = (showModalRemove, id) => {
    this.setState({ showModalRemove });
    if(id) {
      this.setState({ connections: this.state.connections.filter( i => i.mainflux_id !== id )
      });
    };
  };

  editModalCallback = showModalEdit => {
    this.setState({ showModalEdit });
  };

  componentDidMount() {
    this.getToken();
    this.getConnections();
  }

  render() {

    const { connections, showModalRemove, showModalEdit, removingConnection, edittingConnection } = this.state;
    return (
      <div id='connections'>
        <h1>Connections</h1>
        <hr />
        <Item.Group relaxed>

          {connections.map( item =>
            <Item key={item.mainflux_id}>

              <Item.Content verticalAlign='middle'>
                <Item.Header>{item.name}</Item.Header>
                <Item.Description>{item.mainflux_id}</Item.Description>
                <Item.Description>{item.external_id}</Item.Description>
                <Item.Extra>
                  <Button
                    color="red"
                    floated='right'
                    icon='trash alternate outline'
                    labelPosition='right'
                    content="Remove"
                    onClick={() => this.setState({ showModalRemove: true, removingConnection: item })}
                  />
                  <Button
                    color="yellow"
                    floated='right'
                    icon='edit outline'
                    labelPosition='right'
                    content="Edit"
                    onClick={() => this.setState({ showModalEdit: true, edittingConnection: item })}
                  />
                </Item.Extra>
              </Item.Content>

            </Item>
          )}
        </Item.Group>

        <ConnectionModalRemove
          showModalRemove={showModalRemove}
          connection={removingConnection}
          callbackFromParent={this.removeModalCallback}
        />
        <ConnectionModalEdit
          showModalEdit={showModalEdit}
          connection={edittingConnection}
          callbackFromParent={this.editModalCallback}
        />
      </div>
    );
  }
}

export default Bootstrap;