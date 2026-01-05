describe("Authentication E2E Smoke Tests", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  describe("Login page accessibility", () => {
    it("should load login page", () => {
      cy.visit("/login");
      cy.url().should("include", "/login");
      cy.get("body").should("be.visible");
    });

    it("should display employee login form by default", () => {
      cy.visit("/login");
      cy.contains(/Employee/i).should("be.visible");
      cy.get("input").first().should("be.visible");
    });

    it("should allow typing in access code field", () => {
      cy.visit("/login");
      cy.get("input").first().type("TEST123");
      cy.get("input").first().should("have.value", "TEST123");
    });
  });

  describe("Manager login form", () => {
    it("should display manager login form when selected", () => {
      cy.visit("/login");
      cy.contains(/Manager/i).click();
      cy.wait(1000);

      cy.get("input").should("have.length.greaterThan", 1);
    });

    it("should have email and password fields", () => {
      cy.visit("/login");
      cy.contains(/Manager/i).click();
      cy.wait(1000);

      cy.get("input").eq(0).type("manager@test.com");
      cy.get("input").eq(1).type("password123");
      cy.get("input").eq(0).should("have.value", "manager@test.com");
    });

    it("should have password field with correct type", () => {
      cy.visit("/login");
      cy.contains(/Manager/i).click();
      cy.wait(1000);

      cy.get('input[type="password"]').should("exist");
      cy.get('input[type="password"]').type("testpassword");
      cy.get('input[type="password"]').should("have.value", "testpassword");
    });
  });

  describe("Protected routes", () => {
    it("should redirect to login when accessing tabs without auth", () => {
      cy.clearLocalStorage();
      cy.visit("/(tabs)");
      cy.wait(2000);

      cy.url().should("include", "/login");
    });

    it("should redirect to login when accessing create-idea without auth", () => {
      cy.clearLocalStorage();
      cy.visit("/create-idea");
      cy.wait(2000);

      cy.url().should("include", "/login");
    });
  });

  describe("Registration page", () => {
    it("should load manager registration page", () => {
      cy.visit("/manager-register");
      cy.wait(1000);

      cy.get("body").should("be.visible");
    });
  });
});
