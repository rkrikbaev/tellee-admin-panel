import React, { Component } from 'react'
import './Things.scss'
import { Button, Item } from 'semantic-ui-react'
import ThingModalRemove from './ThingModalRemove'
import ThingModalEdit from './ThingModalEdit'

class Things extends Component {
  constructor() {
    super()

    this.state = {
      things: [],
      showModalEdit: false,
      showModalRemove: false,
      removingThing: {},
      edittingThing: {},
    }
  }

  componentDidMount() {
    this.getToken()
    this.getThings()
  }

  getToken = async () => {
    fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/users/login`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      credentials: 'include',
      body: JSON.stringify({ email: `${process.env.REACT_APP_MAINFLUX_USER}` }),
    })
  }

  getThings = async () => {
    fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/things`, {
      mode: 'cors',
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((things) => this.setState({ things }))
      .catch((err) => err)
  }

  removeModalCallback = (showModalRemove, removeItemId) => {
    this.setState({ showModalRemove })
    if (removeItemId) {
      this.setState((prevstate) => ({
        things: prevstate.things.filter((item) => item.id !== removeItemId),
      }))
    }
  }

  editModalCallback = (showModalEdit) => {
    this.setState({ showModalEdit })
  }

  render() {
    const {
      things,
      showModalEdit,
      showModalRemove,
      removingThing,
      edittingThing,
    } = this.state

    return (
      <div id="things">
        <h1>Things</h1>
        <hr />
        <Item.Group relaxed>
          {things.map((thing) => (
            <Item key={thing.id}>
              <Item.Content verticalAlign="middle">
                <Item.Header>{thing.name}</Item.Header>
                <Item.Description>{thing.id}</Item.Description>
                <Item.Extra>
                  <Button
                    color="red"
                    floated="right"
                    icon="trash alternate outline"
                    labelPosition="right"
                    content="Remove"
                    onClick={() =>
                      this.setState({ showModalRemove: true, removingThing: thing })
                    }
                  />
                  <Button
                    color="yellow"
                    floated="right"
                    icon="edit outline"
                    labelPosition="right"
                    content="Edit"
                    onClick={() =>
                      this.setState({ showModalEdit: true, edittingThing: thing })
                    }
                  />
                </Item.Extra>
              </Item.Content>
            </Item>
          ))}
        </Item.Group>
        <ThingModalRemove
          showModalRemove={showModalRemove}
          thing={removingThing}
          callbackFromParent={this.removeModalCallback}
        />
        <ThingModalEdit
          showModalEdit={showModalEdit}
          thing={edittingThing}
          callbackFromParent={this.editModalCallback}
        />
      </div>
    )
  }
}

export default Things
