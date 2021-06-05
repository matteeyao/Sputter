import React from "react";
import { Redirect, Route, Switch } from "react-router-dom";
import Nav from "./Nav";
import Create from "./create/Create";

import GodsList from "./gods/GodsList";
import GodDetail from "./gods/GodDetail";

const pageStyle = {
  padding: "0px 30px",
  fontFamily: "'Roboto', sans-serif"
};

const App = () => {
  return (
    <div style={pageStyle}>
      <Nav />
      <Switch>
        <Route exact path="/" component={GodsList} />
        <Route exact path="/new" component={Create} />
        <Route exact path="/gods/:id" component={GodDetail} />
        <Redirect to="/" />
      </Switch>
    </div>
  );
};

export default App;
