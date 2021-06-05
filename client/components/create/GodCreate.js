import React, { Component } from "react";
import { Mutation } from "react-apollo";

import Mutations from "../../graphql/mutations";
const { NEW_GOD } = Mutations;

import Queries from "../../graphql/queries";
const { FETCH_GODS } = Queries;

class GodCreate extends Component {
  constructor(props) {
    super(props);

    this.state = {
      message: "",
      name: "",
      type: "god",
      description: ""
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  // this function is in change of updating our state for each field
  update(field) {
    return e => this.setState({ [field]: e.target.value });
  }

  updateCache(cache, { data }) {
    let gods;
    try {
      gods = cache.readQuery({ query: FETCH_GODS });
    } catch (err) {
      return;
    }

    if (gods) {
      // take care of un-nesting things before we write to our cache
      let godArray = gods.gods;
      let newGod = data.newGod;
      cache.writeQuery({
        query: FETCH_GODS,
        data: { gods: godArray.concat(newGod) }
      });
    }
  }

  // this function will handle the submission of our mutation
  handleSubmit(e, newGod) {
    e.preventDefault();
    let name = this.state.name;

    newGod({
      variables: {
        name: name,
        type: this.state.type,
        description: this.state.description
      }
    }).then(data => {
      this.setState({
        message: `New god "${name}" created successfully`,
        name: "",
        type: "god",
        description: ""
      });
    });
  }

  render() {
    return (
      <Mutation
        mutation={NEW_GOD}
        update={(cache, data) => this.updateCache(cache, data)}
      >
        {(newGod, { data }) => (
          <div>
            <form onSubmit={e => this.handleSubmit(e, newGod)}>
              <input
                onChange={this.update("name")}
                value={this.state.name}
                placeholder="Name"
              />
              <select value={this.state.type} onChange={this.update("type")}>
                <option value="god">God</option>
                <option value="goddess">Goddess</option>
              </select>
              <textarea
                value={this.state.description}
                onChange={this.update("description")}
                placeholder="description"
              />
              <button type="submit">Create God</button>
            </form>
            <p>{this.state.message}</p>
          </div>
        )}
      </Mutation>
    );
  }
}

export default GodCreate;
