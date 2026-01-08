import React from "react";
import Input from "./Input";

describe("Input component tests", () => {
  it("renders with placeholder", () => {
    cy.mount(<Input placeholder="Enter your email" testID="email-input" />);

    cy.getByTestId("email-input").should("be.visible");
  });

  it("renders without error message initially", () => {
    cy.mount(<Input placeholder="Enter text" testID="test-input" />);

    cy.getByTestId("test-input-error").should("not.exist");
  });

  it("displays error message when error prop is provided", () => {
    cy.mount(
      <Input
        placeholder="Enter email"
        error="Email is required"
        testID="email-input"
      />
    );

    cy.getByTestId("email-input-error").should("be.visible");
    cy.getByTestId("email-input-error").should("contain", "Email is required");
  });

  it("allows user to type text", () => {
    cy.mount(<Input placeholder="Type something" testID="text-input" />);

    cy.getByTestId("text-input").type("Hello World");
    cy.getByTestId("text-input").should("have.value", "Hello World");
  });

  it("accepts custom className prop", () => {
    cy.mount(
      <Input
        placeholder="Custom input"
        className="custom-class"
        testID="custom-input"
      />
    );

    cy.getByTestId("custom-input").should("be.visible");
  });

  it("shows error with different error messages", () => {
    const errorMessages = [
      "Password must be at least 8 characters",
      "Invalid email format",
      "This field is required",
    ];

    errorMessages.forEach((errorMessage) => {
      cy.mount(
        <Input
          placeholder="Test input"
          error={errorMessage}
          testID="validation-input"
        />
      );

      cy.getByTestId("validation-input-error").should("contain", errorMessage);
    });
  });

  it("passes through standard TextInput props", () => {
    cy.mount(
      <Input
        placeholder="Password"
        secureTextEntry={true}
        testID="password-input"
      />
    );

    cy.getByTestId("password-input").should("be.visible");
  });
});
