import React, { Component } from "react";
import { Mutation } from "react-apollo";

import Mutations from "../../graphql/mutations";
const { NEW_ABODE } = Mutations;

import Queries from "../../graphql/queries";
const { FETCH_ABODES } = Queries;

class AbodeCreate extends Component {
  constructor(props) {
    super(props);

    this.state = {
      message: "",
      name: "",
      coordinates: ""
    };
  }

  update(field) {
    return e => this.setState({ [field]: e.target.value });
  }

  updateCache(cache, newAbode) {
    console.log(newAbode);
    let abodes;
    try {
      abodes = cache.readQuery({ query: FETCH_ABODES });
    } catch (err) {
      return;
    }

    if (abodes) {
      // take care of un-nesting things before we write to our cache
      let abodeArray = abodes.abodes;
      cache.writeQuery({
        query: FETCH_ABODES,
        data: { abodes: abodeArray.concat(newAbode) }
      });
    }
  }

  handleSubmit(e, newAbode) {
    e.preventDefault();
    let name = this.state.name;

    newAbode({
      variables: {
        name,
        coordinates: this.state.coordinates
      }
    }).then(data => {
      this.setState({
        message: `New abode "${name}" created successfully`,
        name: "",
        coordinates: ""
      });
    });
  }

  render() {
    return (
      <Mutation
        mutation={NEW_ABODE}
        update={(cache, data) => this.updateCache(cache, { data })}
      >
        {(newAbode, { data }) => (
          <div>
            <form onSubmit={e => this.handleSubmit(e, newAbode)}>
              <input
                onChange={this.update("name")}
                value={this.state.name}
                placeholder="Name"
              />
              <input
                onChange={this.update("coordinates")}
                value={this.state.coordinates}
                placeholder="Coordinates"
              />
              <button type="submit">Create Abode</button>
            </form>
            <p>{this.state.message}</p>
          </div>
        )}
      </Mutation>
    );
  }
}

export default AbodeCreate;
