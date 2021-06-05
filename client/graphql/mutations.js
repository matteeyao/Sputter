import gql from "graphql-tag";

export default {
  NEW_GOD: gql`
    mutation NewGod($name: String, $type: String, $description: String) {
      newGod(name: $name, type: $type, description: $description) {
        id
        name
        description
      }
    }
  `,
  DELETE_GOD: gql`
    mutation DeleteGod($id: ID!) {
      deleteGod(id: $id) {
        id
      }
    }
  `,
  NEW_ABODE: gql`
    mutation NewAbode($name: String, $coordinates: String) {
      newAbode(name: $name, coordinates: $coordinates) {
        id
        name
        coordinates
      }
    }
  `,
  NEW_EMBLEM: gql`
    mutation NewEmblem($name: String) {
      newEmblem(name: $name) {
        id
        name
      }
    }
  `,
  ADD_GOD_DOMAIN: gql`
    mutation AddGodDomain($godId: ID!, $domain: String!) {
      addGodDomain(godId: $godId, domain: $domain) {
        id
        name
        domains
      }
    }
  `,
  REMOVE_GOD_DOMAIN: gql`
    mutation RemoveGodDomain($godId: ID!, $domain: String!) {
      removeGodDomain(godId: $godId, domain: $domain) {
        id
        name
        domains
      }
    }
  `,
  ADD_GOD_EMBLEM: gql`
    mutation AddGodEmblem($godId: ID!, $emblemId: ID!) {
      addGodEmblem(godId: $godId, emblemId: $emblemId) {
        id
        name
        emblems {
          id
          name
        }
      }
    }
  `,
  ADD_GOD_RELATIVE: gql`
    mutation AddGodRelative(
      $godId: ID!
      $relativeId: ID!
      $relationship: String!
    ) {
      addGodRelative(
        godId: $godId
        relativeId: $relativeId
        relationship: $relationship
      ) {
        id
        name
        parents {
          id
          name
        }
        children {
          id
          name
        }
        siblings {
          id
          name
        }
      }
    }
  `,
  UPDATE_GOD_DESCRIPTION: gql`
    mutation UpdateGod($id: ID!, $description: String!) {
      updateGod(id: $id, description: $description) {
        id
        name
        description
      }
    }
  `,
  UPDATE_GOD_NAME: gql`
    mutation UpdateGod($id: ID!, $name: String!) {
      updateGod(id: $id, name: $name) {
        id
        name
      }
    }
  `,
  UPDATE_GOD_TYPE: gql`
    mutation UpdateGod($id: ID!, $type: String!) {
      updateGod(id: $id, type: $type) {
        id
        name
        type
      }
    }
  `,
  UPDATE_GOD_ABODE: gql`
    mutation UpdateGodAbode($godId: ID!, $abodeId: ID!) {
      updateGodAbode(godId: $godId, abodeId: $abodeId) {
        id
        name
        abode {
          id
          name
        }
      }
    }
  `
};
