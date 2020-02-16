import React, { PureComponent, ReactNode } from "react";
import { Input, Label, Button } from "reactstrap";
import { authClient } from "../../network/authClient";
import { Link } from "react-router-dom";

interface Props {}
interface State {}

class LoginView extends PureComponent<Props, State> {
  state: State = {};

  render(): ReactNode {
    return (
      <div className="login-view d-flex flex-column w-100 justify-content-center align-items-center p-2">
        <h1 className="logo font-weight-bold">codelingo</h1>
        <hr />
        <div className="m-2 d-flex flex-column w-100 justify-content-center align-items-center">
          <h4>Log In</h4>
          <Label for="username-input text-left">Username</Label>
          <Input id="username-input" type="text" placeholder="Alice" />
          <p></p>
          <Label for="password-input text-left">Password</Label>
          <Input id="password-input" type="password" />
          <p></p>
          <Link to="/skills">
            <Button
              onClick={() => this.onClick()}
              className="button button-info"
            >
              Log In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  onClick() {
    authClient.login("alice", "test").then(response => {
      console.log(response);
    });
  }
}

export default LoginView;
