import React from "react";
import { Mutation, Query } from "react-apollo";
import { IconContext } from "react-icons";
import { FaPlusCircle } from "react-icons/fa";

import Mutations from "../../graphql/mutations";
const { ADD_GOD_EMBLEM } = Mutations;

import Queries from "../../graphql/queries";
const { FETCH_EMBLEMS } = Queries;

class EmblemsDetail extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      adding: false
    };

    this.handleEdit = this.handleEdit.bind(this);
  }

  handleEdit(e) {
    e.preventDefault();
    this.setState({ adding: true });
  }

  filterEmblems(emblems) {
    const filtered = emblems.filter(emblem => {
      for (let i = 0; i < this.props.god.emblems.length; i++) {
        if (this.props.god.emblems[i].name === emblem.name) {
          return false;
        }
      }
      return true;
    });

    return filtered;
  }

  render() {
    let addEmblem;

    if (this.state.adding) {
      addEmblem = (
        <Mutation mutation={ADD_GOD_EMBLEM}>
          {addGodEmblem => (
            <div>
              <select
                value="default"
                onChange={e => {
                  addGodEmblem({
                    variables: {
                      godId: this.props.god.id,
                      emblemId: e.target.value
                    }
                  });
                  this.setState({ adding: false });
                }}
              >
                <option value="default" disabled>
                  Select an emblem
                </option>
                <Query query={FETCH_EMBLEMS}>
                  {({ loading, error, data }) => {
                    if (loading) return <option>Loading...</option>;
                    if (error) return <option>Error</option>;

                    return this.filterEmblems(data.emblems).map(
                      ({ id, name }) => (
                        <option key={id} value={id}>
                          {name}
                        </option>
                      )
                    );
                  }}
                </Query>
              </select>
            </div>
          )}
        </Mutation>
      );
    } else {
      addEmblem = (
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
        <h4>Emblems:</h4>
        <ul>
          {this.props.god.emblems.map(({ id, name }) => (
            <li key={id}>{name}</li>
          ))}
        </ul>
        {addEmblem}
      </div>
    );
  }
}

export default EmblemsDetail;
