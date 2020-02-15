import React, { PureComponent, ReactNode } from "react";
import { Input, Label, Button } from "reactstrap";
import { authClient } from "../../network/authClient";

interface Props {}
interface State {}

class LoginView extends PureComponent<Props, State> {
  state: State = {};

  render(): ReactNode {
    return (
      <div className="login-view d-flex flex-column align-items-center p-2">
        <h1>Log In</h1>
        <Label for="username-input">Username</Label>
        <Input id="username-input" type="text" placeholder="Alice" />
        <p></p>
        <Label for="password-input">Password</Label>
        <Input id="password-input" type="password" />
        <p></p>
        <Button onClick={this.onClick} className="button">Log In</Button>
      </div>
    );
  }

  onClick() {
    // authClient.login('alice', 'test').then(response => {
    //   console.log(response);
    // });
  }
}

export default LoginView;
