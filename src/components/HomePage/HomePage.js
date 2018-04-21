import React, { Component } from 'react';
import axios from 'axios';

import { loggedIn, getProfile } from '../../utils/AuthService';

class HomePage extends Component {
  constructor(props) {
    super(props);
    this.state = { fullCollectionData: [], singleDocData: [] };
    this.loadDataFromServer = this.loadDataFromServer.bind(this);
    this.pollInterval = null;
  }
  loadDataFromServer() {
    axios.get(this.props.url)
      .then(res => {
        this.setState({ fullCollectionData: res.data });
      })
      // id for a single document
      axios.get('http://localhost:3001/api/contests/5adac57bce44680e02d1a565')
      .then(res => {
        this.setState({ singleDocData: res.data });
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
    let dataNodes = this.state.fullCollectionData.map(comment => {
      return (
        <div key={ comment._id }>
          { comment.text }
        </div>
      )
    })

    // typeof returns object but object methods don't work
    // valueOf() method from mongoose does not work
    // how to loop through members of this object and 
    // retrieve individual objectids without using JSON.stringify()
    // and parsing through strings?
    let childNodeIds = this.state.singleDocData.nameIds;
    //let names = '';
    /*for(let x = 0; x < childNodeIds.length(); x++) {
      let nameurl = 'http://localhost:3001/api/name/';
      nameurl += childNodeIds[x];
      axios.get(nameurl)
      .then(res => {
        names += res.data;
      })
      console.log(nameurl);
    }*/

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
        {this.state.fullCollectionData.length === 0 &&
          <h3> Not Data Found </h3>
        }
        {this.state.fullCollectionData.length > 0 &&
        <div>
          <div><pre>{JSON.stringify(this.state.fullCollectionData, null, 2) }</pre></div>
          <h2> Filtering one field of all entries </h2>
          { dataNodes }
          <h2> One Doc </h2>
          <div><pre>{JSON.stringify(this.state.singleDocData, null, 2) }</pre></div>
          <h2> Viewing children docs of above </h2>
          <div><pre>{JSON.stringify(childNodeIds, null, 2) }</pre></div>
          { typeof(childNodeIds) }
        </div>
        }
      </div>
    )
  }
}

export default HomePage;
