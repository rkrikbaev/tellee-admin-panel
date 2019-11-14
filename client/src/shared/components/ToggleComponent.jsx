import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Store from '../../store/configureStore'

class ToggleComponent extends Component {
  constructor(props) {
    super(props)
    this.state = {
      opened: false,
    }
    Store.subscribe(() => {
      this.setState({ opened: Store.getState().graph.showGraphActionWindow })
    })
  }

  toggleComponent = () => {
    const { opened } = this.state
    this.setState({ opened: !opened })
  }

  render() {
    // let { title } = this.props
    const { children } = this.props
    const { opened } = this.state

    // if (opened) {
    //   title = 'Hide Component'
    // } else {
    //   title = 'Show Component'
    // }

    return (
      <div className="component">
        {/* <button
          type="button"
          className="componentTitle"
          onClick={this.toggleComponent}
        >
          { title }
        </button> */}
        {opened && (
          <div className="componentContent">
            { children }
          </div>
        )}
      </div>
    )
  }
}

export default ToggleComponent

ToggleComponent.propTypes = {
  // title: PropTypes.string.isRequired,
  children: PropTypes.instanceOf(Object).isRequired,
}
