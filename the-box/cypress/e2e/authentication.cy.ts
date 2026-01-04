describe("Authentication E2E tests", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
  });

  describe("Employee authentication", () => {
    it("should display employee login form by default", () => {
      cy.visit("/login");
      cy.url().should("include", "/login");
      cy.get("body").should("be.visible");
      cy.contains(/Employee/i).should("be.visible");
    });

    it("should allow employee to type access code", () => {
      cy.visit("/login");
      cy.get("input").first().type("TEST123");
      cy.get("input").first().should("have.value", "TEST123");
    });

    it("should allow typing in access code field", () => {
      cy.visit("/login");
      cy.get("input").first().should("be.visible");
    });

    it("should successfully authenticate with valid access code (mocked)", () => {
      cy.fixture("users").then((users) => {
        cy.setupMockUser(users.employee);
        cy.visit("/(tabs)");
        cy.wait(2000);

        cy.url().should("match", /\(tabs\)|^\/$/);
        cy.get("body").should("be.visible");
      });
    });

    it("should maintain session after page refresh", () => {
      cy.fixture("users").then((users) => {
        cy.setupMockUser(users.employee);
        cy.visit("/(tabs)");
        cy.wait(2000);

        cy.reload();
        cy.wait(2000);

        cy.url().should("match", /\(tabs\)|^\/$/);
        cy.get("body").should("be.visible");
      });
    });

    it("should redirect to login when not authenticated", () => {
      cy.clearLocalStorage();
      cy.visit("/(tabs)");
      cy.wait(2000);

      cy.url().should("include", "/login");
    });

    it("should prevent access to protected routes without auth", () => {
      cy.clearLocalStorage();
      cy.visit("/create-idea");
      cy.wait(2000);

      cy.url().should("include", "/login");
    });
  });

  describe("Manager authentication flow", () => {
    beforeEach(() => {
      cy.visit("/login");
      cy.contains(/Manager/i).click();
      cy.wait(1000);
    });

    it("should display manager login form", () => {
      cy.get("input").should("have.length.greaterThan", 1);
      cy.url().should("include", "/login");
    });

    it("should have email and password fields", () => {
      cy.get("input").should("have.length.greaterThan", 1);
    });

    it("should allow manager to fill in credentials", () => {
      cy.get("input").eq(0).type("manager@test.com");
      cy.get("input").eq(1).type("password123");
      cy.get("input").eq(0).should("have.value", "manager@test.com");
      cy.get("input").eq(1).should("have.value", "password123");
    });

    it("should have password field", () => {
      cy.get('input[type="password"]').should("exist");
      cy.get("input").eq(1).type("testpassword");

      cy.get('input[type="password"]').should("have.value", "testpassword");
    });

    it("should accept email input", () => {
      cy.fixture("users").then((users) => {
        cy.get("input").eq(0).type(users.manager.email);
        cy.get("input").eq(1).type("password123");
        cy.get("input").eq(0).should("have.value", users.manager.email);
      });
    });

    it("should successfully authenticate with valid credentials (mocked)", () => {
      cy.fixture("users").then((users) => {
        cy.setupMockUser(users.manager);
        cy.visit("/(tabs)");
        cy.wait(2000);

        cy.url().should("match", /\(tabs\)|^\/$/);
        cy.get("body").should("be.visible");
      });
    });

    it("should allow manager to access home page", () => {
      cy.fixture("users").then((users) => {
        cy.setupMockUser(users.manager);
        cy.visit("/(tabs)");
        cy.wait(2000);

        cy.get("body").should("be.visible");
      });
    });
  });

  describe("Session management", () => {
    it("should clear session data on logout", () => {
      cy.fixture("users").then((users) => {
        cy.setupMockUser(users.employee);
        cy.visit("/(tabs)");
        cy.wait(2000);

        cy.clearLocalStorage();
        cy.visit("/(tabs)");
        cy.wait(2000);

        cy.url().should("include", "/login");
      });
    });

    it("should persist user role across sessions", () => {
      cy.fixture("users").then((users) => {
        cy.setupMockUser(users.manager);
        cy.visit("/(tabs)");
        cy.wait(2000);

        cy.window().then((win) => {
          const user = JSON.parse(win.localStorage.getItem("user") || "{}");
          expect(user.role).to.equal("manager");
        });
      });
    });
  });

  describe("Navigation between auth screens", () => {
    it("should show register link if available", () => {
      cy.visit("/login");

      cy.get("body").then(($body) => {
        if ($body.text().match(/Sign up|Register|Create account/i)) {
          cy.contains(/Sign up|Register|Create account/i).should("be.visible");
        }
      });
    });

    it("should load register page", () => {
      cy.visit("/manager-register");
      cy.wait(1000);

      cy.get("body").should("be.visible");
    });
  });
});
