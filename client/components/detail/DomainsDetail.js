import React from "react";
import { Mutation } from "react-apollo";
import { IconContext } from "react-icons";
import { FaPlusCircle } from "react-icons/fa";
import DeleteDomain from "../gods/DeleteDomain";

import Mutations from "../../graphql/mutations";
const { ADD_GOD_DOMAIN } = Mutations;

class DomainsDetail extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      adding: false,
      newDomain: ""
    };

    this.handleEdit = this.handleEdit.bind(this);
  }

  handleEdit(e) {
    e.preventDefault();
    this.setState({ adding: true });
  }

  handleField(field) {
    return e => this.setState({ [field]: e.target.value });
  }

  handleSubmit(e, addGodDomain) {
    let newDomain = this.state.newDomain;
    e.preventDefault();
    addGodDomain({
      variables: {
        godId: this.props.god.id,
        domain: newDomain
      },
      // we are using optimisticResponse here to have the UI update a little bit
      // faster so we don't have to way for the mutation to return. Check out the docs
      // to learn more!
      optimisticResponse: {
        __typename: "Mutation",
        addGodDomain: {
          __typename: "God",
          id: this.props.god.id,
          name: this.props.god.name,
          domains: this.props.god.domains.concat(newDomain)
        }
      }
    }).then(() => this.setState({ adding: false, newDomain: "" }));
  }

  render() {
    let addDomain;

    if (this.state.adding) {
      addDomain = (
        <Mutation mutation={ADD_GOD_DOMAIN}>
          {addGodDomain => (
            <div>
              <form onSubmit={e => this.handleSubmit(e, addGodDomain)}>
                <input
                  value={this.state.newDomain}
                  onChange={this.handleField("newDomain")}
                />
                <button type="submit">Add Name</button>
              </form>
            </div>
          )}
        </Mutation>
      );
    } else {
      addDomain = (
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
        <ul>
          {this.props.god.domains.map((name, i) => {
            return (
              <li key={i}>
                {name}
                <DeleteDomain godId={this.props.god.id} domain={name} />
              </li>
            );
          })}
        </ul>
        {addDomain}
      </div>
    );
  }
}

export default DomainsDetail;
