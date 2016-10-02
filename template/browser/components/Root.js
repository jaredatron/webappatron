import React, { Component } from 'react'
import reactPng from '../images/react.png'

export default class Root extends Component {
  render(){
    return <div>
      <ReactImage />
    </div>
  }
}

const ReactImage = () => (
  <div className="webappatron-banner" >
    <h1>webappatron</h1>
    <h2>&</h2>
    <img src={reactPng} />
  </div>
)
