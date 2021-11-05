import React, { useState } from "react";
import { useHistory, Link } from "react-router-dom";
// reactstrap components
import {
  Button,
  FormGroup,
  Form,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Container,
} from "reactstrap";

import ErrorModal from "MyComponents/common/ModalNotification";

function RegisterPage(props) {
  React.useEffect(() => {
    document.body.classList.add("register-page");
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    return function cleanup() {
      document.body.classList.remove("register-page");
    };
  }, []);
  const [activeContainer, setActiveContainer] = useState("");
  const [signupNameFocus, setSignupNameFocus] = useState("");
  const [signupEmailFocus, setSignupEmailFocus] = useState("");
  const [signupUsernameFocus, setSignupUsernameFocus] = useState("");
  const [signupPasswordFocus, setSignupPasswordFocus] = useState("");
  const [signinEmailFocus, setSigninEmailFocus] = useState("");
  const [signinPasswordFocus, setSigninPasswordFocus] = useState("");
  
  const [signupData, setSignupData] = useState({
    firstName : "",
    lastName : "",
    email : "",
    username: "",
    password : "",
    confirmPassword : ""
  });
  
  const [loginData, setLoginData] = useState({
    username : "",
    password : ""
  });

  const [errors, setErrors] = useState([]);
  const history = useHistory();
  const handleSignupChange = e => {
    const { name, value } = e.target;
    setSignupData(formData => ({ ...formData, [name] : value }))
  }
  
  const handleLoginChange = e => {
    const { name, value } = e.target;
    setLoginData(formData => ({ ...formData, [name] : value }))
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const res = await props.login(loginData);
    if(res.success) {
      history.push("/profile/" + loginData.username)
    } else {
      setErrors(res.errors)
    }
  }

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    const { password, confirmPassword } = signupData;
    if(password !== confirmPassword) {
      setErrors(["Passwords do not match"])
      return
    }
    const copied = { ...signupData }
    delete copied.confirmPassword;
    const res = await props.signup(copied);
    if(res.sucess) {
      history.push("/profile/"+ copied.username)
    } else {
      setErrors(res.errors)
    }
  };
  return (
    <>
      {errors.length > 0 ? <ErrorModal title="error" messages={errors} /> : null}
      <div className="wrapper">
        <div className="page-header bg-default">
          <div
            className="page-header-image"
            style={{
              backgroundImage:
                "url(" + require("assets/img/ill/register_bg.png") + ")",
            }}
          ></div>
          <Container className={activeContainer}>
            <div className="form-container sign-up-container">
              <Form onSubmit={handleSignupSubmit} role="form">
                <h2>Create Account</h2>
                <FormGroup className={"mb-3 " + signupNameFocus}>
                  <InputGroup className="input-group-alternative">
                    <InputGroupAddon addonType="prepend">
                      <InputGroupText>
                        <i className="ni ni-circle-08"></i>
                      </InputGroupText>
                    </InputGroupAddon>
                    <Input
                      placeholder="Firstname"
                      type="text"
                      name="firstName"
                      onChange={handleSignupChange}
                      value={signupData.firstName}
                      onFocus={() => setSignupNameFocus("focused")}
                      onBlur={() => setSignupNameFocus("")}
                    ></Input>

                    <Input
                      placeholder="Lastname"
                      type="text"
                      name="lastName"
                      value={signupData.lastName}
                      onChange={handleSignupChange}
                      onFocus={() => setSignupNameFocus("focused")}
                      onBlur={() => setSignupNameFocus("")}
                    ></Input>
                  </InputGroup>
                </FormGroup>

                <FormGroup className={"mb-3 " + signupUsernameFocus}>
                  <InputGroup className="input-group-alternative">
                    <InputGroupAddon addonType="prepend">
                      <InputGroupText>
                        <i className="ni ni-circle-08"></i>
                      </InputGroupText>
                    </InputGroupAddon>
                    <Input
                      placeholder="username"
                      type="text"
                      name="username"
                      onChange={handleSignupChange}
                      value={signupData.username}
                      onFocus={() => setSignupUsernameFocus("focused")}
                      onBlur={() => setSignupUsernameFocus("")}
                    ></Input>
                  </InputGroup>
                </FormGroup>

                <FormGroup className={"mb-3 " + signupEmailFocus}>
                  <InputGroup className="input-group-alternative">
                    <InputGroupAddon addonType="prepend">
                      <InputGroupText>
                        <i className="ni ni-email-83"></i>
                      </InputGroupText>
                    </InputGroupAddon>
                    <Input
                      placeholder="Email"
                      type="email"
                      name="email"
                      value={signupData.email}
                      onChange={handleSignupChange}
                      onFocus={() => setSignupEmailFocus("focused")}
                      onBlur={() => setSignupEmailFocus("")}
                    ></Input>
                  </InputGroup>
                </FormGroup>


                <FormGroup className={signupPasswordFocus}>
                  <InputGroup className="input-group-alternative">
                    <InputGroupAddon addonType="prepend">
                      <InputGroupText>
                        <i className="ni ni-lock-circle-open"></i>
                      </InputGroupText>
                    </InputGroupAddon>
                    <Input
                      placeholder="Password"
                      type="password"
                      name="password"
                      autoComplete="new-password"
                      value={signupData.password}
                      onChange={handleSignupChange}
                      onFocus={() => setSignupPasswordFocus("focused")}
                      onBlur={() => setSignupPasswordFocus("")}
                    ></Input>
                  </InputGroup>
                  <InputGroup className="input-group-alternative">
                    <InputGroupAddon addonType="prepend">
                      <InputGroupText>
                        <i className="ni ni-lock-circle-open"></i>
                      </InputGroupText>
                    </InputGroupAddon>
                    <Input
                      placeholder="Confirm Password"
                      type="password"
                      autoComplete="new-password"
                      name="confirmPassword"
                      value={signupData.confirmPassword}
                      onChange={handleSignupChange}
                      onFocus={() => setSignupPasswordFocus("focused")}
                      onBlur={() => setSignupPasswordFocus("")}
                    ></Input>
                  </InputGroup>
                </FormGroup>
                <Button color="primary">Sign Up</Button>
              </Form>
            </div>




            <div className="form-container sign-in-container">
              <Form role="form" onSubmit={handleLoginSubmit}>
                <h2>Sign in</h2>
                <div className="social-container">
                  <Button color="facebook" size="sm" type="button">
                    <span className="btn-inner--icon">
                      <i className="fab fa-facebook"></i>
                    </span>
                  </Button>
                  <Button color="instagram" size="sm" type="button">
                    <span className="btn-inner--icon">
                      <i className="fab fa-instagram"></i>
                    </span>
                  </Button>
                  <Button color="twitter" size="sm" type="button">
                    <span className="btn-inner--icon">
                      <i className="fab fa-twitter"></i>
                    </span>
                  </Button>
                </div>
                <span className="text-default mb-4">or use your account</span>
                <FormGroup className={"mb-3 " + signinEmailFocus}>
                  <InputGroup className="input-group-alternative">
                    <InputGroupAddon addonType="prepend">
                      <InputGroupText>
                        <i className="ni ni-circle-08"></i>
                      </InputGroupText>
                    </InputGroupAddon>
                    <Input
                      placeholder="Username"
                      type="text"
                      name="username"
                      value={loginData.username}
                      onChange={handleLoginChange}
                      onFocus={() => setSigninEmailFocus("focused")}
                      onBlur={() => setSigninEmailFocus("")}
                    />
                  </InputGroup>
                </FormGroup>
                <FormGroup className={signinPasswordFocus}>
                  <InputGroup className="input-group-alternative">
                    <InputGroupAddon addonType="prepend">
                      <InputGroupText>
                        <i className="ni ni-lock-circle-open"></i>
                      </InputGroupText>
                    </InputGroupAddon>
                    <Input
                      placeholder="Password"
                      type="password"
                      name="password"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      onFocus={() => setSigninPasswordFocus("focused")}
                      onBlur={() => setSigninPasswordFocus("")}
                    />
                  </InputGroup>
                </FormGroup>
                <Link to="/passwordReset">
                  Forgot your password?
                </Link>
                <Button className="mt-3" color="primary" onSubmit={handleLoginSubmit}>
                  Sign In
                </Button>
              </Form>
            </div>
            <div className="overlay-container">
              <div className="overlay">
                <div className="overlay-panel overlay-left">
                  <h1 className="text-white">Welcome Back!</h1>
                  <p>
                    To keep connected with us please login with your personal
                    info
                  </p>
                  <Button
                    className="btn-neutral"
                    color="default"
                    id="signIn"
                    size="sm"
                    onClick={() => setActiveContainer("")}
                  >
                    Sign In
                  </Button>
                </div>
                <div className="overlay-panel overlay-right">
                  <h1 className="text-white">Hello, Friend!</h1>
                  <p>Enter your personal details and start journey with us</p>
                  <Button
                    className="btn-neutral"
                    color="default"
                    id="signUp"
                    size="sm"
                    onClick={() => setActiveContainer("right-panel-active")}
                  >
                    Sign Up
                  </Button>
                </div>
              </div>
            </div>
          </Container>
        </div>
      </div>
    </>
  );
}

export default RegisterPage;
