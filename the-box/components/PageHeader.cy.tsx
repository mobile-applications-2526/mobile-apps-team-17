import React from "react";
import PageHeader from "./PageHeader";

describe("<PageHeader />", () => {
  it("renders with provided title", () => {
    cy.mount(<PageHeader title="Welcome" />);

    cy.getByTestId("page-header-container").should("be.visible");
    cy.getByTestId("page-header-title").should("be.visible");
    cy.getByTestId("page-header-title").should("contain", "Welcome");
  });

  it("renders different titles correctly", () => {
    const titles = ["Home", "Create Idea", "My Ideas", "Discussion"];

    titles.forEach((title) => {
      cy.mount(<PageHeader title={title} />);
      cy.getByTestId("page-header-title").should("contain", title);
    });
  });

  it("renders with empty string title", () => {
    cy.mount(<PageHeader title="" />);

    cy.getByTestId("page-header-container").should("exist");
  });

  it("renders container and title elements", () => {
    cy.mount(<PageHeader title="Test Title" />);

    cy.getByTestId("page-header-container").should("exist");
    cy.getByTestId("page-header-title").should("exist");
  });
});
