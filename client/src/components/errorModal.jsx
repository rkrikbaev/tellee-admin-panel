import React, { Component } from 'react';
import {
  Button,
  Header,
  Modal,
  Icon
} from 'semantic-ui-react';

class ErrorModal extends Component {

  constructor(props) {
    super(props);

    this.state = {
      showModalError: false,
    }
  }

  close = () => {
    this.setState({ showModalRemove: false });
    this.props.callbackFromParent(this.state.showModalError);
  }

  render() {

    const { showModalError, errorText } = this.props

    return (
      <Modal basic size='small' open={showModalError}>
        <Header icon='archive' content='ERROR' />
        <Modal.Content>
          <p>
            {errorText}
          </p>
        </Modal.Content>
        <Modal.Actions>
          <Button
            basic
            color='green'
            inverted
            onClick={this.close}>
            <Icon name='remove' /> Close
          </Button>
        </Modal.Actions>
      </Modal>
    );
  }
}

export default ErrorModal;