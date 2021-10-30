import React from "react";
import { Route, Switch, Redirect } from "react-router-dom";

import Messenger from "pages/Messenger";
import Login from "pages/Login";
import Register from "pages/Register";
import Profile from "pages/UserProfile/UserProfile";
import ResetPage from "pages/ResetPassword";
import PrivateRoute from "./PrivateRoute";
import EditProfile from "pages/EditProfile/EditProfile";
import Goal from "pages/Goal";
import Friends from "pages/Friends";

/** Site-wide routes.
 *
 * Parts of site should only be visitable when logged in. Those routes are
 * wrapped by <PrivateRoute>, which is an authorization component.
 *
 * Visiting a non-existant route redirects to the homepage.
 */
const Routes = ({ signup, events, login, addEvent }) => {
  console.debug("Routes", `login=${typeof login}, signup=${typeof signup}`);
  return (
    <Switch>
      <PrivateRoute path="/friends" exact>
        <Friends />
      </PrivateRoute>

      <PrivateRoute path="/schedules" exact>
        <Goal events={events} addEvent={addEvent} />
      </PrivateRoute>

      <PrivateRoute path="/edit-profile" exact>
        <EditProfile />
      </PrivateRoute>

      <PrivateRoute path="/messenger" exact>
        <Messenger />
      </PrivateRoute>

      <PrivateRoute exact path="/profile/:username">
        <Profile />
      </PrivateRoute>
      
      <Route path="/passwordReset" exact>
        <ResetPage />
      </Route>
      
      <Route path="/login" exact>
        <Login login={login} />
      </Route>

      <Route path="/register" exact>
        <Register signup={signup} login={login} />
      </Route>

      <Redirect to="/register" />
    </Switch>
  );
};

export default Routes;
