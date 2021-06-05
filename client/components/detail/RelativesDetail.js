import React from "react";
import { Mutation, Query } from "react-apollo";
import { IconContext } from "react-icons";
import { FaPlusCircle } from "react-icons/fa";

import Mutations from "../../graphql/mutations";
const { ADD_GOD_RELATIVE } = Mutations;

import Queries from "../../graphql/queries";
const { FETCH_GODS } = Queries;

class RelativesDetail extends React.Component {
  constructor(props) {
    super(props);

    let title = this.props.relationship
      .toLowerCase()
      .split(" ")
      .map(s => s.charAt(0).toUpperCase() + s.substring(1))
      .join(" ");

    // just some setup to make sure naming is consistent
    const singularRelationships = {
      parents: "parent",
      children: "child",
      siblings: "sibling"
    };

    const singularRelationship = singularRelationships[this.props.relationship];

    this.state = {
      adding: false,
      title,
      singularRelationship
    };

    this.handleEdit = this.handleEdit.bind(this);
  }

  handleEdit(e) {
    e.preventDefault();
    this.setState({ adding: true });
  }

  filterGods(gods) {
    return gods.filter(relative => {
      if (relative.name === this.props.god.name) {
        return false;
      }

      for (let i = 0; i < this.props.relatives.length; i++) {
        const currentRelative = this.props.relatives[i];

        if (currentRelative.name === relative.name) {
          return false;
        }
      }

      return true;
    });
  }

  handleSubmit(e, addGodRelative) {
    e.preventDefault();
    addGodRelative({
      variables: {
        godId: this.props.god.id,
        relativeId: e.target.value,
        relationship: this.state.singularRelationship
      }
    }).then(() => this.setState({ adding: false }));
  }

  render() {
    let addRelative;

    if (this.state.adding) {
      addRelative = (
        <Mutation mutation={ADD_GOD_RELATIVE}>
          {addGodRelative => (
            <div>
              <select
                value="default"
                onChange={e => this.handleSubmit(e, addGodRelative)}
              >
                <option value="default" disabled>
                  Select a relative
                </option>
                <Query query={FETCH_GODS} variables={{ id: this.props.god.id }}>
                  {({ loading, error, data }) => {
                    if (loading) return <option>Loading...</option>;
                    if (error) return <option>Error</option>;

                    return this.filterGods(data.gods).map(({ id, name }) => (
                      <option key={id} value={id}>
                        {name}
                      </option>
                    ));
                  }}
                </Query>
              </select>
            </div>
          )}
        </Mutation>
      );
    } else {
      addRelative = (
        <div
          onClick={this.handleEdit}
          style={{ fontSize: "10px", cursor: "pointer" }}
        >
          <IconContext.Provider value={{ className: "custom-icon" }}>
            <FaPlusCircle />
          </IconContext.Provider>
        </div>
      );
    }

    return (
      <div>
        <h4>{this.state.title}:</h4>
        <ul>
          {this.props.relatives.map(({ id, name }) => (
            <li key={id}>{name}</li>
          ))}
        </ul>
        {addRelative}
      </div>
    );
  }
}

export default RelativesDetail;
