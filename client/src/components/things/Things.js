import React, { Component } from 'react';

class Things extends Component {

  constructor() {
    super();

    this.state = {
      things: [],
    }
  }

  componentDidMount() {
    fetch('/api/things')
      .then( res => res.json() )
      .then( things => this.setState({things},
        () =>
          console.log('Things fetched', things)
        ))
      .catch( err => {
        console.log(err);
      })
  }

  render() {
    return (
      <div>
        <h1>Things</h1>
        <ul>
          {this.state.things.map( thing =>
            <li key={thing.id}>{ thing.name } { thing.mac }</li>
          )}
        </ul>
      </div>
    );
  }
}

export default Things;