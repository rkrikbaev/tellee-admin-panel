import React, { Component } from 'react'
import PropTypes from 'prop-types'
import GraphActionWindow from '../GraphActionWindow'

import './GraphWrapper.scss'
import EditIcon from '../../../static/icons/edit.svg'
import RemoveIcon from '../../../static/icons/delete.svg'

export default class GraphWrapperHeader extends Component {
  constructor(props) {
    super(props)
    this.state = {
      showEditWindow: false,
    }
    this.editBtnRef = React.createRef()
    this.removeBtnRef = React.createRef()
  }

  handleClick = (node) => {
    const { showEditWindow } = this.state
    if (node.className === 'graph_edit__btn') {
      this.editWindow(!showEditWindow)
    } else if (node.className === 'graph_remove__btn') {
      console.info('Remove button clicked...')
    }
  }

  editWindow = (showEditWindow) => {
    this.setState({ showEditWindow })
  }

  render() {
    const { graphTitle, width } = this.props
    const { showEditWindow } = this.state
    return (
      <div
        id="graph_wrapper__header"
        style={{
          borderTopLeftRadius: 5,
          borderTopRightRadius: 5,
          width,
        }}
      >
        <div className="graph_name">
          <h5>{graphTitle}</h5>
        </div>
        <div className="graph_actions">
          <button
            type="button"
            className="graph_edit__btn"
            onClick={() => this.handleClick(this.editBtnRef.current)}
            ref={this.editBtnRef}
          >
            <img
              src={EditIcon}
              alt="Edit graph"
            />
          </button>
          <button
            type="button"
            className="graph_remove__btn"
            onClick={() => this.handleClick(this.removeBtnRef.current)}
            ref={this.removeBtnRef}
          >
            <img
              src={RemoveIcon}
              alt="Remove graph"
            />
          </button>
        </div>
        {showEditWindow ? (
          <GraphActionWindow
            showEditWindow={showEditWindow}
            callbackFromParent={this.editWindow}
            graphTitle={graphTitle}
          />
        ) : null}
      </div>
    )
  }
}

GraphWrapperHeader.propTypes = {
  graphTitle: PropTypes.string.isRequired,
  width: PropTypes.number.isRequired,
}
