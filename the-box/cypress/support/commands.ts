/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login as employee with access code
       * @param accessCode - The 6-character access code
       * @example cy.loginAsEmployee('ABC123')
       */
      loginAsEmployee(accessCode: string): Chainable<void>;

      /**
       * Custom command to login as manager with email/password
       * @param email - Manager email address
       * @param password - Manager password
       * @example cy.loginAsManager('manager@company.com', 'password123')
       */
      loginAsManager(email: string, password: string): Chainable<void>;

      /**
       * Custom command to logout
       * @example cy.logout()
       */
      logout(): Chainable<void>;

      /**
       * Custom command to setup mock user data in localStorage
       * @param userData - User data object
       * @example cy.setupMockUser({ id: '123', email: 'test@test.com', role: 'manager' })
       */
      setupMockUser(userData: any): Chainable<void>;

      /**
       * Custom command to enable/disable anonymous mode
       * @param enabled - Whether anonymous mode is enabled
       * @example cy.setAnonymousMode(true)
       */
      setAnonymousMode(enabled: boolean): Chainable<void>;

      /**
       * Custom command to get an element by testID
       * @param testId - The testID attribute value
       * @example cy.getByTestId('idea-card-follow-button')
       */
      getByTestId(testId: string): Chainable<JQuery<HTMLElement>>;

      /**
       * Custom command to find an element by testID within the current subject
       * @param testId - The testID attribute value
       * @example cy.get('.container').findByTestId('submit-button')
       */
      findByTestId(testId: string): Chainable<JQuery<HTMLElement>>;

      /**
       * Custom command to type in an input with testID
       * @param testId - The testID attribute value
       * @param text - Text to type
       * @example cy.typeInTestId('create-idea-subject-input', 'My Idea')
       */
      typeInTestId(testId: string, text: string): Chainable<void>;

      /**
       * Custom command to click an element with testID
       * @param testId - The testID attribute value
       * @example cy.clickTestId('idea-card-follow-button')
       */
      clickTestId(testId: string): Chainable<void>;

      /**
       * Custom command to wait for element with testID to be visible
       * @param testId - The testID attribute value
       * @example cy.waitForTestId('idea-card-1')
       */
      waitForTestId(testId: string): Chainable<JQuery<HTMLElement>>;
    }
  }
}

// Login as employee command
Cypress.Commands.add("loginAsEmployee", (accessCode: string) => {
  cy.visit("/(auth)/login");
  cy.getByTestId("employee-login-tab").click();
  cy.getByTestId("access-code-input").clear().type(accessCode);
  cy.getByTestId("employee-login-button").click();
  // Wait for navigation to tabs
  cy.url().should("include", "/(tabs)");
});

// Login as manager command
Cypress.Commands.add("loginAsManager", (email: string, password: string) => {
  cy.visit("/(auth)/login");
  cy.getByTestId("manager-login-tab").click();
  cy.getByTestId("email-input").clear().type(email);
  cy.getByTestId("password-input").clear().type(password);
  cy.getByTestId("manager-login-button").click();
  // Wait for navigation to tabs
  cy.url().should("include", "/(tabs)");
});

// Logout command
Cypress.Commands.add("logout", () => {
  cy.getByTestId("logout-button").click();
  // Wait for navigation to login
  cy.url().should("include", "/(auth)/login");
});

// Setup mock user
Cypress.Commands.add("setupMockUser", (userData: any) => {
  cy.window().then((win) => {
    win.localStorage.setItem("user", JSON.stringify(userData));
  });
});

// Set anonymous mode
Cypress.Commands.add("setAnonymousMode", (enabled: boolean) => {
  cy.window().then((win) => {
    win.localStorage.setItem("anonymous_mode", enabled.toString());
  });
});

// Get by testID
Cypress.Commands.add("getByTestId", (testId: string) => {
  return cy.get(`[data-testid="${testId}"]`);
});

// Find by testID
Cypress.Commands.add(
  "findByTestId",
  { prevSubject: true },
  (subject, testId: string) => {
    return cy.wrap(subject).find(`[data-testid="${testId}"]`);
  }
);

// Type in testID
Cypress.Commands.add("typeInTestId", (testId: string, text: string) => {
  cy.getByTestId(testId).clear().type(text);
});

// Click testID
Cypress.Commands.add("clickTestId", (testId: string) => {
  cy.getByTestId(testId).click();
});

// Wait for testID
Cypress.Commands.add("waitForTestId", (testId: string) => {
  return cy.getByTestId(testId).should("be.visible");
});

export {};
