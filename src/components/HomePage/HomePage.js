import React, { Component } from 'react';
import axios from 'axios';

import { loggedIn, getProfile } from '../../utils/AuthService';

class HomePage extends Component {
  constructor(props) {
    super(props);
    this.state = { data: [] };
    this.loadDataFromServer = this.loadDataFromServer.bind(this);
    this.pollInterval = null;
  }
  loadDataFromServer() {
    axios.get(this.props.url)
      .then(res => {
        this.setState({ data: res.data });
      })
  }

  componentDidMount() {
    this.loadDataFromServer();
    if (!this.pollInterval) {
      this.pollInterval = setInterval(this.loadDataFromServer, this.props.pollInterval)
    } 
  }
  
  //this will prevent error messages every 2 seconds
  //after HomePage is unmounted
  componentWillUnmount() {
  //this.pollInterval && clearInterval(this.pollInterval);
  clearInterval(this.pollInterval);
  this.pollInterval = null;
  }

  render() {
    let dataNodes = this.state.data.map(comment => {
      return (
        <div key={ comment._id }>
          { comment.text }
        </div>
      )
    })
    return (
      <div>
        <h2>Homepage Title Here</h2>
        {loggedIn() &&
          <div>
            <h3> Login Successful </h3>
            <p> Username to go in db: { getProfile().nickname }</p>
            <p> Identifier to go in db: { getProfile().sub }</p>
          </div>
        }
        {!loggedIn() &&
          <h3> Not Logged In </h3>
        }
        <h2> Sample JSON Data </h2>
        {this.state.data.length === 0 &&
          <h3> Not Data Found </h3>
        }
        {this.state.data.length > 0 &&
        <div>
          <div><pre>{JSON.stringify(this.state.data, null, 2) }</pre></div>
          <h2> Filtering one field of all entries </h2>
          { dataNodes }
        </div>
        }
      </div>
    )
  }
}

export default HomePage;
