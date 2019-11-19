import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { graphActionWindow } from '../../shared/actions/graphs'
import Store from '../../store/configureStore'

import './Graphs.scss'

import GraphActionWindow from '../../shared/components/GraphActionWindow'
import ToggleComponent from '../../shared/components/ToggleComponent'
import GraphWrapper from '../../shared/components/GraphWrapper/GraphWrapper'

const data = [
  {
    name: 'Page A', uv: 4000, pv: 2400, amt: 2400,
  },
  {
    name: 'Page B', uv: 3000, pv: 1398, amt: 2210,
  },
  {
    name: 'Page C', uv: 2000, pv: 9800, amt: 2290,
  },
  {
    name: 'Page D', uv: 2780, pv: 3908, amt: 2000,
  },
  {
    name: 'Page E', uv: 1890, pv: 4800, amt: 2181,
  },
  {
    name: 'Page F', uv: 2390, pv: 3800, amt: 2500,
  },
  {
    name: 'Page G', uv: 3490, pv: 4300, amt: 2100,
  },
]

class Graphs extends Component {
  _isMounted = false

  constructor(props) {
    super(props)

    this.state = {
      graphsList: [],
    }
    Store.subscribe(() => {
      this.setState({ graphsList: Store.getState().graph.graphsList })
    })
  }

  async componentDidMount() {
    const { graphsList } = Store.getState().graph
    const { device, date, parameter } = graphsList[0]
    this._isMounted = true
    this.setState({ graphsList })
    const resp = await fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/data/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      credentials: 'include',
      body: JSON.stringify({ device, date: date * 3600000, parameter }),
    })
    console.table(resp)
  }

  shouldComponentUpdate(prevProps, prevState) {
    if (this.state === prevState) {
      return false
    }
    return true
  }

  componentWillUnmount() {
    this._isMounted = false
  }

  createGraph = () => {
    const { showGraphActionWindow } = this.props
    showGraphActionWindow(!Store.getState().graph.showGraphActionWindow)
  }

  render() {
    const { graphsList } = this.state
    return (
      <div id="graphs" className="main_wrapper">
        <div className="graphs_header">
          <button type="button" onClick={this.createGraph}>Create</button>
        </div>
        {
          graphsList.length > 0
            ? graphsList.map((item, i) => (
              <GraphWrapper
                // eslint-disable-next-line react/no-array-index-key
                key={i}
                title={item.title}
                type={item.type}
                data={data}
              />
            ))
            : ''
        }

        <ToggleComponent title="Show Component">
          <GraphActionWindow
            showEditWindow
            callbackFromParent={this.createGraph}
            graphTitle=""
            graphType=""
            deviceName=""
            requestDate={0}
          />
        </ToggleComponent>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  showGraphActionWindow: state.isShowGraphActionWindow,
})

function mapDispatchToProps(dispatch) {
  return {
    showGraphActionWindow: (isVisible) => dispatch(graphActionWindow(isVisible)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Graphs)

Graphs.propTypes = {
  showGraphActionWindow: PropTypes.func.isRequired,
}
