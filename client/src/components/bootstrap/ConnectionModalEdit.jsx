import React, { Component } from 'react';
import './Bootstrap.scss';
import {
  Button,
  Form,
  Modal,
  Dropdown
} from 'semantic-ui-react';

class ConnectionModalEdit extends Component {

  constructor(props) {
    super(props);

    this.state = {
      showModalEdit: false,
      firmwares: [],
      channels: [],
      models: [],
      config: {},
      selectedFirmware: '',
      selectedModel: '',
      selectedChannels: [],
      isEnabled: true
    };
  }

  getConfigById = async id => {
    fetch(`https://zsse.zeinetsse.com:5000/api/bootstrap/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    })
      .then( res =>  res.json())
      .then( config => {
        const { firmwares, models } = this.state;
        const selectedChannels = [];

        config.content = JSON.parse(config.content);

        const selectedFirmware = firmwares.filter( item => {
          return item.text === config.content.firmware;
        });

        const selectedModel = models.filter( item => {
          return item.text === config.content.model;
        });

        for (let i = 0; i < config.mainflux_channels.length; i++) {
          selectedChannels.push(config.mainflux_channels[i].id);
        }

        this.setState({
          selectedFirmware,
          selectedModel,
          selectedChannels,
          config
        });
      })
      .catch( err => console.log(err) );
  };

  editConnection = async () => {
    const { config } = this.state;
    const obj = {
      mac: this.props.connection.external_id,
      id: config.mainflux_id,
      channels: config.mainflux_channels,
      name: config.content.name,
      firmware: config.content.firmware,
      cycle: config.content.cycle
    };
    fetch(`https://zsse.zeinetsse.com:5000/api/bootstrap/edit/info/${config.mainflux_id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ obj })
    });

    let arr = [];
    if(config.mainflux_channels[0].id) {
      arr = config.mainflux_channels.map( item => {
        return item.id;
      });
    } else {
      arr = config.mainflux_channels;
    }

    obj.channels = arr;

    fetch(`https://zsse.zeinetsse.com:5000/api/bootstrap/edit/channels/${config.mainflux_id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ obj })
    });

    this.close();
  };

  getFirmwares = async () => {
    fetch('https://zsse.zeinetsse.com:5000/api/other/firmwares', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    })
      .then( res => res.json())
      .then( firmwares => {
        const firm = firmwares.map( item => {
          return { text: item, value: item}
        });
        this.setState({ firmwares: firm });
      })
      .catch( err => console.log(err) );
  };

  getModels = async () => {
    fetch('https://zsse.zeinetsse.com:5000/api/other/models', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    })
      .then( res => res.json())
      .then( models => {
        const mod = models.map( item => {
          return { text: item, value: item}
        });
        this.setState({ models: mod });
      })
      .catch( err => console.log(err) );
  };

  getChannels = async () => {
    fetch('https://zsse.zeinetsse.com:5000/api/channels', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    })
      .then( res =>  res.json())
      .then( channels => {
        const chan = channels.map( (item, i) => {
          return {text: item.name, value: item.id}
        });
        this.setState({ channels: chan });
      })
      .catch( err => console.log(err) );
  };

  componentDidMount() {
    this.getFirmwares();
    this.getChannels();
    this.getModels();
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.connection !== this.props.connection){
      this.getConfigById(nextProps.connection.external_id);
    }
  }

  close = () => {
    this.setState({ showModalEdit: false });
    this.props.callbackFromParent(this.state.showModalEdit);
  };

  handleChangeName = e => {
    const obj = this.state.config;
    obj.content.name = e.target.value;
    this.setState({ config: obj });
  };

  handleChangeFirmware = (e, { value }) => {
    const obj = this.state.config;
    obj.content.firmware = value;
    this.setState({ config: obj });
  };

  handleChangeModel = (e, { value }) => {
    const obj = this.state.config;
    obj.content.model = value;
    this.setState({ config: obj });
  };

  handleChangeCycle = (e) => {
    let obj = this.state.config;
    obj.content.cycle = e.target.value;
    this.setState({ config: obj, isEnabled: obj.content.cycle.length <= 5 && /^\d+$/.test(obj.content.cycle) });
  };

  handleChangeChannel = (e, { value }) => {
    let obj = this.state.config;
    obj.mainflux_channels = value;
    this.setState({ config: obj });
  };

  render() {
    const { showModalEdit, connection } = this.props;
    const {
      firmwares,
      channels,
      models,
      config,
      selectedFirmware,
      selectedChannels,
      selectedModel,
      isEnabled
    } = this.state;

    // console.log(this.state);
    return (
      <Modal closeIcon dimmer="blurring" open={showModalEdit} onClose={this.close}>
        <Modal.Header>EDIT CONNECTION</Modal.Header>
        <Modal.Content>
          <Form>
            <Form.Field>
              <label>Name</label>
              <input
                placeholder='name'
                value={config.content !== undefined ? config.content.name : ''}
                onChange={e => this.handleChangeName(e)}
              />
            </Form.Field>
            <Form.Field>
              <label>Firmware</label>
              <Dropdown
                placeholder='firmware'
                fluid
                selection
                options={firmwares}
                defaultValue={selectedFirmware[0] !== undefined ? selectedFirmware[0].value : ''}
                onChange={this.handleChangeFirmware}
              />
            </Form.Field>
            <Form.Field>
              <label>Model</label>
              <Dropdown
                placeholder='model'
                fluid
                selection
                options={models}
                defaultValue={selectedModel[0] !== undefined ? selectedModel[0].value : ''}
                onChange={this.handleChangeModel}
              />
            </Form.Field>
            <Form.Field>
              <label>Channels</label>
              <Dropdown
                placeholder='channels'
                multiple
                fluid
                selection
                options={channels}
                defaultValue={selectedChannels}
                onChange={this.handleChangeChannel}
              />
            </Form.Field>
            <Form.Field>
              <label>Cycle (per/sec)</label>
              <input
                placeholder='cycle'
                value={config.content !== undefined ? config.content.cycle : ''}
                onChange={e => this.handleChangeCycle(e)}
              />
            </Form.Field>
          </Form>
          </Modal.Content>
          <Modal.Actions>
            <Button color='black' onClick={this.close}>
              No
            </Button>
            <Button
              positive
              icon='edit outline'
              labelPosition='right'
              content="Yes"
              disabled={!isEnabled}
              onClick={() => this.editConnection(connection)}
            />
          </Modal.Actions>
        </Modal>
    );
  }
}

export default ConnectionModalEdit;