import React from "react";
import { Query, Mutation } from "react-apollo";
import { IconContext } from "react-icons";
import { FaPencilAlt } from "react-icons/fa";

import Mutations from "../../graphql/mutations";
const { UPDATE_GOD_ABODE } = Mutations;

import Queries from "../../graphql/queries";
const { FETCH_ABODES } = Queries;

class AbodeDetail extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      editing: false
    };

    this.handleEdit = this.handleEdit.bind(this);
  }

  handleEdit(e) {
    e.preventDefault();
    this.setState({ editing: true });
  }

  render() {
    if (this.state.editing) {
      return (
        <Mutation mutation={UPDATE_GOD_ABODE}>
          {(updateGodAbode, data) => (
            <select
              value="default"
              onChange={e => {
                updateGodAbode({
                  variables: {
                    abodeId: e.target.value,
                    godId: this.props.god.id
                  }
                }).then(() => this.setState({ editing: false }));
              }}
            >
              <option value="default" disabled>
                Choose an abode
              </option>
              <Query query={FETCH_ABODES}>
                {({ loading, error, data }) => {
                  if (loading) return <option>Loading...</option>;
                  if (error) return <option>Error</option>;

                  return data.abodes.map(({ id, name }) => (
                    <option value={id} key={id}>
                      {name}
                    </option>
                  ));
                }}
              </Query>
            </select>
          )}
        </Mutation>
      );
    } else {
      return (
        <div>
          <div
            onClick={this.handleEdit}
            style={{ fontSize: "10px", cursor: "pointer", display: "inline" }}
          >
            <IconContext.Provider value={{ className: "custom-icon" }}>
              <FaPencilAlt />
            </IconContext.Provider>
          </div>
          <h4>
            Abode:{" "}
            {this.props.god.abode ? this.props.god.abode.name : "Unassigned"}
          </h4>
        </div>
      );
    }
  }
}

export default AbodeDetail;
