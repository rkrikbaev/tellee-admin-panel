import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { graphActionWindow, addGraphDataAction } from '../../shared/actions/graphs'
import Store from '../../store/configureStore'

import './Graphs.scss'

import GraphActionWindow from '../../shared/components/GraphActionWindow'
import ToggleComponent from '../../shared/components/ToggleComponent'
import GraphWrapper from '../../shared/components/GraphWrapper/GraphWrapper'

class Graphs extends Component {
  _isMounted = false

  constructor(props) {
    super(props)

    this.state = {
      graphsConfigList: [],
      graphsData: [],
      loading: false,
    }
    Store.subscribe(() => {
      const { graphsConfigList, graphsData, loading } = Store.getState().graph
      this.setState({ graphsConfigList, graphsData, loading })
    })
  }

  componentDidMount() {
    const { graphsConfigList, graphsData } = Store.getState().graph
    const { addGraphData } = this.props
    this._isMounted = true
    this.setState({ graphsConfigList, graphsData })
    graphsConfigList.forEach(async (item) => {
      addGraphData(item)
    })
  }

  shouldComponentUpdate() {
    const { graph } = Store.getState()
    const { graphsConfigList, graphsData } = this.state
    if (
      graph.graphsConfigList === graphsConfigList
      && graph.graphsData === graphsData
    ) {
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
    const { graphsConfigList, graphsData, loading } = this.state

    return (
      <div id="graphs" className="main_wrapper">
        <div className="graphs_header">
          <button type="button" onClick={this.createGraph}>Create</button>
        </div>
        {
          loading ? <p>LOADING...</p> : ''
        }
        {
          (graphsData.length > 0)
            ? graphsConfigList.map((item, i) => (
              <GraphWrapper
                // eslint-disable-next-line react/no-array-index-key
                key={i}
                title={item.title}
                type={item.type}
                data={graphsData[i] || ['wait']}
              />
            ))
            : ''
        }

        <ToggleComponent title="Show Component">
          <GraphActionWindow
            showEditWindow
            graphTitle=""
            graphType=""
            deviceName=""
            deviceParameter=""
            requestDate={1}
          />
        </ToggleComponent>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  graph: state.config,
})

function mapDispatchToProps(dispatch) {
  return {
    showGraphActionWindow: (isVisible) => dispatch(graphActionWindow(isVisible)),
    addGraphData: (config) => dispatch(addGraphDataAction(config)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Graphs)

Graphs.propTypes = {
  showGraphActionWindow: PropTypes.func.isRequired,
  addGraphData: PropTypes.func.isRequired,
}
