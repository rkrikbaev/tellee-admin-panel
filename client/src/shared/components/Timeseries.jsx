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

  shouldComponentUpdate(prevProps) {
    if (prevProps === this.props) {
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
    let param = []
    // let loader = false
    if (data[0] === 'wait') {
      return (
        <p>Waiting for data...</p>
      )
    }
    if (data.length > 0) {
      param = Object.keys(data[0]).filter((item) => item !== 'name')
    }
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
          <YAxis type="number" domain={[10, 11]} />
          <Tooltip />
          <Legend onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave} />
          <Line
            type="monotone"
            dataKey={param[0]}
            strokeOpacity={opacity.pv}
            stroke="#8884d8"
            activeDot={{ r: 8 }}
          />
          {/* <Line type="monotone" dataKey="uv" strokeOpacity={opacity.uv} stroke="#82ca9d" /> */}
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
