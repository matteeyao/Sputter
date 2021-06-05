import React, { Component } from "react";
import { Query } from "react-apollo";

import Queries from "../../graphql/queries";
const { FETCH_GOD } = Queries;

import NameDetail from "../detail/NameDetail";
import DomainsDetail from "../detail/DomainsDetail";
import TypeDetail from "../detail/TypeDetail";
import DescriptionDetail from "../detail/DescriptionDetail";
import AbodeDetail from "../detail/AbodeDetail";
import EmblemsDetail from "../detail/EmblemsDetail";
import RelativesDetail from "../detail/RelativesDetail";

const GodDetail = props => {
  return (
    <Query query={FETCH_GOD} variables={{ id: props.match.params.id }}>
      {({ loading, error, data }) => {
        if (loading) return <p>Loading...</p>;
        if (error) return <p>Error</p>;
        return (
          <div className="detail">
            <NameDetail god={data.god} />
            <TypeDetail god={data.god} /> of <DomainsDetail god={data.god} />
            <DescriptionDetail god={data.god} />
            <AbodeDetail god={data.god} />
            <EmblemsDetail god={data.god} />
            <RelativesDetail
              god={data.god}
              relatives={data.god.parents}
              relationship="parents"
            />
            <RelativesDetail
              god={data.god}
              relatives={data.god.children}
              relationship="children"
            />
            <RelativesDetail
              god={data.god}
              relatives={data.god.siblings}
              relationship="siblings"
            />
          </div>
        );
      }}
    </Query>
  );
};

export default GodDetail;
