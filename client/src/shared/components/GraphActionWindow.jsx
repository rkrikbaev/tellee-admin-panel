import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {
  Button,
  Form,
  Modal,
  Dropdown,
} from 'semantic-ui-react'

import { addGraphAction } from '../actions/graphs'
import './GraphWrapper/GraphWrapper.scss'

const types = [
  { key: 0, text: 'Timeseries', value: 'timeseries' },
  { key: 1, text: 'KPI', value: 'kpi' },
  { key: 2, text: 'Table', value: 'table' },
]

const dates = [
  { key: 0, text: '1 hour', value: '1' },
  { key: 1, text: '3 hours', value: '3' },
  { key: 2, text: '6 hours', value: '6' },
]

class GraphActionWindow extends Component {
  constructor(props) {
    super(props)
    this.state = {
      isVisible: false,
      config: {
        title: '',
        type: '',
        device: '',
        date: '',
        parameter: '',
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

  handleChangeData = (key, e, dropdownValue) => {
    const { value } = e.target
    if (value === undefined) {
      this.setState((prevState) => ({
        config: {
          ...prevState.config,
          [key]: dropdownValue,
        },
      }))
      return
    }
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
              <label htmlFor="name">Title</label>
              <input
                placeholder="title"
                value={config.title}
                onChange={(e) => this.handleChangeData('title', e)}
              />
            </Form.Field>
            <Form.Field>
              <label htmlFor="mainflux_key">Type</label>
              <Dropdown
                placeholder="types"
                fluid
                selection
                options={types}
                onChange={(e, { value }) => this.handleChangeData('type', e, value)}
              />
            </Form.Field>
            <Form.Field>
              <label htmlFor="name">Device name</label>
              <input
                placeholder="device name"
                value={config.device}
                onChange={(e) => this.handleChangeData('device', e)}
              />
            </Form.Field>
            <Form.Field>
              <label htmlFor="name">Parameter</label>
              <input
                placeholder="parameter"
                value={config.parameter}
                onChange={(e) => this.handleChangeData('parameter', e)}
              />
            </Form.Field>
            <Form.Field>
              <label htmlFor="name">Date</label>
              <Dropdown
                placeholder="date"
                fluid
                selection
                options={dates}
                onChange={(e, { value }) => this.handleChangeData('date', e, value)}
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
