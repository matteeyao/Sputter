import React from "react";
import { Mutation } from "react-apollo";
import { IconContext } from "react-icons";
import { FaPencilAlt } from "react-icons/fa";

import Mutations from "../../graphql/mutations";
const { UPDATE_GOD_TYPE } = Mutations;

class TypeDetail extends React.Component {
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
      let input;

      return (
        <Mutation mutation={UPDATE_GOD_TYPE}>
          {(updateGodType, { data }) => (
            <select
              value={this.props.god.type}
              onChange={e => {
                e.preventDefault();
                updateGodType({
                  variables: { id: this.props.god.id, type: e.target.value }
                }).then(() => this.setState({ editing: false }));
              }}
            >
              <option value="god">God</option>
              <option value="goddess">Goddess</option>
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
          <h4>{this.props.god.type}</h4>
        </div>
      );
    }
  }
}

export default TypeDetail;
