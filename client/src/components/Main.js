import React, { Component } from 'react'
import 'semantic-ui-css/semantic.min.css'

class Main extends Component {

  render() {
    return (
      <div className="main_wrapper">
        <h1>Home</h1>
        <hr />
        <p>
          Here you can put everything your heart desires.
          <span role="img" aria-label="Hooray">🙂</span>
        </p>
      </div>
    );
  }
}

export default Main;
