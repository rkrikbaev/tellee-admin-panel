import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Rnd } from 'react-rnd'
import Timeseries from '../Timeseries'
import GraphWrapperHeader from './GraphWrapperHeader'

class GraphWrapper extends Component {
  constructor(props) {
    super(props)
    this.state = {
      width: 620,
      height: 350,
      graphTitle: 'Timeseries',
    }
  }

  static getDerivedStateFromProps(props, state) {
    if (props.width !== state.width) {
      return {
        width: props.width,
        height: props.height,
      }
    }

    return null
  }

  render() {
    console.info(this.props)
    const { width, height, graphTitle } = this.state
    const {
      type,
      title,
      data,
    } = this.props

    return (
      <div
        style={{ margin: 0, paddingBottom: '40px' }}
      >
        <Rnd
          default={{
            x: 0,
            y: 0,
            width,
            height,
          }}
          style={{
            background: '#EBEFF2',
            position: 'relative',
            padding: '10px',
            borderRadius: '5px',
          }}
          onResize={(e, direction, ref, delta, position) => {
            this.setState({
              width: parseInt(ref.style.width, 10),
              height: parseInt(ref.style.height, 10),
              ...position,
            })
          }}
        >
          <GraphWrapperHeader width={width - 20} graphTitle={graphTitle} />
          <Timeseries
            width={width}
            height={height - 30}
            type={type}
            title={title}
            data={data}
          />
        </Rnd>
      </div>
    )
  }
}

export default GraphWrapper

GraphWrapper.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  type: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  data: PropTypes.instanceOf(Object).isRequired,
}
