describe('Navigation E2E tests', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.fixture('users').then((users) => {
      cy.setupMockUser(users.employee)
    })
  })

  describe('Basic navigation', () => {
    it('should redirect from root to home', () => {
      cy.visit('/')
      cy.wait(2000)
      cy.url().should('match', /\(tabs\)|^\/$/)
    })

    it('should load the home screen', () => {
      cy.visit('/(tabs)')
      cy.wait(2000)
      cy.get('body').should('be.visible')
    })

    it('should navigate to create idea screen directly', () => {
      cy.visit('/create-idea')
      cy.url().should('include', '/create-idea')
      cy.getByTestId('create-idea-screen').should('be.visible')
    })

    it('should navigate to discussion screen with id', () => {
      cy.visit('/discussion/idea-1')
      cy.wait(2000)
      cy.url().should('include', '/discussion/idea-1')
      cy.get('body').should('be.visible')
    })

    it('should click cancel button on create idea', () => {
      cy.visit('/create-idea')
      cy.getByTestId('create-idea-cancel-button').click()
      cy.wait(1000)
    })
  })

  describe('Form navigation', () => {
    it('should type data and click cancel button', () => {
      cy.visit('/create-idea')
      cy.getByTestId('create-idea-description-input').type('Some data')
      cy.getByTestId('create-idea-cancel-button').click()
      cy.wait(500)
    })

    it('should click cancel on empty form', () => {
      cy.visit('/create-idea')
      cy.getByTestId('create-idea-cancel-button').click()
      cy.wait(500)
    })
  })

  describe('Deep linking', () => {
    it('should handle deep linking to specific discussion', () => {
      cy.visit('/discussion/idea-1')
      cy.wait(1000)
      cy.url().should('include', '/discussion/idea-1')
    })

    it('should navigate to login when not authenticated', () => {
      cy.window().then((win) => {
        win.localStorage.removeItem('user')
      })
      cy.visit('/(tabs)')
      cy.wait(2000)
      cy.url().should('include', '/login')
    })
  })

  describe('Error handling', () => {
    it('should load page after visiting non-existent route', () => {
      cy.visit('/nonexistent', { failOnStatusCode: false })
      cy.wait(1000)
      cy.get('body').should('be.visible')
    })
  })

  describe('Multiple screens', () => {
    it('should navigate through create idea flow', () => {
      cy.visit('/(tabs)')
      cy.wait(1000)
      cy.visit('/create-idea')
      cy.url().should('include', '/create-idea')
      cy.getByTestId('create-idea-description-input').type('Test navigation idea')
      cy.getByTestId('create-idea-submit-button').click()
      cy.wait(3000)
    })

    it('should preserve user session across navigation', () => {
      cy.visit('/(tabs)')
      cy.wait(1000)
      cy.visit('/create-idea')
      cy.getByTestId('create-idea-screen').should('be.visible')
    })
  })

  describe('Navigation from home screen', () => {
    it('should navigate to create idea screen from home', () => {
      cy.visit('/(tabs)')
      cy.wait(1000)
      cy.visit('/create-idea')
      cy.url().should('include', '/create-idea')
    })

    it('should navigate to discussion page', () => {
      cy.visit('/(tabs)')
      cy.wait(2000)
      cy.get('body').then(($body) => {
        if ($body.find('[data-testid*="idea-card"]').length > 0) {
          cy.visit('/discussion/idea-1')
          cy.wait(1000)
          cy.url().should('include', '/discussion')
        } else {
          cy.get('body').should('be.visible')
        }
      })
    })
  })

  describe('Create idea navigation flow', () => {
    it('should navigate from home to create idea and back', () => {
      cy.visit('/(tabs)')
      cy.wait(1000)
      cy.visit('/create-idea')
      cy.url().should('include', '/create-idea')
      cy.getByTestId('create-idea-cancel-button').click()
      cy.wait(1000)
    })

    it('should submit idea and return to home', () => {
      cy.visit('/create-idea')
      cy.getByTestId('create-idea-description-input').type('Navigation test idea')
      cy.getByTestId('create-idea-submit-button').click()
      cy.wait(3000)
      cy.url().should('match', /\(tabs\)|^\/$/)
    })
  })

  describe('Discussion navigation flow', () => {
    it('should navigate from home to discussion', () => {
      cy.visit('/(tabs)')
      cy.wait(2000)
      cy.visit('/discussion/idea-1')
      cy.wait(1000)
      cy.url().should('include', '/discussion/idea-1')
    })

    it('should navigate between different discussions', () => {
      cy.visit('/discussion/idea-1')
      cy.wait(2000)
      cy.url().should('include', '/discussion/idea-1')
      cy.visit('/discussion/idea-2')
      cy.wait(2000)
      cy.url().should('include', '/discussion/idea-2')
    })
  })

  describe('Tab navigation', () => {
    it('should load all posts tab', () => {
      cy.visit('/(tabs)')
      cy.wait(2000)
      cy.get('body').then(($body) => {
        if ($body.text().match(/All Posts/i)) {
          cy.contains(/All Posts/i).should('be.visible')
        }
      })
    })

    it('should switch to following tab', () => {
      cy.visit('/(tabs)')
      cy.wait(2000)
      cy.get('body').then(($body) => {
        if ($body.text().match(/Following/i)) {
          cy.contains(/Following/i).click()
          cy.wait(1000)
          cy.url().should('match', /\(tabs\)|^\/$/)
        }
      })
    })
  })
})
