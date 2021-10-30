import React, { useState } from "react";

// reactstrap components
import {
  Container,
  Col,
  CardHeader,
  CardImg,
  CardTitle,
  CardBody,
  Form,
  FormGroup,
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  Card,
  Input,
  Button
} from "reactstrap";

function ResetPage() {
  const [emailFocus, setEmailFocus] = useState("");
  React.useEffect(() => {
    document.body.classList.add("reset-page");
    window.scrollTo(0, 0);
    document.body.scrollTop = 0;
    return function cleanup() {
      document.body.classList.remove("reset-page");
    };
  });
  return (
    <>
      <div className="wrapper">
        <div className="page-header bg-default">
          <div
            className="page-header-image"
            style={{
              backgroundImage:
                "url(" + require("assets/img/ill/register_bg.png") + ")",
            }}
          ></div>
          <Container>
            <Col className="mx-auto" lg="5" md="8">
              <Card className="bg-secondary shadow border-0">
                <CardHeader>
                  <CardImg
                    alt="..."
                    src={require("assets/img/ill/bg5-1.svg")}
                  ></CardImg>
                  <CardTitle className="text-center" tag="h4">
                    Reset Password
                  </CardTitle>
                </CardHeader>
                <CardBody className="px-lg-5 py-lg-5">
                  <div className="text-center text-muted mb-4">
                    <small>Enter email address to reset password</small>
                  </div>
                  <Form role="form">
                    <FormGroup className={"mb-3 " + emailFocus}>
                      <InputGroup className="input-group-alternative">
                        <InputGroupAddon addonType="prepend">
                          <InputGroupText>
                            <i className="ni ni-email-83"></i>
                          </InputGroupText>
                        </InputGroupAddon>
                        <Input
                          placeholder="Email"
                          type="email"
                          onFocus={() => setEmailFocus("focused")}
                          onBlur={() => setEmailFocus("")}
                        ></Input>
                      </InputGroup>
                    </FormGroup>
                    <div className="text-center">
                      <Button className="my-4" color="primary" type="button">
                        Send
                      </Button>
                    </div>
                  </Form>
                </CardBody>
              </Card>
            </Col>
          </Container>
        </div>
      </div>
    </>
  );
}

export default ResetPage;
