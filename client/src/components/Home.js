import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Card } from 'semantic-ui-react'
import { addUser } from '../shared/actions/user'


import 'semantic-ui-css/semantic.min.css'

import turbine from '../static/icons/turbine.svg'
import pump from '../static/icons/pump.svg'
import generator from '../static/icons/generator.svg'

const statusTypes = ['connected', 'not connected']
const statusColorTypes = []

class Home extends Component {
  _isMounted = false

  constructor(props) {
    super(props)

    this.state = {
      devices: [],
    }
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillMount() {
    // eslint-disable-next-line react/destructuring-assignment
    this.props.addUser('milk')
  }

  async componentDidMount() {
    this._isMounted = true
    await this.getToken()
    this.getDevicesFromMainflux()
  }

  componentWillUnmount() {
    this._isMounted = false
  }

  getToken = async () => {
    await fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/users/login`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      credentials: 'include',
      body: JSON.stringify({ email: `${process.env.REACT_APP_MAINFLUX_USER}` }),
    })
  }

  getDevicesFromMainflux = () => {
    fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/bootstrap`, {
      mode: 'cors',
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((devices) => {
        this.parseDataFromBootstrap(devices)
      })
      .catch((err) => err)
  }

  parseDataFromBootstrap = (devices) => {
    const data = devices
      .filter((item) => {
        item.content = JSON.parse(item.content)
        return item.content.type === 'device'
      })
      .map((item) => ({
        id: item.mainflux_id,
        icon: item.content.device_type,
        name: item.name,
        status: statusTypes[Math.floor(Math.random() * statusTypes.length)],
        ram: Math.floor(Math.random() * 100) + 1,
        memory: `7976/${Math.floor(Math.random() * 7976) + 1}`,
      }))
    this.customizeDataForRender(data)
  }

  customizeDataForRender = (devices) => {
    devices.forEach((item) => {
      switch (item.icon) {
        case 'turbine':
          item.icon = turbine
          break
        case 'e-meter_v2':
          item.icon = pump
          break
        case 'e-meter_v1':
          item.icon = generator
          break
        default:
          break
      }
    })

    devices.forEach((item) => {
      switch (item.status) {
        case 'connected':
          statusColorTypes.push('green')
          break
        case 'not connected':
          statusColorTypes.push('yellow')
          break
        default:
          break
      }
    })

    if (this._isMounted) this.setState({ devices })
  }

  render() {
    const { devices } = this.state
    return (
      <div className="main_wrapper">
        <h1>Home</h1>
        <hr />
        {devices.length !== 0 ? (
          <Card.Group>
            {devices.map((item, i) => (
              <Card
                fluid
                color={statusColorTypes[i]}
                key={item.id}
                className="home_card"
              >
                <img
                  src={item.icon}
                  alt={`${item.name}`}
                  className="home_card__item"
                />
                <p className="home_card__item">
                  <label className="home_card__label" htmlFor="name">
                    name:
                  </label>
                  {item.name.toUpperCase()}
                </p>
                <p className="home_card__item">
                  <label className="home_card__label" htmlFor="status">
                    status:
                  </label>
                  {item.status.toUpperCase()}
                </p>
                <p className="home_card__item">
                  <label className="home_card__label" htmlFor="cpu">
                    CPU:
                  </label>
                  {item.ram}
%
                </p>
                <p className="home_card__item">
                  <label className="home_card__label" htmlFor="memory">
                    memory:
                  </label>
                  {item.memory}
                  kB
                </p>
              </Card>
            ))}
          </Card.Group>
        ) : (
          <p>
            Here you can put everything your heart desires.
            <span role="img" aria-label="Hooray">
              🙂
            </span>
          </p>
        )}
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  users: state.users.items,
})

function mapDispatchToProps(dispatch) {
  return {
    addUser: (article) => dispatch(addUser(article)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Home)

Home.propTypes = {
  addUser: PropTypes.func.isRequired,
}
