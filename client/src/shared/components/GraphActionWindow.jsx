import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Button, Form, Modal } from 'semantic-ui-react'

import { addGraphAction } from '../actions/graphs'
import './GraphWrapper/GraphWrapper.scss'

class GraphActionWindow extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isVisible: false,
      config: {
        title: '',
        type: '',
        device: '',
        date: 0,
      },
    }
  }

  static getDerivedStateFromProps(props, state) {
    if (props.showEditWindow !== state.isVisible) {
      return {
        isVisible: true,
        config: {
          title: props.graphTitle,
          type: props.graphType,
          device: props.deviceName,
          date: props.requestDate,
        },
      }
    }

    return null
  }

  componentDidMount() {}

  handleChangeData = (key, e) => {
    const { value } = e.target
    this.setState((prevState) => ({
      config: {
        ...prevState.config,
        [key]: value,
      },
    }))
  }

  handleSubmit = () => {
    const { callbackFromParent } = this.props
    const { config } = this.state
    callbackFromParent(config)
    // eslint-disable-next-line react/destructuring-assignment
    this.props.addGraphAction(config)
  }

  onClose = () => {
    const { callbackFromParent } = this.props
    const { isVisible } = this.state
    this.setState({ isVisible: false })
    callbackFromParent(isVisible)
  }

  render() {
    const { showEditWindow } = this.props
    const { config } = this.state

    return (
      <Modal closeIcon dimmer="blurring" open={showEditWindow} onClose={() => this.onClose()}>
        <Modal.Header>
          {config.title}
          {' '}
          Graph
        </Modal.Header>
        <Modal.Content>
          <Form>
            <Form.Field>
              <label htmlFor="name">Type</label>
              <input
                placeholder="type"
                value={config.type}
                onChange={(e) => this.handleChangeData('type', e)}
              />
            </Form.Field>
            <Form.Field>
              <label htmlFor="name">Device name</label>
              <input
                placeholder="device"
                value={config.device}
                onChange={(e) => this.handleChangeData('device', e)}
              />
            </Form.Field>
            <Form.Field>
              <label htmlFor="name">Date</label>
              <input
                placeholder="date"
                value={config.date}
                onChange={(e) => this.handleChangeData('date', e)}
              />
            </Form.Field>
          </Form>
        </Modal.Content>
        <Modal.Actions>
          <Button color="black" onClick={() => this.onClose()}>
            No
          </Button>
          <Button
            positive
            icon="edit outline"
            labelPosition="right"
            content="Yes"
            onClick={() => this.handleSubmit()}
          />
        </Modal.Actions>
      </Modal>
    )
  }
}

const mapStateToProps = (state) => ({
  graph: state.config,
})

function mapDispatchToProps(dispatch) {
  return {
    addGraphAction: (config) => dispatch(addGraphAction(config)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(GraphActionWindow)

GraphActionWindow.propTypes = {
  callbackFromParent: PropTypes.func.isRequired,
  addGraphAction: PropTypes.func.isRequired,
  showEditWindow: PropTypes.bool.isRequired,
  graphTitle: PropTypes.string.isRequired,
  graphType: PropTypes.string.isRequired,
  deviceName: PropTypes.string.isRequired,
  requestDate: PropTypes.number.isRequired,
}
