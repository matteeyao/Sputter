import React from "react";
import { Mutation } from "react-apollo";
import { IconContext } from "react-icons";
import { FaTrash } from "react-icons/fa";

import Mutations from "../../graphql/mutations";
const { REMOVE_GOD_DOMAIN } = Mutations;

const linkStyle = {
  cursor: "pointer",
  fontSize: "10px",
  color: "red"
};

const DeleteDomain = props => {
  return (
    <Mutation mutation={REMOVE_GOD_DOMAIN}>
      {(removeGodDomain, { data }) => (
        <a
          style={linkStyle}
          onClick={e => {
            e.preventDefault();
            removeGodDomain({
              variables: {
                godId: props.godId,
                domain: props.domain
              }
            });
          }}
        >
          <IconContext.Provider value={{ className: "custom-icon" }}>
            <FaTrash />
          </IconContext.Provider>
        </a>
      )}
    </Mutation>
  );
};

export default DeleteDomain;
