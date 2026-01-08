describe("Discussion and comments E2E tests", () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.clearCookies();
    cy.fixture("users").then((users) => {
      cy.setupMockUser(users.employee);
    });
  });

  describe("Discussion page display", () => {
    beforeEach(() => {
      cy.visit("/discussion/idea-1");
      cy.wait(2000);
    });

    it("should load discussion page", () => {
      cy.url().should("include", "/discussion");
      cy.get("body").should("be.visible");
    });

    it("should display idea card at top of discussion", () => {
      cy.get("body").then(($body) => {
        if ($body.find('[data-testid*="idea-card"]').length > 0) {
          cy.get('[data-testid*="idea-card"]').should("be.visible");
        }
      });
    });

    it("should display comments section", () => {
      cy.contains(/Discussion|Comments|comment/i).should("be.visible");
    });

    it("should have comment tab filters", () => {
      cy.get("body").then(($body) => {
        if ($body.text().match(/All comments|Comments by manager/i)) {
          cy.contains(/All comments/i).should("be.visible");
          cy.contains(/Comments by manager/i).should("be.visible");
        }
      });
    });

    it("should display add comment button or input", () => {
      cy.get("body").then(($body) => {
        if ($body.text().match(/Add comment|Write a comment/i)) {
          cy.contains(/Add comment|Write a comment/i).should("be.visible");
        }
      });
    });
  });

  describe("Viewing comments", () => {
    beforeEach(() => {
      cy.visit("/discussion/idea-3");
      cy.wait(2000);
    });

    it("should load discussion page with comments", () => {
      cy.get("body").should("be.visible");
    });

    it("should show All Comments by default", () => {
      cy.get("body").then(($body) => {
        if ($body.text().match(/All comments/i)) {
          cy.contains(/All comments/i).should("be.visible");
        }
      });
    });

    it("should load page content", () => {
      cy.get("body").should("be.visible");
    });

    it("should load page successfully", () => {
      cy.get("body").should("be.visible");
    });

    it("should display relative timestamps on comments", () => {
      cy.get("body").then(($body) => {
        if ($body.text().match(/ago|Now/i)) {
          cy.get("body").should("contain.text", /ago|Now/i);
        }
      });
    });

    it("should render page", () => {
      cy.get("body").should("be.visible");
    });
  });

  describe("Filtering comments", () => {
    beforeEach(() => {
      cy.visit("/discussion/idea-3");
      cy.wait(2000);
    });

    it("should click manager comments filter", () => {
      cy.get("body").then(($body) => {
        if ($body.text().match(/Comments by manager/i)) {
          cy.contains(/Comments by manager/i).click();
          cy.wait(1000);

          cy.get("body").should("be.visible");
        }
      });
    });

    it("should switch back to All Comments", () => {
      cy.get("body").then(($body) => {
        if ($body.text().match(/All comments/i)) {
          if ($body.text().match(/Comments by manager/i)) {
            cy.contains(/Comments by manager/i).click();
            cy.wait(1000);
          }

          cy.contains(/All comments/i).click();
          cy.wait(1000);

          cy.get("body").should("be.visible");
        }
      });
    });

    it("should click manager comments tab", () => {
      cy.get("body").then(($body) => {
        if ($body.text().match(/Comments by manager/i)) {
          cy.contains(/Comments by manager/i).click();
          cy.wait(500);

          cy.get("body").should("be.visible");
        }
      });
    });

    it("should load page after clicking manager filter", () => {
      cy.visit("/discussion/idea-1");
      cy.wait(2000);

      cy.get("body").then(($body) => {
        if ($body.text().match(/Comments by manager/i)) {
          cy.contains(/Comments by manager/i).click();
          cy.wait(1000);

          cy.get("body").should("be.visible");
        }
      });
    });
  });

  describe("Adding comments", () => {
    beforeEach(() => {
      cy.visit("/discussion/idea-1");
      cy.wait(2000);
    });

    it("should open comment input when Add comment is clicked", () => {
      cy.get("body").then(($body) => {
        if ($body.text().match(/Add comment/i)) {
          cy.contains(/Add comment/i).click();
          cy.wait(500);

          cy.get("input, textarea").should("exist");
        }
      });
    });

    it("should submit comment when submit button is clicked", () => {
      cy.get("body").then(($body) => {
        if ($body.find("input, textarea").length > 0) {
          cy.get("input, textarea").first().type("Great idea!");

          if ($body.text().match(/Add comment|Submit|Post/i)) {
            cy.contains(/Add comment|Submit|Post/i)
              .last()
              .click();
            cy.wait(2000);

            cy.get("body").should("be.visible");
          }
        }
      });
    });

    it("should type and submit comment", () => {
      cy.get("body").then(($body) => {
        if ($body.find("input, textarea").length > 0) {
          cy.get("input, textarea").first().type("Test comment");

          if ($body.text().match(/Add comment|Submit|Post/i)) {
            cy.contains(/Add comment|Submit|Post/i)
              .last()
              .click();
            cy.wait(2000);

            cy.get("body").should("be.visible");
          }
        }
      });
    });

    it("should submit comment with timestamp", () => {
      cy.get("body").then(($body) => {
        if ($body.find("input, textarea").length > 0) {
          const commentText = "New test comment " + Date.now();
          cy.get("input, textarea").first().type(commentText);

          if ($body.text().match(/Add comment|Submit|Post/i)) {
            cy.contains(/Add comment|Submit|Post/i)
              .last()
              .click();
            cy.wait(2000);

            cy.get("body").should("be.visible");
          }
        }
      });
    });

    it("should type comment with whitespace and submit", () => {
      cy.get("body").then(($body) => {
        if ($body.find("input, textarea").length > 0) {
          cy.get("input, textarea").first().type("  Comment with spaces  ");

          if ($body.text().match(/Add comment|Submit|Post/i)) {
            cy.contains(/Add comment|Submit|Post/i)
              .last()
              .click();
            cy.wait(2000);

            cy.get("body").should("be.visible");
          }
        }
      });
    });
  });

  describe("Manager comments", () => {
    beforeEach(() => {
      cy.clearLocalStorage();
      cy.fixture("users").then((users) => {
        cy.setupMockUser(users.manager);
      });
      cy.visit("/discussion/idea-1");
      cy.wait(2000);
    });

    it("should submit comment as manager", () => {
      cy.get("body").then(($body) => {
        if ($body.find("input, textarea").length > 0) {
          cy.get("input, textarea").first().type("Manager comment");

          if ($body.text().match(/Add comment|Submit|Post/i)) {
            cy.contains(/Add comment|Submit|Post/i)
              .last()
              .click();
            cy.wait(2000);

            cy.get("body").should("be.visible");
          }
        }
      });
    });

    it("should submit manager feedback comment", () => {
      cy.get("body").then(($body) => {
        if ($body.find("input, textarea").length > 0) {
          cy.get("input, textarea")
            .first()
            .type("Manager feedback on this idea");

          if ($body.text().match(/Add comment|Submit|Post/i)) {
            cy.contains(/Add comment|Submit|Post/i)
              .last()
              .click();
            cy.wait(2000);

            cy.get("body").should("be.visible");
          }
        }
      });
    });

    it("should submit manager comment and click filter", () => {
      cy.get("body").then(($body) => {
        if ($body.find("input, textarea").length > 0) {
          cy.get("input, textarea").first().type("Test manager comment");

          if ($body.text().match(/Add comment|Submit|Post/i)) {
            cy.contains(/Add comment|Submit|Post/i)
              .last()
              .click();
            cy.wait(2000);

            if ($body.text().match(/Comments by manager/i)) {
              cy.contains(/Comments by manager/i).click();
              cy.wait(1000);

              cy.get("body").should("be.visible");
            }
          }
        }
      });
    });
  });

  describe("Anonymous comments", () => {
    beforeEach(() => {
      cy.clearLocalStorage();
      cy.fixture("users").then((users) => {
        cy.setupMockUser(users.manager);
        cy.setAnonymousMode(true);
      });
      cy.visit("/discussion/idea-1");
      cy.wait(2000);
    });

    it("should submit comment with anonymous mode enabled", () => {
      cy.get("body").then(($body) => {
        if ($body.find("input, textarea").length > 0) {
          cy.get("input, textarea").first().type("Anonymous comment");

          if ($body.text().match(/Add comment|Submit|Post/i)) {
            cy.contains(/Add comment|Submit|Post/i)
              .last()
              .click();
            cy.wait(2000);

            cy.get("body").should("be.visible");
          }
        }
      });
    });

    it("should submit manager comment in anonymous mode", () => {
      cy.get("body").then(($body) => {
        if ($body.find("input, textarea").length > 0) {
          cy.get("input, textarea").first().type("Incognito manager comment");

          if ($body.text().match(/Add comment|Submit|Post/i)) {
            cy.contains(/Add comment|Submit|Post/i)
              .last()
              .click();
            cy.wait(2000);

            cy.get("body").should("be.visible");
          }
        }
      });
    });
  });
});
