import React, { Component } from 'react'
import { Card } from 'semantic-ui-react'

import 'semantic-ui-css/semantic.min.css'

import turbine from '../static/icons/turbine.svg'
import pump from '../static/icons/pump.svg'
import generator from '../static/icons/generator.svg'


const statusTypes = ['connected', 'not connected'];
const statusColorTypes = [];

class Main extends Component {
  _isMounted = false;

  constructor(props) {
    super(props);

    this.state = {
      devices: [],
    }

  }

  componentDidMount() {
    this._isMounted = true;
    this.getToken();
    this.getDevicesFromMainflux();
  }
  componentWillUnmount() {
    this._isMounted = false;
  }

  getToken = async () => {
    fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/users/login`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      mode: 'cors',
      credentials : 'include',
      body: JSON.stringify({email: `${process.env.REACT_APP_MAINFLUX_USER}`})
    });
  };

  getDevicesFromMainflux = async () => {
    const dataFromBootstrap = [];
    await fetch(`${process.env.REACT_APP_EXPRESS_HOST}/api/bootstrap`, {
      mode: 'cors',
      credentials : 'include',
    })
      .then( res =>  res.json() )
      .then( devices => {
        devices.forEach(item => {
          dataFromBootstrap.push(item);
        })
      })
      .catch( err => console.log(err) );

    this.parseDataFromBootstrap(dataFromBootstrap);
  }

  parseDataFromBootstrap = devices => {
    const _data = devices
      .filter(item => {
        item.content = JSON.parse(item.content);
        return item.content.type === 'device';
      })
      .map(item => {
        return {
          icon: item.content.device_type,
          name: item.name,
          status: statusTypes[Math.floor(Math.random() * statusTypes.length)],
          ram: Math.floor(Math.random() * 100) + 1,
          memory: `7976/${Math.floor(Math.random() * 7976) + 1}`,
        }
    });
    this.customizeDataForRender(_data);
  }

  customizeDataForRender = devices => {
    devices.forEach(item => {
      switch(item.icon) {
        case 'turbine':
          item.icon = turbine;
          break;
        case 'e-meter_v2':
          item.icon = pump;
          break;
        case 'e-meter_v1':
          item.icon = generator;
          break;
        default:
          break;
      }
    });

    devices.forEach(item => {
      switch(item.status) {
        case 'connected':
          statusColorTypes.push('green');
          break;
        case 'not connected':
          statusColorTypes.push('yellow');
          break;
        default:
          break;
      }
    });

    if(this._isMounted) this.setState({ devices });
  }

  render() {

    const { devices } = this.state;

    return (
      <div className="main_wrapper">
        <h1>Home</h1>
        <hr />
        {
          devices.length !== 0
          ?
          <Card.Group>
            {
              devices.map((item, index) =>
                <Card fluid color={statusColorTypes[index]} key={index} className="home_card">
                  <img
                    src={item.icon}
                    alt={`${item.name}`}
                    className="home_card__item"
                  />
                  <p className="home_card__item">
                    <label className="home_card__label">name:</label>
                    {item.name.toUpperCase()}
                  </p>
                  <p className="home_card__item">
                    <label className="home_card__label">status:</label>
                    {item.status.toUpperCase()}
                  </p>
                  <p className="home_card__item">
                    <label className="home_card__label">CPU:</label>
                    {item.ram}%
                  </p>
                  <p className="home_card__item">
                    <label className="home_card__label">memory:</label>
                    {item.memory}kB
                  </p>
                </Card>
              )
            }
          </Card.Group>
          :
          <p>
            Here you can put everything your heart desires.
            <span role="img" aria-label="Hooray">🙂</span>
          </p>
        }
      </div>
    );
  }
}

export default Main;
