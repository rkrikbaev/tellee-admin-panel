import React, { Component } from 'react'
import PropTypes from 'prop-types'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts'

export default class Timeseries extends Component {
  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps(props, nextProps) {
    if (props === nextProps) {
      return false
    }
    return true
  }

  render() {
    const { width, height, data } = this.props
    return (
      <div id="timeseries" className="">
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
          <Legend />
          <Line type="monotone" dataKey="pv" stroke="#8884d8" activeDot={{ r: 8 }} />
          <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
        </LineChart>
      </div>
    )
  }
}

Timeseries.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  data: PropTypes.instanceOf(Array).isRequired,
}
