import React, { Component } from 'react';
import { css } from '@stitches/react';
import Avatar from 'react-avatar';
import { GoPrimitiveDot } from 'react-icons/go';

import colors from '../config/colors';
import UserStatus from './UserStatus';

const header = css({
  backgroundColor: colors.darkmodeLightBlack,
  height: '80px',
  maxWidth: '450px',
  marginLeft: '10px',
  marginRight: '10px',
  display: 'flex',
  borderTopLeftRadius: '12px',
});
const headerButtons = css({
  marginLeft: 'auto',
  height: '30px',
  width: '40px',
  backgroundColor: 'transparent',
  border: 'none',
});
const headerDotColor = colors.darkmodeHighWhite;
const headerDotSize = 15;

const avatar = css({
  borderTopLeftRadius: '12px',
});
const text = css({
  paddingLeft: '8px',
  paddingTop: '2px',
  color: colors.darkmodeHighWhite,
  fontSize: '1em',
  fontWeight: 'initial',
});

export default class WidgetHeader extends Component {
  constructor() {
    super();
    this.state = {
      chromiumData: 'hey',
      windowData: 'hey',
      wss: null,
    };
  }

  componentDidMount() {
    // this.connect();
  }

  connect = () => {
    // var wss = new WebSocket('ws://' + window.location.host + '/');
    // const WebSocket = require('ws');
    var wss = new WebSocket('ws://localhost:8080/');
    let that = this;
    var connectionInterval;

    wss.onopen = () => {
      console.log('yo');
      console.log('connected websocket main component');

      this.setState({ wss: wss });

      this.wss.onmessage = (evt) => {
        console.log(evt.data);

        // this.state.setState((oldData) => oldData.windowData, data);
      };
      // reset timer to 250 on open of websocket connection
      that.timeout = 250;

      // clear Interval on on open of websocket connection
      clearTimeout(connectionInterval);
    };

    wss.onclose = (evt) => {
      console.log(
        `Socket is closed. Reconnect will be attempted in ${Math.min(
          10000 / 1000,
          (that.timeout + that.timeout) / 1000
        )} second(s).`,
        evt.reason
      );

      //increment retry interval
      that.timeout = that.timeout + that.timeout;

      //call check function after timeout
      connectionInterval = setTimeout(
        this.check,
        Math.min(10000, that.timeout)
      );
    };

    wss.onerror = (err) => {
      console.error(
        'Socket encountered error: ',
        err.message,
        'Closing socket'
      );

      wss.close();
    };

    window.onbeforeunload = function () {
      wss.onclose = function () {}; // disable onclose handler first
      wss.close();
    };
  };

  check = () => {
    const { wss } = this.state;
    //check if websocket instance is closed, if so call `connect` function.
    if (!wss || wss.readyState == WebSocket.CLOSED) this.connect();
  };

  render() {
    return (
      <React.Fragment>
        <div className={header()}>
          <Avatar
            className={avatar()}
            name='Sam Ba'
            size='80'
            style={{
              '-webkit-app-region': 'no-drag',
            }}
          />
          <text className={text()}>Sam Ba</text>
          <UserStatus
            chromiumData={this.state.chromiumData}
            windowData={this.state.windowData}
          />
          <button
            className={headerButtons()}
            onClick={this.props.onHeaderButton}
            style={{ '-webkit-app-region': 'no-drag' }}
          >
            <GoPrimitiveDot
              color={headerDotColor}
              size={headerDotSize}
              // style={{}}
            />
          </button>
        </div>
      </React.Fragment>
    );
  }
}
