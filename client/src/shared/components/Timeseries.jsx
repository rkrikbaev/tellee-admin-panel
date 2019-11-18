import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Brush,
} from 'recharts'

class Timeseries extends Component {
  constructor(props) {
    super(props)
    this.state = {
      opacity: {
        uv: 1,
        pv: 1,
      },
    }
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps(props, nextProps) {
    if (props === nextProps) {
      return false
    }
    return true
  }

  handleMouseEnter = (o) => {
    const { dataKey } = o
    const { opacity } = this.state

    this.setState({
      opacity: { ...opacity, [dataKey]: 0.5 },
    })
  }

  handleMouseLeave = (o) => {
    const { dataKey } = o
    const { opacity } = this.state

    this.setState({
      opacity: { ...opacity, [dataKey]: 1 },
    })
  }

  render() {
    const { width, height, data } = this.props
    const { opacity } = this.state
    return (
      <div id="timeseries" className="disable-dragging">
        <LineChart
          width={width - 20}
          height={height - 20}
          data={data}
          margin={{
            top: 5, right: 30, left: 20, bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave} />
          <Line type="monotone" dataKey="pv" strokeOpacity={opacity.pv} stroke="#8884d8" activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="uv" strokeOpacity={opacity.uv} stroke="#82ca9d" />
          <Brush />
        </LineChart>
      </div>
    )
  }
}

export default Timeseries

Timeseries.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  data: PropTypes.instanceOf(Array).isRequired,
}
