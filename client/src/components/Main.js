import React, { Component } from 'react'
import { Card } from 'semantic-ui-react'

import 'semantic-ui-css/semantic.min.css'

import turbine from '../static/icons/turbine.svg'
import pump from '../static/icons/pump.svg'
import generator from '../static/icons/generator.svg'

const data = [
  {
    icon: 'turbine',
    name: 'Turbine:01',
    status: 'Run',
    ram: 30,
    memory: '7976/6459',
  },
  {
    icon: 'pump',
    name: 'Pump:01',
    status: 'Stop',
    ram: 28,
    memory: '8176/2459',
  },
  {
    icon: 'generator',
    name: 'Generator:01',
    status: 'Run',
    ram: 42,
    memory: '2976/459',
  },
  {
    icon: 'turbine',
    name: 'Turbine:02',
    status: 'Crush',
    ram: 11,
    memory: '9976/6419',
  },
]

class Main extends Component {

  render() {

    const statusArray = []

    data.forEach(item => {
      switch(item.icon) {
        case 'turbine':
          item.icon = turbine;
          break;
        case 'pump':
          item.icon = pump;
          break;
        case 'generator':
          item.icon = generator;
          break;
        default:
          break;
      }
    })

    data.forEach(item => {
      switch(item.status) {
        case 'Run':
          statusArray.push('green');
          break;
        case 'Stop':
          statusArray.push('yellow');
          break;
        case 'Crush':
          statusArray.push('red');
          break;
        default:
          break;
      }
    })

    return (
      <div className="main_wrapper">
        <h1>Home</h1>
        <hr />
        {
          data.length !== 0
          ?
          <Card.Group>
            {
              data.map((item, index) =>
                <Card fluid color={statusArray[index]} key={index} className="home_card">
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
