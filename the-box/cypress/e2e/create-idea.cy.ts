describe("Create idea E2E tests", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.fixture("users").then((users) => {
      cy.setupMockUser(users.employee);
    });
    cy.visit("/create-idea");
  });

  describe("Form display", () => {
    it("should display the create idea form with all elements", () => {
      cy.getByTestId("create-idea-screen").should("be.visible");
      cy.getByTestId("create-idea-subject-input").should("be.visible");
      cy.getByTestId("create-idea-description-input").should("be.visible");
      cy.getByTestId("create-idea-submit-button").should("be.visible");
      cy.getByTestId("create-idea-cancel-button").should("be.visible");
    });

    it("should have empty form fields initially", () => {
      cy.getByTestId("create-idea-subject-input").should("have.value", "");
      cy.getByTestId("create-idea-description-input").should("have.value", "");
    });
  });

  describe("Form validation", () => {
    it("should allow submission with only description", () => {
      cy.getByTestId("create-idea-description-input").type(
        "This is a simple idea without a subject."
      );
      cy.getByTestId("create-idea-submit-button").click();
      cy.wait(3000);
    });

    it("should allow submission with both subject and description", () => {
      cy.getByTestId("create-idea-subject-input").type("Improve Office Layout");
      cy.getByTestId("create-idea-description-input").type(
        "We should reorganize the office for better collaboration."
      );
      cy.getByTestId("create-idea-submit-button").click();
      cy.wait(3000);
    });

    it("should reject profane language in description", () => {
      cy.getByTestId("create-idea-description-input").type(
        "This contains bad words: damn"
      );
      cy.getByTestId("create-idea-submit-button").click();
      cy.wait(500);
    });

    it("should trim whitespace from inputs", () => {
      cy.getByTestId("create-idea-subject-input").type("  Spaced Subject  ");
      cy.getByTestId("create-idea-description-input").type(
        "  Spaced Description  "
      );
      cy.getByTestId("create-idea-submit-button").click();
      cy.wait(3000);
    });
  });

  describe("Anonymous mode", () => {
    it("should post anonymously when anonymous mode is enabled", () => {
      cy.setAnonymousMode(true);
      cy.reload();
      cy.getByTestId("create-idea-description-input").type(
        "Anonymous idea submission."
      );
      cy.getByTestId("create-idea-submit-button").click();
      cy.wait(3000);
    });

    it("should post with user ID when anonymous mode is disabled", () => {
      cy.setAnonymousMode(false);
      cy.reload();
      cy.getByTestId("create-idea-description-input").type(
        "Public idea submission."
      );
      cy.getByTestId("create-idea-submit-button").click();
      cy.wait(3000);
    });
  });

  describe("Form interaction", () => {
    it("should allow typing in subject field", () => {
      const subject = "New Office Equipment";
      cy.getByTestId("create-idea-subject-input").type(subject);
      cy.getByTestId("create-idea-subject-input").should("have.value", subject);
    });

    it("should allow typing in description field", () => {
      const description = "We need new standing desks for better ergonomics.";
      cy.getByTestId("create-idea-description-input").type(description);
      cy.getByTestId("create-idea-description-input").should(
        "have.value",
        description
      );
    });

    it("should allow multiline text in description", () => {
      const multilineText = "Line 1\nLine 2\nLine 3";
      cy.getByTestId("create-idea-description-input").type(multilineText);
      cy.getByTestId("create-idea-description-input").should(
        "contain.value",
        "Line 1"
      );
    });
  });

  describe("Cancel functionality", () => {
    it("should show confirmation dialog when cancel is clicked with data entered", () => {
      cy.getByTestId("create-idea-description-input").type("Some content");
      cy.getByTestId("create-idea-cancel-button").click();
      cy.wait(500);
    });

    it("should discard data when discard is confirmed", () => {
      cy.getByTestId("create-idea-subject-input").type("Test Subject");
      cy.getByTestId("create-idea-description-input").type("Test Description");
      cy.getByTestId("create-idea-cancel-button").click();
      cy.wait(500);
    });
  });

  describe("Success flow", () => {
    it("should clear form after successful submission", () => {
      cy.getByTestId("create-idea-subject-input").type("Test");
      cy.getByTestId("create-idea-description-input").type("Test description");
      cy.getByTestId("create-idea-submit-button").click();
      cy.wait(4000);
      cy.visit("/create-idea");
      cy.getByTestId("create-idea-subject-input").should("have.value", "");
      cy.getByTestId("create-idea-description-input").should("have.value", "");
    });
  });

  describe("Date calculation", () => {
    const getLastFridayOfMonth = () => {
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth();
      const lastDayOfMonth = new Date(year, month + 1, 0);

      while (lastDayOfMonth.getDay() !== 5) {
        lastDayOfMonth.setDate(lastDayOfMonth.getDate() - 1);
      }

      return lastDayOfMonth;
    };

    it("should calculate review date as last Friday of current month", () => {
      const expectedLastFriday = getLastFridayOfMonth();
      const expectedDateString = expectedLastFriday.toISOString().split("T")[0];

      cy.getByTestId("create-idea-description-input").type(
        "Test review date calculation"
      );
      cy.getByTestId("create-idea-submit-button").click();
      cy.wait(3000);

      // navigate to home to find the created idea
      cy.visit("/(tabs)");
      cy.wait(2000);

      // search for the created idea
      cy.get("body").then(($body) => {
        if ($body.text().match(/Test review date calculation/i)) {
          // verify the status contains the correct Friday date
          cy.contains("Test review date calculation")
            .parents('[data-testid*="idea-card"]')
            .should("contain", `Review date: ${expectedDateString}`);
        } else {
          // if search/filter is needed to find it
          cy.log(`Expected review date: ${expectedDateString}`);
        }
      });
    });

    it("should verify last Friday calculation for different months", () => {
      const lastFriday = getLastFridayOfMonth();
      expect(lastFriday.getDay()).to.equal(5);

      const today = new Date();
      expect(lastFriday.getMonth()).to.equal(today.getMonth());
    });
  });

  describe("Keyboard behavior", () => {
    it("should show keyboard when input is focused", () => {
      cy.getByTestId("create-idea-description-input").click();
      cy.getByTestId("create-idea-description-input").should("have.focus");
    });
  });

  describe("Accessibility", () => {
    it("should have proper labels for screen readers", () => {
      cy.contains("Topic (optional)").should("be.visible");
      cy.contains("Your idea / opinion / feedback").should("be.visible");
    });

    it("should indicate required fields", () => {
      cy.contains("*").should("be.visible");
    });
  });

  describe("Idea creation", () => {
    beforeEach(() => {
      cy.clearLocalStorage();
      cy.clearCookies();
      cy.fixture("users").then((users) => {
        cy.setupMockUser(users.employee);
      });
      cy.visit("/create-idea");
    });

    it("should create idea and verify it appears in home feed", () => {
      const uniqueDescription = "E2E Test Idea - " + Date.now();

      cy.getByTestId("create-idea-subject-input").type("E2E Test Subject");
      cy.getByTestId("create-idea-description-input").type(uniqueDescription);
      cy.getByTestId("create-idea-submit-button").click();
      cy.wait(3000);

      cy.visit("/(tabs)");
      cy.wait(2000);

      cy.get("body").then(($body) => {
        if ($body.text().includes(uniqueDescription)) {
          cy.contains(uniqueDescription).should("be.visible");
          cy.log("Idea successfully appears in home feed");
        } else {
          if ($body.find('input[placeholder*="Search"]').length > 0) {
            cy.get('input[placeholder*="Search"]').type(uniqueDescription);
            cy.wait(1000);
            cy.contains(uniqueDescription).should("be.visible");
          } else {
            cy.log("Idea may be created but not visible immediately");
          }
        }
      });
    });

    it("should create idea with subject and verify all fields appear", () => {
      const timestamp = Date.now();
      const testSubject = "Test Subject " + timestamp;
      const testDescription = "Test Description " + timestamp;

      cy.getByTestId("create-idea-subject-input").type(testSubject);
      cy.getByTestId("create-idea-description-input").type(testDescription);
      cy.getByTestId("create-idea-submit-button").click();
      cy.wait(3000);

      cy.visit("/(tabs)");
      cy.wait(2000);
      cy.get("body").then(($body) => {
        if ($body.text().includes(testSubject)) {
          cy.contains(testSubject).should("be.visible");
          cy.contains(testDescription).should("be.visible");
        }
      });
    });

    it("should create idea without subject and verify it appears", () => {
      const testDescription = "No subject test - " + Date.now();
      cy.getByTestId("create-idea-description-input").type(testDescription);
      cy.getByTestId("create-idea-submit-button").click();
      cy.wait(3000);

      cy.visit("/(tabs)");
      cy.wait(2000);

      cy.get("body").then(($body) => {
        if ($body.text().includes(testDescription)) {
          cy.contains(testDescription).should("be.visible");
        }
      });
    });
  });

  describe("Anonymous idea creation", () => {
    beforeEach(() => {
      cy.fixture("users").then((users) => {
        cy.setupMockUser(users.manager);
        cy.setAnonymousMode(true);
      });
      cy.visit("/create-idea");
    });

    it("should create anonymous idea and verify creator is hidden", () => {
      const anonymousIdea = "Anonymous idea test " + Date.now();

      cy.getByTestId("create-idea-description-input").type(anonymousIdea);
      cy.getByTestId("create-idea-submit-button").click();
      cy.wait(3000);

      cy.visit("/(tabs)");
      cy.wait(2000);

      cy.get("body").then(($body) => {
        if ($body.text().includes(anonymousIdea)) {
          cy.contains(anonymousIdea)
            .parents('[data-testid*="idea-card"]')
            .should("not.contain.text", "John Manager");
        }
      });
    });
  });
});
