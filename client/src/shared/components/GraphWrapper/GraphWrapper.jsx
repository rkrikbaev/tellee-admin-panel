import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Rnd } from 'react-rnd'
import Timeseries from '../Timeseries'
import GraphWrapperHeader from './GraphWrapperHeader'
import Store from '../../../store/configureStore'

class GraphWrapper extends Component {
  constructor(props) {
    super(props)
    this.state = {
      width: 620,
      height: 350,
    }
  }

  componentDidMount() {
    const { defaultWidth, defaultHeight } = Store.getState().graph
    this._isMounted = true
    this.setState({
      width: defaultWidth,
      height: defaultHeight,
    })
  }

  shouldComponentUpdate(prevProps) {
    if (prevProps === this.props) {
      return false
    }
    return true
  }

  render() {
    const {
      width,
      height,
    } = this.state
    const { type, title, data } = this.props

    let component

    if (type === 'timeseries') {
      component = (
        <Timeseries
          width={width}
          height={height - 30}
          type={type}
          title={title}
          data={data}
        />
      )
    } else {
      component = <h4 style={{ color: 'red' }}>Error occured, please check the configs of this graph!</h4>
    }

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
          cancel=".disable-dragging"
        >
          <GraphWrapperHeader width={width - 20} graphTitle={title} />
          {component}
        </Rnd>
      </div>
    )
  }
}

export default GraphWrapper

GraphWrapper.propTypes = {
  type: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  data: PropTypes.instanceOf(Object).isRequired,
}
