import React, { Component } from 'react';
import './Connections.scss';
import {
  Button,
  Form,
  Modal,
  Dropdown
} from 'semantic-ui-react';

class AppModalEdit extends Component {

  constructor(props) {
    super(props);

    this.state = {
      config: {},
      channels: [],
      selectedChannels: [],
      showModalEditApp: false,
    };
  };

  getConfigById = async id => {
    fetch(`http://localhost:5000/api/bootstrap/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    })
      .then( res =>  res.json())
      .then( config => {
        const selectedChannels = [];

        config.content = JSON.parse(config.content);

        for (let i = 0; i < config.mainflux_channels.length; i++) {
          selectedChannels.push({
            text: config.mainflux_channels[i].name,
            value: config.mainflux_channels[i].id,
          });
        };

        this.setState({
          selectedChannels,
          config
        });
      })
      .catch( err => console.log(err) );
  };

  getChannels = async () => {
    fetch('http://localhost:5000/api/channels', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    })
      .then( res =>  res.json())
      .then( channels => {
        const chan = channels.map( (item, i) => {
          return {key: item.id, text: item.name, value: item.id}
        });
        this.setState({ channels: chan });
      })
      .catch( err => console.log(err) );
  };

  editApp = async () => {
    const { config } = this.state;
    const { mac, name } = this.state.config.content;
    const obj = {
      mac,
      id: config.mainflux_id,
      channels: config.mainflux_channels,
      name,
      type: "app",
      content: config.content,
    };
    await fetch(`http://localhost:5000/api/bootstrap/edit/info/${config.mainflux_id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ obj })
    });

    // -- FOR EDITTING CONFIG'S CHANNELS -- //
    // let arr = [];
    // if(config.mainflux_channels[0].id) {
    //   arr = config.mainflux_channels.map( item => {
    //     return item.id;
    //   });
    // } else {
    //   arr = config.mainflux_channels;
    // }

    // obj.channels = arr;

    // fetch(`http://localhost:5000/api/bootstrap/edit/channels/${config.mainflux_id}`, {
    //   method: 'PUT',
    //   headers: {
    //     'Content-Type': 'application/json'
    //   },
    //   body: JSON.stringify({ obj })
    // });

    this.close();
  };

  componentWillReceiveProps(nextProps) {
    if(nextProps.connection !== this.props.connection){
      this.getConfigById(nextProps.connection.external_id);
    };
  };

  componentDidMount() {
    this.getChannels();
  }

  close = () => {
    this.setState({ showModalEditApp: false });
    this.props.callbackFromParent(this.state.showModalEditApp);
  };

  handleChangeName = e => {
    const obj = this.state.config;
    obj.content.name = e.target.value;
    this.setState({ config: obj });
  };

  handleChangeChannel = (e, { value }) => {
    let obj = this.state.config;
    obj.mainflux_channels = value;
    this.setState({ config: obj });
  };

  render() {
    const { showModalEditApp } = this.props;
    const { config, channels } = this.state;

    return (
      <Modal closeIcon dimmer="blurring" open={showModalEditApp} onClose={this.close}>
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
              <label>Channels</label>
              <Dropdown
                placeholder='channels'
                multiple
                fluid
                selection
                options={channels}
                onChange={this.handleChangeChannel}
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
            onClick={this.editApp}
          />
        </Modal.Actions>
      </Modal>
    );
  };
};

export default AppModalEdit;