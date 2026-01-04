describe("Navigation E2E Smoke Tests", () => {
  describe("Unauthenticated navigation", () => {
    beforeEach(() => {
      cy.clearLocalStorage();
      cy.clearCookies();
    });

    it("should redirect to login from protected routes", () => {
      cy.visit("/(tabs)");
      cy.wait(2000);
      cy.url().should("include", "/login");
    });

    it("should redirect to login from create-idea", () => {
      cy.visit("/create-idea");
      cy.wait(2000);
      cy.url().should("include", "/login");
    });

    it("should load login page directly", () => {
      cy.visit("/login");
      cy.wait(1000);
      cy.url().should("include", "/login");
      cy.get("body").should("be.visible");
    });

    it("should load manager registration page", () => {
      cy.visit("/manager-register");
      cy.wait(1000);
      cy.get("body").should("be.visible");
    });
  });

  describe("Route handling", () => {
    it("should handle non-existent routes gracefully", () => {
      cy.visit("/nonexistent", { failOnStatusCode: false });
      cy.wait(1000);
      cy.get("body").should("be.visible");
    });

    it("should handle deep linking to discussion (redirects to login)", () => {
      cy.clearLocalStorage();
      cy.visit("/discussion/idea-1", { failOnStatusCode: false });
      cy.wait(2000);
      // should redirect to login since not authenticated
      cy.url().should("include", "/login");
    });
  });

  describe("Public page navigation", () => {
    it("should navigate between login and register", () => {
      cy.visit("/login");
      cy.wait(1000);

      cy.get("body").then(($body) => {
        if ($body.text().match(/Sign up|Register|Create account/i)) {
          cy.contains(/Sign up|Register|Create account/i).click();
          cy.wait(1000);
          cy.url().should("include", "register");
        }
      });
    });

    it("should handle root route without crashing", () => {
      cy.visit("/");
      cy.wait(2000);
      cy.get("body").should("be.visible");
    });
  });

  describe("Browser navigation", () => {
    it("should handle browser back button", () => {
      cy.visit("/login");
      cy.wait(1000);
      cy.visit("/manager-register");
      cy.wait(1000);
      cy.go("back");
      cy.wait(1000);
      cy.url().should("include", "/login");
    });

    it("should handle browser forward button", () => {
      cy.visit("/login");
      cy.wait(1000);
      cy.visit("/manager-register");
      cy.wait(1000);
      cy.go("back");
      cy.wait(1000);
      cy.go("forward");
      cy.wait(1000);
      cy.url().should("include", "register");
    });
  });
});
